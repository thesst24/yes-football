import { Component } from '@angular/core';
import { Auth } from '../../services/auth';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
 form = { email: '', password: '' };

constructor(private auth: Auth, private router: Router){}

login() {
  this.auth.login(this.form).subscribe({
    next: (res: any) => {
      this.auth.saveToken(res.token);

      this.router.navigate(['/'])
      alert('Login success');
    },
    error: err => alert(err.error.message)
  });
}
}
