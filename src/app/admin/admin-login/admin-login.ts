import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Admin } from '../../services/admin';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-admin-login',
  imports: [RouterLink, FormsModule,CommonModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLogin {
  password = '';
  error = '';

constructor(private adminService: Admin, private router: Router){}

login() {
    this.adminService.login(this.password).subscribe({
      next: () => {
        const seasonId = localStorage.getItem("selectedSeasonId");
      const sessionId = localStorage.getItem("selectedSessionId");

      if (seasonId && sessionId) {
        this.router.navigate(['/season']);
      } 
      },
      error: () => {
        alert(this.error = 'Password incorrect');
      },
    });
  }
}
