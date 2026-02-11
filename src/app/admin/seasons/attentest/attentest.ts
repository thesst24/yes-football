import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Injectable, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-attentest',
  imports: [FormsModule,DatePipe,NgClass],
  templateUrl: './attentest.html',
  styleUrl: './attentest.css',
})
export class Attentest {
  private apiUrl = 'http://localhost:3000/api';

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
