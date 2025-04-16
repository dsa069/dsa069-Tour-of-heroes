package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Superpower;

@Repository
public interface SuperpowerRepository extends JpaRepository<Superpower, Long> {
}