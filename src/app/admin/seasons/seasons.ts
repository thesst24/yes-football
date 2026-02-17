import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { ManageSeason } from './manage-season/manage-season';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { Season } from '../../services/season';

@Component({
  selector: 'app-seasons',
  imports: [
    RouterLink,
    ManageSeason,
    FormsModule,
    TableModule,
    CommonModule,
    RouterLinkActive,
    RouterOutlet,
  ],
  templateUrl: './seasons.html',
  styleUrl: './seasons.css',
})
export class Seasons {
  @Output() onSaveSuccess = new EventEmitter<void>();

  seasons: any[] = [];
  filteredSessions: any[] = [];
  allSessions: any[] = [];
  latestSessions: any[] = [];

  sessions: any[] = [];
  currentSessionId: string = '';
  selectedSeason: any;
  showAllSessions: boolean = false;
  isPastSessions: boolean = false;

  // ===== UI =====
  showPopup = false;
  showList = false;

  constructor(
    private http: HttpClient,
    private seasonService: Season,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
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

  selectedSessionId: string = '';

  isPastSession(session: any) {
    return session.status === "completed";
  }

  isTodaySession(session: any) {
    const d1 = new Date(session.date);
    const d2 = new Date();

    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  }

  isNextSession(session: any) {
    // session แรกสุดใน list ถือว่าเป็น next
    return this.sessions.length > 0 && session._id === this.sessions[0]._id;
  }

  loadSeasons() {
    this.http.get<any[]>('http://localhost:3000/api/seasons').subscribe({
      next: (data) => {
        // เรียงจากใหม่ไปเก่า
        this.seasons = data.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        const savedId = localStorage.getItem('selectedSeasonId');
        const found = this.seasons.find((s) => s._id === savedId);

        if (found) {
          this.selectSeason(found);
        } else if (this.seasons.length > 0) {
          this.selectSeason(this.seasons[0]); // ถ้าไม่มีที่บันทึกไว้ ให้เลือกอันล่าสุด
        }

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching seasons:', err),
    });
  }

  loadSessions(seasonId: string) {
    this.http.get<any[]>('http://localhost:3000/api/sessions/season/' + seasonId).subscribe({
      next: (res) => {
        this.sessions = res;

        // ✅ เปรียบเทียบวันแบบตัดเวลาออก
        const sessionDate = new Date(res[0].date);
        sessionDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // ✅ Past Session ?
        this.isPastSessions = sessionDate < today;

        console.log('Past Session =', this.isPastSession);

        this.cdr.detectChanges();
      },
      error: () => {
        alert('❌ Session not found');
      },
    });
  }

  applySessionFilter() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const toDateOnly = (d: any) => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      return date;
    };

    // ✅ Past Sessions
    const past = this.allSessions
      .filter((s) => toDateOnly(s.date) < today)
      .sort((a, b) => toDateOnly(b.date).getTime() - toDateOnly(a.date).getTime());

    // ✅ Upcoming Sessions
    const upcoming = this.allSessions
      .filter((s) => toDateOnly(s.date) >= today)
      .sort((a, b) => toDateOnly(a.date).getTime() - toDateOnly(b.date).getTime());

    // ✅ Next Session = upcoming ตัวแรกเท่านั้น
    const nextSession = upcoming.length > 0 ? upcoming[0] : null;

    if (this.showAllSessions) {
      // ✅ checkbox ON → Past ทั้งหมด + Next เท่านั้น
      this.sessions = [...(nextSession ? [nextSession] : []), ...past];
    } else {
      // ✅ checkbox OFF → Next + Past 2 ล่าสุด
      this.sessions = [...(nextSession ? [nextSession] : []), ...past.slice(0, 2)];
    }

    this.cdr.detectChanges();
  }

  toggleShowAllSessions() {
    this.applySessionFilter();
  }

  selectSeason(season: any) {
    this.selectedSeason = season;
    localStorage.setItem('selectedSeasonId', season._id);

    this.seasonService.getSessionsBySeason(season._id).subscribe((res: any) => {
      // ✅ เก็บ session ทั้งหมดไว้ก่อน
      this.allSessions = res;

      // ✅ เรียก filter เพื่อแสดงตาม checkbox
      this.applySessionFilter();

      this.showList = false;

      this.cdr.markForCheck();
      this.cdr.detectChanges();
    });
  }

  selectSession(session: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sessionDate = new Date(session.date);
    sessionDate.setHours(0, 0, 0, 0);

    // ✅ Past Session เข้าได้
    const isPast = sessionDate < today;

    // ✅ Next Session คือ session แรกใน list
    const isNext = this.sessions.length > 0 && session._id === this.sessions[0]._id;

    if (!isPast && !isNext) {
      alert('❌ Session นี้ยังไม่เปิดให้เข้า');
      return;
    }

    // ✅ Navigate เข้า Events
    this.router.navigate(['events', this.selectedSeason._id, session._id], {
      relativeTo: this.route,
    });
  }

  updateDisplaySessions() {
    if (this.showAllSessions) {
      this.sessions = [...this.sessions]; // show all
    } else {
      this.sessions = this.sessions.slice(0, 3); // show only 3 latest
    }
  }

  get isOnEventsPage() {
    return this.router.url.includes('/season/events');
  }
}
