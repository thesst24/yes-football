import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root',
})
export class Participant {
   api = "http://localhost:3000/api/participants";

  constructor(private http: HttpClient) {}

  join(sessionId: string, memberId: string) {
    return this.http.post(`${this.api}/join`, { sessionId, memberId });
  }

  getBySession(sessionId: string) {
    return this.http.get<any[]>(`${this.api}/${sessionId}`);
  }

  remove(sessionId: string, memberId: string) {
    return this.http.delete(`${this.api}/${sessionId}/${memberId}`);
  }

  updateStatus(sessionId: string, memberId: string, status: string) {
    return this.http.patch(`${this.api}/status`, {
      sessionId,
      memberId,
      status,
    });
  }
    // ✅ เพิ่มตรงนี้
  removeAll(sessionId: string) {
    return this.http.delete(
      "http://localhost:3000/api/participants/removeAll/" + sessionId
    );
  }
}
