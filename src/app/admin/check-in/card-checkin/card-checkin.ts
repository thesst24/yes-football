import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Member } from '../../../services/member';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-card-checkin',
  imports: [CommonModule],
  templateUrl: './card-checkin.html',
  styleUrl: './card-checkin.css',
})
export class CardCheckin {
  @Input() member: any;

  // ✅ รับค่าจาก Season/Session ที่เลือก
  @Input() seasonId!: string;
  @Input() sessionId!: string;

  @Output() close = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();

  setting: any = {};
  card: any = null;
  checkinSlots = Array.from({ length: 10 }, (_, i) => i);

  constructor(
    private memberService: Member,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    if (this.member?._id) {
      this.loadCard();
    }
    this.settings();
  }

  settings() {
    this.http.get('http://localhost:3000/api/settings').subscribe((res) => {
      this.setting = res;

      this.cdr.detectChanges();
    });
  }

  loadCard() {
    this.memberService.getCard(this.member._id).subscribe({
      next: (res) => {
        console.log('✅ Card Loaded:', res); // 👈 เพิ่มตรงนี้
        this.card = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('❌ Card Error:', err);
        alert('Failed to load card');
      },
    });
  }

  // ✅ กดได้แค่ช่องถัดไป
  onCheckInClick(index: number) {
    // ❌ ถ้า card inactive หรือเต็มแล้ว ห้ามกด
    if (this.isCardFull || this.card?.status === 'inactive') return;

    if (index !== this.card.usedSessions) return;

    if (!confirm('Confirm Check-in?')) return;

    this.checkinNow();
  }

  checkinNow() {
    this.http
      .post('http://localhost:3000/api/attendance/checkin', {
        memberId: this.member._id,
        seasonId: this.seasonId,
        sessionId: this.sessionId,
      })
      .subscribe({
        next: (res: any) => {
          alert('✅ Check-in Success');
          this.card = res.card;

          this.refresh.emit();
          this.close.emit();
        },
        error: (err) => alert(err.error.message),
      });
  }

  get isCardFull(): boolean {
    return this.card?.usedSessions >= 10;
  }

  renewCard() {
    console.log('🔥 Renew memberId:', this.member._id);
    this.http
      .post('http://localhost:3000/api/cards/renew', {
        memberId: this.member._id,
      })
      .subscribe({
        next: (res: any) => {
          alert('✅ Renew success');
          this.card = res.card;

          // ✅ refresh attendance list
          this.refresh.emit();

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log('❌ Renew Error:', err.error);
          alert(err.error.message);
        },
      });
  }

  closePopup() {
    this.close.emit();
  }
}
