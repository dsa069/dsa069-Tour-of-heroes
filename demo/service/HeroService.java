package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.model.Hero;
import com.example.demo.model.Superpower;
import com.example.demo.repository.HeroRepository;
import com.example.demo.repository.SuperpowerRepository;

@Service
public class HeroService {
    
    @Autowired
    private HeroRepository heroRepository;
    
    public List<Hero> findAllHeroes() {
        return heroRepository.findAll();
    }
    
    public Optional<Hero> findHeroById(Long id) {
        return heroRepository.findById(id);
    }
    
    public List<Hero> searchHeroes(String term) {
        return heroRepository.findByNameContainingIgnoreCase(term);
    }

    public List<Hero> searchHeroesByAlterEgo(String term) {
        return heroRepository.findByAlterEgoContainingIgnoreCase(term);
    }
    
    public Hero saveHero(Hero hero) {
        return heroRepository.save(hero);
    }
    
    public void deleteHero(Long id) {
        heroRepository.deleteById(id);
    }

    @Autowired
    private SuperpowerRepository superpowerRepository;
    
    @Transactional
    public Hero addSuperpowerToHero(Long heroId, Long superpowerId) {
        Hero hero = heroRepository.findById(heroId)
                .orElseThrow(() -> new RuntimeException("Hero not found"));
        
        Superpower superpower = superpowerRepository.findById(superpowerId)
                .orElseThrow(() -> new RuntimeException("Superpower not found"));
        
        hero.getSuperpowers().add(superpower);
        superpower.getHeroes().add(hero);
        return heroRepository.save(hero);
    }

    @Transactional
    public Hero removeSuperpowerFromHero(Long heroId, Long superpowerId) {
        Hero hero = heroRepository.findById(heroId)
                .orElseThrow(() -> new RuntimeException("Hero not found"));
        
        Superpower superpower = superpowerRepository.findById(superpowerId)
                .orElseThrow(() -> new RuntimeException("Superpower not found"));
        
        // Eliminar la asociación
        hero.getSuperpowers().remove(superpower);
        superpower.getHeroes().remove(hero);
        
        return heroRepository.save(hero);
    }
}