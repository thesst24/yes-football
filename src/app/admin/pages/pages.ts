import { Component, OnInit } from '@angular/core';
import { Sidebar } from "../../components/sidebar/sidebar";
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-pages',
  imports: [Sidebar, RouterOutlet, NgClass],
  templateUrl: './pages.html',
  styleUrl: './pages.css',
})
export class Pages {
  sidebarVisible: boolean = true;
selectedMenu: string = '';

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
}
