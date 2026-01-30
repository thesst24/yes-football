import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { UserLogin } from "./user/user-login/user-login";
import { CardCheck } from "./user/card-check/card-check";
import { Login } from "./test/login/login";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UserLogin, CardCheck, RouterLinkWithHref, Login],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('tsubasafc');
}
