import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-report',
  imports: [CommonModule,FormsModule],
  templateUrl: './report.html',
  styleUrl: './report.css',
})
export class Report {
// ✅ Report Data
  report: any = null;

  // ✅ Default Filter
  year: number = new Date().getFullYear();
  month: number = new Date().getMonth() + 1;

  // ✅ Months Dropdown
  months = [
    { value: 1, label: "Jan" },
    { value: 2, label: "Feb" },
    { value: 3, label: "Mar" },
    { value: 4, label: "Apr" },
    { value: 5, label: "May" },
    { value: 6, label: "Jun" },
    { value: 7, label: "Jul" },
    { value: 8, label: "Aug" },
    { value: 9, label: "Sep" },
    { value: 10, label: "Oct" },
    { value: 11, label: "Nov" },
    { value: 12, label: "Dec" }
  ];

  // ✅ Years Dropdown
  years = [2026, 2025, 2024, 2023, 2022, 2021];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    this.http
      .get<any>(
        `http://localhost:3000/api/report/monthly?year=${this.year}&month=${this.month}`
      )
      .subscribe((res) => {
        this.report = res;
        this.cdr.detectChanges();
      });
  }
}
