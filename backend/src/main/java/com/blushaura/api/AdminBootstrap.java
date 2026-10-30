package com.blushaura.api;

import java.nio.file.*;
import java.nio.file.attribute.PosixFilePermissions;
import java.security.SecureRandom;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrap implements ApplicationRunner {
  private final JdbcClient jdbc;
  private final PasswordEncoder encoder;
  private final Path localDirectory;
  private final String bootstrapEmail;
  private final String bootstrapPassword;
  private final boolean writeLocalCredentials;

  public AdminBootstrap(
      JdbcClient jdbc,
      PasswordEncoder encoder,
      @Value("${blushaura.local-dir:.local}") String localDirectory,
      @Value("${blushaura.bootstrap-email:admin@blushaura.local}") String bootstrapEmail,
      @Value("${blushaura.bootstrap-password:}") String bootstrapPassword,
      @Value("${blushaura.write-local-credentials:true}") boolean writeLocalCredentials) {
    this.jdbc = jdbc;
    this.encoder = encoder;
    this.localDirectory = Path.of(localDirectory);
    this.bootstrapEmail = bootstrapEmail;
    this.bootstrapPassword = bootstrapPassword;
    this.writeLocalCredentials = writeLocalCredentials;
  }

  @Override
  public void run(ApplicationArguments args) throws Exception {
    if (jdbc.sql("SELECT COUNT(*) FROM admin_users").query(Long.class).single() != 0) return;
    String password = bootstrapPassword;
    if (!writeLocalCredentials && password.isBlank()) {
      throw new IllegalStateException("ADMIN_PASSWORD must be configured for hosted deployment");
    }
    if (password.isBlank()) {
      byte[] random = new byte[24];
      new SecureRandom().nextBytes(random);
      password = Base64.getUrlEncoder().withoutPadding().encodeToString(random);
    }
    if (password.length() < 16
        || password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72) {
      throw new IllegalStateException(
          "Admin password must be at least 16 characters and at most 72 UTF-8 bytes");
    }
    if (writeLocalCredentials) {
      Files.createDirectories(
          localDirectory,
          PosixFilePermissions.asFileAttribute(PosixFilePermissions.fromString("rwx------")));
      Path credentials = localDirectory.resolve("admin-credentials.txt");
      Files.writeString(
          credentials,
          "Blush Aura local super admin\nEmail: "
              + bootstrapEmail
              + "\nPassword: "
              + password
              + "\nSign in: http://127.0.0.1:5173/admin\n",
          StandardOpenOption.CREATE,
          StandardOpenOption.TRUNCATE_EXISTING);
      Files.setPosixFilePermissions(credentials, PosixFilePermissions.fromString("rw-------"));
    }
    jdbc.sql("INSERT INTO admin_users(email, password_hash) VALUES (:email, :hash)")
        .param("email", bootstrapEmail)
        .param("hash", encoder.encode(password))
        .update();
  }
}
