package com.blushaura.api;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OrderService {
  private final CatalogRepository catalog;
  private final JdbcClient jdbc;

  public OrderService(CatalogRepository catalog, JdbcClient jdbc) {
    this.catalog = catalog;
    this.jdbc = jdbc;
  }

  public record Line(String productId, String name, int quantity, BigDecimal unitPrice) {}

  public record OrderResult(
      String id,
      String status,
      String currency,
      BigDecimal subtotal,
      BigDecimal shipping,
      BigDecimal total,
      List<Line> items) {}

  @Transactional
  public OrderResult place(CheckoutRequest request) {
    var lines = new ArrayList<Line>();
    var seen = new HashSet<String>();
    var subtotal = BigDecimal.ZERO;
    for (var item :
        request.items().stream()
            .sorted(java.util.Comparator.comparing(CheckoutRequest.Item::productId))
            .toList()) {
      if (!seen.add(item.productId())) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duplicate product in bag");
      }
      Product product =
          catalog
              .findById(item.productId())
              .orElseThrow(
                  () ->
                      new ResponseStatusException(
                          HttpStatus.BAD_REQUEST, "A product is no longer available"));
      if (product.stock() < item.quantity()) {
        throw new ResponseStatusException(
            HttpStatus.CONFLICT, product.name() + " has insufficient stock");
      }
      lines.add(new Line(product.id(), product.name(), item.quantity(), product.price()));
      subtotal = subtotal.add(product.price().multiply(BigDecimal.valueOf(item.quantity())));
    }
    BigDecimal shipping = shippingFor(subtotal);
    BigDecimal total = subtotal.add(shipping);
    String id = "BA-" + UUID.randomUUID();
    var a = request.address();
    jdbc.sql(
            """
            INSERT INTO orders (id, status, currency, subtotal, shipping, total, payment_method,
                customer_name, email, street, city, postal, country)
            VALUES (:id, 'MOCK_CONFIRMED', 'INR', :subtotal, :shipping, :total, :payment,
                :name, :email, :street, :city, :postal, :country)
            """)
        .param("id", id)
        .param("subtotal", subtotal)
        .param("shipping", shipping)
        .param("total", total)
        .param("payment", request.paymentMethod())
        .param("name", a.name())
        .param("email", a.email())
        .param("street", a.street())
        .param("city", a.city())
        .param("postal", a.postal())
        .param("country", a.country())
        .update();
    for (var line : lines) {
      int updated =
          jdbc.sql(
                  "UPDATE products SET stock = stock - :quantity WHERE id = :id AND active = true AND stock >= :quantity")
              .param("id", line.productId())
              .param("quantity", line.quantity())
              .update();
      if (updated != 1)
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Stock changed. Refresh your bag.");
      jdbc.sql(
              """
                INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price)
                VALUES (:order, :product, :name, :quantity, :price)
                """)
          .param("order", id)
          .param("product", line.productId())
          .param("name", line.name())
          .param("quantity", line.quantity())
          .param("price", line.unitPrice())
          .update();
    }
    return new OrderResult(
        id, "MOCK_CONFIRMED", "INR", subtotal, shipping, total, List.copyOf(lines));
  }

  static BigDecimal shippingFor(BigDecimal subtotal) {
    return subtotal.compareTo(new BigDecimal("1999")) >= 0 ? BigDecimal.ZERO : new BigDecimal("99");
  }
}
