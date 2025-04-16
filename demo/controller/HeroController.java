package com.example.demo.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Hero;
import com.example.demo.model.Superpower;
import com.example.demo.repository.SuperpowerRepository;
import com.example.demo.service.HeroService;
import com.example.demo.dto.HeroSuperpowerDTO;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
public class HeroController {
    
    @Autowired
    private HeroService heroService;
    
    @Autowired  // Agregar esta anotación
    private SuperpowerRepository superpowerRepository;
    
    // Get all heroes
    @GetMapping("/heroes")
    public ResponseEntity<List<Hero>> getAllHeroes() {
        List<Hero> heroes = heroService.findAllHeroes();
        return new ResponseEntity<>(heroes, HttpStatus.OK);
    }
    
    // Get hero by id
    @GetMapping("/heroes/{id}")
    public ResponseEntity<Hero> getHeroById(@PathVariable("id") Long id) {
        Optional<Hero> heroData = heroService.findHeroById(id);
        
        if (heroData.isPresent()) {
            return new ResponseEntity<>(heroData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    // Search heroes by name
    @GetMapping("/heroes/search")
    public ResponseEntity<List<Hero>> searchHeroes(@RequestParam("name") String name) {
        List<Hero> heroes = heroService.searchHeroes(name);
        return new ResponseEntity<>(heroes, HttpStatus.OK);
    }

    // Search heroes by alterEgo
    @GetMapping("/heroes/search/alterEgo")
    public ResponseEntity<List<Hero>> searchHeroesByAlterEgo(@RequestParam("alterEgo") String alterEgo) {
        List<Hero> heroes = heroService.searchHeroesByAlterEgo(alterEgo);
        return new ResponseEntity<>(heroes, HttpStatus.OK);
    }
    
    // Create a new hero
    @PostMapping("/heroes")
    public ResponseEntity<Hero> createHero(@RequestBody Hero hero) {
        try {
            Hero _hero = heroService.saveHero(hero);
            return new ResponseEntity<>(_hero, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Agregar este método a HeroController.java justo antes del método deleteHero
    @PostMapping("/heroes/add-superpower")
    public ResponseEntity<Object> addSuperpowerToHeroWithDTO(@RequestBody HeroSuperpowerDTO dto) {
        try {
            // Verificar primero si ambos existen
            Optional<Hero> hero = heroService.findHeroById(dto.getHeroId());
            if (!hero.isPresent()) {
                return new ResponseEntity<>("Hero with ID " + dto.getHeroId() + " not found", HttpStatus.NOT_FOUND);
            }
            
            // Verificar si el superpoder existe
            Optional<Superpower> superpower = superpowerRepository.findById(dto.getSuperpowerId());
            if (!superpower.isPresent()) {
                return new ResponseEntity<>("Superpower with ID " + dto.getSuperpowerId() + " not found", HttpStatus.NOT_FOUND);
            }
            
            Hero updatedHero = heroService.addSuperpowerToHero(dto.getHeroId(), dto.getSuperpowerId());
            return new ResponseEntity<>(updatedHero, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error interno: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PostMapping("/heroes/remove-superpower")
    public ResponseEntity<Object> removeSuperpowerFromHeroWithDTO(@RequestBody HeroSuperpowerDTO dto) {
        try {
            // Verificar primero si ambos existen
            Optional<Hero> hero = heroService.findHeroById(dto.getHeroId());
            if (!hero.isPresent()) {
                return new ResponseEntity<>("Hero with ID " + dto.getHeroId() + " not found", HttpStatus.NOT_FOUND);
            }
            
            // Verificar si el superpoder existe
            Optional<Superpower> superpower = superpowerRepository.findById(dto.getSuperpowerId());
            if (!superpower.isPresent()) {
                return new ResponseEntity<>("Superpower with ID " + dto.getSuperpowerId() + " not found", HttpStatus.NOT_FOUND);
            }
            
            Hero updatedHero = heroService.removeSuperpowerFromHero(dto.getHeroId(), dto.getSuperpowerId());
            return new ResponseEntity<>(updatedHero, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error interno: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update a hero
    @PutMapping("/heroes/{id}")
    public ResponseEntity<Hero> updateHero(@PathVariable("id") Long id, @RequestBody Hero hero) {
        Optional<Hero> heroData = heroService.findHeroById(id);
        
        if (heroData.isPresent()) {
            Hero _hero = heroData.get();
            _hero.setName(hero.getName());
            _hero.setAlterEgo(hero.getAlterEgo());
            
            // Actualizar superpoderes si se proporcionan
            if (hero.getSuperpowers() != null) {
                _hero.setSuperpowers(hero.getSuperpowers());
            }
            
            return new ResponseEntity<>(heroService.saveHero(_hero), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete a hero
    @DeleteMapping("/heroes/{id}")
    public ResponseEntity<HttpStatus> deleteHero(@PathVariable("id") Long id) {
        try {
            heroService.deleteHero(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}