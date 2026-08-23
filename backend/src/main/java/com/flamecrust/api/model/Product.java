package com.flamecrust.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, length = 40)
    private String sku;
    private String name;
    private String description;
    private BigDecimal price;
    private String category;
    private String image;
    private String tags;
    private BigDecimal rating;
    private boolean popular;
    private boolean spicy;
    private boolean vegetarian;
    private boolean active = true;

    protected Product() {}

    public Product(String name, String description, BigDecimal price, String category,
                   String image, String tags, BigDecimal rating, boolean popular,
                   boolean spicy, boolean vegetarian) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.image = image;
        this.tags = tags;
        this.rating = rating;
        this.popular = popular;
        this.spicy = spicy;
        this.vegetarian = vegetarian;
    }

    public Long getId() { return id; }
    public String getSku() { return sku; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public BigDecimal getPrice() { return price; }
    public String getCategory() { return category; }
    public String getImage() { return image; }
    public String getTags() { return tags; }
    public BigDecimal getRating() { return rating; }
    public boolean isPopular() { return popular; }
    public boolean isSpicy() { return spicy; }
    public boolean isVegetarian() { return vegetarian; }
    public boolean isActive() { return active; }
}
