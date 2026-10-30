package com.blushaura.api;

import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class CatalogRepository {
  private final JdbcClient jdbc;
  static final RowMapper<Product> MAPPER =
      (rs, row) ->
          new Product(
              rs.getString("id"),
              rs.getString("name"),
              rs.getString("subtitle"),
              rs.getString("category"),
              rs.getString("subcategory"),
              rs.getBigDecimal("price"),
              rs.getBigDecimal("original_price"),
              rs.getString("color"),
              rs.getString("kind"),
              rs.getString("badge"),
              rs.getString("description"),
              rs.getString("image_url"),
              rs.getInt("stock"),
              rs.getBoolean("active"),
              rs.getInt("display_order"));

  public CatalogRepository(JdbcClient jdbc) {
    this.jdbc = jdbc;
  }

  public List<Product> findAll() {
    return jdbc.sql("SELECT * FROM products WHERE active = true ORDER BY display_order, id")
        .query(MAPPER)
        .list();
  }

  public Optional<Product> findById(String id) {
    return jdbc.sql("SELECT * FROM products WHERE id = :id AND active = true FOR UPDATE")
        .param("id", id)
        .query(MAPPER)
        .optional();
  }
}
