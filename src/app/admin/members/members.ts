import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Member } from '../../services/member';
import { AddMember } from './add-member/add-member';

@Component({
  selector: 'app-members',
  imports: [CommonModule, ToggleSwitchModule, DatePipe, FormsModule, AddMember],
  templateUrl: './members.html',
  styleUrl: './members.css',
})
export class Members {
  members: any[] = []; 
  showPopup = false;
  editData: any = null;
  // pagination
   allMembers: any[] = [];
    pageSize = 9;
  currentPage = 1;
  totalItems = 0;

  //  sortKey: string = '';
  // sortDir: 'asc' | 'desc' = 'asc';
  sortDateDir: 'asc' | 'desc' = 'asc';
  sortUDir: 'asc' | 'desc' = 'asc';

  searchText = '';
filteredMembers: any[] = [];

totalMembers: number = 0;
activeMembers: number = 0;


  constructor(private service: Member) {}

  ngOnInit() {
    this.load();
  }
  
  load() {
     this.service.getAll().subscribe((res: any) => {
      // คำนวณ ageGroup ถ้าใช้ U12 U13 ...
      this.members = res.map((m: any) => ({
        ...m,
        ageGroup: this.getAgeGroup(m.dateOfBirth),
      }));
      this.filteredMembers = [...this.members]; // initialize
      this.updateMemberCount();
    });
  }
  filterMembers() {
  const text = this.searchText.toLowerCase();
  this.filteredMembers = this.members.filter(m =>
    (m.fullname?.toLowerCase().includes(text)) ||
    (m.guardian?.toLowerCase().includes(text)) ||
    (m.whatsapp?.toString().includes(text))
  );
}
updateMemberCount() {
  this.totalMembers = this.members.length;
  this.activeMembers = this.members.filter(m => m.status).length;
}


  openAdd() {
    this.editData = null;
    this.showPopup = true;
  }

  openEdit(m: any) {
    this.editData = m;
    this.showPopup = true;
  }

  closePopup(data?: any) {
    this.showPopup = false;

    if (data && typeof data === 'object') {
      // member ใหม่ push เข้า list
      this.members.push({
        ...data,
        ageGroup: this.getAgeGroup(data.dateOfBirth),
      });
    } else {
      this.load(); // สำหรับ edit / delete
    }
      this.filteredMembers = [...this.members]; // รีเฟรช search list
  this.updateMemberCount(); // อัปเดต counter
  }

  delete(id: string) {
    if (confirm('Delete this member?')) {
      this.service.delete(id).subscribe(() => this.load());
    }
  }
  getAgeGroup(dateOfBirth: string | Date): string {
    if (!dateOfBirth) return '-';

    const dob = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return `U${age}`;
  }

  toggleStatus(member: any) {
    if (!member._id) {
      alert('Cannot update status: missing _id');
      return;
    }

    const newStatus = !!member.status;
    member.status = newStatus; // Optimistic UI
    this.updateMemberCount();

    this.service.updateStatus(member._id, newStatus).subscribe({
      next: () => {},
      error: () => {
        member.status = !newStatus; // rollback
        this.updateMemberCount();
        alert('Cannot update status');
      },
    });
  }
//  Sort BY Date
   // 🔥 sort U
  sortByU() {
    this.sortUDir = this.sortUDir === 'asc' ? 'desc' : 'asc';

    this.filteredMembers.sort((a, b) => {
      const u1 = parseInt(a.ageGroup?.replace('U', '') || 0, 10);
      const u2 = parseInt(b.ageGroup?.replace('U', '') || 0, 10);

      return this.sortUDir === 'asc' ? u1 - u2 : u2 - u1;
    });
  }

  // 🔥 sort Date of Birth
  sortByDate() {
    this.sortDateDir = this.sortDateDir === 'asc' ? 'desc' : 'asc';

    this.filteredMembers.sort((a, b) => {
      const d1 = new Date(a.dateOfBirth).getTime();
      const d2 = new Date(b.dateOfBirth).getTime();

      return this.sortDateDir === 'asc' ? d1 - d2 : d2 - d1;
    });
  }
}
