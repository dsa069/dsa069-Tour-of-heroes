import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';
import { Md5 } from 'ts-md5';

@Injectable({
  providedIn: 'root'
})
export class MarvelApiService {
  // You'll need to get valid keys from developer.marvel.com
  private publicKey = '5c2a2696302bbef8947fa967a442c602';
  private privateKey = '7f8ec04b7ed47d3b3e69198c56dd74e1389495d7';
  private baseUrl = 'https://gateway.marvel.com/v1/public';

  constructor(private http: HttpClient) { }

  // Generate the required hash for Marvel API
  private generateHash(timestamp: string): string {
    return Md5.hashStr(timestamp + this.privateKey + this.publicKey);
  }

  // Get hero image by name with improved error handling
  getHeroImage(heroName: string): Observable<string | null> {
    // Don't try to search with empty names
    if (!heroName || heroName.trim().length < 2) {
      console.log('Hero name too short for Marvel API search');
      return of(null);
    }
    
    const timestamp = new Date().getTime().toString();
    const hash = this.generateHash(timestamp);
    
    // Sanitize the hero name for the API
    const sanitizedName = heroName.trim().replace(/\s+/g, ' ');
    console.log(`Searching Marvel API for: "${sanitizedName}"`);
    
    const url = `${this.baseUrl}/characters`;
    const params = {
      apikey: this.publicKey,
      ts: timestamp,
      hash: hash,
      nameStartsWith: sanitizedName,
      limit: 1
    };

    return this.http.get<any>(url, { params }).pipe(
      retry(1), // Retry the request once if it fails
      map(response => {
        console.log('Marvel API response:', response);
        if (response.data && response.data.results && response.data.results.length > 0) {
          const character = response.data.results[0];
          // Check for default "image not available" 
          if (character.thumbnail.path.includes('image_not_available')) {
            return null;
          }
          return `${character.thumbnail.path}.${character.thumbnail.extension}`;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error fetching Marvel data:', error);
        // Provide a more specific error message based on the status code
        if (error.status === 401) {
          console.error('Marvel API authentication failed. Check your API keys.');
        } else if (error.status === 403) {
          console.error('Marvel API request forbidden. Check your referer/domain settings.');
        } else if (error.status === 418) {
          console.error('Marvel API returned a teapot error. API may be temporarily unavailable.');
        }
        return of(null);
      })
    );
  }
}