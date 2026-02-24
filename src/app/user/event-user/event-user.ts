import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Member } from '../../services/member';
import { Season } from '../../services/season';
import { Participant } from '../../services/participant';


@Component({
  selector: 'app-event-user',
  imports: [RouterLink,FormsModule,CommonModule],
  templateUrl: './event-user.html',
  styleUrl: './event-user.css',
})
export class EventUser {
// ===== DATA =====
  allMembers: any[] = [];
  filteredMembers: any[] = [];
  participants: any[] = [];
  filteredParticipants: any[] = [];

  season: any = {};
  session: any = {};
  showConfirmRemoveAll = false;

  // ===== Trial Player =====
  showTrialPopup = false;

  trialForm = {
    fullname: '',
    phone: '',
  };
  trialCount = 1;
  trialPhoneBase = 2000000000;

  // ===== COUNT =====
  totalMembers = 0;
  activeMembers = 0;
  // ==== Search ====
  searchText = '';
  // ===== UI =====
  selectedMember: any = null;
  popupMode: 'join' | 'remove' = 'join';

  seasonId!: string;
  sessionId!: string;

  sessionData: any;
  isPastSession: boolean = false;

  loggedInMember: any;

  constructor(
    private service: Member,
    private route: ActivatedRoute,
    private sessionService: Season,
    private cdr: ChangeDetectorRef,
    private participantService: Participant,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    const data = localStorage.getItem('member');
    if(data) {
      const parsed = JSON.parse(data);

      this.loggedInMember = parsed.member;
    }

    this.seasonId = this.route.snapshot.paramMap.get('seasonId')!;
    this.sessionId = this.route.snapshot.paramMap.get('sessionId')!;

    // ✅ โหลด session จริงจาก database
    this.loadLatestSeasonAndSession();
    this.load();
  }

loadParticipants() {
  
  if (!this.sessionId) {
    console.log("SessionId not ready");
    return;
  }
  this.http.get<any[]>(
    `http://localhost:3000/api/participants/${this.sessionId}`
  ).subscribe(res => {

  this.participants = res.map(p => {

  // ✅ ถ้ามี memberId ใช้ข้อมูลจาก Member เสมอ
  if (p.memberId) {
    return {
      _id: p.memberId._id,
      fullname: p.memberId.fullname,
      whatsapp: p.memberId.whatsapp,
      status: p.status,
      isTrial: p.memberId.isTrial === true,
      image: p.memberId.image && p.memberId.image.trim() !== ""
        ? p.memberId.image
        : "uploads/logo.png"
    };
  }

  // ✅ กรณี Trial แบบ standalone (ไม่มี memberId)
  return {
    _id: p._id,
    fullname: p.trialName || "Trial",
    whatsapp: p.trialPhone || "-",
    status: "trial",
    isTrial: true,
    image: "uploads/logo.png"
  };

}).filter(x => x !== null); // ✅ สำคัญมาก

    this.filteredParticipants = [...this.participants];
    this.cdr.detectChanges();
  });
}

isAlreadyParticipant(memberId: string): boolean {
  return this.participants.some(p => p._id === memberId);
}


  // ===== LOAD =====
 load() {
  this.service.getAll().subscribe((res: any) => {
    this.allMembers = res;
    this.filteredMembers = [...this.allMembers];

    // ✅ Update Trial Count จาก DB จริง
    const trialMembers = this.allMembers.filter(m => m.isTrial);
    this.trialCount = trialMembers.length + 1;

    this.updateMemberCount();
    this.cdr.detectChanges();
  });
}


loadLatestSeasonAndSession() {
  this.http.get<any[]>('http://localhost:3000/api/seasons')
    .subscribe(seasons => {

      if (!seasons.length) return;

      // ✅ เรียงตามปีล่าสุด
      const latestSeason = seasons.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      this.seasonId = latestSeason._id;

      this.loadNearestSession();
    });
}



loadNearestSession() {
  this.http.get<any[]>(
    `http://localhost:3000/api/seasons/${this.seasonId}/sessions`
  ).subscribe(sessions => {

    if (!sessions.length) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // เอาเฉพาะ session ที่ยังไม่ผ่าน
    const upcoming = sessions
      .filter(s => new Date(s.date) >= today)
      .sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

    if (!upcoming.length) return;

    const nearest = upcoming[0];

    this.sessionId = nearest._id;
    this.sessionData = nearest;

    this.loadParticipants();
  });
}

isLoggedInUser(member: any): boolean {
  if (!this.loggedInMember) return false;
  return member.whatsapp === this.loggedInMember.whatsapp;
}

  filterMembers() {
    const text = this.searchText.toLowerCase().trim();

    // ============================
    // ✅ Filter Club Members
    // ============================
    if (!text) {
      this.filteredMembers = [...this.allMembers];
    } else {
      this.filteredMembers = this.allMembers.filter(
        (m) =>
          (m.fullname || '').toLowerCase().includes(text) ||
          (m.guardian || '').toLowerCase().includes(text) ||
          String(m.whatsapp ?? '').includes(text),
      );
    }

    // ============================
    // ✅ Filter Participants ด้วย
    // ============================
    if (!text) {
      this.filteredParticipants = [...this.participants];
    } else {
      this.filteredParticipants = this.participants.filter(
        (p) =>
          (p.fullname || '').toLowerCase().includes(text) ||
          String(p.whatsapp ?? '').includes(text),
      );
    }

    this.updateMemberCount();
  }

  updateMemberCount() {
    this.totalMembers = this.filteredMembers.length;
    this.activeMembers = this.filteredMembers.filter((m) => m.status).length;
  }
  open(member: any) {
    this.selectedMember = member;
    this.popupMode = 'join';
  }
  openParticipant(member: any) {
    this.selectedMember = member;
    this.popupMode = 'remove';
  }

  
joinMember() {

  if (!this.loggedInMember) {
    alert("❌ Please login first");
    return;
  }

  this.http.post("http://localhost:3000/api/participants/join", {
    memberId: this.loggedInMember._id,   // ✅ บังคับใช้ member ที่ login
    seasonId: this.seasonId,
    sessionId: this.sessionId,
  }).subscribe({
    next: () => {
      alert("✅ Joined Event");
      this.loadParticipants();
      this.closePopup();
    },
    error: (err) => alert(err.error.message)
  });
}

getImagePath(img: string) {
  if (!img) return '/logo.png';

  if (img.includes('/uploads')) {
    return 'http://localhost:3000' + img;
  }

  return img;
}

removeMember() {

  // ✅ Trial
  if (this.selectedMember.isTrial) {

    this.http.delete(
      `http://localhost:3000/api/participants/removeTrial/${this.sessionId}/${this.selectedMember._id}`
    ).subscribe(() => {
      alert("✅ Trial Removed");
      this.loadParticipants();
      this.closePopup();
    });

    return;
  }

  // ✅ Member ปกติ
  this.http.delete(
    `http://localhost:3000/api/participants/removeWithAttendance/${this.sessionId}/${this.selectedMember._id}`
  ).subscribe(() => {
    alert("✅ Removed Member + Undo Checkin");
    this.loadParticipants();
    this.closePopup();
  });
}

  closePopup() {
    this.selectedMember = null;
  }


  openTrialPopup() {
    this.showTrialPopup = true;

    // ✅ Auto Default Trial Name + Phone
    this.trialForm.fullname = `Trial-${this.trialCount}`;
    this.trialForm.phone = String(this.trialPhoneBase + (this.trialCount - 1));
  }

  closeTrialPopup() {
    this.showTrialPopup = false;

    // reset form เฉพาะ field
    this.trialForm = { fullname: '', phone: '' };
  }

addTrialPlayer() {
  this.http.post("http://localhost:3000/api/members/trial", {})
    .subscribe(() => {
      alert("✅ Trial Added");
      this.load();
      this.closeTrialPopup();
    });
}
}
