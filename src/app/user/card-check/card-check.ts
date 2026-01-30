import { Component } from '@angular/core';
import { Card } from "../../components/card/card";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-card-check',
  imports: [Card, RouterLink],
  templateUrl: './card-check.html',
  styleUrl: './card-check.css',
})
export class CardCheck {

}
