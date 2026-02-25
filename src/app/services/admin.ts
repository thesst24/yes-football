import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Admin {
   api = `${environment.apiUrl}/api/admin`;

  constructor(private http: HttpClient) {}

  login(password: string) {
    return this.http.post<any>(`${this.api}/login`, { password });
  }
}
