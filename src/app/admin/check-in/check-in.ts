import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Member } from '../../services/member';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardCheckin } from "./card-checkin/card-checkin";

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

  // ===== COUNT =====
  totalMembers = 0;
  activeMembers = 0;
  // ==== Search ====
  searchText = '';
    // ===== UI =====
 selectedMember: any = null;

  constructor(private service: Member,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.load();
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

