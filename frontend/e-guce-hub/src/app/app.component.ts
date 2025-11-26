import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'hub-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-container">
      <hub-sidebar
        [collapsed]="sidebarCollapsed"
        (toggleCollapse)="toggleSidebar()">
      </hub-sidebar>
      <div class="main-content" [class.sidebar-collapsed]="sidebarCollapsed">
        <hub-header
          [sidebarCollapsed]="sidebarCollapsed"
          (toggleSidebar)="toggleSidebar()">
        </hub-header>
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
export class AppComponent {
  sidebarCollapsed = false;

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
