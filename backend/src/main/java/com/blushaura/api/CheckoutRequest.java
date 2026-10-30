package com.blushaura.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record CheckoutRequest(
    @NotNull @Valid Address address,
    @NotBlank @Pattern(regexp = "card|paypal") String paymentMethod,
    @NotEmpty @Size(max = 50) List<@NotNull @Valid Item> items) {
  public record Address(
      @NotBlank @Size(max = 120) String name,
      @NotBlank @Email @Size(max = 254) String email,
      @NotBlank @Size(max = 300) String street,
      @NotBlank @Size(max = 100) String city,
      @NotBlank @Size(max = 20) String postal,
      @NotBlank @Pattern(regexp = "India|United Arab Emirates|United Kingdom|United States")
          String country) {}

  public record Item(@NotBlank @Size(max = 60) String productId, @Min(1) @Max(99) int quantity) {}
}
