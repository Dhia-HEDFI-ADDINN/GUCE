import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';

// BPMN.js imports - will be loaded dynamically
declare const BpmnJS: any;

interface WorkflowDefinition {
  id?: string;
  tenantId: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  processId: string;
  bpmnXml: string;
  targetModule: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface GeneratedCode {
  processId: string;
  packageName: string;
  files: { [key: string]: string };
}

@Component({
  selector: 'guce-workflow-designer',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <div class="workflow-designer">
      <!-- Header -->
      <div class="designer-header">
        <div class="header-left">
          <button mat-icon-button routerLink="/config/workflow-designer" matTooltip="Retour à la liste">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="workflow-info" *ngIf="workflow()">
            <h1>{{ workflow()?.displayName || 'Nouveau Workflow' }}</h1>
            <div class="workflow-meta">
              <mat-chip-listbox>
                <mat-chip [class]="'status-' + workflow()?.status?.toLowerCase()">
                  {{ getStatusLabel(workflow()?.status) }}
                </mat-chip>
                <mat-chip>v{{ workflow()?.version }}</mat-chip>
                <mat-chip>{{ getModuleLabel(workflow()?.targetModule) }}</mat-chip>
              </mat-chip-listbox>
            </div>
          </div>
        </div>

        <div class="header-actions">
          <button mat-stroked-button (click)="validateWorkflow()" [disabled]="saving()">
            <mat-icon>check_circle</mat-icon>
            Valider
          </button>
          <button mat-stroked-button (click)="previewCode()" [disabled]="saving()">
            <mat-icon>code</mat-icon>
            Prévisualiser Code
          </button>
          <button mat-flat-button color="primary" (click)="saveWorkflow()" [disabled]="saving()">
            <mat-icon>save</mat-icon>
            {{ saving() ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
          <button mat-flat-button color="accent" [matMenuTriggerFor]="deployMenu" [disabled]="workflow()?.status !== 'VALIDATED'">
            <mat-icon>rocket_launch</mat-icon>
            Déployer
          </button>
          <mat-menu #deployMenu="matMenu">
            <button mat-menu-item (click)="deployWorkflow('CM')">
              <mat-icon>flag</mat-icon>
              <span>Cameroun (CM)</span>
            </button>
            <button mat-menu-item (click)="deployWorkflow('SN')">
              <mat-icon>flag</mat-icon>
              <span>Sénégal (SN)</span>
            </button>
            <button mat-menu-item (click)="deployWorkflow('CI')">
              <mat-icon>flag</mat-icon>
              <span>Côte d'Ivoire (CI)</span>
            </button>
          </mat-menu>
        </div>
      </div>

      <!-- Progress bar -->
      <mat-progress-bar *ngIf="saving() || deploying()" mode="indeterminate"></mat-progress-bar>

      <!-- Main Content -->
      <div class="designer-content">
        <!-- BPMN Canvas -->
        <div class="canvas-container">
          <div class="canvas-toolbar">
            <button mat-icon-button matTooltip="Annuler" (click)="undo()">
              <mat-icon>undo</mat-icon>
            </button>
            <button mat-icon-button matTooltip="Refaire" (click)="redo()">
              <mat-icon>redo</mat-icon>
            </button>
            <mat-divider vertical></mat-divider>
            <button mat-icon-button matTooltip="Zoom +" (click)="zoomIn()">
              <mat-icon>zoom_in</mat-icon>
            </button>
            <button mat-icon-button matTooltip="Zoom -" (click)="zoomOut()">
              <mat-icon>zoom_out</mat-icon>
            </button>
            <button mat-icon-button matTooltip="Ajuster à l'écran" (click)="fitToViewport()">
              <mat-icon>fit_screen</mat-icon>
            </button>
            <mat-divider vertical></mat-divider>
            <button mat-icon-button matTooltip="Exporter BPMN" (click)="exportBpmn()">
              <mat-icon>download</mat-icon>
            </button>
            <button mat-icon-button matTooltip="Importer BPMN" (click)="importBpmn()">
              <mat-icon>upload</mat-icon>
            </button>
          </div>
          <div #bpmnCanvas class="bpmn-canvas"></div>
        </div>

        <!-- Side Panel -->
        <div class="side-panel">
          <mat-tab-group>
            <!-- Properties Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>settings</mat-icon>
                Propriétés
              </ng-template>
              <div class="panel-content">
                <form [formGroup]="propertiesForm" class="properties-form">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Nom technique</mat-label>
                    <input matInput formControlName="name" placeholder="procedure-import">
                    <mat-hint>Utilisé pour l'identifiant du processus</mat-hint>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Nom affiché</mat-label>
                    <input matInput formControlName="displayName" placeholder="Procédure d'import">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Description</mat-label>
                    <textarea matInput formControlName="description" rows="3"></textarea>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Module cible</mat-label>
                    <mat-select formControlName="targetModule">
                      <mat-option value="E_FORCE">e-Force (Déclarations)</mat-option>
                      <mat-option value="E_GOV">e-Gov (Administration)</mat-option>
                      <mat-option value="E_BUSINESS">e-Business (Entreprises)</mat-option>
                      <mat-option value="E_PAYMENT">e-Payment (Paiements)</mat-option>
                    </mat-select>
                  </mat-form-field>
                </form>

                <!-- Selected Element Properties -->
                <div class="element-properties" *ngIf="selectedElement()">
                  <mat-divider></mat-divider>
                  <h3>Élément sélectionné</h3>
                  <div class="element-info">
                    <p><strong>Type:</strong> {{ selectedElement()?.type }}</p>
                    <p><strong>ID:</strong> {{ selectedElement()?.id }}</p>
                  </div>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Nom</mat-label>
                    <input matInput [value]="selectedElement()?.name || ''" (input)="updateElementName($event)">
                  </mat-form-field>

                  <!-- Task Type for Service/User Tasks -->
                  <mat-form-field appearance="outline" class="full-width" *ngIf="isTaskElement()">
                    <mat-label>Type de tâche (Job Type)</mat-label>
                    <input matInput [value]="getTaskType()" (input)="updateTaskType($event)">
                    <mat-hint>Ex: validation-douane, calcul-taxes</mat-hint>
                  </mat-form-field>
                </div>
              </div>
            </mat-tab>

            <!-- Palette Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>widgets</mat-icon>
                Palette
              </ng-template>
              <div class="panel-content">
                <div class="palette-section">
                  <h3>Événements</h3>
                  <div class="palette-items">
                    <div class="palette-item" draggable="true" (dragstart)="onDragStart($event, 'bpmn:StartEvent')">
                      <div class="palette-icon start-event"></div>
                      <span>Début</span>
                    </div>
                    <div class="palette-item" draggable="true" (dragstart)="onDragStart($event, 'bpmn:EndEvent')">
                      <div class="palette-icon end-event"></div>
                      <span>Fin</span>
                    </div>
                    <div class="palette-item" draggable="true" (dragstart)="onDragStart($event, 'bpmn:IntermediateCatchEvent')">
                      <div class="palette-icon timer-event"></div>
                      <span>Timer</span>
                    </div>
                  </div>
                </div>

                <div class="palette-section">
                  <h3>Tâches</h3>
                  <div class="palette-items">
                    <div class="palette-item" draggable="true" (dragstart)="onDragStart($event, 'bpmn:UserTask')">
                      <div class="palette-icon user-task"></div>
                      <span>Tâche utilisateur</span>
                    </div>
                    <div class="palette-item" draggable="true" (dragstart)="onDragStart($event, 'bpmn:ServiceTask')">
                      <div class="palette-icon service-task"></div>
                      <span>Tâche service</span>
                    </div>
                    <div class="palette-item" draggable="true" (dragstart)="onDragStart($event, 'bpmn:ScriptTask')">
                      <div class="palette-icon script-task"></div>
                      <span>Script</span>
                    </div>
                  </div>
                </div>

                <div class="palette-section">
                  <h3>Passerelles</h3>
                  <div class="palette-items">
                    <div class="palette-item" draggable="true" (dragstart)="onDragStart($event, 'bpmn:ExclusiveGateway')">
                      <div class="palette-icon exclusive-gateway"></div>
                      <span>Exclusive (XOR)</span>
                    </div>
                    <div class="palette-item" draggable="true" (dragstart)="onDragStart($event, 'bpmn:ParallelGateway')">
                      <div class="palette-icon parallel-gateway"></div>
                      <span>Parallèle (AND)</span>
                    </div>
                    <div class="palette-item" draggable="true" (dragstart)="onDragStart($event, 'bpmn:InclusiveGateway')">
                      <div class="palette-icon inclusive-gateway"></div>
                      <span>Inclusive (OR)</span>
                    </div>
                  </div>
                </div>

                <div class="palette-section">
                  <h3>Sous-processus</h3>
                  <div class="palette-items">
                    <div class="palette-item" draggable="true" (dragstart)="onDragStart($event, 'bpmn:SubProcess')">
                      <div class="palette-icon subprocess"></div>
                      <span>Sous-processus</span>
                    </div>
                    <div class="palette-item" draggable="true" (dragstart)="onDragStart($event, 'bpmn:CallActivity')">
                      <div class="palette-icon call-activity"></div>
                      <span>Appel d'activité</span>
                    </div>
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- Validation Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>verified</mat-icon>
                Validation
              </ng-template>
              <div class="panel-content">
                <div class="validation-results" *ngIf="validationResult()">
                  <div class="validation-status" [class.valid]="validationResult()?.valid" [class.invalid]="!validationResult()?.valid">
                    <mat-icon>{{ validationResult()?.valid ? 'check_circle' : 'error' }}</mat-icon>
                    <span>{{ validationResult()?.valid ? 'Workflow valide' : 'Workflow invalide' }}</span>
                  </div>

                  <div class="validation-errors" *ngIf="validationResult()?.errors?.length">
                    <h4>Erreurs</h4>
                    <div class="error-item" *ngFor="let error of validationResult()?.errors">
                      <mat-icon color="warn">error</mat-icon>
                      <span>{{ error }}</span>
                    </div>
                  </div>

                  <div class="validation-warnings" *ngIf="validationResult()?.warnings?.length">
                    <h4>Avertissements</h4>
                    <div class="warning-item" *ngFor="let warning of validationResult()?.warnings">
                      <mat-icon color="accent">warning</mat-icon>
                      <span>{{ warning }}</span>
                    </div>
                  </div>
                </div>

                <div class="no-validation" *ngIf="!validationResult()">
                  <mat-icon>info</mat-icon>
                  <p>Cliquez sur "Valider" pour vérifier le workflow</p>
                </div>
              </div>
            </mat-tab>

            <!-- Code Preview Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>code</mat-icon>
                Code
              </ng-template>
              <div class="panel-content code-panel">
                <div class="code-files" *ngIf="generatedCode()">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Fichier</mat-label>
                    <mat-select [(value)]="selectedCodeFile">
                      <mat-option *ngFor="let file of getCodeFiles()" [value]="file">
                        {{ file }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>

                  <pre class="code-preview"><code>{{ getFileContent() }}</code></pre>
                </div>

                <div class="no-code" *ngIf="!generatedCode()">
                  <mat-icon>code_off</mat-icon>
                  <p>Cliquez sur "Prévisualiser Code" pour voir le code généré</p>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </div>
      </div>
    </div>

    <!-- Hidden file input for import -->
    <input type="file" #fileInput accept=".bpmn,.xml" style="display: none" (change)="onFileSelected($event)">
  `,
  styles: [`
    .workflow-designer {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: #f5f5f5;
    }

    .designer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 24px;
      background: white;
      border-bottom: 1px solid #e0e0e0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .workflow-info h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }

    .workflow-meta {
      margin-top: 4px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .designer-content {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 0;
      overflow: hidden;
    }

    .canvas-container {
      display: flex;
      flex-direction: column;
      background: white;
      border-right: 1px solid #e0e0e0;
    }

    .canvas-toolbar {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 16px;
      background: #fafafa;
      border-bottom: 1px solid #e0e0e0;
    }

    .canvas-toolbar mat-divider {
      height: 24px;
      margin: 0 8px;
    }

    .bpmn-canvas {
      flex: 1;
      min-height: 500px;
    }

    .side-panel {
      background: white;
      overflow: auto;
    }

    .panel-content {
      padding: 16px;
    }

    .properties-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .full-width {
      width: 100%;
    }

    .element-properties {
      margin-top: 16px;
    }

    .element-properties h3 {
      margin: 16px 0 12px;
      font-size: 14px;
      font-weight: 500;
    }

    .element-info {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 12px;
    }

    .element-info p {
      margin: 4px 0;
      font-size: 13px;
    }

    .palette-section {
      margin-bottom: 24px;
    }

    .palette-section h3 {
      margin: 0 0 12px;
      font-size: 13px;
      font-weight: 500;
      color: #666;
      text-transform: uppercase;
    }

    .palette-items {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .palette-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #fafafa;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      cursor: grab;
      transition: all 0.2s ease;
    }

    .palette-item:hover {
      background: #e3f2fd;
      border-color: #1976d2;
    }

    .palette-item span {
      font-size: 11px;
      text-align: center;
      color: #666;
    }

    .palette-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid #333;
    }

    .palette-icon.start-event { background: #4caf50; border-color: #2e7d32; }
    .palette-icon.end-event { background: #f44336; border-color: #c62828; }
    .palette-icon.timer-event { background: #ff9800; border-color: #ef6c00; }
    .palette-icon.user-task { background: #2196f3; border-color: #1565c0; border-radius: 8px; }
    .palette-icon.service-task { background: #9c27b0; border-color: #6a1b9a; border-radius: 8px; }
    .palette-icon.script-task { background: #607d8b; border-color: #37474f; border-radius: 8px; }
    .palette-icon.exclusive-gateway { background: #ffc107; border-color: #f57c00; transform: rotate(45deg); border-radius: 4px; }
    .palette-icon.parallel-gateway { background: #00bcd4; border-color: #00838f; transform: rotate(45deg); border-radius: 4px; }
    .palette-icon.inclusive-gateway { background: #8bc34a; border-color: #558b2f; transform: rotate(45deg); border-radius: 4px; }
    .palette-icon.subprocess { background: white; border: 2px dashed #666; border-radius: 8px; }
    .palette-icon.call-activity { background: #e1bee7; border-color: #7b1fa2; border-radius: 8px; }

    .validation-status {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .validation-status.valid {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .validation-status.invalid {
      background: #ffebee;
      color: #c62828;
    }

    .validation-errors, .validation-warnings {
      margin-bottom: 16px;
    }

    .validation-errors h4, .validation-warnings h4 {
      margin: 0 0 8px;
      font-size: 14px;
    }

    .error-item, .warning-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 8px;
      background: #fafafa;
      border-radius: 4px;
      margin-bottom: 4px;
      font-size: 13px;
    }

    .no-validation, .no-code {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
      color: #666;
    }

    .no-validation mat-icon, .no-code mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .code-panel {
      height: calc(100vh - 200px);
      display: flex;
      flex-direction: column;
    }

    .code-preview {
      flex: 1;
      background: #263238;
      color: #aed581;
      padding: 16px;
      border-radius: 8px;
      overflow: auto;
      font-family: 'Fira Code', 'Consolas', monospace;
      font-size: 12px;
      line-height: 1.5;
      margin: 0;
    }

    .status-draft { background: #e3f2fd !important; color: #1565c0 !important; }
    .status-validated { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .status-deployed { background: #f3e5f5 !important; color: #7b1fa2 !important; }

    :host ::ng-deep .bjs-powered-by { display: none !important; }
  `]
})
export class WorkflowDesignerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('bpmnCanvas') bpmnCanvas!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  private bpmnModeler: any;
  private destroy$ = new Subject<void>();

  workflow = signal<WorkflowDefinition | null>(null);
  saving = signal(false);
  deploying = signal(false);
  selectedElement = signal<any>(null);
  validationResult = signal<ValidationResult | null>(null);
  generatedCode = signal<GeneratedCode | null>(null);
  selectedCodeFile = '';

  propertiesForm: FormGroup;

  private apiUrl = '/api/v1/workflow-designer';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.propertiesForm = this.fb.group({
      name: ['', Validators.required],
      displayName: ['', Validators.required],
      description: [''],
      targetModule: ['E_FORCE', Validators.required]
    });
  }

  ngOnInit(): void {
    const workflowId = this.route.snapshot.paramMap.get('id');
    if (workflowId && workflowId !== 'create') {
      this.loadWorkflow(workflowId);
    }
  }

  async ngAfterViewInit(): Promise<void> {
    await this.initBpmnModeler();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.bpmnModeler) {
      this.bpmnModeler.destroy();
    }
  }

  private async initBpmnModeler(): Promise<void> {
    // Load bpmn-js dynamically
    const BpmnModeler = (window as any).BpmnJS?.default || (window as any).BpmnModeler;

    if (!BpmnModeler) {
      console.warn('BPMN.js not loaded - using placeholder');
      return;
    }

    this.bpmnModeler = new BpmnModeler({
      container: this.bpmnCanvas.nativeElement,
      keyboard: { bindTo: window },
      propertiesPanel: { parent: '#properties-panel' }
    });

    // Listen to selection changes
    this.bpmnModeler.on('selection.changed', (e: any) => {
      const selection = e.newSelection;
      if (selection.length === 1) {
        this.selectedElement.set({
          id: selection[0].id,
          type: selection[0].type,
          name: selection[0].businessObject?.name || ''
        });
      } else {
        this.selectedElement.set(null);
      }
    });

    // Create empty diagram if no workflow loaded
    if (!this.workflow()) {
      await this.createEmptyDiagram();
    }
  }

  private async createEmptyDiagram(): Promise<void> {
    const emptyBpmn = `<?xml version="1.0" encoding="UTF-8"?>
      <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                        xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                        xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                        id="Definitions_1"
                        targetNamespace="http://bpmn.io/schema/bpmn">
        <bpmn:process id="Process_1" isExecutable="true">
          <bpmn:startEvent id="StartEvent_1"/>
        </bpmn:process>
        <bpmndi:BPMNDiagram id="BPMNDiagram_1">
          <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
            <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
              <dc:Bounds x="180" y="160" width="36" height="36"/>
            </bpmndi:BPMNShape>
          </bpmndi:BPMNPlane>
        </bpmndi:BPMNDiagram>
      </bpmn:definitions>`;

    if (this.bpmnModeler) {
      await this.bpmnModeler.importXML(emptyBpmn);
    }
  }

  private loadWorkflow(id: string): void {
    this.http.get<WorkflowDefinition>(`${this.apiUrl}/workflows/${id}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (workflow) => {
          this.workflow.set(workflow);
          this.propertiesForm.patchValue({
            name: workflow.name,
            displayName: workflow.displayName,
            description: workflow.description,
            targetModule: workflow.targetModule
          });

          if (this.bpmnModeler && workflow.bpmnXml) {
            await this.bpmnModeler.importXML(workflow.bpmnXml);
          }
        },
        error: (err) => {
          this.snackBar.open('Erreur lors du chargement du workflow', 'Fermer', { duration: 3000 });
        }
      });
  }

  async saveWorkflow(): Promise<void> {
    if (this.propertiesForm.invalid) {
      this.snackBar.open('Veuillez remplir tous les champs obligatoires', 'Fermer', { duration: 3000 });
      return;
    }

    this.saving.set(true);

    try {
      const { xml } = await this.bpmnModeler?.saveXML({ format: true }) || { xml: '' };

      const workflowData = {
        ...this.propertiesForm.value,
        bpmnXml: xml,
        tenantId: 'current-tenant-id' // Get from auth service
      };

      const workflowId = this.workflow()?.id;

      const request$ = workflowId
        ? this.http.put<WorkflowDefinition>(`${this.apiUrl}/workflows/${workflowId}`, workflowData)
        : this.http.post<WorkflowDefinition>(`${this.apiUrl}/workflows`, workflowData);

      request$.pipe(takeUntil(this.destroy$)).subscribe({
        next: (saved) => {
          this.workflow.set(saved);
          this.snackBar.open('Workflow enregistré avec succès', 'Fermer', { duration: 3000 });

          if (!workflowId) {
            this.router.navigate(['/config/workflow-designer', saved.id, 'edit']);
          }
        },
        error: (err) => {
          this.snackBar.open('Erreur lors de l\'enregistrement', 'Fermer', { duration: 3000 });
        }
      });
    } catch (e) {
      this.snackBar.open('Erreur lors de l\'export BPMN', 'Fermer', { duration: 3000 });
    } finally {
      this.saving.set(false);
    }
  }

  validateWorkflow(): void {
    const workflowId = this.workflow()?.id;
    if (!workflowId) {
      this.snackBar.open('Veuillez d\'abord enregistrer le workflow', 'Fermer', { duration: 3000 });
      return;
    }

    this.http.post<ValidationResult>(`${this.apiUrl}/workflows/${workflowId}/validate`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.validationResult.set(result);
          if (result.valid) {
            this.workflow.update(w => w ? { ...w, status: 'VALIDATED' } : null);
            this.snackBar.open('Workflow validé avec succès', 'Fermer', { duration: 3000 });
          }
        },
        error: () => {
          this.snackBar.open('Erreur lors de la validation', 'Fermer', { duration: 3000 });
        }
      });
  }

  previewCode(): void {
    const workflowId = this.workflow()?.id;
    if (!workflowId) return;

    this.http.post<{ [key: string]: string }>(`${this.apiUrl}/workflows/${workflowId}/preview-code`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (files) => {
          this.generatedCode.set({
            processId: this.workflow()?.processId || '',
            packageName: '',
            files
          });
          this.selectedCodeFile = Object.keys(files)[0] || '';
        },
        error: () => {
          this.snackBar.open('Erreur lors de la génération du code', 'Fermer', { duration: 3000 });
        }
      });
  }

  deployWorkflow(countryCode: string): void {
    const workflowId = this.workflow()?.id;
    if (!workflowId) return;

    this.deploying.set(true);

    this.http.post<any>(`${this.apiUrl}/workflows/${workflowId}/deploy`, { targetCountryCode: countryCode })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open(`Déploiement lancé pour ${countryCode}`, 'Fermer', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Erreur lors du déploiement', 'Fermer', { duration: 3000 });
        },
        complete: () => {
          this.deploying.set(false);
        }
      });
  }

  // Canvas controls
  undo(): void { this.bpmnModeler?.get('commandStack')?.undo(); }
  redo(): void { this.bpmnModeler?.get('commandStack')?.redo(); }
  zoomIn(): void { this.bpmnModeler?.get('zoomScroll')?.stepZoom(1); }
  zoomOut(): void { this.bpmnModeler?.get('zoomScroll')?.stepZoom(-1); }
  fitToViewport(): void { this.bpmnModeler?.get('canvas')?.zoom('fit-viewport'); }

  async exportBpmn(): Promise<void> {
    const { xml } = await this.bpmnModeler?.saveXML({ format: true }) || { xml: '' };
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.workflow()?.name || 'workflow'}.bpmn`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importBpmn(): void {
    this.fileInput.nativeElement.click();
  }

  async onFileSelected(event: any): Promise<void> {
    const file = event.target.files[0];
    if (file) {
      const xml = await file.text();
      await this.bpmnModeler?.importXML(xml);
      this.snackBar.open('BPMN importé avec succès', 'Fermer', { duration: 3000 });
    }
  }

  // Palette drag & drop
  onDragStart(event: DragEvent, elementType: string): void {
    event.dataTransfer?.setData('elementType', elementType);
  }

  // Element properties
  updateElementName(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const element = this.selectedElement();
    if (element && this.bpmnModeler) {
      const modeling = this.bpmnModeler.get('modeling');
      const elementRegistry = this.bpmnModeler.get('elementRegistry');
      const shape = elementRegistry.get(element.id);
      if (shape) {
        modeling.updateProperties(shape, { name: value });
      }
    }
  }

  isTaskElement(): boolean {
    const type = this.selectedElement()?.type;
    return type?.includes('Task') || false;
  }

  getTaskType(): string {
    const element = this.selectedElement();
    if (!element || !this.bpmnModeler) return '';
    const elementRegistry = this.bpmnModeler.get('elementRegistry');
    const shape = elementRegistry.get(element.id);
    return shape?.businessObject?.$attrs?.['zeebe:taskType'] || '';
  }

  updateTaskType(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const element = this.selectedElement();
    if (element && this.bpmnModeler) {
      const modeling = this.bpmnModeler.get('modeling');
      const elementRegistry = this.bpmnModeler.get('elementRegistry');
      const shape = elementRegistry.get(element.id);
      if (shape) {
        modeling.updateProperties(shape, { 'zeebe:taskType': value });
      }
    }
  }

  // Helper methods
  getStatusLabel(status?: string): string {
    const labels: { [key: string]: string } = {
      DRAFT: 'Brouillon',
      VALIDATED: 'Validé',
      GENERATED: 'Généré',
      DEPLOYED: 'Déployé',
      ARCHIVED: 'Archivé'
    };
    return labels[status || ''] || status || '';
  }

  getModuleLabel(module?: string): string {
    const labels: { [key: string]: string } = {
      E_FORCE: 'e-Force',
      E_GOV: 'e-Gov',
      E_BUSINESS: 'e-Business',
      E_PAYMENT: 'e-Payment'
    };
    return labels[module || ''] || module || '';
  }

  getCodeFiles(): string[] {
    return Object.keys(this.generatedCode()?.files || {});
  }

  getFileContent(): string {
    return this.generatedCode()?.files?.[this.selectedCodeFile] || '';
  }
}
