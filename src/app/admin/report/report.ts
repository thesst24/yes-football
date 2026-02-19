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

  mode: "monthly" | "yearly" = "monthly";

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
  years: number[] = [];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
  this.generateYears();
  this.loadReport();
}

generateYears() {
  const currentYear = new Date().getFullYear();

  // ย้อนหลัง 5 ปี + ปีปัจจุบัน
  this.years = Array.from({ length: 6 }, (_, i) => currentYear - i);
}

  loadReport() {

  let url = "";

  if (this.mode === "monthly") {
    url = `http://localhost:3000/api/report/monthly?year=${this.year}&month=${this.month}`;
  }

  if (this.mode === "yearly") {
    url = `http://localhost:3000/api/report/yearly?year=${this.year}`;
  }

  this.http.get<any>(url).subscribe(res => {
    this.report = res;
    this.cdr.detectChanges();
  });
}

    // ✅ helper show selected month label
  get selectedMonthLabel() {
    return this.months.find(m => m.value == this.month)?.label;
  }

  exportExcel() {
  window.open(
    `http://localhost:3000/api/report/export-excel?year=${this.year}&month=${this.month}`,
    "_blank"
  );
}
}
