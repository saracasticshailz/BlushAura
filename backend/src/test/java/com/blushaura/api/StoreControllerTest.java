package com.blushaura.api;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(StoreController.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
class StoreControllerTest {
  @Autowired MockMvc mvc;
  @MockitoBean CatalogRepository catalog;
  @MockitoBean OrderService orders;
  @MockitoBean CategoryRepository categories;

  @Test
  void returnsCatalog() throws Exception {
    when(catalog.findAll())
        .thenReturn(
            List.of(
                new Product(
                    "aura",
                    "Aura",
                    "Massage wand",
                    "Massagers",
                    "Wands",
                    new BigDecimal("2499"),
                    new BigDecimal("3299"),
                    "#b56a7d",
                    "wand",
                    null,
                    "Demo",
                    null,
                    25,
                    true,
                    0,
                    List.of())));
    mvc.perform(get("/api/products"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value("aura"))
        .andExpect(jsonPath("$[0].price").value(2499));
  }

  @Test
  void missingProductIs404() throws Exception {
    when(catalog.findById("missing")).thenReturn(Optional.empty());
    mvc.perform(get("/api/products/missing")).andExpect(status().isNotFound());
  }

  @Test
  void rejectsInvalidCheckout() throws Exception {
    mvc.perform(
            post("/api/orders")
                .contentType("application/json")
                .content(
                    """
                {"address":{"name":"","email":"invalid","street":"x","city":"x","postal":"1","country":"India"},
                 "paymentMethod":"cash","items":[{"productId":"aura","quantity":0}]}
                """))
        .andExpect(status().isBadRequest());
    verifyNoInteractions(orders);
  }

  @Test
  void rejectsClientSuppliedPrice() throws Exception {
    mvc.perform(
            post("/api/orders")
                .contentType("application/json")
                .content(
                    """
                {"address":{"name":"Demo","email":"demo@example.com","street":"Example","city":"Demo","postal":"1","country":"India"},
                 "paymentMethod":"card","items":[{"productId":"aura","quantity":1,"price":1}]}
                """))
        .andExpect(status().isBadRequest());
    verifyNoInteractions(orders);
  }

  @Test
  void shippingThresholdIsInclusive() {
    assertEquals(new BigDecimal("99"), OrderService.shippingFor(new BigDecimal("1998.99")));
    assertEquals(BigDecimal.ZERO, OrderService.shippingFor(new BigDecimal("1999")));
    assertEquals(BigDecimal.ZERO, OrderService.shippingFor(new BigDecimal("2499")));
  }
}
