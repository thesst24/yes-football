import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-manage-season',
  imports: [DatePickerModule, FormsModule, CommonModule],
  templateUrl: './manage-season.html',
  styleUrl: './manage-season.css',
})
export class ManageSeason {
  @Output() close = new EventEmitter<any>();
  @Output() onSaveSuccess = new EventEmitter<void>();

  seasonForm = {
    name: '',
    fromtoDate: [], 
  };

  constructor(private http: HttpClient) {}

  createSeason() {
    const dateRange = this.seasonForm.fromtoDate;

    if (!this.seasonForm.name) {
      alert('Please enter the season name.');
      return;
    }

    if (!dateRange || dateRange.length < 2 || !dateRange[1]) {
      alert(
        'Please select a date range that includes both "start" and "end" dates (you need to select it twice in the calendar).',
      );
      return;
    }

    // --- ส่วน Logic การคำนวณวันซ้อมอัตโนมัติ (Auto Sessions) ---
    const sessions = [];
    let currentDate = new Date(dateRange[0]);
    const endDate = new Date(dateRange[1]);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay(); // 0 = อาทิตย์, 3 = พุธ, 6 = เสาร์
      
      if (dayOfWeek === 0 || dayOfWeek === 3 || dayOfWeek === 6) {
        // เพิ่มสำเนาของวันที่ปัจจุบันลงในอาเรย์
        sessions.push(new Date(currentDate));
      }
      
      // ขยับไปวันถัดไป (+1 วัน)
      currentDate.setDate(currentDate.getDate() + 1);
    }
    // -------------------------------------------------------
    const payload = {
      name: this.seasonForm.name,
      startDate: dateRange[0],
      endDate: dateRange[1],
      sessions: sessions
    };

    this.http.post('http://localhost:3000/api/seasons', payload).subscribe({
      next: (res) => {
        alert('Season created successfully!');

        this.close.emit(true);
      },
      error: (err) => {
        console.error('Error:', err);
        alert('Error: ' + err.error.message);
      },
    });
  }


  calculatePreview(): number {
  if (!this.seasonForm.fromtoDate[1]) return 0;
  
  let count = 0;
  let curr = new Date(this.seasonForm.fromtoDate[0]);
  let end = new Date(this.seasonForm.fromtoDate[1]);
  
  while (curr <= end) {
    if ([0, 3, 6].includes(curr.getDay())) count++;
    curr.setDate(curr.getDate() + 1);
  }
  return count;
}
}
