import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { environment } from '@env/environment';

@Component({
  selector: 'guce-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-container" [style.--primary-color]="primaryColor" [style.--secondary-color]="secondaryColor">
      <guce-sidebar
        [collapsed]="sidebarCollapsed"
        (toggleCollapse)="toggleSidebar()">
      </guce-sidebar>
      <div class="main-content" [class.sidebar-collapsed]="sidebarCollapsed">
        <guce-header
          [sidebarCollapsed]="sidebarCollapsed"
          (toggleSidebar)="toggleSidebar()">
        </guce-header>
        <main class="content-area">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class AppComponent implements OnInit {
  sidebarCollapsed = false;
  primaryColor = environment.branding.primaryColor;
  secondaryColor = environment.branding.secondaryColor;

  ngOnInit(): void {
    // Set CSS variables for dynamic theming
    document.documentElement.style.setProperty('--primary-color', this.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', this.secondaryColor);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
