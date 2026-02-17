import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Season as SessionService } from '../../../services/season';
import { Member } from '../../../services/member';
import { FormsModule } from '@angular/forms';
import { Participant } from '../../../services/participant';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-events',
  imports: [DatePipe, CommonModule, RouterLink, FormsModule],
  templateUrl: './events.html',
  styleUrl: './events.css',
})
export class Events {
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

  constructor(
    private service: Member,
    private route: ActivatedRoute,
    private sessionService: SessionService,
    private cdr: ChangeDetectorRef,
    private participantService: Participant,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    // ✅ ดึง param จาก URL
    this.seasonId = this.route.snapshot.paramMap.get('seasonId')!;
    this.sessionId = this.route.snapshot.paramMap.get('sessionId')!;

    // ✅ โหลด session จริงจาก database
    this.loadSession();

    this.load();
    this.loadParticipants();
  }

loadParticipants() {
  this.http.get<any[]>(
    `http://localhost:3000/api/attendance/session/${this.sessionId}`
  ).subscribe(res => {

    // ✅ map participants ก่อน
    this.participants = res.map(a => {

      // ✅ Trial Player
      if (a.isTrial) {
        return {
          _id: a._id,
          fullname: a.trialName,
          whatsapp: a.trialPhone,
          status: "trial",
          isTrial: true,
          image: "/logo.png" // ✅ default image
        };
      }

      // ✅ Normal Member
      return {
        _id: a.memberId._id,
        fullname: a.memberId.fullname,
        whatsapp: a.memberId.whatsapp,
        status: "present",
        isTrial: false,
        image: a.memberId.image || '/logo.png',
      };
    });

    // ✅ นับ Trial หลังจาก participants ถูกสร้างแล้ว
    const trialPlayers = this.participants.filter(p => p.isTrial);

    // ✅ Trial Count ต่อจากของเดิม
    this.trialCount = trialPlayers.length + 1;

    // ✅ update filtered list
    this.filteredParticipants = [...this.participants];
    this.cdr.detectChanges();
  });
}

  loadSession() {
    this.sessionService.getSessionById(this.sessionId).subscribe({
      next: (res) => {
        this.sessionData = res;

        // ✅ Past Session Check
        const sessionDate = new Date(res.date);
        sessionDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.isPastSession = sessionDate < today;

        this.cdr.detectChanges();
      },

      error: () => alert('❌ Session not found'),
    });
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
  if (this.isPastSession) return;

  this.http.post("http://localhost:3000/api/attendance/checkin", {
    memberId: this.selectedMember._id,
    seasonId: this.seasonId,
    sessionId: this.sessionId,
  }).subscribe({
    next: () => {
      alert("✅ Joined");
      this.loadParticipants();
      this.closePopup();
    },
    error: (err) => alert(err.error.message)
  });
}

removeMember() {

  // ✅ ถ้าเป็น Trial
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

  confirmRemoveAll() {
    this.showConfirmRemoveAll = true;
  }

  removeAllParticipants() {
    if (!confirm('⚠️ Remove ALL participants + rollback checkins?')) return;

    this.http
      .delete(`http://localhost:3000/api/participants/removeAllWithAttendance/${this.sessionId}`)
      .subscribe({
        next: () => {
          alert('✅ Removed All + Card Rollback Success');

          this.loadParticipants();
          this.showConfirmRemoveAll = false;
        },
        error: (err) => alert(err.error.message),
      });
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
