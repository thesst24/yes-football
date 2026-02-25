import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { Member } from '../../services/member';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-card-user',
  imports: [CommonModule,FormsModule,RouterLink],
  templateUrl: './card-user.html',
  styleUrl: './card-user.css',
})
export class CardUser {

  
 @Output() close = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();

  member: any = null;
  card: any = null;
  showRenew = false;
  setting: any = {};

  constructor(
    private memberService: Member,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    // โหลด member จาก localStorage
    const stored = localStorage.getItem("member");
    if (stored) {
      this.member = JSON.parse(stored).member;
      this.loadCard();
    }
    this.loadSettings();
  }

  loadSettings() {
    this.http.get(`${environment.apiUrl}/api/settings`)
      .subscribe(res => {
        this.setting = res;
        this.cdr.detectChanges();
      });
  }

  showPopupRenew() {
    this.showRenew = true;
  }

  closePopupRenew() {
    this.showRenew = false;
  }

  loadCard() {
    this.memberService.getCard(this.member._id).subscribe({
      next: (res) => {
        this.card = res;
        this.cdr.detectChanges();
      },
      error: () => alert("Failed to load card"),
    });
  }

  renewCard() {
    console.log("🔥 Renew memberId:", this.member._id);
    this.http.post(`${environment.apiUrl}/api/cards/renew`, {
      memberId: this.member._id
    }).subscribe({
      next: (res: any) => {
        alert("✅ Renew success");
        this.card = res.card;
        // refresh attendance list
        this.refresh.emit();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log("❌ Renew Error:", err.error);
        alert(err.error.message);
      }
    });
  }

  get isCardFull(): boolean {
    return this.card?.usedSessions >= 10;
  }

  get usedSessions() {
    return this.card?.usedSessions || 0;
  }

  get remainingSessions() {
    return 10 - this.usedSessions;
  }

  getImagePath(img: string) {
    if (!img) return '/logo.png';
    if (img.includes('/uploads')) return `${environment.apiUrl}${img}`;
    return img;
  }
}
