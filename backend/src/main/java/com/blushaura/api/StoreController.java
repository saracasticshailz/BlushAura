package com.blushaura.api;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class StoreController {
  private final CatalogRepository catalog;
  private final OrderService orders;
  private final CategoryRepository categories;

  public StoreController(
      CatalogRepository catalog, OrderService orders, CategoryRepository categories) {
    this.catalog = catalog;
    this.orders = orders;
    this.categories = categories;
  }

  @GetMapping("/health")
  public Map<String, String> health() {
    return Map.of("status", "UP", "service", "blush-aura-api");
  }

  @GetMapping("/products")
  public List<Product> products() {
    return catalog.findAll();
  }

  @GetMapping("/products/{id}")
  public Product product(@PathVariable String id) {
    return catalog
        .findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
  }

  public record Category(String name, List<String> subcategories) {}

  @GetMapping("/categories")
  public List<Category> categories() {
    return categories.findAll();
  }

  @PostMapping("/orders")
  @ResponseStatus(HttpStatus.CREATED)
  public OrderService.OrderResult checkout(@Valid @RequestBody CheckoutRequest request) {
    return orders.place(request);
  }
}
