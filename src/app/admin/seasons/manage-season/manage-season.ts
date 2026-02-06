import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';


@Component({
  selector: 'app-manage-season',
  imports: [DatePickerModule,FormsModule,CommonModule],
  templateUrl: './manage-season.html',
  styleUrl: './manage-season.css',
})
export class ManageSeason {

  @Output() close = new EventEmitter<any>();

  constructor(private cdr: ChangeDetectorRef){}

  rangeDates: Date[] | undefined;

}
