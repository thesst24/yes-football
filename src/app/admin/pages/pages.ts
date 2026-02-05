import { Component } from '@angular/core';
import { Sidebar } from "../../components/sidebar/sidebar";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-pages',
  imports: [Sidebar, RouterOutlet],
  templateUrl: './pages.html',
  styleUrl: './pages.css',
})
export class Pages {

}
