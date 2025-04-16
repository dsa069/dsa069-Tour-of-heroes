import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Md5 } from 'ts-md5';

@Injectable({
  providedIn: 'root'
})
export class MarvelApiService {
  // Marvel API keys (you'll need to get these from developer.marvel.com)
  private publicKey = 'YOUR_PUBLIC_KEY';
  private privateKey = 'YOUR_PRIVATE_KEY';
  private baseUrl = 'https://gateway.marvel.com/v1/public';

  constructor(private http: HttpClient) { }

  // Generate the required hash for Marvel API
  private generateHash(timestamp: string): string {
    return Md5.hashStr(timestamp + this.privateKey + this.publicKey);
  }

  // Get hero image by name
  getHeroImage(heroName: string): Observable<string | null> {
    const timestamp = new Date().getTime().toString();
    const hash = this.generateHash(timestamp);
    
    const url = `${this.baseUrl}/characters`;
    const params = {
      apikey: this.publicKey,
      ts: timestamp,
      hash: hash,
      nameStartsWith: heroName,
      limit: 1
    };

    return this.http.get<any>(url, { params }).pipe(
      map(response => {
        if (response.data && response.data.results && response.data.results.length > 0) {
          const character = response.data.results[0];
          return `${character.thumbnail.path}.${character.thumbnail.extension}`;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error fetching Marvel data:', error);
        return of(null);
      })
    );
  }
}