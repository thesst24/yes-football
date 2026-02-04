import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { UserLogin } from "./user/user-login/user-login";
import { CardCheck } from "./user/card-check/card-check";
import { Login } from "./test/login/login";
import { NgModel } from '@angular/forms';
import { CardCheckin } from "./admin/check-in/card-checkin/card-checkin";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UserLogin, CardCheck, RouterLink, Login, CardCheckin],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('tsubasafc');
}
