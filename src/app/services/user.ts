import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class User {
  api = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get(this.api + '/users');
  }

  addUser(data: any) {
    return this.http.post(this.api + '/users', data);
  }
}
