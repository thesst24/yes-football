import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Attendance {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  // เช็คอินสมาชิก
  checkIn(whatsapp: string, sessionId: string) {
    return this.http.post(`${this.apiUrl}/attendance/checkin`, { whatsapp, sessionId });
  }

  // ดึงข้อมูลการ์ดของสมาชิก (สำหรับหน้า Member Dashboard)
  getMemberCard(memberId: string) {
    return this.http.get(`${this.apiUrl}/members/${memberId}/card`);
  }

  
}
