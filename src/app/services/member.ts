import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Member {
   api = 'http://localhost:3000/api/members';

  constructor(private http: HttpClient) {}

  updateStatus(id: string, status: boolean) {
    return this.http.patch(`${this.api}/${id}/status`, { status });
  }



  getAll() {
  return this.http.get<any[]>(this.api);
}


  create(data: FormData) {
    return this.http.post(this.api, data);
  }

  update(id: string, data: FormData) {
    return this.http.put(`${this.api}/${id}`, data);
  }

  delete(id: string) {
    return this.http.delete(`${this.api}/${id}`);
  }

  
loginByWhatsapp(whatsapp: string) {
  return this.http.post<any>(
    `${this.api}/user-login`,
    { whatsapp }
  );
}

checkIn(memberId: string) {
  return this.http.post<any>('http://localhost:3000/api/members/checkin', {
    memberId
  });
}

  // member.service.ts
getCard(memberId: string) {
  return this.http.get(
    `http://localhost:3000/api/cards/${memberId}`
  );
}
}
