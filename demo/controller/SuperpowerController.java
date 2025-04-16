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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Superpower;
import com.example.demo.repository.SuperpowerRepository;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api")
public class SuperpowerController {

    @Autowired
    private SuperpowerRepository superpowerRepository;
    
    @GetMapping("/superpowers")
    public ResponseEntity<List<Superpower>> getAllSuperpowers() {
        List<Superpower> superpowers = superpowerRepository.findAll();
        return new ResponseEntity<>(superpowers, HttpStatus.OK);
    }
    
    @GetMapping("/superpowers/{id}")
    public ResponseEntity<Superpower> getSuperpowerById(@PathVariable("id") Long id) {
        Optional<Superpower> superpowerData = superpowerRepository.findById(id);
        
        if (superpowerData.isPresent()) {
            return new ResponseEntity<>(superpowerData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    
    @PostMapping("/superpowers")
    public ResponseEntity<Superpower> createSuperpower(@RequestBody Superpower superpower) {
        try {
            Superpower _superpower = superpowerRepository.save(superpower);
            return new ResponseEntity<>(_superpower, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Actualizar un superpoder existente
    @PutMapping("/superpowers/{id}")
    public ResponseEntity<Superpower> updateSuperpower(@PathVariable("id") Long id, @RequestBody Superpower superpower) {
        Optional<Superpower> superpowerData = superpowerRepository.findById(id);
        
        if (superpowerData.isPresent()) {
            Superpower _superpower = superpowerData.get();
            _superpower.setName(superpower.getName());
            _superpower.setDescription(superpower.getDescription());
            
            return new ResponseEntity<>(superpowerRepository.save(_superpower), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Eliminar un superpoder
    @DeleteMapping("/superpowers/{id}")
    public ResponseEntity<HttpStatus> deleteSuperpower(@PathVariable("id") Long id) {
        try {
            Optional<Superpower> superpower = superpowerRepository.findById(id);
            if (!superpower.isPresent()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            
            // Primero eliminar las relaciones con héroes para evitar errores de integridad
            Superpower powToDelete = superpower.get();
            if (powToDelete.getHeroes() != null && !powToDelete.getHeroes().isEmpty()) {
                powToDelete.getHeroes().clear();
                superpowerRepository.save(powToDelete);
            }
            
            // Luego eliminar el superpoder
            superpowerRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

