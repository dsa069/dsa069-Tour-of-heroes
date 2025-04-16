package com.example.demo.model;

import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "superpowers")
public class Superpower {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    private String description;
    
    @ManyToMany(mappedBy = "superpowers", fetch = FetchType.LAZY)
    @JsonIgnoreProperties("superpowers")
    private Set<Hero> heroes = new HashSet<>();
    
    // Constructores
    public Superpower() {}
    
    public Superpower(String name, String description) {
        this.name = name;
        this.description = description;
    }
    
    // Getters y setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Set<Hero> getHeroes() {
        return heroes;
    }
    
    public void setHeroes(Set<Hero> heroes) {
        this.heroes = heroes;
    }
}