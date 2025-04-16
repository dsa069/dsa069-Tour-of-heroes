import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Hero } from '../hero';
import { Superpower } from '../superpower';
import { HeroService } from '../hero.service';
import { SuperpowerService } from '../superpower.service';
import { MessageService } from '../message.service'; // Add this import
import { Observable, forkJoin, of } from 'rxjs';
import { MarvelApiService } from '../marvel-api.service';

@Component({
  selector: 'app-hero-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.scss']
})
export class HeroDetailComponent implements OnInit {
  hero?: Hero;
  allSuperpowers: Superpower[] = [];
  newSuperpowerName = '';
  newSuperpowerDescription = '';
  loading = false;
  errorMessage = '';
  originalHero?: Hero;  // To store the hero as it was loaded
  pendingAddPowers: number[] = [];  // IDs of superpowers to add
  pendingRemovePowers: number[] = [];  // IDs of superpowers to remove
  hasChanges = false;  // Track if there are unsaved changes
  
  constructor(
    private route: ActivatedRoute,
    private heroService: HeroService,
    private superpowerService: SuperpowerService,
    private marvelApiService: MarvelApiService, // Add this
    private location: Location,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.getHero();
    this.getSuperpowers();
  }

  getHero(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.heroService.getHero(id)
      .subscribe({
        next: hero => {
          console.log('Hero loaded:', hero);
          this.hero = hero;
          this.originalHero = JSON.parse(JSON.stringify(hero));
          this.pendingAddPowers = [];
          this.pendingRemovePowers = [];
          this.hasChanges = false;
          
          // Get the hero image after loading the hero
          this.getHeroImage();
        },
        error: error => {
          console.error('Error loading hero:', error);
          this.errorMessage = `Error loading hero: ${error.message}`;
        }
      });
  }

  getSuperpowers(): void {
    this.superpowerService.getSuperpowers()
      .subscribe({
        next: superpowers => {
          console.log('Superpowers loaded:', superpowers);
          this.allSuperpowers = superpowers;
        },
        error: error => {
          console.error('Error loading superpowers:', error);
          this.errorMessage = `Error loading superpowers: ${error.message}`;
        }
      });
  }

  getHeroImage(): void {
    if (this.hero && !this.hero.imageUrl) {
      this.marvelApiService.getHeroImage(this.hero.name).subscribe({
        next: (imageUrl) => {
          if (imageUrl) {
            this.hero!.imageUrl = imageUrl;
          }
        },
        error: (error) => {
          console.error('Error fetching hero image:', error);
        }
      });
    }
  }

  createAndAddPower(): void {
    if (!this.hero || !this.newSuperpowerName.trim()) { 
      this.errorMessage = "Hero or superpower name is missing";
      return; 
    }
    
    this.loading = true;
    this.errorMessage = '';
    
    // Step 1: Still need to create the superpower in the database
    const newPower = {
      name: this.newSuperpowerName.trim(),
      description: this.newSuperpowerDescription.trim() || ''
    };
    
    this.superpowerService.addSuperpower(newPower).subscribe({
      next: (createdPower) => {
        // Add to hero's powers locally instead of calling the server
        if (!this.hero!.superpowers) {
          this.hero!.superpowers = [];
        }
        this.hero!.superpowers.push(createdPower);
        
        // Track for later saving
        this.pendingAddPowers.push(createdPower.id);
        this.hasChanges = true;
        
        // Clear form fields
        this.newSuperpowerName = '';
        this.newSuperpowerDescription = '';
        this.messageService.add(`Created superpower: ${createdPower.name} (hero changes not saved yet)`);
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = `Error creating superpower: ${err.message}`;
        this.loading = false;
      }
    });
  }

  addExistingPower(superpowerId: number): void {
    if (!this.hero) { return; }
    
    // Check if this power is already in the hero's powers
    if (this.hero.superpowers && this.hero.superpowers.some(p => p.id === superpowerId)) {
      return; // Power already added
    }
    
    // Find the superpower from all available powers
    const powerToAdd = this.allSuperpowers.find(p => p.id === superpowerId);
    if (!powerToAdd) { return; }
    
    // Add to hero's powers locally
    if (!this.hero.superpowers) {
      this.hero.superpowers = [];
    }
    this.hero.superpowers.push(powerToAdd);
    
    // Track this addition for later saving
    this.pendingAddPowers.push(superpowerId);
    
    // If it was pending removal, remove from that list
    const removeIndex = this.pendingRemovePowers.indexOf(superpowerId);
    if (removeIndex > -1) {
      this.pendingRemovePowers.splice(removeIndex, 1);
    }
    
    this.hasChanges = true;
    this.messageService.add(`Power "${powerToAdd.name}" added to hero (not saved yet)`);
  }

  removePower(superpowerId: number): void {
    if (!this.hero || !this.hero.superpowers) { return; }
    
    // Find the power to remove
    const powerIndex = this.hero.superpowers.findIndex(p => p.id === superpowerId);
    if (powerIndex === -1) { return; }
    
    const removedPower = this.hero.superpowers[powerIndex];
    
    // Remove locally
    this.hero.superpowers.splice(powerIndex, 1);
    
    // Track this removal for later saving
    this.pendingRemovePowers.push(superpowerId);
    
    // If it was pending addition, remove from that list
    const addIndex = this.pendingAddPowers.indexOf(superpowerId);
    if (addIndex > -1) {
      this.pendingAddPowers.splice(addIndex, 1);
    }
    
    this.hasChanges = true;
    this.messageService.add(`Power "${removedPower.name}" removed from hero (not saved yet)`);
  }

  goBack(): void {
    this.location.back();
  }

  save(): void {
    if (!this.hero) { return; }
    
    this.loading = true;
    this.errorMessage = '';
    
    // Create an observable array for all operations
    const operations: Observable<any>[] = [];
    
    // First add all pending add operations
    this.pendingAddPowers.forEach(powerId => {
      operations.push(
        this.superpowerService.addSuperpowerToHero(this.hero!.id, powerId)
      );
    });
    
    // Then add all pending remove operations
    this.pendingRemovePowers.forEach(powerId => {
      operations.push(
        this.superpowerService.removeSuperpowerFromHero(this.hero!.id, powerId)
      );
    });
    
    // Finally update the hero basic info
    operations.push(this.heroService.updateHero(this.hero));
    
    // Execute all operations in sequence
    if (operations.length > 0) {
      forkJoin(operations).subscribe({
        next: responses => {
          console.log('All changes saved successfully:', responses);
          this.messageService.add('Hero updated with all superpower changes');
          this.hasChanges = false;
          this.pendingAddPowers = [];
          this.pendingRemovePowers = [];
          this.loading = false;
          this.goBack();
        },
        error: err => {
          console.error('Error saving changes:', err);
          this.errorMessage = `Error saving changes: ${err.message}`;
          this.loading = false;
        }
      });
    } else {
      // No changes, just update the hero
      this.heroService.updateHero(this.hero).subscribe({
        next: () => {
          this.messageService.add('Hero updated');
          this.loading = false;
          this.goBack();
        },
        error: (error) => {
          console.error('Error saving hero:', error);
          this.errorMessage = `Error saving hero: ${error.message || error}`;
          this.loading = false;
        }
      });
    }
  }
}