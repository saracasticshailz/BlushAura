package com.blushaura.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.*;
import org.springframework.http.*;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
  private final JdbcClient jdbc;

  public AdminController(JdbcClient jdbc) {
    this.jdbc = jdbc;
  }

  public record ProductInput(
      @NotBlank @Size(max = 120) String name,
      @NotBlank @Size(max = 250) String subtitle,
      @NotBlank @Size(max = 120) String category,
      @NotBlank @Size(max = 120) String subcategory,
      @NotNull @DecimalMin("0.01") @Digits(integer = 9, fraction = 2) BigDecimal price,
      @NotNull @DecimalMin("0") @Digits(integer = 9, fraction = 2) BigDecimal original,
      @NotBlank @Pattern(regexp = "#[0-9a-fA-F]{6}") String color,
      @NotBlank @Pattern(regexp = "wand|oil|pebble|bundle|candle") String kind,
      @Size(max = 80) String badge,
      @NotBlank @Size(max = 10000) String description,
      @Pattern(regexp = "^$|/api/media/[0-9a-f-]{36}") String imageUrl,
      @Min(0) @Max(1000000) int stock,
      boolean active,
      @Min(0) @Max(100000) int displayOrder) {}

  public record CategoryInput(
      @NotBlank @Size(max = 120) @Pattern(regexp = "(?!All essentials$)\\S(?:.*\\S)?") String name,
      @NotEmpty @Size(max = 50)
          List<@NotBlank @Size(max = 120) @Pattern(regexp = "\\S(?:.*\\S)?") String>
              subcategories) {}

  @GetMapping("/dashboard")
  public Map<String, Object> dashboard() {
    return jdbc.sql(
            """
            SELECT (SELECT COUNT(*) FROM products) AS "products",
             (SELECT COUNT(*) FROM products WHERE active) AS "activeProducts",
             (SELECT COUNT(*) FROM products WHERE active AND stock < 5) AS "lowStock",
             (SELECT COUNT(*) FROM categories) AS "categories",
             (SELECT COUNT(*) FROM orders) AS "orders",
             (SELECT COUNT(*) FROM orders WHERE fulfillment = 'NEW') AS "newOrders",
             (SELECT COALESCE(SUM(total),0) FROM orders WHERE fulfillment <> 'CANCELLED') AS "demoRevenue"
            """)
        .query()
        .singleRow();
  }

  @GetMapping("/products")
  public List<Product> products() {
    return jdbc.sql("SELECT * FROM products ORDER BY display_order, id")
        .query(CatalogRepository.MAPPER)
        .list();
  }

  @PostMapping("/products")
  @ResponseStatus(HttpStatus.CREATED)
  @Transactional
  public Product create(@Valid @RequestBody ProductInput p) {
    return save("p-" + UUID.randomUUID(), p, true);
  }

  @PutMapping("/products/{id}")
  @Transactional
  public Product update(@PathVariable String id, @Valid @RequestBody ProductInput p) {
    return save(id, p, false);
  }

  private Product save(String id, ProductInput p, boolean create) {
    if (p.original().compareTo(p.price()) < 0)
      throw bad("Compare-at price must be at least the selling price");
    if (jdbc.sql("SELECT COUNT(*) FROM subcategories WHERE category=:c AND name=:s")
            .param("c", p.category())
            .param("s", p.subcategory())
            .query(Long.class)
            .single()
        == 0) throw bad("Choose an existing category and subcategory");
    if (p.imageUrl() != null && !p.imageUrl().isBlank()) {
      UUID mediaId;
      try {
        mediaId = UUID.fromString(p.imageUrl().substring("/api/media/".length()));
      } catch (RuntimeException ex) {
        throw bad("Invalid image reference");
      }
      if (jdbc.sql("SELECT COUNT(*) FROM media WHERE id=:id")
              .param("id", mediaId)
              .query(Long.class)
              .single()
          == 0) throw bad("Upload the image before saving");
    }
    String sql =
        create
            ? """
            INSERT INTO products (id,name,subtitle,category,subcategory,price,original_price,color,kind,badge,description,image_url,stock,active,display_order)
            VALUES (:id,:name,:subtitle,:category,:subcategory,:price,:original,:color,:kind,:badge,:description,:image,:stock,:active,:sort)
            """
            : """
            UPDATE products SET name=:name,subtitle=:subtitle,category=:category,subcategory=:subcategory,price=:price,
            original_price=:original,color=:color,kind=:kind,badge=:badge,description=:description,image_url=:image,
            stock=:stock,active=:active,display_order=:sort WHERE id=:id
            """;
    int changed =
        jdbc.sql(sql)
            .param("id", id)
            .param("name", p.name())
            .param("subtitle", p.subtitle())
            .param("category", p.category())
            .param("subcategory", p.subcategory())
            .param("price", p.price())
            .param("original", p.original())
            .param("color", p.color())
            .param("kind", p.kind())
            .param("badge", p.badge())
            .param("description", p.description())
            .param("image", p.imageUrl() == null || p.imageUrl().isBlank() ? null : p.imageUrl())
            .param("stock", p.stock())
            .param("active", p.active())
            .param("sort", p.displayOrder())
            .update();
    if (changed == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
    return jdbc.sql("SELECT * FROM products WHERE id=:id")
        .param("id", id)
        .query(CatalogRepository.MAPPER)
        .single();
  }

  @DeleteMapping("/products/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void archive(@PathVariable String id) {
    if (jdbc.sql("UPDATE products SET active=false WHERE id=:id").param("id", id).update() == 0)
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
  }

  @GetMapping("/categories")
  public List<StoreController.Category> categories() {
    return new CategoryRepository(jdbc).findAll();
  }

  @PostMapping("/categories")
  @ResponseStatus(HttpStatus.CREATED)
  @Transactional
  public void createCategory(@Valid @RequestBody CategoryInput c) {
    if (new HashSet<>(c.subcategories()).size() != c.subcategories().size())
      throw bad("Subcategory names must be unique");
    jdbc.sql("INSERT INTO categories(name) VALUES (:n)").param("n", c.name()).update();
    for (String sub : c.subcategories())
      jdbc.sql("INSERT INTO subcategories(category,name) VALUES (:c,:s)")
          .param("c", c.name())
          .param("s", sub)
          .update();
  }

  @PutMapping("/categories/{name}")
  @Transactional
  public void updateCategory(@PathVariable String name, @Valid @RequestBody CategoryInput c) {
    if (new HashSet<>(c.subcategories()).size() != c.subcategories().size())
      throw bad("Subcategory names must be unique");
    if (jdbc.sql("UPDATE categories SET name=:new WHERE name=:old")
            .param("new", c.name())
            .param("old", name)
            .update()
        == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found");
    var existing =
        jdbc.sql("SELECT name FROM subcategories WHERE category=:c")
            .param("c", c.name())
            .query(String.class)
            .list();
    for (String sub : existing)
      if (!c.subcategories().contains(sub))
        jdbc.sql("DELETE FROM subcategories WHERE category=:c AND name=:s")
            .param("c", c.name())
            .param("s", sub)
            .update();
    for (String sub : c.subcategories())
      if (!existing.contains(sub))
        jdbc.sql("INSERT INTO subcategories(category,name) VALUES (:c,:s)")
            .param("c", c.name())
            .param("s", sub)
            .update();
  }

  @DeleteMapping("/categories/{name}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteCategory(@PathVariable String name) {
    if (jdbc.sql("DELETE FROM categories WHERE name=:name").param("name", name).update() == 0)
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found");
  }

  @GetMapping("/orders")
  public List<Map<String, Object>> orders(@RequestParam(defaultValue = "0") @Min(0) int page) {
    if (page < 0 || page > 100000) throw bad("Invalid page");
    return jdbc.sql(
            "SELECT id, customer_name AS \"customerName\", total, currency, fulfillment, created_at AS \"createdAt\", payment_method AS \"paymentMethod\" FROM orders ORDER BY created_at DESC LIMIT 50 OFFSET :offset")
        .param("offset", page * 50)
        .query()
        .listOfRows();
  }

  @GetMapping("/orders/{id}")
  public Map<String, Object> order(@PathVariable String id) {
    var row =
        jdbc
            .sql(
                "SELECT id, customer_name AS \"customerName\",email,street,city,postal,country,subtotal,shipping,total,currency,fulfillment,created_at AS \"createdAt\",payment_method AS \"paymentMethod\" FROM orders WHERE id=:id")
            .param("id", id)
            .query()
            .listOfRows()
            .stream()
            .findFirst()
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    var result = new LinkedHashMap<>(row);
    result.put(
        "items",
        jdbc.sql(
                "SELECT product_name AS name,quantity,unit_price AS \"unitPrice\" FROM order_items WHERE order_id=:id ORDER BY product_id")
            .param("id", id)
            .query()
            .listOfRows());
    return result;
  }

  public record Fulfillment(
      @NotBlank @Pattern(regexp = "NEW|PROCESSING|SHIPPED|COMPLETED|CANCELLED")
          String fulfillment) {}

  @PatchMapping("/orders/{id}")
  @Transactional
  public void fulfillment(@PathVariable String id, @Valid @RequestBody Fulfillment input) {
    String old =
        jdbc.sql("SELECT fulfillment FROM orders WHERE id=:id FOR UPDATE")
            .param("id", id)
            .query(String.class)
            .optional()
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    if (old.equals(input.fulfillment())) return;
    var allowed =
        Map.of(
            "NEW",
            Set.of("PROCESSING", "CANCELLED"),
            "PROCESSING",
            Set.of("SHIPPED", "CANCELLED"),
            "SHIPPED",
            Set.of("COMPLETED"));
    if (!allowed.getOrDefault(old, Set.of()).contains(input.fulfillment()))
      throw bad("This order status transition is not allowed");
    if (input.fulfillment().equals("CANCELLED")) {
      var items =
          jdbc.sql(
                  "SELECT product_id,quantity FROM order_items WHERE order_id=:id ORDER BY product_id")
              .param("id", id)
              .query()
              .listOfRows();
      for (var item : items)
        jdbc.sql("UPDATE products SET stock=stock+:qty WHERE id=:id")
            .param("qty", item.get("quantity"))
            .param("id", item.get("product_id"))
            .update();
    }
    jdbc.sql("UPDATE orders SET fulfillment=:s WHERE id=:id")
        .param("s", input.fulfillment())
        .param("id", id)
        .update();
  }

  private ResponseStatusException bad(String text) {
    return new ResponseStatusException(HttpStatus.BAD_REQUEST, text);
  }
}
