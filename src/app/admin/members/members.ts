import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { RouterLink } from "@angular/router";
import { Member } from '../../services/member';
import { AddMember } from "./add-member/add-member";


@Component({
  selector: 'app-members',
  imports: [CommonModule, ToggleSwitchModule,DatePipe, FormsModule, RouterLink, AddMember],
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
  this.service.getAll().subscribe(res => {
    this.members = (res as any[]).map(m => ({
      ...m,
      ageGroup: this.getAgeGroup(m.dateOfBirth)
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

  closePopup(refresh = false) {
    this.showPopup = false;
    if (refresh) this.load();
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

}