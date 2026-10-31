package com.blushaura.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.constraints.*;
import java.util.List;

public record ProductMedia(
    @NotBlank @Pattern(regexp = "/api/media/[0-9a-f-]{36}") String url,
    @NotBlank @Pattern(regexp = "image|video") String type,
    @NotNull @Size(max = 160) String caption) {
  private static final ObjectMapper JSON = new ObjectMapper();

  static List<ProductMedia> read(String value) {
    try {
      return JSON.readValue(value, new TypeReference<List<ProductMedia>>() {});
    } catch (JsonProcessingException e) {
      throw new IllegalStateException("Invalid stored product gallery", e);
    }
  }

  static String write(List<ProductMedia> value) {
    try {
      return JSON.writeValueAsString(value);
    } catch (JsonProcessingException e) {
      throw new IllegalArgumentException("Invalid product gallery", e);
    }
  }
}
