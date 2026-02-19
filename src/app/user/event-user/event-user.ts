import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-event-user',
  imports: [RouterLink,FormsModule,CommonModule],
  templateUrl: './event-user.html',
  styleUrl: './event-user.css',
})
export class EventUser {
 // 🔍 Search
  searchText: string = "";

  // Members
  members: any[] = [];
  filteredMembers: any[] = [];

  // Participants
  participants: any[] = [];

  // Selected Popup
  selectedMember: any = null;

  // Season + Session Info
  season: any = null;
  session: any = null;

  seasonId: string = "";
  sessionId: string = "";

  // Count
  activeMembers = 0;
  totalMembers = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadEvent();
    this.loadMembers();
    this.loadParticipants();
  }

  // ==============================
  // ✅ Load Season + Session Info
  // ==============================
  loadEvent() {
    this.seasonId = localStorage.getItem("seasonId") || "";
    this.sessionId = localStorage.getItem("sessionId") || "";

    // โหลดข้อมูล Season
    this.http.get(`http://localhost:3000/api/seasons/${this.seasonId}`)
      .subscribe((res: any) => this.season = res);

    // โหลดข้อมูล Session
    this.http.get(`http://localhost:3000/api/sessions/${this.sessionId}`)
      .subscribe((res: any) => this.session = res);
  }

  // ==============================
  // ✅ Load Club Members
  // ==============================
  loadMembers() {
    this.http.get("http://localhost:3000/api/members")
      .subscribe((res: any) => {
        this.members = res;

        // filter active only
        this.filteredMembers = this.members;
        this.totalMembers = this.members.length;
        this.activeMembers = this.members.filter(m => m.status === true).length;
      });
  }

  // ==============================
  // ✅ Load Participants
  // ==============================
  loadParticipants() {
    this.http.get(`http://localhost:3000/api/participants/${this.sessionId}`)
      .subscribe((res: any) => {
        this.participants = res;
      });
  }

  // ==============================
  // ✅ Search Filter
  // ==============================
  filterMembers() {
    this.filteredMembers = this.members.filter(m =>
      m.fullname.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  // ==============================
  // ✅ Open Popup Card
  // ==============================
  open(member: any) {
    this.selectedMember = member;
  }

  closePopup() {
    this.selectedMember = null;
  }

  // Reload after checkin/renew
  refresh() {
    this.loadParticipants();
    this.loadMembers();
  }
}
