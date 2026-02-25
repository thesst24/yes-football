import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Member } from '../../services/member';
import { Season } from '../../services/season';
import { Participant } from '../../services/participant';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-event-user',
  imports: [RouterLink,FormsModule,CommonModule],
  templateUrl: './event-user.html',
  styleUrl: './event-user.css',
})
export class EventUser {
allMembers: any[] = [];
  filteredMembers: any[] = [];
  participants: any[] = [];
  filteredParticipants: any[] = [];

  season: any = {};
  session: any = {};
  showConfirmRemoveAll = false;

  showTrialPopup = false;
  trialForm = { fullname: '', phone: '' };
  trialCount = 1;
  trialPhoneBase = 2000000000;

  totalMembers = 0;
  activeMembers = 0;
  searchText = '';
  selectedMember: any = null;
  popupMode: 'join' | 'remove' = 'join';

  seasonId!: string;
  sessionId!: string;
  sessionData: any;
  isPastSession: boolean = false;

  loggedInMember: any;
  memberCards: { [key: string]: any } = {};
  isEventClosed: boolean = false;
  showSeasonPopup: boolean = false;
  seasonPopupMessage: string = '';

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
    if (data) this.loggedInMember = JSON.parse(data).member;

    this.seasonId = this.route.snapshot.paramMap.get('seasonId')!;
    this.sessionId = this.route.snapshot.paramMap.get('sessionId')!;

    this.checkEventStatus();
    this.loadLatestSeasonAndSession();
    this.load();
  }

  // ================== PARTICIPANTS ==================
  loadParticipants() {
    if (!this.sessionId) return;

    this.http.get<any[]>(`${environment.apiUrl}/api/participants/${this.sessionId}`)
      .subscribe(res => {
        this.participants = res.map(p => {
          if (p.memberId) return {
            _id: p.memberId._id,
            fullname: p.memberId.fullname,
            whatsapp: p.memberId.whatsapp,
            status: p.status,
            isTrial: p.memberId.isTrial === true,
            image: p.memberId.image?.trim() ? p.memberId.image : "uploads/logo.png"
          };
          return {
            _id: p._id,
            fullname: p.trialName || "Trial",
            whatsapp: p.trialPhone || "-",
            status: "trial",
            isTrial: true,
            image: "uploads/logo.png"
          };
        }).filter(x => x !== null);

        this.filteredParticipants = [...this.participants];
        this.cdr.detectChanges();
      });
  }

  isAlreadyParticipant(memberId: string): boolean {
    return this.participants.some(p => p._id === memberId);
  }

  // ================== MEMBERS ==================
  load() {
    this.service.getAll().subscribe((res: any) => {
      this.allMembers = res;
      this.filteredMembers = [...this.allMembers];

      this.allMembers.forEach(member => {
        this.http.get(`${environment.apiUrl}/api/cards/${member._id}`)
          .subscribe(card => this.memberCards[member._id] = card);
      });

      const trialMembers = this.allMembers.filter(m => m.isTrial);
      this.trialCount = trialMembers.length + 1;

      this.updateMemberCount();
      this.cdr.detectChanges();
    });
  }

  canJoin(memberId: string): boolean {
    const card = this.memberCards[memberId];
    if (!card) return false;
    return card.status === 'active' && card.usedSessions < card.totalSessions;
  }

  // ================== SEASON & SESSION ==================
  loadLatestSeasonAndSession() {
    this.http.get<any[]>(`${environment.apiUrl}/api/seasons`)
      .subscribe(seasons => {
        if (!seasons.length) return this.showSeasonError("No season available.");

        const latestSeason = seasons.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        if (!latestSeason.status) return this.showSeasonError("Season is currently inactive.");

        this.seasonId = latestSeason._id;
        this.loadNearestSession();
      });
  }

  loadNearestSession() {
    this.http.get<any[]>(`${environment.apiUrl}/api/seasons/${this.seasonId}/sessions`)
      .subscribe(sessions => {
        if (!sessions.length) return this.showSeasonError("No session available.");

        const today = new Date();
        today.setHours(0,0,0,0);

        const upcoming = sessions
          .filter(s => s.status !== false && new Date(s.date) >= today)
          .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (!upcoming.length) return this.showSeasonError("No active session available.");

        this.sessionData = upcoming[0];
        this.sessionId = upcoming[0]._id;

        this.loadParticipants();
      });
  }

  private showSeasonError(msg: string) {
    this.seasonPopupMessage = msg;
    this.showSeasonPopup = true;
  }

  isLoggedInUser(member: any): boolean {
    return this.loggedInMember?.whatsapp === member.whatsapp;
  }

  // ================== FILTER ==================
  filterMembers() {
    const text = this.searchText.toLowerCase().trim();
    this.filteredMembers = !text ? [...this.allMembers] : this.allMembers.filter(
      m => (m.fullname || '').toLowerCase().includes(text) ||
           (m.guardian || '').toLowerCase().includes(text) ||
           String(m.whatsapp ?? '').includes(text)
    );

    this.filteredParticipants = !text ? [...this.participants] : this.participants.filter(
      p => (p.fullname || '').toLowerCase().includes(text) ||
           String(p.whatsapp ?? '').includes(text)
    );

    this.updateMemberCount();
  }

  updateMemberCount() {
    this.totalMembers = this.filteredMembers.length;
    this.activeMembers = this.filteredMembers.filter(m => m.status).length;
  }

  open(member: any) { this.selectedMember = member; this.popupMode = 'join'; }
  openParticipant(member: any) { this.selectedMember = member; this.popupMode = 'remove'; }

  joinMember() {
    if (!this.loggedInMember) return alert("❌ Please login first");

    this.http.post(`${environment.apiUrl}/api/participants/join`, {
      memberId: this.loggedInMember._id,
      seasonId: this.seasonId,
      sessionId: this.sessionId
    }).subscribe({
      next: () => { alert("✅ Joined Event"); this.loadParticipants(); this.closePopup(); },
      error: err => alert(err.error.message)
    });
  }

  removeMember() {
    const memberId = this.selectedMember._id;
    const url = this.selectedMember.isTrial
      ? `${environment.apiUrl}/api/participants/removeTrial/${this.sessionId}/${memberId}`
      : `${environment.apiUrl}/api/participants/removeWithAttendance/${this.sessionId}/${memberId}`;

    this.http.delete(url).subscribe(() => {
      alert(`✅ ${this.selectedMember.isTrial ? "Trial Removed" : "Removed Member"}`);
      this.loadParticipants();
      this.closePopup();
    });
  }

  closePopup() { this.selectedMember = null; }

  checkEventStatus() {
    this.http.get<any[]>(`${environment.apiUrl}/api/seasons`).subscribe(seasons => {
      if (!seasons.length) return this.showSeasonError("No season available.");

      const latestSeason = seasons.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      if (!latestSeason.status) return this.showSeasonError("Season is currently inactive.");

      this.seasonId = latestSeason._id;

      this.http.get<any[]>(`${environment.apiUrl}/api/seasons/${this.seasonId}/sessions`).subscribe(sessions => {
        if (!sessions.length) return this.showSeasonError("No session available.");

        const today = new Date(); today.setHours(0,0,0,0);
        const upcoming = sessions.filter(s => s.status !== false && new Date(s.date) >= today)
          .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (!upcoming.length) return this.showSeasonError("No active session available.");

        this.sessionData = upcoming[0];
        this.sessionId = upcoming[0]._id;

        this.loadParticipants();
        this.load();
        this.cdr.detectChanges();
      });
    });
  }

  getImagePath(img: string) {
    if (!img) return '/logo.png';
    return img.includes('/uploads') ? `${environment.apiUrl}${img}` : img;
  }
}
