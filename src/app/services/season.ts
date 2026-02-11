import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Season {

  constructor(private http:HttpClient){}
getSessionsBySeason(seasonId: string) {
  return this.http.get(
    `http://localhost:3000/api/seasons/${seasonId}/sessions`
  );
}
}
