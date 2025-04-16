import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Hero } from './hero';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class HeroService {

  private heroesUrl = '/api/heroes';  
  
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  /** GET hero by id. Will 404 if id not found */
  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    return this.http.get<any>(url).pipe(
      map(hero => ({
        id: hero.id,
        name: hero.name,
        alterEgo: hero.alterEgo,
        superpowers: hero.superpowers || [], // Correctly map superpowers from backend
        powers: [] // Keep powers for backwards compatibility
      })),
      tap(_ => this.log(`fetched hero id=${id}`)),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    );
  }

  /** GET heroes from the server */
  getHeroes(): Observable<Hero[]> {
    return this.http.get<Hero[]>(this.heroesUrl)
      .pipe(
        map(heroes => {
          // Transform API heroes to our app model if needed
          return heroes.map(hero => ({
            id: hero.id,
            name: hero.name,
            alterEgo: hero.alterEgo,
            superpowers: hero.superpowers || [], // Add this line
            powers: hero.powers || [] 
          }));
        }),
        tap(_ => this.log('fetched heroes')),
        catchError(this.handleError<Hero[]>('getHeroes', []))
      );
  }

  /** PUT: update the hero on the server */
  updateHero(hero: Hero): Observable<any> {
    const url = `${this.heroesUrl}/${hero.id}`;
    
    // Create a hero object that includes all needed properties
    const apiHero = {
      id: hero.id,
      name: hero.name,
      alterEgo: hero.alterEgo || '',
      superpowers: hero.superpowers,
      imageUrl: hero.imageUrl // Preserve the image URL
    };
    
    return this.http.put(url, apiHero, this.httpOptions).pipe(
      tap(_ => this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>('updateHero'))
    );
  }

  /** POST: add a new hero to the server */
  addHero(hero: Hero): Observable<Hero> {
    // Create a hero object that matches the API's expected format
    const apiHero = {
      name: hero.name,
      alterEgo: '' // Include this empty field as the API expects it
    };
    
    return this.http.post<any>(this.heroesUrl, apiHero, this.httpOptions).pipe(
      map(response => ({
        id: response.id,
        name: response.name,
        powers: [] // Initialize with empty powers since API doesn't have this
      })),
      tap((newHero: Hero) => this.log(`added hero w/ id=${newHero.id}`)),
      catchError(this.handleError<Hero>('addHero'))
    );
  }

  /** DELETE: delete the hero from the server */
  deleteHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Hero>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted hero id=${id}`)),
      catchError(this.handleError<Hero>('deleteHero'))
    );
  }

  /** GET heroes whose name contains search term */
  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) {
      // If no search term, return all heroes
      return this.getHeroes();
    }
    
    const url = `${this.heroesUrl}/search?name=${term}`;
    return this.http.get<Hero[]>(url).pipe(
      map(heroes => {
        // Transform API heroes to our app model if needed
        return heroes.map(hero => ({
          id: hero.id,
          name: hero.name,
          alterEgo: hero.alterEgo,
          superpowers: hero.superpowers || [],
          powers: hero.powers || []
        }));
      }),
      tap(x => x.length ?
        this.log(`found heroes matching "${term}"`) :
        this.log(`no heroes matching "${term}"`)),
      catchError(this.handleError<Hero[]>('searchHeroes', []))
    );
  }

  /** Log a HeroService message with the MessageService */
  private log(message: string) {
    this.messageService.add(`HeroService: ${message}`);
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   *
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error); // log to console instead

      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}