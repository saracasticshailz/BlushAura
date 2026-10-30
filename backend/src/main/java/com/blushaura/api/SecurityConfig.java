package com.blushaura.api;

import java.util.Map;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

@Configuration
public class SecurityConfig {
  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  UserDetailsService users(JdbcClient jdbc) {
    return email ->
        jdbc.sql("SELECT email, password_hash FROM admin_users WHERE email = :email")
            .param("email", email)
            .query(
                (rs, n) ->
                    User.withUsername(rs.getString(1))
                        .password(rs.getString(2))
                        .roles("SUPER_ADMIN")
                        .build())
            .optional()
            .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));
  }

  @Bean
  SecurityFilterChain security(HttpSecurity http) throws Exception {
    return http.authorizeHttpRequests(
            auth ->
                auth.requestMatchers("/api/csrf", "/api/admin/login", "/error")
                    .permitAll()
                    .requestMatchers("/api/admin/**")
                    .hasRole("SUPER_ADMIN")
                    .requestMatchers(
                        HttpMethod.GET,
                        "/",
                        "/index.html",
                        "/admin",
                        "/admin/",
                        "/assets/**",
                        "/favicon.ico",
                        "/api/ready",
                        "/api/health",
                        "/api/products",
                        "/api/products/*",
                        "/api/categories",
                        "/api/media/*")
                    .permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/orders")
                    .permitAll()
                    .anyRequest()
                    .denyAll())
        .formLogin(
            form ->
                form.loginProcessingUrl("/api/admin/login")
                    .successHandler(
                        (req, res, auth) -> {
                          res.setContentType("application/json");
                          res.getWriter().write("{\"authenticated\":true}");
                        })
                    .failureHandler(
                        (req, res, ex) -> {
                          res.setStatus(401);
                          res.setContentType("application/json");
                          res.getWriter().write("{\"detail\":\"Invalid email or password\"}");
                        }))
        .logout(
            logout ->
                logout
                    .logoutUrl("/api/admin/logout")
                    .logoutSuccessHandler((req, res, auth) -> res.setStatus(204)))
        .exceptionHandling(
            ex ->
                ex.authenticationEntryPoint(
                        (req, res, e) -> {
                          res.setStatus(401);
                          res.setContentType("application/json");
                          res.getWriter().write("{\"detail\":\"Admin sign-in required\"}");
                        })
                    .accessDeniedHandler(
                        (req, res, e) -> {
                          res.setStatus(403);
                          res.setContentType("application/json");
                          res.getWriter()
                              .write(
                                  "{\"detail\":\"Session token expired. Refresh and try again.\"}");
                        }))
        .requestCache(cache -> cache.disable())
        .build();
  }
}

@RestController
class SessionController {
  @GetMapping("/api/csrf")
  Map<String, String> csrf(CsrfToken token) {
    return Map.of("token", token.getToken(), "headerName", token.getHeaderName());
  }

  @GetMapping("/api/admin/session")
  Map<String, String> session(java.security.Principal principal) {
    return Map.of("email", principal.getName(), "role", "SUPER_ADMIN");
  }
}
