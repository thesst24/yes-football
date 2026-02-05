import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Member } from '../../../services/member';

@Component({
  selector: 'app-add-member',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-member.html',
  styleUrls: ['./add-member.css'],
})
export class AddMember {
  @Input() data: any;
  @Output() close = new EventEmitter<any>();

  form: any = { status: true };
  image!: File;
  imagePreview: string | null = null;

  whatsappInvalid = false;

  constructor(private service: Member,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
        this.cdr.detectChanges(); 
    if (this.data) {
      this.form = { ...this.data };

      this.imagePreview = this.form.image ? 'http://localhost:3000' + this.form.image : null;

      if (this.form.image) {
        this.imagePreview = 'http://localhost:3000' + this.form.image;
      }
    }

  }

  onFile(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    this.image = input.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string; // 🔥 preview ทันที

      this.cdr.detectChanges();
    };
    reader.readAsDataURL(this.image);

  }
  removeImage() {
    this.image = undefined as any;
    this.imagePreview = null;

    // ถ้า edit แล้วลบรูปเดิม
    if (this.form.image) {
      this.form.image = null;
    }
  }

  save() {
    if (!this.form.fullname || !this.form.guardian || !this.form.dateOfBirth || !this.form.whatsapp)
      return;

    const whatsappPattern = /^[0-9]{10}$/;

    if (!whatsappPattern.test(this.form.whatsapp)) {
      this.whatsappInvalid = true;
      return;
    }

    this.whatsappInvalid = false;

    const fd = new FormData();
    Object.keys(this.form).forEach((k) => fd.append(k, this.form[k]));
    if (this.image) fd.append('image', this.image);

    const request$ = this.form._id
      ? this.service.update(this.form._id, fd)
      : this.service.create(fd);

    request$.subscribe({
      next: () => this.close.emit(true),
      error: (err) => {
        if (err.status === 400 && err.error.msg === 'WhatsApp number already exists') {
          alert('This WhatsApp number already exists.!');
        } else {
          alert('An error occurred. Please try again.');
        }
      },
    });
  }
}
