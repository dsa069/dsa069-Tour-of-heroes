import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Hero } from '../hero';
import { HeroService } from '../hero.service';

@Component({
  selector: 'app-heroes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.scss']
})
export class HeroesComponent implements OnInit {
  heroes: Hero[] = [];
  heroName = '';

  constructor(private heroService: HeroService) { }

  ngOnInit(): void {
    this.getHeroes();
  }

  getHeroes(): void {
    this.heroService.getHeroes()
      .subscribe(heroes => this.heroes = heroes);
  }

  add(): void {
    const name = this.heroName.trim();
    if (!name) { return; }
    
    // Create a new hero with a temporary ID (will be replaced by server)
    const newHero: Hero = {
      id: 0, // Temporary ID, will be replaced by server
      name: name,
      powers: [] // Start with empty powers array
    };
    
    this.heroService.addHero(newHero)
      .subscribe(hero => {
        this.heroes.push(hero);
        this.heroName = ''; // Clear the input
      });
  }

  delete(hero: Hero): void {
    this.heroes = this.heroes.filter(h => h !== hero);
    this.heroService.deleteHero(hero.id).subscribe();
  }
}