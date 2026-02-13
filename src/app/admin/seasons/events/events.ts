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
  imports: [DatePipe,CommonModule,RouterLink,FormsModule],
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
    this.seasonId = this.route.snapshot.paramMap.get("seasonId")!;
    this.sessionId = this.route.snapshot.paramMap.get("sessionId")!;

    // ✅ โหลด session จริงจาก database
    this.loadSession();

    this.load();
    this.loadParticipants();

  }

  loadParticipants() {
  this.participantService.getBySession(this.sessionId)
    .subscribe(res => {

      // memberId คือข้อมูล member จริง
      this.participants = res.map(p => ({
        ...p.memberId,
        status: p.status
      }));
      
  // ✅ สำคัญ: copy ไป filteredParticipants
      this.filteredParticipants = [...this.participants];
      this.cdr.detectChanges();
    });
}

  loadSession() {
    this.sessionService.getSessionById(this.sessionId)
      .subscribe({
        next: (res) => {
          this.sessionData = res;

              this.cdr.detectChanges();
        },
        error: () => {
          alert("❌ Session not found");
        }
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

  // ============================
  // ✅ Filter Club Members
  // ============================
  if (!text) {
    this.filteredMembers = [...this.allMembers];
  } else {
    this.filteredMembers = this.allMembers.filter(m =>
      (m.fullname || '').toLowerCase().includes(text) ||
      (m.guardian || '').toLowerCase().includes(text) ||
      String(m.whatsapp ?? '').includes(text)
    );
  }

  // ============================
  // ✅ Filter Participants ด้วย
  // ============================
  if (!text) {
    this.filteredParticipants = [...this.participants];
  } else {
    this.filteredParticipants = this.participants.filter(p =>
      (p.fullname || '').toLowerCase().includes(text) ||
      String(p.whatsapp ?? '').includes(text)
    );
  }

  this.updateMemberCount();
}

 updateMemberCount() {
    this.totalMembers = this.filteredMembers.length;
    this.activeMembers = this.filteredMembers.filter(m => m.status).length;
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

  // ❌ กันซ้ำ
  const exists = this.participants.find(p => p._id === this.selectedMember._id);
  if (exists) return;

  this.participantService.join(
    this.sessionId,
    this.selectedMember._id
  ).subscribe(() => {

    this.loadParticipants();
    this.closePopup();

  });
  // ✅ เพิ่มเข้า participants
  this.participants.push(this.selectedMember);
  

  this.updateMemberCount();
  this.closePopup();
}

removeMember() {

  // ✅ เอาออกจาก participants
  this.participants = this.participants.filter(
    p => p._id !== this.selectedMember._id
  );
 this.participantService.remove(
    this.sessionId,
    this.selectedMember._id
  ).subscribe(() => {

    this.loadParticipants();
    this.closePopup();

  });


  this.updateMemberCount();
  this.closePopup();
}


  closePopup() {
    this.selectedMember = null;
  }

  confirmRemoveAll() {
  this.showConfirmRemoveAll = true;
}

removeAllParticipants() {

  this.participantService.removeAll(this.sessionId)
    .subscribe(() => {

      alert("✅ Removed all participants!");

      this.loadParticipants(); // reload list
      this.showConfirmRemoveAll = false;

    });
}


}
