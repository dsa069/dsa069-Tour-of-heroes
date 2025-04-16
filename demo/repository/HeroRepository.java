package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Hero;

@Repository
public interface HeroRepository extends JpaRepository<Hero, Long> {
    List<Hero> findByNameContainingIgnoreCase(String name);

    // Añadir este método para búsqueda por alterEgo
    List<Hero> findByAlterEgoContainingIgnoreCase(String alterEgo);
}

