import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { MatIconModule} from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";


@Component({
  selector: 'app-sidebar',
  imports: [MatIconModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
    @Output() menuSelect = new EventEmitter<string>();
seasonId!: string;
sessionId!: string;

    constructor(public router: Router,
      private cdr: ChangeDetectorRef,
      private http:HttpClient,
    ){}
    
ngOnInit() {
  this.seasonId = localStorage.getItem("selectedSeasonId") || "";
  this.sessionId = localStorage.getItem("selectedSessionId") || "";
  this.cdr.detectChanges();
}

  selectMenu(name: string) {
    this.menuSelect.emit(name);
  }

 goCheckin() {

  const seasonId = localStorage.getItem("selectedSeasonId");
  const sessionId = localStorage.getItem("selectedSessionId");

  // ✅ ถ้ามีอยู่แล้ว → เข้าเลย
  if (seasonId && sessionId) {
    this.router.navigate(["/checkin", seasonId, sessionId]);
    return;
  }

  // ✅ ถ้าไม่มี → โหลด latest season/session อัตโนมัติ
  this.http.get("http://localhost:3000/api/checkin/latest")
    .subscribe({
      next: (res: any) => {

        // เก็บลง localStorage
        localStorage.setItem("selectedSeasonId", res.season._id);
        localStorage.setItem("selectedSessionId", res.session._id);

        // ไปหน้า checkin
        this.router.navigate([
          "/checkin",
          res.season._id,
          res.session._id
        ]);
      },
      error: () => {
        alert("❌ No active season/session found");
      }
    });
}

isSeasonActive(): boolean {
  return (
    this.router.url.startsWith('/season') ||
    this.router.url.startsWith('/events')
  );
}
}
