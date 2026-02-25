import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { MatIconModule} from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { environment } from '../../../environments/environment';

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

  if (seasonId && sessionId) {
    this.router.navigate(["/checkin", seasonId, sessionId]);
    return;
  }

  this.http.get(`${environment.apiUrl}/api/checkin/latest`)
    .subscribe({
      next: (res: any) => {
        localStorage.setItem("selectedSeasonId", res.season._id);
        localStorage.setItem("selectedSessionId", res.session._id);

        this.router.navigate([
          "/checkin",
          res.season._id,
          res.session._id
        ]);
      },
      error: () => alert("❌ No active season/session found")
    });
}

isSeasonActive(): boolean {
  return (
    this.router.url.startsWith('/season') ||
    this.router.url.startsWith('/events')
  );
}
}
