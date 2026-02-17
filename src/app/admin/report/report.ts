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
// ✅ ต้องมีตัวแปรเหล่านี้ก่อน
  report: any = null;

  year: number = new Date().getFullYear();
  month: number = new Date().getMonth() + 1;

  constructor(private http: HttpClient,
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
