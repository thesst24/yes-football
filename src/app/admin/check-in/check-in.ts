import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Member } from '../../services/member';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardCheckin } from './card-checkin/card-checkin';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-check-in',
  imports: [CommonModule, FormsModule, CardCheckin],
  templateUrl: './check-in.html',
  styleUrl: './check-in.css',
})
export class CheckIn {
  // ===== DATA =====
  allMembers: any[] = [];
  filteredMembers: any[] = [];

  seasonId!: string;
  sessionId!: string;

  season: any = {};
  session: any = {};

  // ===== COUNT =====
  totalMembers = 0;
  activeMembers = 0;
  // ==== Search ====
  searchText = '';
  // ===== UI =====
  selectedMember: any = null;

  constructor(
    private service: Member,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    // ✅ รับ seasonId จาก URL
    this.seasonId = this.route.snapshot.paramMap.get('seasonId')!;

    console.log('🔥 seasonId:', this.seasonId);

    // โหลด member list
    this.load();

    // ✅ โหลด season
    this.loadSeason();

    // ✅ โหลด session ที่ใกล้สุดของ season นี้
    this.loadNextSessionOfSeason();
  }

 loadSeason() {
  this.http.get(environment.apiUrl + '/api/seasons/' + this.seasonId)
    .subscribe({
      next: (res) => {
        console.log('✅ Season Loaded:', res);
        this.season = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.log('❌ Season Error:', err),
    });
}

loadLatestSeasonAndSession() {
  this.http.get<any>(`${environment.apiUrl}/checkin/latest-session`)
    .subscribe({
      next: (res) => {
        console.log('✅ Latest Season + Session:', res);
        this.season = res.season;
        this.session = res.session;
        this.seasonId = res.season._id;
        this.sessionId = res.session._id;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('❌ Latest Season/Session Error:', err);
        alert(err.error?.message || 'Failed to load latest season/session');
      }
    });
}

loadNextSessionOfSeason() {
  this.http
    .get<any[]>(environment.apiUrl + '/api/sessions/season/' + this.seasonId)
    .subscribe({
      next: (sessions) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayDay = today.getDay();

        const sameWeekday = sessions.filter((s) => {
          const d = new Date(s.date);
          return d.getDay() === todayDay;
        });

        sameWeekday.sort((a, b) => {
          const diffA = Math.abs(new Date(a.date).getTime() - today.getTime());
          const diffB = Math.abs(new Date(b.date).getTime() - today.getTime());
          return diffA - diffB;
        });

        if (sameWeekday.length > 0) {
          this.session = sameWeekday[0];
        } else {
          const upcoming = sessions.filter(
            (s) => new Date(s.date) >= today
          );

          upcoming.sort(
            (a, b) =>
              new Date(a.date).getTime() -
              new Date(b.date).getTime()
          );

          if (upcoming.length > 0) {
            this.session = upcoming[0];
          } else {
            alert('❌ No sessions found');
            return;
          }
        }

        this.sessionId = this.session._id;
        this.cdr.detectChanges();
      },
      error: (err) => console.log('❌ Session Load Error:', err),
    });
}

  // ===== LOAD =====
  load() {
    this.service.getAll().subscribe((res: any) => {
      this.allMembers = res;
      this.filteredMembers = [...this.allMembers];
      this.updateMemberCount();
      this.cdr.detectChanges();
    });
  }

  filterMembers() {
    const text = this.searchText.toLowerCase().trim();

    if (!text) {
      // ถ้า input ว่าง → แสดงสมาชิกทั้งหมด
      this.filteredMembers = [...this.allMembers];
    } else {
      // กรองสมาชิกตาม fullname, guardian, whatsapp
      this.filteredMembers = this.allMembers.filter(
        (m) =>
          (m.fullname || '').toLowerCase().includes(text) ||
          (m.guardian || '').toLowerCase().includes(text) ||
          String(m.whatsapp ?? '').includes(text), // ✅ แก้ตรงนี้
      );
    }
    this.updateMemberCount();
  }

  updateMemberCount() {
    this.totalMembers = this.filteredMembers.length;
    this.activeMembers = this.filteredMembers.filter((m) => m.status).length;
  }

  // ==== popup card-checkin

  open(member: any) {
    this.selectedMember = member;
  }

  closePopup() {
    this.selectedMember = null;
  }
  getImagePath(img?: string) {
  if (!img) return '/logo.png'; // default image
  return environment.apiUrl + img;
}
}
