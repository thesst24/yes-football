import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Card } from '../../../components/card/card';
import { CommonModule } from '@angular/common';
import { Member } from '../../../services/member';

@Component({
  selector: 'app-card-checkin',
  imports: [Card, CommonModule],
  templateUrl: './card-checkin.html',
  styleUrl: './card-checkin.css',
})
export class CardCheckin {
  @Input() member: any;                // ⬅️ รับข้อมูลสมาชิก
  @Output() close = new EventEmitter(); // ⬅️ แจ้งให้ parent ปิด popup

  checkinSlots = Array(10).fill(0);

  closePopup() {
    this.close.emit();
  }
}

