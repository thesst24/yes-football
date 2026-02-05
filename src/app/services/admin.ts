import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Admin {
  api = 'http://localhost:3000/api/admin';

  constructor(private http: HttpClient) {}

  login(password: string) {
    return this.http.post<any>(`${this.api}/login`, { password });
  }
}
