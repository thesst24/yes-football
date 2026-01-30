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

  constructor(private service: Member) {}

  ngOnInit() {
    this.load();
  }
  load() {
    this.service.getAll().subscribe((res) => {
      this.members = (res as any[]).map((m) => ({
        ...m,
        ageGroup: this.getAgeGroup(m.dateOfBirth),
      }));
    });
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

    this.service.updateStatus(member._id, newStatus).subscribe({
      next: () => {},
      error: () => {
        member.status = !newStatus; // rollback
        alert('Cannot update status');
      },
    });
  }
}
