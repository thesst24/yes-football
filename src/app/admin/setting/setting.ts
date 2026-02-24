import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';

@Component({
  selector: 'app-setting',
  imports: [CommonModule],
  templateUrl: './setting.html',
  styleUrl: './setting.css',
})
export class Setting {
 setting: any = {};
  backgroundPreview: string = '';
  qrPreview: string = '';

  baseUrl = "http://localhost:3000";

  constructor(private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    
    this.loadSetting();

  }

  loadSetting() {
    this.http.get<any>(`${this.baseUrl}/api/settings`)
      .subscribe(res => {
        this.setting = res;

        if (res?.cardBackground) {
          this.backgroundPreview = this.baseUrl + res.cardBackground;
        }

        if (res?.qrImage) {
          this.qrPreview = this.baseUrl + res.qrImage;
        }
        
         this.cdr.detectChanges();
      });
         
  }

  uploadBackground(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // 🔹 Preview ทันที
    const reader = new FileReader();
    reader.onload = () => {
      this.backgroundPreview = reader.result as string;
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("image", file);

    this.http.post(`${this.baseUrl}/api/settings/upload-background`, formData)
      .subscribe(() => {
        alert("✅ Background Updated");
        this.loadSetting(); // refresh path จริงจาก server
      });
  }

  uploadQR(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.qrPreview = reader.result as string;
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("image", file);

    this.http.post(`${this.baseUrl}/api/settings/upload-qr`, formData)
      .subscribe(() => {
        alert("✅ QR Updated");
        this.loadSetting();
      });
  }
}
