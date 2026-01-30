import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  api = 'http://localhost:3000/api/auth';
 constructor(private http: HttpClient) {}

  register(data: any) {
    return this.http.post(this.api + '/register', data);
  }

  login(data: any) {
    return this.http.post(this.api + '/admin-login', data);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  logout() {
    localStorage.clear();
  }
}
