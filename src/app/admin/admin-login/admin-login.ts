import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-admin-login',
  imports: [RouterLink, FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLogin {
 form = { password: '' };

constructor(private auth: Auth, private router: Router){}

login() {
  this.auth.login(this.form).subscribe({
    next: (res: any) => {
      this.auth.saveToken(res.token);

      this.router.navigate(['/pages']);
      alert('Login success');
    },
    error: err => alert(err.error.message)
  });
}
}
