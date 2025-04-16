package com.example.demo.dto;

/**
 * DTO para operaciones con héroes y superpoderes
 */
public class HeroSuperpowerDTO {
    private Long heroId;
    private Long superpowerId;
    
    // Constructores
    public HeroSuperpowerDTO() {
    }
    
    public HeroSuperpowerDTO(Long heroId, Long superpowerId) {
        this.heroId = heroId;
        this.superpowerId = superpowerId;
    }
    
    // Getters y setters
    public Long getHeroId() {
        return heroId;
    }
    
    public void setHeroId(Long heroId) {
        this.heroId = heroId;
    }
    
    public Long getSuperpowerId() {
        return superpowerId;
    }
    
    public void setSuperpowerId(Long superpowerId) {
        this.superpowerId = superpowerId;
    }
}