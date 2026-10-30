package com.blushaura.api;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class ReadinessController {
  private final JdbcClient jdbc;

  public ReadinessController(JdbcClient jdbc) {
    this.jdbc = jdbc;
  }

  @GetMapping("/api/ready")
  public Map<String, String> ready() {
    try {
      jdbc.sql("SELECT 1").query(Integer.class).single();
      return Map.of("status", "UP");
    } catch (org.springframework.dao.DataAccessException ex) {
      throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Service not ready");
    }
  }
}
