import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Member } from '../../services/member';
import { AddMember } from './add-member/add-member';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';


@Component({
  selector: 'app-members',
  imports: [CommonModule, ToggleSwitchModule, DatePipe, FormsModule, AddMember],
  templateUrl: './members.html',
  styleUrl: './members.css',
})
export class Members {
 // ===== DATA =====
  allMembers: any[] = [];
  filteredMembers: any[] = [];
  members: any[] = [];

  // ===== UI =====
  showPopup = false;
  editData: any = null;

  // ===== PAGINATION =====
  pageSize = 9;
  currentPage = 1;
  totalItems = 0;

  // ===== SORT =====
  sortDateDir: 'asc' | 'desc' = 'asc';
  sortUDir: 'asc' | 'desc' = 'asc';

  // ===== SEARCH =====
  searchText = '';

  // ===== COUNT =====
  totalMembers = 0;
  activeMembers = 0;

  constructor(
    private service: Member, 
    private router:Router,
  private cdr: ChangeDetectorRef ) {}

  ngOnInit() {
    this.load();
  }

  // ===== LOAD =====
  load() {
    this.service.getAll().subscribe((res: any[]) => {
      const mapped = res.map(m => ({
        ...m,
        ageGroup: this.getAgeGroup(m.dateOfBirth),
      }));

      this.allMembers = [...mapped];
      this.filteredMembers = [...this.allMembers];
      this.totalItems = this.filteredMembers.length;
      this.currentPage = 1;

      this.updatePage();
      this.updateMemberCount();
      
      this.cdr.detectChanges();
      
    });
    
  }

  // ===== PAGINATION =====
  updatePage() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.members = this.filteredMembers.slice(start, end);
  }

  nextPage() {
    if (this.currentPage * this.pageSize < this.totalItems) {
      this.currentPage++;
      this.updatePage();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePage();
    }
  }

  get startItem() {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem() {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  // ===== SEARCH =====
  filterMembers() {
    const text = this.searchText.trim().toLowerCase();

    if (!text) {
      this.filteredMembers = [...this.allMembers];
    } else {
      this.filteredMembers = this.allMembers.filter(m =>
        m.fullname?.toLowerCase().includes(text) ||
        m.guardian?.toLowerCase().includes(text) ||
        m.whatsapp?.toString().includes(text)
      );
    }
    this.totalItems = this.filteredMembers.length;
    this.currentPage = 1;
    this.updatePage();
    this.updateMemberCount();
  }

  // ===== COUNT =====
  updateMemberCount() {
    this.totalMembers = this.filteredMembers.length;
    this.activeMembers = this.filteredMembers.filter(m => m.status).length;
  }

  // ===== SORT =====
  sortByU() {
    this.sortUDir = this.sortUDir === 'asc' ? 'desc' : 'asc';

    this.filteredMembers.sort((a, b) => {
      const u1 = +a.ageGroup.replace('U', '');
      const u2 = +b.ageGroup.replace('U', '');
      return this.sortUDir === 'asc' ? u1 - u2 : u2 - u1;
    });

    this.updatePage();
  }

  sortByDate() {
    this.sortDateDir = this.sortDateDir === 'asc' ? 'desc' : 'asc';

    this.filteredMembers.sort((a, b) => {
      const d1 = new Date(a.dateOfBirth).getTime();
      const d2 = new Date(b.dateOfBirth).getTime();
      return this.sortDateDir === 'asc' ? d1 - d2 : d2 - d1;
    });

    this.updatePage();
  }

  // ===== CRUD =====
  openAdd() {
    this.editData = null;
    this.showPopup = true;
  }

  openEdit(m: any) {
    this.editData = m;
    this.showPopup = true;
  }

  closePopup(refresh?: boolean) {
    this.showPopup = false;
    if (refresh) this.load();
  }

  delete(id: string) {
    if (confirm('Delete this member?')) {
      this.service.delete(id).subscribe(() => this.load());
    }
  }

toggleStatus(member: any) {
  const newStatus = !!member.status;

  // ✅ เปิด Active
  if (newStatus) {
    this.service.renew(member._id).subscribe({
      next: () => {
        alert("✅ Member Activated + Card Renewed!");
        this.load();
      },
      error: (err) => {
        alert("❌ Renew failed: " + err.error.message);
        member.status = false; // rollback toggle
      },
    });

    return;
  }

  // ❌ ปิด inactive
  this.service.updateStatus(member._id, false).subscribe({
    next: () => {
      alert("❌ Member Deactivated");
      this.load();
    },
    error: () => {
      alert("❌ Update failed");
      member.status = true; // rollback toggle
    },
  });
}

  // ===== UTIL =====
  getAgeGroup(date: string | Date) {
    const dob = new Date(date);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    if (
      today.getMonth() < dob.getMonth() ||
      (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
    ) age--;
    return `U${age}`;
  }
}
