import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Member } from '../../../services/member';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-card-checkin',
  imports: [ CommonModule],
  templateUrl: './card-checkin.html',
  styleUrl: './card-checkin.css',
})
export class CardCheckin {
 @Input() member: any;
  @Output() close = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();

  card: any = null;
  loading = false;
  checkinSlots = new Array(10);

  constructor(private memberService: Member) {}

  ngOnInit() {
    if (this.member?._id) {
      this.loadCard();
    }
  }

  loadCard() {
    this.memberService.getCard(this.member._id).subscribe({
      next: (res) => {
        this.card = res;
      },
      error: () => {
        alert('Failed to load card');
      }
    });
  }

  isExpired(): boolean {
    if (!this.card?.expiryDate) return false;
    return new Date() > new Date(this.card.expiryDate);
  }

  onCheckInClick(index: number) {

    if (!this.card) return;

    // กดได้เฉพาะช่องถัดไป
    if (index !== this.card.usedSessions) return;

    if (this.isExpired()) {
      alert('Card expired');
      return;
    }

    if (this.card.usedSessions >= this.card.totalSessions) {
      alert('Card fully used');
      return;
    }

    this.loading = true;

    this.memberService.checkIn(this.member._id)
      .subscribe({
        next: (res: any) => {
          this.card.usedSessions = res.usedSessions;
          this.loading = false;

          // 🔥 บอกหน้าแม่ให้ refresh list
          this.refresh.emit();
        },
        error: (err) => {
          this.loading = false;
          alert(err?.error?.message || 'Check-in failed');
        }
      });
  }

  closePopup() {
    this.close.emit();
  }

}

