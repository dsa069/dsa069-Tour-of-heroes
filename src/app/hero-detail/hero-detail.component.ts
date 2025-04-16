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
import { catchError, finalize, tap, switchMap } from 'rxjs/operators';

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
  
  constructor(
    private route: ActivatedRoute,
    private heroService: HeroService,
    private superpowerService: SuperpowerService,
    private location: Location,
    private messageService: MessageService // Add MessageService
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

  // Just update this method, leave others unchanged
  // Just update the createAndAddPower method to show more detailed errors
  createAndAddPower(): void {
    if (!this.hero || !this.newSuperpowerName.trim()) { 
      this.errorMessage = "Hero or superpower name is missing";
      return; 
    }
    
    this.loading = true;
    this.errorMessage = '';
    
    // Step 1: Create the superpower
    const newPower = {
      name: this.newSuperpowerName.trim(),
      description: this.newSuperpowerDescription.trim() || ''
    };
    
    console.log('STEP 1: Creating superpower with data:', newPower);
    
    this.superpowerService.addSuperpower(newPower).subscribe({
      next: (createdPower) => {
        console.log('STEP 1 SUCCESS: Created superpower:', createdPower);
        
        // More detailed ID debugging
        console.log('ID details:', {
          id: createdPower.id,
          type: typeof createdPower.id,
          hasValue: Boolean(createdPower.id),
          numericValue: Number(createdPower.id)
        });
        
        // Update the ID validation in createAndAddPower method
        if (!createdPower.id || isNaN(createdPower.id) || createdPower.id <= 0) {
          this.errorMessage = `Created superpower has invalid ID: ${createdPower.id}`;
          this.loading = false;
          return;
        }
        
        if (isNaN(Number(createdPower.id)) || Number(createdPower.id) <= 0) {
          this.errorMessage = `Created superpower has invalid ID: ${createdPower.id}`;
          this.loading = false;
          return;
        }
        
        // Clear form fields and show success message
        this.newSuperpowerName = '';
        this.newSuperpowerDescription = '';
        this.messageService.add(`Created superpower: ${createdPower.name} with ID: ${createdPower.id}`);
        
        // Continue with adding to hero...
        
        // Step 2: Add the superpower to the hero
        console.log('STEP 2: Adding superpower', createdPower.id, 'to hero', this.hero!.id);
        
        this.superpowerService.addSuperpowerToHero(this.hero!.id, createdPower.id).subscribe({
          next: (updatedHero) => {
            console.log('STEP 2 SUCCESS: Hero updated with new power:', updatedHero);
            
            // Extra validation to ensure we got a proper hero back
            if (!updatedHero) {
              this.errorMessage = "Server returned empty response after adding superpower to hero";
              this.loading = false;
              return;
            }
            
            // Update hero in component
            this.messageService.add(`Added superpower to hero ${this.hero!.name}`);
            
            // Store hero explicitly
            this.hero = updatedHero;
            
            // Refresh data explicitly
            this.getHero();
            this.getSuperpowers();
            
            this.loading = false;
          },
          error: (err) => {
            console.error('STEP 2 ERROR: Failed to add superpower to hero:', err);
            let errorMsg = 'Error adding superpower to hero: ';
            
            if (err.status === 0) {
              errorMsg += 'Cannot connect to server';
            } else if (err.status === 404) {
              errorMsg += 'Endpoint not found - check URL configuration';
            } else if (err.error && typeof err.error === 'string') {
              errorMsg += err.error;
            } else if (err.message) {
              errorMsg += err.message;
            } else {
              errorMsg += JSON.stringify(err);
            }
            
            this.errorMessage = errorMsg;
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('STEP 1 ERROR: Failed to create superpower:', err);
        this.errorMessage = `Error creating superpower: ${err.message || JSON.stringify(err)}`;
        this.loading = false;
      }
    });
  }

  // Add an existing power to the hero
  addExistingPower(superpowerId: number): void {
    if (!this.hero) { return; }
    
    this.loading = true;
    this.errorMessage = '';
    console.log('Adding existing superpower:', superpowerId, 'to hero:', this.hero.id);

    this.superpowerService.addSuperpowerToHero(this.hero.id, superpowerId)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (updatedHero) => {
          console.log('Hero updated with existing power:', updatedHero);
          this.hero = updatedHero;
          // Refresh hero data to ensure we have latest information
          this.getHero();
        },
        error: (error) => {
          console.error('Error adding existing power:', error);
          this.errorMessage = `Error adding superpower to hero: ${error.message || error}`;
        }
      });
  }

  // Remove a power from the hero
  removePower(superpowerId: number): void {
    if (!this.hero) { return; }
    
    this.loading = true;
    this.errorMessage = '';
    console.log('Removing superpower:', superpowerId, 'from hero:', this.hero.id);

    this.superpowerService.removeSuperpowerFromHero(this.hero.id, superpowerId)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (updatedHero) => {
          console.log('Hero updated after power removal:', updatedHero);
          this.hero = updatedHero;
          // Refresh hero data to ensure we have latest information
          this.getHero();
        },
        error: (error) => {
          console.error('Error removing power:', error);
          this.errorMessage = `Error removing superpower from hero: ${error.message || error}`;
        }
      });
  }

  goBack(): void {
    this.location.back();
  }

  save(): void {
    if (this.hero) {
      this.heroService.updateHero(this.hero)
        .subscribe({
          next: () => this.goBack(),
          error: (error) => {
            console.error('Error saving hero:', error);
            this.errorMessage = `Error saving hero: ${error.message || error}`;
          }
        });
    }
  }
}