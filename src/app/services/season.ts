import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Season {
  generate15Sessions(startDate: Date) {
    const sessions = [];
    const targetDays = [3, 6, 0]; // 0=อาทิตย์, 3=พุธ, 6=เสาร์
    let currentDate = new Date(startDate);
    let count = 1;

    while (count <= 15) {
      // ตรวจสอบว่าวันที่ปัจจุบันตรงกับ พุธ, เสาร์ หรือ อาทิตย์ หรือไม่
      if (targetDays.includes(currentDate.getDay())) {
        sessions.push({
          sessionNo: count,
          date: new Date(currentDate),
          dayName: this.getDay(currentDate.getDay())
        });
        count++;
      }
      // ขยับไปวันถัดไป
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return sessions;
  }

  getDay(dayIndex: number): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thusday', 'firday', 'saturday'];
    return days[dayIndex];
  }
}
