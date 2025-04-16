package com.example.demo.model;

import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "heroes")
public class Hero {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    private String alterEgo;
    
    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "hero_superpowers", 
        joinColumns = @JoinColumn(name = "hero_id"),
        inverseJoinColumns = @JoinColumn(name = "superpower_id")
    )
    @JsonIgnoreProperties("heroes")
    private Set<Superpower> superpowers = new HashSet<>();
    
    // Constructores
    public Hero() {}
    
    public Hero(String name, String alterEgo) {
        this.name = name;
        this.alterEgo = alterEgo;
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
    
    public String getAlterEgo() {
        return alterEgo;
    }
    
    public void setAlterEgo(String alterEgo) {
        this.alterEgo = alterEgo;
    }
    
    public Set<Superpower> getSuperpowers() {
        return superpowers;
    }
    
    public void setSuperpowers(Set<Superpower> superpowers) {
        this.superpowers = superpowers;
    }
}