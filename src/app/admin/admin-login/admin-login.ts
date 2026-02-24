import { ChangeDetectorRef, Component } from '@angular/core';
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
  showPopup = false;

constructor(private adminService: Admin, 
  private router: Router,
private cdr: ChangeDetectorRef){}
login() {

    if (!this.password.trim()) {
      this.error = 'Please enter your password';
      return;
    }
  this.adminService.login(this.password).subscribe({
    next: () => {
      this.router.navigate(['/season']);
    },
    error: () => {
      this.showPopup = true;
      this.error = '';

      this.cdr.detectChanges();
    },
  });
}

closePopup() {
    this.showPopup = false;
    this.password = ''; 
  }


  onPasswordInput() {
    if (this.password.length > 0) {
      this.error = '';
    }
  }

}
