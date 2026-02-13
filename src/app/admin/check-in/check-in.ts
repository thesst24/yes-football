import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from "@angular/router";
import { Member } from '../../services/member';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardCheckin } from "./card-checkin/card-checkin";
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-check-in',
  imports: [RouterLink, CommonModule, FormsModule, CardCheckin],
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

  constructor(private service: Member,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {

  // ✅ รับ seasonId จาก URL
  this.seasonId = this.route.snapshot.paramMap.get("seasonId")!;

  console.log("🔥 seasonId:", this.seasonId);

  // โหลด member list
  this.load();

  // ✅ โหลด season
  this.loadSeason();

  // ✅ โหลด session ที่ใกล้สุดของ season นี้
  this.loadNextSessionOfSeason();
}

  loadSeason() {
    
  this.http
    .get("http://localhost:3000/api/seasons/" + this.seasonId)
    .subscribe({
      next: (res) => {
        console.log("✅ Season Loaded:", res);
        this.season = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.log("❌ Season Error:", err)
    });
    
}


loadNextSessionOfSeason() {

  this.http
    .get<any[]>("http://localhost:3000/api/sessions/season/" + this.seasonId)
    .subscribe({
      next: (sessions) => {

        const today = new Date();

        // ✅ เอาเฉพาะ session ที่ยังไม่ถึง
        const upcoming = sessions.filter(s =>
          new Date(s.date) >= today
        );

        // ✅ sort เอาอันใกล้สุด
        upcoming.sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        if (upcoming.length > 0) {

          // ✅ session ใกล้สุด
          this.session = upcoming[0];
          this.sessionId = this.session._id;

          // ✅ Save ลง localStorage ให้ sidebar ใช้ได้
          localStorage.setItem("selectedSessionId", this.sessionId);

          console.log("✅ Auto Next Session:", this.session);

        } else {
          alert("❌ No upcoming sessions for this season");
        }

        this.cdr.detectChanges();
      },

      error: (err) => console.log("❌ Session Load Error:", err)
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
    this.filteredMembers = this.allMembers.filter(m =>
      (m.fullname || '').toLowerCase().includes(text) ||
      (m.guardian || '').toLowerCase().includes(text) ||
       String(m.whatsapp ?? '').includes(text)   // ✅ แก้ตรงนี้
    );
  }
  this.updateMemberCount();
}

 updateMemberCount() {
    this.totalMembers = this.filteredMembers.length;
    this.activeMembers = this.filteredMembers.filter(m => m.status).length;
  }

// ==== popup card-checkin

 open(member: any) {
    this.selectedMember = member;
  }

  closePopup() {
    this.selectedMember = null;
  }

  
}

