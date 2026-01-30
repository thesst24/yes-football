import { Component,Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Member } from '../../../services/member';

@Component({
  selector: 'app-add-member',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-member.html',
  styleUrl: './add-member.css',
})
export class AddMember {

  @Input() data: any;
  @Output() close = new EventEmitter<boolean>();

  form: any = {};
  image!: File;

  constructor(private service: Member) {}

  ngOnInit() {
    if (this.data) {
      this.form = { ...this.data };
    }
  }

  onFile(e: any) {
    this.image = e.target.files[0];
  }

  save() {
    if (!this.form.fullname ||
      !this.form.guardian ||
      !this.form.dateOfBirth ||
      !this.form.WhatsApp) {
    return;}
    const fd = new FormData();
    Object.keys(this.form).forEach(k => fd.append(k, this.form[k]));
    if (this.image) fd.append('image', this.image);

    if (this.form._id) {
      this.service.update(this.form._id, fd)
        .subscribe(() => this.close.emit(true));
    } else {
      this.service.create(fd)
        .subscribe(() => this.close.emit(true));
    }
  }
}
