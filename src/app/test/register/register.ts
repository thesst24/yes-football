import { Component } from '@angular/core';
import { Auth } from '../../services/auth';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  form = { username: '', email: '', password: '' };
  constructor(private auth: Auth) {}
  register() {
    this.auth.register(this.form).subscribe({
      next: (res: any) => {
        alert('Registration successful');
      },
      error: err => alert(err.error.message)
    });
  }

}
