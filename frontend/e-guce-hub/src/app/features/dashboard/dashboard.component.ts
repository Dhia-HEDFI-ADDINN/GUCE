import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'hub-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <header class="app-header">
        <div class="header-left">
          <h1>🏢 E-GUCE 3G Hub</h1>
        </div>
        <div class="header-right">
          <div class="user-info">
            <span class="user-name">👤 {{ username }}</span>
            <span class="user-roles">{{ roles.join(', ') }}</span>
          </div>
          <button class="logout-btn" (click)="logout()">Déconnexion</button>
        </div>
      </header>

      <main class="main-content">
        <div class="page-header">
          <h2>Dashboard</h2>
          <p class="page-description">Vue d'ensemble de toutes les instances GUCE deployées</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-value">16</div>
            <div class="stat-label">Services Docker</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-value">16</div>
            <div class="stat-label">Services Actifs</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">🔐</div>
            <div class="stat-value">1</div>
            <div class="stat-label">Realm Keycloak</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">🗄️</div>
            <div class="stat-value">3</div>
            <div class="stat-label">Bases de données</div>
          </div>
        </div>

        <div class="services-section">
          <h3>Services disponibles (SSO activé)</h3>
          <p class="sso-info">🔐 Connexion automatique via Keycloak SSO</p>
          <div class="services-grid">
            <a class="service-card" href="http://localhost:8180/admin/e-guce-hub/console" target="_blank">
              <h4>🔐 Keycloak Admin</h4>
              <p>Gestion des utilisateurs</p>
              <span class="port">Port 8180</span>
            </a>
            <a class="service-card sso-enabled" href="http://localhost:3000" target="_blank">
              <h4>📈 Grafana</h4>
              <p>Monitoring et Dashboards</p>
              <span class="port">Port 3000</span>
              <span class="sso-badge">SSO</span>
            </a>
            <a class="service-card" href="http://localhost:9090" target="_blank">
              <h4>📊 Prometheus</h4>
              <p>Métriques</p>
              <span class="port">Port 9090</span>
            </a>
            <a class="service-card" href="http://localhost:9200" target="_blank">
              <h4>🔍 Elasticsearch</h4>
              <p>Recherche et Logs</p>
              <span class="port">Port 9200</span>
            </a>
            <a class="service-card sso-enabled" href="http://localhost:8083" target="_blank">
              <h4>📨 Kafka UI</h4>
              <p>Message Broker</p>
              <span class="port">Port 8083</span>
              <span class="sso-badge">SSO</span>
            </a>
            <a class="service-card sso-enabled" href="http://localhost:9001" target="_blank">
              <h4>💾 MinIO</h4>
              <p>Object Storage</p>
              <span class="port">Port 9001</span>
              <span class="sso-badge">SSO</span>
            </a>
            <a class="service-card" href="http://localhost:8081" target="_blank">
              <h4>⚙️ Camunda Operate</h4>
              <p>Workflow Engine</p>
              <span class="port">Port 8081</span>
            </a>
            <a class="service-card" href="http://localhost:8082" target="_blank">
              <h4>📋 Camunda Tasklist</h4>
              <p>Gestion des tâches</p>
              <span class="port">Port 8082</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard {
      font-family: Roboto, Arial, sans-serif;
      background: #f5f5f5;
      min-height: 100vh;
    }
    .app-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .header-left h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 500;
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .user-name {
      font-weight: 500;
      font-size: 0.95rem;
    }
    .user-roles {
      font-size: 0.75rem;
      opacity: 0.85;
    }
    .logout-btn {
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.3);
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .logout-btn:hover {
      background: rgba(255,255,255,0.25);
    }
    .main-content {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }
    .page-header {
      margin-bottom: 32px;
    }
    .page-header h2 {
      color: #333;
      font-size: 1.8rem;
      margin: 0 0 8px 0;
    }
    .page-description {
      color: #666;
      font-size: 1rem;
      margin: 0;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      text-align: center;
    }
    .stat-icon {
      font-size: 2rem;
      margin-bottom: 12px;
    }
    .stat-value {
      font-size: 2.5rem;
      font-weight: bold;
      color: #333;
    }
    .stat-label {
      color: #666;
      font-size: 0.9rem;
      margin-top: 4px;
    }
    .services-section h3 {
      color: #333;
      margin-bottom: 8px;
      font-size: 1.3rem;
    }
    .sso-info {
      color: #2e7d32;
      font-size: 0.9rem;
      margin-bottom: 20px;
    }
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }
    .service-card {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 20px;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s ease;
      display: block;
      position: relative;
    }
    .service-card.sso-enabled {
      border-left: 4px solid #4caf50;
    }
    .service-card:hover {
      border-color: #1976d2;
      box-shadow: 0 4px 12px rgba(25, 118, 210, 0.15);
      transform: translateY(-2px);
    }
    .service-card.sso-enabled:hover {
      border-left-color: #4caf50;
    }
    .service-card h4 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 1.1rem;
    }
    .service-card p {
      margin: 0 0 12px 0;
      color: #666;
      font-size: 0.9rem;
    }
    .port {
      display: inline-block;
      background: #e3f2fd;
      color: #1976d2;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.8rem;
      font-weight: 500;
    }
    .sso-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: #4caf50;
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: bold;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private keycloakService = inject(KeycloakService);
  
  username = '';
  roles: string[] = [];

  ngOnInit(): void {
    this.username = this.keycloakService.getUsername();
    this.roles = this.keycloakService.getUserRoles();
  }

  logout(): void {
    this.keycloakService.logout(window.location.origin);
  }
}
