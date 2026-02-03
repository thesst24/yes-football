import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Member } from '../../services/member';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-login',
  imports: [RouterLink,FormsModule,CommonModule],
  templateUrl: './user-login.html',
  styleUrl: './user-login.css',
})
export class UserLogin {
  whatsapp = '';
  error = '';

  constructor(private memberService: Member,
    private router: Router
  ) {}

  login() {
    if (!this.whatsapp) {
      this.error = 'Please enter whatsapp number';
      return;
    } 

    this.memberService.loginByWhatsapp(this.whatsapp).subscribe({
      next: (member) => {
        localStorage.setItem('member', JSON.stringify(member));
              this.router.navigate(['/card-check']);
        alert('Login success');
      },
       error: err => alert(err.error.message)
    });
  }
}
