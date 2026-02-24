import { ChangeDetectorRef, Component } from '@angular/core';
import { Member } from '../../services/member';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-login',
  imports: [ FormsModule, CommonModule],
  templateUrl: './user-login.html',
  styleUrl: './user-login.css',
})
export class UserLogin {
  whatsapp = '';
  error = '';
  showPopup = false;

  private logoClickCount = 0;
  private clickTimer: any = null;

  constructor(
    private memberService: Member,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onLogoClick() {
    this.logoClickCount++;

    clearTimeout(this.clickTimer);

    this.clickTimer = setTimeout(() => {
      this.logoClickCount = 0;
    }, 1500); 

    if (this.logoClickCount === 5) {
      this.logoClickCount = 0;
      this.router.navigate(['/admin-login']);
    }
  }
  
  login() {
    if (!this.whatsapp.trim()) {
      this.error = 'Please enter whatsapp number';
      return;
    }

    this.memberService.loginByWhatsapp(this.whatsapp).subscribe({
      next: (member) => {
        this.error = '';
        localStorage.setItem('member', JSON.stringify(member));
        
        this.router.navigate(['/card-user']);
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
    this.whatsapp = ''; 
  }

}
