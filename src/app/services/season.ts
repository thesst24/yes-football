import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Season {

 private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  getSessionsBySeason(seasonId: string) {
    return this.http.get(
      `${this.apiUrl}/seasons/${seasonId}/sessions`
    );
  }

  getSessionById(sessionId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/sessions/${sessionId}`
    );
  }
}
