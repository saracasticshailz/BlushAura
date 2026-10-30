package com.blushaura.api;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.crypto.password.PasswordEncoder;

class AdminBootstrapTest {
  @TempDir Path directory;

  private JdbcClient emptyDatabase() {
    var jdbc = mock(JdbcClient.class, RETURNS_DEEP_STUBS);
    when(jdbc.sql("SELECT COUNT(*) FROM admin_users").query(Long.class).single()).thenReturn(0L);
    return jdbc;
  }

  @Test
  void hostedBootstrapRequiresSecretAndDoesNotWriteCredentials() {
    var jdbc = emptyDatabase();
    var encoder = mock(PasswordEncoder.class);
    var bootstrap =
        new AdminBootstrap(jdbc, encoder, directory.toString(), "admin@blushaura.local", "", false);
    assertThrows(IllegalStateException.class, () -> bootstrap.run(null));
    verifyNoInteractions(encoder);
    assertFalse(Files.exists(directory.resolve("admin-credentials.txt")));
  }

  @Test
  void hostedBootstrapUsesConfiguredPasswordWithoutWritingAFile() throws Exception {
    var jdbc = emptyDatabase();
    var encoder = mock(PasswordEncoder.class);
    String password = "TestOnly-Hosted-Password-123";
    when(encoder.encode(password)).thenReturn("hashed-password");
    new AdminBootstrap(
            jdbc, encoder, directory.toString(), "admin@blushaura.local", password, false)
        .run(null);
    verify(encoder).encode(password);
    assertFalse(Files.exists(directory.resolve("admin-credentials.txt")));
  }

  @Test
  void hostedBootstrapRejectsShortPasswords() {
    var bootstrap =
        new AdminBootstrap(
            emptyDatabase(),
            mock(PasswordEncoder.class),
            directory.toString(),
            "admin@blushaura.local",
            "short",
            false);
    assertThrows(IllegalStateException.class, () -> bootstrap.run(null));
  }

  @Test
  void localBootstrapStillGeneratesPrivateCredentialsFile() throws Exception {
    var jdbc = emptyDatabase();
    var encoder = mock(PasswordEncoder.class);
    when(encoder.encode(anyString())).thenReturn("hashed-password");
    new AdminBootstrap(jdbc, encoder, directory.toString(), "admin@blushaura.local", "", true)
        .run(null);
    var file = directory.resolve("admin-credentials.txt");
    assertTrue(Files.readString(file).contains("Email: admin@blushaura.local"));
    assertEquals(
        "rw-------",
        java.nio.file.attribute.PosixFilePermissions.toString(Files.getPosixFilePermissions(file)));
  }
}
