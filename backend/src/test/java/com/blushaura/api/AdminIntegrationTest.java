package com.blushaura.api;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestBuilders.formLogin;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@EnabledIfEnvironmentVariable(named = "BLUSHAURA_INTEGRATION_TESTS", matches = "true")
class AdminIntegrationTest {
  @Autowired MockMvc mvc;
  @Autowired JdbcClient jdbc;
  @Autowired ObjectMapper mapper;
  @Autowired PasswordEncoder encoder;

  @Test
  void adminDataRequiresAuthenticationAndCsrf() throws Exception {
    mvc.perform(get("/api/admin/products")).andExpect(status().isUnauthorized());
    mvc.perform(get("/api/admin/orders")).andExpect(status().isUnauthorized());
    mvc.perform(
            post("/api/admin/categories")
                .with(user("test").roles("SUPER_ADMIN"))
                .contentType("application/json")
                .content("{\"name\":\"Test\",\"subcategories\":[\"One\"]}"))
        .andExpect(status().isForbidden());
    mvc.perform(get("/api/admin/products").with(user("customer").roles("CUSTOMER")))
        .andExpect(status().isForbidden());
  }

  @Test
  void signInUsesDatabasePasswordAndLogoutClearsSession() throws Exception {
    jdbc.sql("INSERT INTO admin_users(email,password_hash) VALUES (:email,:hash)")
        .param("email", "integration@example.local")
        .param("hash", encoder.encode("TestingOnly!123"))
        .update();
    mvc.perform(formLogin("/api/admin/login").user("integration@example.local").password("wrong"))
        .andExpect(status().isUnauthorized());
    var result =
        mvc.perform(
                formLogin("/api/admin/login")
                    .user("integration@example.local")
                    .password("TestingOnly!123"))
            .andExpect(status().isOk())
            .andReturn();
    var session = (MockHttpSession) result.getRequest().getSession(false);
    assertNotNull(session);
    mvc.perform(get("/api/admin/session").session(session))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email").value("integration@example.local"));
    mvc.perform(post("/api/admin/logout").session(session).with(csrf()))
        .andExpect(status().isNoContent());
    assertTrue(session.isInvalid());
  }

  @Test
  void categoryProductAndImageSharePublicCatalog() throws Exception {
    var admin = user("test").roles("SUPER_ADMIN");
    mvc.perform(
            post("/api/admin/categories")
                .with(admin)
                .with(csrf())
                .contentType("application/json")
                .content(
                    "{\"name\":\"Integration collection\",\"subcategories\":[\"Essentials\"]}"))
        .andExpect(status().isCreated());
    var bytes = new ByteArrayOutputStream();
    ImageIO.write(new BufferedImage(20, 10, BufferedImage.TYPE_INT_RGB), "png", bytes);
    var upload =
        mvc.perform(
                multipart("/api/admin/media")
                    .file(
                        new MockMultipartFile("file", "demo.png", "image/png", bytes.toByteArray()))
                    .param("width", "800")
                    .param("height", "600")
                    .param("scale", "50")
                    .with(admin)
                    .with(csrf().asHeader()))
            .andExpect(status().isCreated())
            .andReturn();
    String url = mapper.readTree(upload.getResponse().getContentAsString()).get("url").asText();
    var stored =
        mvc.perform(get(url))
            .andExpect(status().isOk())
            .andExpect(content().contentType("image/png"))
            .andReturn();
    var resized =
        ImageIO.read(
            new java.io.ByteArrayInputStream(stored.getResponse().getContentAsByteArray()));
    assertEquals(800, resized.getWidth());
    assertEquals(600, resized.getHeight());
    assertEquals(java.awt.Color.WHITE.getRGB(), resized.getRGB(0, 0));
    assertEquals(java.awt.Color.BLACK.getRGB(), resized.getRGB(400, 300));
    String body =
        """
            {"name":"Integration product","subtitle":"A test essential","category":"Integration collection",
             "subcategory":"Essentials","price":500,"original":600,"color":"#b56a7d","kind":"oil",
             "badge":"","description":"A test product","imageUrl":"%s","stock":4,"active":true,"displayOrder":10}
            """
            .formatted(url);
    var created =
        mvc.perform(
                post("/api/admin/products")
                    .with(admin)
                    .with(csrf())
                    .contentType("application/json")
                    .content(body))
            .andExpect(status().isCreated())
            .andReturn();
    String id = mapper.readTree(created.getResponse().getContentAsString()).get("id").asText();
    mvc.perform(get("/api/products/" + id))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.imageUrl").value(url));

    mvc.perform(delete("/api/admin/products/" + id).with(admin).with(csrf()))
        .andExpect(status().isNoContent());
    mvc.perform(get("/api/products/" + id)).andExpect(status().isNotFound());
    mvc.perform(get("/api/admin/products").with(admin)).andExpect(status().isOk());
    mvc.perform(delete("/api/admin/categories/Integration collection").with(admin).with(csrf()))
        .andExpect(status().isConflict());
  }

  @Test
  void videoGalleryRoundTripsAndSupportsRangeRequests() throws Exception {
    var admin = user("test").roles("SUPER_ADMIN");
    byte[] header = new byte[] {0, 0, 0, 24, 'f', 't', 'y', 'p', 'i', 's', 'o', 'm', 0, 0, 0, 0};
    var uploaded =
        mvc.perform(
                multipart("/api/admin/media")
                    .file(new MockMultipartFile("file", "clip.mp4", "video/mp4", header))
                    .with(admin)
                    .with(csrf().asHeader()))
            .andExpect(status().isCreated())
            .andReturn();
    String url = mapper.readTree(uploaded.getResponse().getContentAsString()).get("url").asText();
    mvc.perform(get(url).header("Range", "bytes=0-7"))
        .andExpect(status().isPartialContent())
        .andExpect(header().string("Content-Range", "bytes 0-7/16"))
        .andExpect(content().bytes(java.util.Arrays.copyOf(header, 8)));
    var product =
        mapper.valueToTree(
            jdbc.sql("SELECT * FROM products WHERE id='aura'")
                .query(CatalogRepository.MAPPER)
                .single());
    ((com.fasterxml.jackson.databind.node.ObjectNode) product).remove("id");
    com.fasterxml.jackson.databind.node.ArrayNode gallery = product.withArray("media");
    gallery.addObject().put("url", url).put("type", "video").put("caption", "A short ritual");
    mvc.perform(
            put("/api/admin/products/aura")
                .with(admin)
                .with(csrf())
                .contentType("application/json")
                .content(mapper.writeValueAsBytes(product)))
        .andExpect(status().isOk());
    mvc.perform(get("/api/products/aura"))
        .andExpect(jsonPath("$.media[0].url").value(url))
        .andExpect(jsonPath("$.media[0].type").value("video"));
    ((com.fasterxml.jackson.databind.node.ObjectNode) gallery.get(0)).put("type", "image");
    mvc.perform(
            put("/api/admin/products/aura")
                .with(admin)
                .with(csrf())
                .contentType("application/json")
                .content(mapper.writeValueAsBytes(product)))
        .andExpect(status().isBadRequest());
    ((com.fasterxml.jackson.databind.node.ObjectNode) gallery.get(0))
        .put("url", "https://example.com/media.mp4");
    mvc.perform(
            put("/api/admin/products/aura")
                .with(admin)
                .with(csrf())
                .contentType("application/json")
                .content(mapper.writeValueAsBytes(product)))
        .andExpect(status().isBadRequest());
    mvc.perform(
            multipart("/api/admin/media")
                .file(
                    new MockMultipartFile(
                        "file", "fake.mp4", "video/mp4", "not a video".getBytes()))
                .with(admin)
                .with(csrf().asHeader()))
        .andExpect(status().isBadRequest());
    mvc.perform(
            multipart("/api/admin/media")
                .file(
                    new MockMultipartFile(
                        "file", "large.mp4", "video/mp4", new byte[20 * 1024 * 1024 + 1]))
                .with(admin)
                .with(csrf().asHeader()))
        .andExpect(status().isBadRequest());
  }

  @Test
  void checkoutDecrementsStockAndCancellationRestocksOnlyOnce() throws Exception {
    int before =
        jdbc.sql("SELECT stock FROM products WHERE id='aura'").query(Integer.class).single();
    var response =
        mvc.perform(
                post("/api/orders")
                    .with(csrf())
                    .contentType("application/json")
                    .content(
                        """
            {"address":{"name":"Demo Customer","email":"demo@example.com","street":"Example Street","city":"Demo City","postal":"100001","country":"India"},
             "paymentMethod":"paypal","items":[{"productId":"aura","quantity":2}]}
            """))
            .andExpect(status().isCreated())
            .andReturn();
    var result = mapper.readTree(response.getResponse().getContentAsString());
    String id = result.get("id").asText();
    BigDecimal price =
        jdbc.sql("SELECT price FROM products WHERE id='aura'").query(BigDecimal.class).single();
    assertEquals(
        0, price.multiply(BigDecimal.valueOf(2)).compareTo(result.get("subtotal").decimalValue()));
    assertEquals(
        before - 2,
        jdbc.sql("SELECT stock FROM products WHERE id='aura'").query(Integer.class).single());
    var admin = user("test").roles("SUPER_ADMIN");
    mvc.perform(get("/api/admin/orders/" + id).with(admin))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.items[0].quantity").value(2));
    for (int i = 0; i < 2; i++)
      mvc.perform(
              patch("/api/admin/orders/" + id)
                  .with(admin)
                  .with(csrf())
                  .contentType("application/json")
                  .content("{\"fulfillment\":\"CANCELLED\"}"))
          .andExpect(status().isOk());
    assertEquals(
        before,
        jdbc.sql("SELECT stock FROM products WHERE id='aura'").query(Integer.class).single());
    mvc.perform(
            patch("/api/admin/orders/" + id)
                .with(admin)
                .with(csrf())
                .contentType("application/json")
                .content("{\"fulfillment\":\"SHIPPED\"}"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void uploadCropsTheSelectedAreaAndRejectsPartialOrInvalidBounds() throws Exception {
    var source = new BufferedImage(40, 20, BufferedImage.TYPE_INT_RGB);
    var g = source.createGraphics();
    g.setColor(java.awt.Color.RED);
    g.fillRect(0, 0, 40, 20);
    g.setColor(java.awt.Color.BLUE);
    g.fillRect(20, 0, 20, 20);
    g.dispose();
    var bytes = new ByteArrayOutputStream();
    ImageIO.write(source, "png", bytes);
    var file = new MockMultipartFile("file", "crop.png", "image/png", bytes.toByteArray());
    var admin = user("test").roles("SUPER_ADMIN");
    var upload =
        mvc.perform(
                multipart("/api/admin/media")
                    .file(file)
                    .param("width", "600")
                    .param("height", "600")
                    .param("scale", "100")
                    .param("cropX", "20")
                    .param("cropY", "0")
                    .param("cropWidth", "20")
                    .param("cropHeight", "20")
                    .with(admin)
                    .with(csrf().asHeader()))
            .andExpect(status().isCreated())
            .andReturn();
    var url = mapper.readTree(upload.getResponse().getContentAsString()).get("url").asText();
    var response = mvc.perform(get(url)).andExpect(status().isOk()).andReturn();
    var result =
        ImageIO.read(
            new java.io.ByteArrayInputStream(response.getResponse().getContentAsByteArray()));
    assertEquals(600, result.getWidth());
    assertEquals(600, result.getHeight());
    assertEquals(java.awt.Color.BLUE.getRGB(), result.getRGB(0, 0));
    assertEquals(java.awt.Color.BLUE.getRGB(), result.getRGB(599, 599));
    mvc.perform(
            multipart("/api/admin/media")
                .file(file)
                .param("cropX", "20")
                .with(admin)
                .with(csrf().asHeader()))
        .andExpect(status().isBadRequest());
    mvc.perform(
            multipart("/api/admin/media")
                .file(file)
                .param("cropX", "30")
                .param("cropY", "0")
                .param("cropWidth", "20")
                .param("cropHeight", "20")
                .with(admin)
                .with(csrf().asHeader()))
        .andExpect(status().isBadRequest());
  }

  @Test
  void rejectsNonImagesAndInsufficientStock() throws Exception {
    mvc.perform(
            multipart("/api/admin/media")
                .file(new MockMultipartFile("file", "fake.png", "image/png", "image".getBytes()))
                .param("width", "9000")
                .param("height", "800")
                .param("scale", "100")
                .with(user("test").roles("SUPER_ADMIN"))
                .with(csrf().asHeader()))
        .andExpect(status().isBadRequest());
    mvc.perform(
            multipart("/api/admin/media")
                .file(
                    new MockMultipartFile(
                        "file", "fake.png", "image/png", "not an image".getBytes()))
                .with(user("test").roles("SUPER_ADMIN"))
                .with(csrf().asHeader()))
        .andExpect(status().isBadRequest());
    jdbc.sql("UPDATE products SET stock=0 WHERE id='aura'").update();
    mvc.perform(
            post("/api/orders")
                .with(csrf())
                .contentType("application/json")
                .content(
                    """
            {"address":{"name":"Demo","email":"demo@example.com","street":"Example","city":"Demo","postal":"100001","country":"India"},
             "paymentMethod":"card","items":[{"productId":"aura","quantity":1}]}
            """))
        .andExpect(status().isConflict());
  }
}
