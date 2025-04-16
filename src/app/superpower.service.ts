import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, retry } from 'rxjs/operators';

import { Superpower } from './superpower';
import { MessageService } from './message.service';
import { HeroSuperpowerDTO } from './hero-superpower-dto';

@Injectable({
  providedIn: 'root'
})
export class SuperpowerService {
  // Keep relative URL for superpower creation (this works)
  private superpowersUrl = '/api/superpowers';
  
  // Use absolute URL only for the problematic endpoint
  private heroesUrl = '/api/heroes';
  private heroesAbsoluteUrl = 'http://localhost:8080/api/heroes';
  
  httpOptions = {
    headers: new HttpHeaders({ 
      'Content-Type': 'application/json'
    })
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService) { 
      // Log URLs for debugging
      console.log('SuperpowerService initialized with URLs:');
      console.log('- superpowersUrl:', this.superpowersUrl);
      console.log('- heroesUrl:', this.heroesUrl);
      console.log('- heroesAbsoluteUrl:', this.heroesAbsoluteUrl);
    }


  /** GET superpowers from the server */
  getSuperpowers(): Observable<Superpower[]> {
    return this.http.get<Superpower[]>(this.superpowersUrl)
      .pipe(
        tap(_ => this.log('fetched superpowers')),
        catchError(this.handleError<Superpower[]>('getSuperpowers', []))
      );
  }

  /** GET superpower by id */
  getSuperpower(id: number): Observable<Superpower> {
    const url = `${this.superpowersUrl}/${id}`;
    return this.http.get<Superpower>(url).pipe(
      tap(_ => this.log(`fetched superpower id=${id}`)),
      catchError(this.handleError<Superpower>(`getSuperpower id=${id}`))
    );
  }

  /** POST: add a new superpower - FIXED VERSION */
  addSuperpower(superpower: {name: string, description: string}): Observable<Superpower> {
    console.log('Creating new superpower:', superpower);
    
    const superpowerRequest = {
      name: superpower.name,
      description: superpower.description || ''
    };
    
    console.log('Sending request to API:', JSON.stringify(superpowerRequest));
    
    return this.http.post<any>(this.superpowersUrl, superpowerRequest, this.httpOptions).pipe(
      map(response => {
        console.log('Raw server response:', response);
        
        // Extract ID from the self link URL
        let id = null;
        if (response._links && response._links.self) {
          const selfUrl = response._links.self.href;
          const urlParts = selfUrl.split('/');
          id = parseInt(urlParts[urlParts.length - 1], 10);
          console.log('Extracted ID from URL:', id);
        }
        
        // Map to Superpower object with correct ID
        const mappedSuperpower: Superpower = {
          id: id || 0, // Provide a default value of 0 if id is null
          name: response.name,
          description: response.description || ''
        };
        
        console.log('Mapped superpower:', mappedSuperpower);
        return mappedSuperpower;
      }),
      catchError(error => {
        console.error('Server error:', error);
        return throwError(() => error);
      })
    );
  }

  /** PUT: update a superpower */
  updateSuperpower(superpower: Superpower): Observable<any> {
    const url = `${this.superpowersUrl}/${superpower.id}`;
    return this.http.put(url, superpower, this.httpOptions).pipe(
      tap(_ => this.log(`updated superpower id=${superpower.id}`)),
      catchError(this.handleError<any>('updateSuperpower'))
    );
  }

  /** DELETE: delete a superpower */
  deleteSuperpower(id: number): Observable<any> {
    const url = `${this.superpowersUrl}/${id}`;
    return this.http.delete<any>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted superpower id=${id}`)),
      catchError(this.handleError<any>('deleteSuperpower'))
    );
  }

  /** Add superpower to hero */
  addSuperpowerToHero(heroId: number, superpowerId: number): Observable<any> {
    console.log(`Adding superpower ${superpowerId} to hero ${heroId}`);
    
    // Use the correct DTO format that matches the Java backend expectation
    const dto: HeroSuperpowerDTO = {
      heroId: heroId,
      superpowerId: superpowerId
    };
    
    // Use the absolute URL for reliability
    const url = `${this.heroesAbsoluteUrl}/add-superpower`;
    console.log('Sending request to:', url);
    console.log('With payload:', dto);
    
    return this.http.post<any>(url, dto, this.httpOptions).pipe(
      tap(response => console.log('Add superpower to hero response:', response)),
      catchError(error => {
        console.error('Error adding superpower to hero:', error);
        return throwError(() => error);
      })
    );
  }

  /** Remove superpower from hero */
  removeSuperpowerFromHero(heroId: number, superpowerId: number): Observable<any> {
    const url = `${this.heroesAbsoluteUrl}/remove-superpower`;
    
    // Use the proper DTO interface
    const dto: HeroSuperpowerDTO = {
      heroId: heroId,
      superpowerId: superpowerId
    };
    
    return this.http.post<any>(url, dto, this.httpOptions).pipe(
      tap(_ => this.log(`removed superpower id=${superpowerId} from hero id=${heroId}`)),
      catchError(this.handleError<any>('removeSuperpowerFromHero'))
    );
  }

  /** Test server connectivity - use this for debugging */
  pingServer(): Observable<any> {
    // Don't specify responseType to allow automatic JSON parsing
    return this.http.get<any>(`${this.superpowersUrl}`)
      .pipe(
        tap(() => console.log('Server is reachable')),
        catchError(error => {
          console.error('Server is unreachable:', error);
          return throwError(() => new Error('Server connectivity test failed'));
        })
      );
  }

  private log(message: string) {
    this.messageService.add(`SuperpowerService: ${message}`);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} error:`, error);
      
      let errorMsg = 'Unknown error';
      if (error.error && error.error.message) {
        errorMsg = error.error.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      this.log(`${operation} failed: ${errorMsg}`);
      return of(result as T);
    };
  }
}