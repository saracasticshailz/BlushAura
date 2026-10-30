package com.blushaura.api;

import java.util.List;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class CategoryRepository {
  private final JdbcClient jdbc;

  public CategoryRepository(JdbcClient jdbc) {
    this.jdbc = jdbc;
  }

  public List<StoreController.Category> findAll() {
    return jdbc.sql("SELECT name FROM categories ORDER BY name").query(String.class).list().stream()
        .map(
            n ->
                new StoreController.Category(
                    n,
                    jdbc.sql("SELECT name FROM subcategories WHERE category=:c ORDER BY name")
                        .param("c", n)
                        .query(String.class)
                        .list()))
        .toList();
  }
}
