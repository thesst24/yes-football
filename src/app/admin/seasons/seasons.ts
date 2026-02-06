import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { ManageSeason } from "./manage-season/manage-season";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-seasons',
  imports: [RouterLink, ManageSeason, FormsModule, CommonModule, RouterLinkActive],
  templateUrl: './seasons.html',
  styleUrl: './seasons.css',
})
export class Seasons {
    // ===== UI =====
    showPopup = false;

    constructor(private http:HttpClient){}

    openPopup() {
      this.showPopup = true;
    }

    closePopup(refresh?: boolean){
      this.showPopup = false;
    }

}
