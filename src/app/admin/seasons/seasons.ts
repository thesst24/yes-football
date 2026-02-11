import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ManageSeason } from './manage-season/manage-season';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { Season } from '../../services/season';


@Component({
  selector: 'app-seasons',
  imports: [RouterLink, ManageSeason, FormsModule, TableModule, CommonModule, RouterLinkActive],
  templateUrl: './seasons.html',
  styleUrl: './seasons.css',
})
export class Seasons {
  @Output() onSaveSuccess = new EventEmitter<void>();

  seasons: any[] = [];
  latestSessions: any[] = [];

  sessions: any[] = [];
  currentSessionId: string = '';
  selectedSeason: any;
  showAllSessions: boolean = false;
  displaySessions: any[] = [];

  // ===== UI =====
  showPopup = false;
  showList = false;

  constructor(
    private http: HttpClient,
    private seasonService: Season,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  openPopup() {
    this.showPopup = true;
  }

  closePopup(refresh?: boolean) {
    this.showPopup = false;
    if (refresh) this.loadSeasons();
  }

  openListSeasons() {
    this.showList = true;
  }
  closeListSeasons() {
    this.showList = false;
  }

  ngOnInit() {
    this.loadSeasons();
  }
  getLatestSessions() {
    this.http.get<any[]>('http://localhost:3000/api/latest-sessions ').subscribe({
      next: (data) => {
        this.latestSessions = data;
      },
      error: (err) => console.error(err),
    });
  }

  // ฟังก์ชันเมื่อคลิกที่ Session เพื่อไปหน้าเช็คชื่อ
  onSessionClick(sessionId: string) {
    console.log('ไปที่หน้าเช็คชื่อ Session ID:', sessionId);
    // เช่น: this.router.navigate(['/attendance', sessionId]);
  }
  
  loadSeasons() {
  this.http.get<any[]>('http://localhost:3000/api/seasons').subscribe({
    next: (data) => {
      // เรียงจากใหม่ไปเก่า
      this.seasons = data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const savedId = localStorage.getItem("selectedSeasonId");
      const found = this.seasons.find(s => s._id === savedId);

      if (found) {
        this.selectSeason(found);
      } else if (this.seasons.length > 0) {
        this.selectSeason(this.seasons[0]); // ถ้าไม่มีที่บันทึกไว้ ให้เลือกอันล่าสุด
      }

      this.cdr.detectChanges()
    },
    error: (err) => console.error('Error fetching seasons:', err)
  });
}

selectSeason(season: any) {

  this.selectedSeason = season;
  localStorage.setItem("selectedSeasonId", season._id);

  this.seasonService.getSessionsBySeason(season._id)
    .subscribe((res:any) => {

      const today = new Date();

      // ✅ เอาเฉพาะ session ที่ยังไม่ถึงวันนั้น (Pending)
      const pendingSessions = res.filter((s:any) =>
        new Date(s.date) >= today
      );

      // ✅ sort ใกล้สุดก่อน
      pendingSessions.sort((a:any, b:any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // ✅ แสดงแค่ 3 อันที่ใกล้สุด
      this.sessions = pendingSessions.slice(0, 3);

      // ✅ session ที่ใกล้ที่สุดที่สุด (Next Session)
      if (this.sessions.length > 0) {
        this.currentSessionId = this.sessions[0]._id;
      }

      // ปิด list popup
      this.showList = false;
    });
}

selectSession(session:any) {

  // ✅ เปิดได้แค่ session แรก
  if (session._id !== this.sessions[0]._id) return;

  // ไปหน้า checkin พร้อม seasonId + sessionId
  this.router.navigate([
    '/checkin',
    this.selectedSeason._id,
    session._id
  ]);
}

updateDisplaySessions() {
  if (this.showAllSessions) {
    this.displaySessions = [...this.sessions]; // show all
  } else {
    this.displaySessions = this.sessions.slice(0, 3); // show only 3 latest
  }
}

toggleShowAllSessions() {
  this.updateDisplaySessions();
}
}
