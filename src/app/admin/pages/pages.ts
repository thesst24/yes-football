import { Component } from '@angular/core';
import { Sidebar } from "../../components/sidebar/sidebar";
import { RouterOutlet } from '@angular/router';
import { Main } from "../main/main";

@Component({
  selector: 'app-pages',
  imports: [Sidebar, RouterOutlet, Main],
  templateUrl: './pages.html',
  styleUrl: './pages.css',
})
export class Pages {

}
