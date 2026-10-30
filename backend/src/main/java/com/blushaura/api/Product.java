package com.blushaura.api;

import java.math.BigDecimal;

public record Product(
    String id,
    String name,
    String subtitle,
    String category,
    String subcategory,
    BigDecimal price,
    BigDecimal original,
    String color,
    String kind,
    String badge,
    String description,
    String imageUrl,
    int stock,
    boolean active,
    int displayOrder) {}
