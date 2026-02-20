import { Component, HostListener, OnInit } from '@angular/core';
import { Sidebar } from "../../components/sidebar/sidebar";
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule, NgClass } from '@angular/common';
import { filter } from 'rxjs';


@Component({
  selector: 'app-pages',
  imports: [Sidebar, RouterOutlet, NgClass, CommonModule],
  templateUrl: './pages.html',
  styleUrl: './pages.css',
})
export class Pages {
  sidebarVisible: boolean = true;
selectedMenu: string = '';

  isMobileView = window.innerWidth <= 768;

constructor(private router: Router){}

ngOnInit() {
    // 1. ตรวจสอบชื่อเมนูทันทีที่โหลดหน้า (ป้องกันตอน Refresh)
    this.updateTitleByUrl(this.router.url);

    // 2. ติดตามการเปลี่ยนแปลงของ URL (เผื่อกรณีผู้ใช้กด Back/Forward ใน Browser)
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateTitleByUrl(event.urlAfterRedirects);
    });
    // ถ้าความกว้างหน้าจอน้อยกว่าหรือเท่ากับ 768px ให้ปิด Sidebar ทันทีที่โหลด
    if (window.innerWidth <= 768) {
      this.sidebarVisible = false;
    }
  }

  // ฟังก์ชันช่วยแปลง URL เป็นชื่อ Header
  updateTitleByUrl(url: string) {
    if (url.includes('check-in')) this.selectedMenu = 'Check-in';
    else if (url.includes('season')) this.selectedMenu = 'Seasons';
    else if (url.includes('member')) this.selectedMenu = 'Members';
    else if (url.includes('report')) this.selectedMenu = 'Report';
    else if (url.includes('setting')) this.selectedMenu = 'Setting';
    else this.selectedMenu = 'Check-in'; // ค่า Default
  }

  // เพิ่มเติม: ถ้าอยากให้กดเมนูแล้วปิด Sidebar อัตโนมัติ (เฉพาะมือถือ)
  onMenuSelect() {
    if (window.innerWidth <= 768) {
      this.sidebarVisible = false;
    }
  }

  // ✅ ฟังก์ชันเช็คว่าเป็นมือถือหรือไม่
  isMobile(): boolean {
    return window.innerWidth <= 768;
  }



@HostListener('window:resize')
onResize() {
  this.isMobileView = window.innerWidth <= 768;
}
  
}
