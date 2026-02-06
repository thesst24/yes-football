import { Component, EventEmitter, Output } from '@angular/core';
import { MatIconModule} from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from "@angular/router";


@Component({
  selector: 'app-sidebar',
  imports: [MatIconModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
    @Output() menuSelect = new EventEmitter<string>();


  selectMenu(name: string) {
    this.menuSelect.emit(name);
  }
}
