import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FimexService } from '../../../core/services/fimex.service';
import {
  TypeInscriptionFIMEX,
  FormeJuridique,
  Civilite,
  TypeDocument,
  PieceJointe,
  getDocumentsRequis,
  getFraisInscription,
  getTypeInscriptionLabel,
  getTypeDocumentLabel,
  RegionCameroun,
  SecteurActivite,
  CentreImpots
} from '../../../core/models/fimex.model';

/**
 * Formulaire d'inscription FIMEX - Wizard multi-étapes
 *
 * Étapes:
 * 1. Type d'inscription (Import/Export/Import-Export)
 * 2. Informations Entreprise
 * 3. Représentant Légal
 * 4. Documents Justificatifs
 * 5. Révision et Paiement
 */
@Component({
  selector: 'guce-fimex-inscription-form',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatStepperModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatButtonModule,
    MatIconModule, MatCheckboxModule, MatRadioModule, MatDividerModule,
    MatChipsModule, MatSnackBarModule, MatProgressBarModule, MatProgressSpinnerModule,
    MatTooltipModule, MatAutocompleteModule
  ],
  template: `
    <div class="inscription-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <button mat-icon-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h1>Nouvelle inscription FIMEX</h1>
            <p>Fichier des Importateurs et Exportateurs - MINCOMMERCE</p>
          </div>
        </div>
        <div class="header-actions">
          <button mat-stroked-button (click)="saveDraft()" [disabled]="saving">
            <mat-icon>save</mat-icon>
            Enregistrer brouillon
          </button>
        </div>
      </div>

      <!-- Progress Bar -->
      <mat-progress-bar mode="determinate" [value]="progressPercent" class="form-progress"></mat-progress-bar>

      <!-- Stepper -->
      <mat-stepper [linear]="true" #stepper (selectionChange)="onStepChange($event)">

        <!-- STEP 1: Type d'inscription -->
        <mat-step [stepControl]="typeForm" label="Type d'inscription">
          <mat-card class="step-card">
            <mat-card-header>
              <mat-card-title>Choisissez votre type d'inscription</mat-card-title>
              <mat-card-subtitle>Sélectionnez le type d'opérations commerciales que vous souhaitez effectuer</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <form [formGroup]="typeForm">
                <div class="type-options">
                  <div class="type-option" *ngFor="let type of typeOptions"
                       [class.selected]="typeForm.get('typeInscription')?.value === type.value"
                       (click)="selectType(type.value)">
                    <mat-icon>{{ type.icon }}</mat-icon>
                    <div class="type-info">
                      <h3>{{ type.label }}</h3>
                      <p>{{ type.description }}</p>
                      <span class="price">{{ type.price | number }} FCFA</span>
                    </div>
                    <mat-icon class="check-icon" *ngIf="typeForm.get('typeInscription')?.value === type.value">
                      check_circle
                    </mat-icon>
                  </div>
                </div>

                <div class="documents-required" *ngIf="typeForm.get('typeInscription')?.value">
                  <h4>Documents requis pour cette inscription:</h4>
                  <ul>
                    <li *ngFor="let doc of documentsRequis">
                      <mat-icon>description</mat-icon>
                      {{ getDocumentLabel(doc) }}
                    </li>
                  </ul>
                </div>
              </form>
            </mat-card-content>

            <mat-card-actions align="end">
              <button mat-flat-button color="primary" matStepperNext
                      [disabled]="typeForm.invalid">
                Suivant <mat-icon>arrow_forward</mat-icon>
              </button>
            </mat-card-actions>
          </mat-card>
        </mat-step>

        <!-- STEP 2: Informations Entreprise -->
        <mat-step [stepControl]="entrepriseForm" label="Entreprise">
          <mat-card class="step-card">
            <mat-card-header>
              <mat-card-title>Informations de l'entreprise</mat-card-title>
              <mat-card-subtitle>Renseignez les informations légales de votre entreprise</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <form [formGroup]="entrepriseForm">
                <!-- Identification -->
                <h3 class="section-title">Identification</h3>
                <div class="form-grid">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Raison sociale</mat-label>
                    <input matInput formControlName="raisonSociale" placeholder="Ex: SARL IMPORT TRADING">
                    <mat-error *ngIf="entrepriseForm.get('raisonSociale')?.hasError('required')">
                      Raison sociale obligatoire
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Forme juridique</mat-label>
                    <mat-select formControlName="formeJuridique">
                      <mat-option *ngFor="let forme of formesJuridiques" [value]="forme.value">
                        {{ forme.label }}
                      </mat-option>
                    </mat-select>
                    <mat-error *ngIf="entrepriseForm.get('formeJuridique')?.hasError('required')">
                      Forme juridique obligatoire
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>NINEA (N° Identification Nationale)</mat-label>
                    <input matInput formControlName="ninea" placeholder="M123456789012">
                    <mat-hint>Format: M suivi de 13 chiffres</mat-hint>
                    <mat-error *ngIf="entrepriseForm.get('ninea')?.hasError('required')">
                      NINEA obligatoire
                    </mat-error>
                    <mat-error *ngIf="entrepriseForm.get('ninea')?.hasError('pattern')">
                      Format NINEA invalide
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Numéro Registre Commerce</mat-label>
                    <input matInput formControlName="numeroRegistreCommerce" placeholder="RC/DLA/2020/B/1234">
                    <mat-error *ngIf="entrepriseForm.get('numeroRegistreCommerce')?.hasError('required')">
                      N° RC obligatoire
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Capital social (FCFA)</mat-label>
                    <input matInput type="number" formControlName="capitalSocial" placeholder="1000000">
                    <mat-error *ngIf="entrepriseForm.get('capitalSocial')?.hasError('required')">
                      Capital social obligatoire
                    </mat-error>
                    <mat-error *ngIf="entrepriseForm.get('capitalSocial')?.hasError('min')">
                      Capital minimum: 100 000 FCFA
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Date de création</mat-label>
                    <input matInput [matDatepicker]="pickerCreation" formControlName="dateCreation">
                    <mat-datepicker-toggle matIconSuffix [for]="pickerCreation"></mat-datepicker-toggle>
                    <mat-datepicker #pickerCreation></mat-datepicker>
                    <mat-error *ngIf="entrepriseForm.get('dateCreation')?.hasError('required')">
                      Date de création obligatoire
                    </mat-error>
                  </mat-form-field>
                </div>

                <mat-divider></mat-divider>

                <!-- Activités -->
                <h3 class="section-title">Activités</h3>
                <div class="form-grid">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Secteurs d'activité</mat-label>
                    <mat-select formControlName="secteurActivite" multiple>
                      <mat-option *ngFor="let secteur of secteursActivite" [value]="secteur.code">
                        {{ secteur.libelle }}
                      </mat-option>
                    </mat-select>
                    <mat-error *ngIf="entrepriseForm.get('secteurActivite')?.hasError('required')">
                      Au moins un secteur d'activité
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Activités principales</mat-label>
                    <textarea matInput formControlName="activitesPrincipales" rows="2"
                              placeholder="Décrivez vos activités principales"></textarea>
                    <mat-hint>Séparez les activités par des virgules</mat-hint>
                    <mat-error *ngIf="entrepriseForm.get('activitesPrincipales')?.hasError('required')">
                      Activités principales obligatoires
                    </mat-error>
                  </mat-form-field>
                </div>

                <mat-divider></mat-divider>

                <!-- Adresse Siège -->
                <h3 class="section-title">Adresse du siège social</h3>
                <div class="form-grid" formGroupName="siege">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Adresse complète</mat-label>
                    <textarea matInput formControlName="adresseComplete" rows="2"
                              placeholder="Numéro, rue, quartier..."></textarea>
                    <mat-error *ngIf="entrepriseForm.get('siege.adresseComplete')?.hasError('required')">
                      Adresse obligatoire
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Ville</mat-label>
                    <input matInput formControlName="ville" placeholder="Douala">
                    <mat-error *ngIf="entrepriseForm.get('siege.ville')?.hasError('required')">
                      Ville obligatoire
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Région</mat-label>
                    <mat-select formControlName="region">
                      <mat-option *ngFor="let region of regions" [value]="region.code">
                        {{ region.nom }}
                      </mat-option>
                    </mat-select>
                    <mat-error *ngIf="entrepriseForm.get('siege.region')?.hasError('required')">
                      Région obligatoire
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Boîte postale</mat-label>
                    <input matInput formControlName="boitePostale" placeholder="BP 1234">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Téléphone</mat-label>
                    <input matInput formControlName="telephone" placeholder="+237 6XX XXX XXX">
                    <mat-error *ngIf="entrepriseForm.get('siege.telephone')?.hasError('required')">
                      Téléphone obligatoire
                    </mat-error>
                    <mat-error *ngIf="entrepriseForm.get('siege.telephone')?.hasError('pattern')">
                      Format: +237 6/2 XX XXX XXX
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Email</mat-label>
                    <input matInput type="email" formControlName="email" placeholder="contact@entreprise.cm">
                    <mat-error *ngIf="entrepriseForm.get('siege.email')?.hasError('required')">
                      Email obligatoire
                    </mat-error>
                    <mat-error *ngIf="entrepriseForm.get('siege.email')?.hasError('email')">
                      Email invalide
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Site web</mat-label>
                    <input matInput formControlName="siteWeb" placeholder="https://www.entreprise.cm">
                  </mat-form-field>
                </div>

                <mat-divider></mat-divider>

                <!-- Fiscalité -->
                <h3 class="section-title">Informations fiscales</h3>
                <div class="form-grid" formGroupName="fiscalite">
                  <mat-form-field appearance="outline">
                    <mat-label>N° Carte contribuable</mat-label>
                    <input matInput formControlName="numeroCarteContribuable" placeholder="P123456789C">
                    <mat-error *ngIf="entrepriseForm.get('fiscalite.numeroCarteContribuable')?.hasError('required')">
                      N° carte contribuable obligatoire
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Centre des impôts</mat-label>
                    <mat-select formControlName="centreImpots">
                      <mat-option *ngFor="let centre of centresImpots" [value]="centre.code">
                        {{ centre.nom }}
                      </mat-option>
                    </mat-select>
                    <mat-error *ngIf="entrepriseForm.get('fiscalite.centreImpots')?.hasError('required')">
                      Centre des impôts obligatoire
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Date validité attestation fiscale</mat-label>
                    <input matInput [matDatepicker]="pickerAttestation" formControlName="dateValiditeAttestation">
                    <mat-datepicker-toggle matIconSuffix [for]="pickerAttestation"></mat-datepicker-toggle>
                    <mat-datepicker #pickerAttestation></mat-datepicker>
                    <mat-error *ngIf="entrepriseForm.get('fiscalite.dateValiditeAttestation')?.hasError('required')">
                      Date de validité obligatoire
                    </mat-error>
                  </mat-form-field>
                </div>
              </form>
            </mat-card-content>

            <mat-card-actions align="end">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon> Précédent
              </button>
              <button mat-flat-button color="primary" matStepperNext
                      [disabled]="entrepriseForm.invalid">
                Suivant <mat-icon>arrow_forward</mat-icon>
              </button>
            </mat-card-actions>
          </mat-card>
        </mat-step>

        <!-- STEP 3: Représentant Légal -->
        <mat-step [stepControl]="representantForm" label="Représentant légal">
          <mat-card class="step-card">
            <mat-card-header>
              <mat-card-title>Représentant légal</mat-card-title>
              <mat-card-subtitle>Informations sur le dirigeant principal de l'entreprise</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <form [formGroup]="representantForm">
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Civilité</mat-label>
                    <mat-select formControlName="civilite">
                      <mat-option value="M">Monsieur</mat-option>
                      <mat-option value="Mme">Madame</mat-option>
                      <mat-option value="Mlle">Mademoiselle</mat-option>
                    </mat-select>
                    <mat-error *ngIf="representantForm.get('civilite')?.hasError('required')">
                      Civilité obligatoire
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Nom</mat-label>
                    <input matInput formControlName="nom" placeholder="NGUEMA">
                    <mat-error *ngIf="representantForm.get('nom')?.hasError('required')">
                      Nom obligatoire
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Prénom(s)</mat-label>
                    <input matInput formControlName="prenom" placeholder="Pierre Marie">
                    <mat-error *ngIf="representantForm.get('prenom')?.hasError('required')">
                      Prénom obligatoire
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Fonction</mat-label>
                    <input matInput formControlName="fonction" placeholder="Directeur Général">
                    <mat-error *ngIf="representantForm.get('fonction')?.hasError('required')">
                      Fonction obligatoire
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Nationalité</mat-label>
                    <input matInput formControlName="nationalite" placeholder="Camerounaise">
                    <mat-error *ngIf="representantForm.get('nationalite')?.hasError('required')">
                      Nationalité obligatoire
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>N° Carte Nationale d'Identité</mat-label>
                    <input matInput formControlName="numeroCNI" placeholder="123456789">
                    <mat-error *ngIf="representantForm.get('numeroCNI')?.hasError('required')">
                      N° CNI obligatoire
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Date de naissance</mat-label>
                    <input matInput [matDatepicker]="pickerNaissance" formControlName="dateNaissance">
                    <mat-datepicker-toggle matIconSuffix [for]="pickerNaissance"></mat-datepicker-toggle>
                    <mat-datepicker #pickerNaissance></mat-datepicker>
                    <mat-error *ngIf="representantForm.get('dateNaissance')?.hasError('required')">
                      Date de naissance obligatoire
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Lieu de naissance</mat-label>
                    <input matInput formControlName="lieuNaissance" placeholder="Douala">
                    <mat-error *ngIf="representantForm.get('lieuNaissance')?.hasError('required')">
                      Lieu de naissance obligatoire
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Téléphone</mat-label>
                    <input matInput formControlName="telephone" placeholder="+237 6XX XXX XXX">
                    <mat-error *ngIf="representantForm.get('telephone')?.hasError('required')">
                      Téléphone obligatoire
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Email</mat-label>
                    <input matInput type="email" formControlName="email" placeholder="representant@email.cm">
                    <mat-error *ngIf="representantForm.get('email')?.hasError('required')">
                      Email obligatoire
                    </mat-error>
                    <mat-error *ngIf="representantForm.get('email')?.hasError('email')">
                      Email invalide
                    </mat-error>
                  </mat-form-field>
                </div>
              </form>
            </mat-card-content>

            <mat-card-actions align="end">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon> Précédent
              </button>
              <button mat-flat-button color="primary" matStepperNext
                      [disabled]="representantForm.invalid">
                Suivant <mat-icon>arrow_forward</mat-icon>
              </button>
            </mat-card-actions>
          </mat-card>
        </mat-step>

        <!-- STEP 4: Documents -->
        <mat-step [stepControl]="documentsForm" label="Documents">
          <mat-card class="step-card">
            <mat-card-header>
              <mat-card-title>Documents justificatifs</mat-card-title>
              <mat-card-subtitle>Téléchargez les documents requis pour votre inscription</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <form [formGroup]="documentsForm">
                <div class="documents-upload">
                  <div class="document-upload-item" *ngFor="let doc of documentsRequis">
                    <div class="doc-info">
                      <mat-icon>{{ getUploadedDocument(doc) ? 'check_circle' : 'description' }}</mat-icon>
                      <div class="doc-details">
                        <span class="doc-label">{{ getDocumentLabel(doc) }}</span>
                        <span class="doc-status" *ngIf="getUploadedDocument(doc)">
                          {{ getUploadedDocument(doc)!.nom }}
                        </span>
                        <span class="doc-required">Obligatoire</span>
                      </div>
                    </div>
                    <div class="doc-actions">
                      <input type="file" #fileInput [id]="'file-' + doc"
                             accept=".pdf,.jpg,.jpeg,.png"
                             (change)="onFileSelected($event, doc)" hidden>
                      <button mat-stroked-button (click)="fileInput.click()"
                              *ngIf="!getUploadedDocument(doc)">
                        <mat-icon>upload</mat-icon>
                        Télécharger
                      </button>
                      <button mat-icon-button color="warn" (click)="removeDocument(doc)"
                              *ngIf="getUploadedDocument(doc)"
                              matTooltip="Supprimer">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="upload-info">
                  <mat-icon>info</mat-icon>
                  <span>Formats acceptés: PDF, JPEG, PNG. Taille maximale: 5 Mo par fichier.</span>
                </div>

                <!-- Upload Progress -->
                <mat-progress-bar mode="determinate" [value]="uploadProgress"
                                  *ngIf="uploading" class="upload-progress"></mat-progress-bar>
              </form>
            </mat-card-content>

            <mat-card-actions align="end">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon> Précédent
              </button>
              <button mat-flat-button color="primary" matStepperNext
                      [disabled]="!allDocumentsUploaded">
                Suivant <mat-icon>arrow_forward</mat-icon>
              </button>
            </mat-card-actions>
          </mat-card>
        </mat-step>

        <!-- STEP 5: Révision et Soumission -->
        <mat-step label="Révision">
          <mat-card class="step-card">
            <mat-card-header>
              <mat-card-title>Révision et soumission</mat-card-title>
              <mat-card-subtitle>Vérifiez vos informations avant de soumettre votre inscription</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <!-- Summary Sections -->
              <div class="summary-section">
                <div class="summary-header">
                  <h3>Type d'inscription</h3>
                  <button mat-icon-button (click)="goToStep(0)"><mat-icon>edit</mat-icon></button>
                </div>
                <div class="summary-content">
                  <p><strong>{{ getTypeLabel() }}</strong></p>
                </div>
              </div>

              <mat-divider></mat-divider>

              <div class="summary-section">
                <div class="summary-header">
                  <h3>Informations entreprise</h3>
                  <button mat-icon-button (click)="goToStep(1)"><mat-icon>edit</mat-icon></button>
                </div>
                <div class="summary-content summary-grid">
                  <div class="summary-item">
                    <span class="label">Raison sociale</span>
                    <span class="value">{{ entrepriseForm.get('raisonSociale')?.value }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">NINEA</span>
                    <span class="value">{{ entrepriseForm.get('ninea')?.value }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Registre commerce</span>
                    <span class="value">{{ entrepriseForm.get('numeroRegistreCommerce')?.value }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Téléphone</span>
                    <span class="value">{{ entrepriseForm.get('siege.telephone')?.value }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Email</span>
                    <span class="value">{{ entrepriseForm.get('siege.email')?.value }}</span>
                  </div>
                </div>
              </div>

              <mat-divider></mat-divider>

              <div class="summary-section">
                <div class="summary-header">
                  <h3>Représentant légal</h3>
                  <button mat-icon-button (click)="goToStep(2)"><mat-icon>edit</mat-icon></button>
                </div>
                <div class="summary-content">
                  <p>
                    <strong>
                      {{ representantForm.get('civilite')?.value }}
                      {{ representantForm.get('prenom')?.value }}
                      {{ representantForm.get('nom')?.value }}
                    </strong>
                    - {{ representantForm.get('fonction')?.value }}
                  </p>
                </div>
              </div>

              <mat-divider></mat-divider>

              <div class="summary-section">
                <div class="summary-header">
                  <h3>Documents ({{ uploadedDocuments.length }}/{{ documentsRequis.length }})</h3>
                  <button mat-icon-button (click)="goToStep(3)"><mat-icon>edit</mat-icon></button>
                </div>
                <div class="summary-content">
                  <mat-chip-listbox>
                    <mat-chip *ngFor="let doc of uploadedDocuments" color="primary" highlighted>
                      <mat-icon>check</mat-icon>
                      {{ getDocumentLabel(doc.type) }}
                    </mat-chip>
                  </mat-chip-listbox>
                </div>
              </div>

              <mat-divider></mat-divider>

              <!-- Frais -->
              <div class="fees-section">
                <h3>Frais d'inscription</h3>
                <div class="fees-table">
                  <div class="fee-row">
                    <span>Frais d'inscription FIMEX {{ getTypeLabel() }}</span>
                    <span class="amount">{{ fraisInscription | number }} FCFA</span>
                  </div>
                  <div class="fee-row total">
                    <span>Total à payer</span>
                    <span class="amount">{{ fraisInscription | number }} FCFA</span>
                  </div>
                </div>
              </div>

              <!-- Terms -->
              <div class="terms-section">
                <mat-checkbox [(ngModel)]="acceptTerms" [ngModelOptions]="{standalone: true}">
                  J'atteste sur l'honneur que les informations fournies sont exactes et je m'engage à respecter
                  les réglementations du commerce extérieur du Cameroun.
                </mat-checkbox>
              </div>
            </mat-card-content>

            <mat-card-actions align="end">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon> Précédent
              </button>
              <button mat-flat-button color="primary" (click)="submit()"
                      [disabled]="!canSubmit() || submitting">
                <mat-spinner diameter="20" *ngIf="submitting"></mat-spinner>
                <mat-icon *ngIf="!submitting">send</mat-icon>
                Soumettre et payer
              </button>
            </mat-card-actions>
          </mat-card>
        </mat-step>
      </mat-stepper>
    </div>
  `,
  styles: [`
    .inscription-container {
      padding: 24px;
      max-width: 900px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;

      .header-left {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }

      h1 {
        margin: 0;
        color: #008751;
        font-size: 24px;
      }

      p {
        margin: 4px 0 0;
        color: #666;
        font-size: 14px;
      }
    }

    .form-progress {
      margin-bottom: 24px;
      border-radius: 4px;
    }

    .step-card {
      margin-top: 16px;

      mat-card-header {
        margin-bottom: 16px;
      }
    }

    .section-title {
      color: #008751;
      font-size: 16px;
      font-weight: 500;
      margin: 24px 0 16px;

      &:first-child {
        margin-top: 0;
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;

      .full-width {
        grid-column: 1 / -1;
      }
    }

    /* Type Selection */
    .type-options {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .type-option {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          border-color: #008751;
          background: #f9fdf9;
        }

        &.selected {
          border-color: #008751;
          background: #E8F5E9;
        }

        > mat-icon {
          font-size: 40px;
          width: 40px;
          height: 40px;
          color: #008751;
        }

        .type-info {
          flex: 1;

          h3 {
            margin: 0 0 4px;
            color: #333;
          }

          p {
            margin: 0 0 8px;
            color: #666;
            font-size: 14px;
          }

          .price {
            font-weight: 600;
            color: #008751;
          }
        }

        .check-icon {
          color: #008751;
        }
      }
    }

    .documents-required {
      margin-top: 24px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;

      h4 {
        margin: 0 0 12px;
        color: #333;
      }

      ul {
        margin: 0;
        padding: 0;
        list-style: none;

        li {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          color: #666;

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
            color: #008751;
          }
        }
      }
    }

    /* Documents Upload */
    .documents-upload {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .document-upload-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;

        .doc-info {
          display: flex;
          align-items: center;
          gap: 12px;

          mat-icon {
            color: #666;

            &.check_circle {
              color: #2E7D32;
            }
          }

          .doc-details {
            display: flex;
            flex-direction: column;

            .doc-label {
              font-weight: 500;
            }

            .doc-status {
              font-size: 12px;
              color: #2E7D32;
            }

            .doc-required {
              font-size: 11px;
              color: #E65100;
            }
          }
        }
      }
    }

    .upload-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      padding: 12px;
      background: #E3F2FD;
      border-radius: 8px;
      color: #1565C0;
      font-size: 13px;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .upload-progress {
      margin-top: 16px;
    }

    /* Summary */
    .summary-section {
      padding: 16px 0;

      .summary-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
          margin: 0;
          font-size: 16px;
          color: #333;
        }
      }

      .summary-content {
        margin-top: 12px;
        color: #666;

        p {
          margin: 0;
        }
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;

        .summary-item {
          display: flex;
          flex-direction: column;

          .label {
            font-size: 12px;
            color: #999;
            text-transform: uppercase;
          }

          .value {
            font-weight: 500;
            color: #333;
          }
        }
      }
    }

    /* Fees */
    .fees-section {
      padding: 24px;
      background: #f5f5f5;
      border-radius: 8px;
      margin: 16px 0;

      h3 {
        margin: 0 0 16px;
        color: #333;
      }

      .fees-table {
        .fee-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e0e0e0;

          &.total {
            border-bottom: none;
            padding-top: 12px;
            font-weight: 600;
            font-size: 18px;

            .amount {
              color: #008751;
            }
          }

          .amount {
            font-family: 'Roboto Mono', monospace;
          }
        }
      }
    }

    /* Terms */
    .terms-section {
      margin-top: 16px;
      padding: 16px;
      background: #FFF3E0;
      border-radius: 8px;

      mat-checkbox {
        color: #E65100;
      }
    }

    mat-card-actions {
      padding: 16px !important;
      gap: 8px;
    }

    @media (max-width: 768px) {
      .inscription-container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        gap: 16px;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .type-option {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class FimexInscriptionFormComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private fimexService = inject(FimexService);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  // Forms
  typeForm!: FormGroup;
  entrepriseForm!: FormGroup;
  representantForm!: FormGroup;
  documentsForm!: FormGroup;

  // State
  saving = false;
  submitting = false;
  uploading = false;
  uploadProgress = 0;
  acceptTerms = false;
  currentStep = 0;

  // Documents
  uploadedDocuments: PieceJointe[] = [];
  documentsRequis: TypeDocument[] = [];

  // Reference Data
  regions: RegionCameroun[] = [];
  secteursActivite: SecteurActivite[] = [];
  centresImpots: CentreImpots[] = [];

  // Options
  typeOptions = [
    {
      value: TypeInscriptionFIMEX.IMPORT,
      label: 'Import',
      description: 'Pour effectuer des opérations d\'importation de marchandises',
      icon: 'login',
      price: 50000
    },
    {
      value: TypeInscriptionFIMEX.EXPORT,
      label: 'Export',
      description: 'Pour effectuer des opérations d\'exportation de marchandises',
      icon: 'logout',
      price: 75000
    },
    {
      value: TypeInscriptionFIMEX.IMPORT_EXPORT,
      label: 'Import / Export',
      description: 'Pour effectuer les deux types d\'opérations',
      icon: 'sync_alt',
      price: 100000
    }
  ];

  formesJuridiques = [
    { value: FormeJuridique.SA, label: 'Société Anonyme (SA)' },
    { value: FormeJuridique.SARL, label: 'SARL' },
    { value: FormeJuridique.SAS, label: 'SAS' },
    { value: FormeJuridique.SNC, label: 'SNC' },
    { value: FormeJuridique.ETS, label: 'Établissement' },
    { value: FormeJuridique.GIE, label: 'GIE' },
    { value: FormeJuridique.AUTRE, label: 'Autre' }
  ];

  get progressPercent(): number {
    return ((this.currentStep + 1) / 5) * 100;
  }

  get fraisInscription(): number {
    const type = this.typeForm.get('typeInscription')?.value;
    return type ? getFraisInscription(type) : 0;
  }

  get allDocumentsUploaded(): boolean {
    return this.documentsRequis.every(doc =>
      this.uploadedDocuments.some(u => u.type === doc)
    );
  }

  ngOnInit(): void {
    this.initForms();
    this.loadReferenceData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForms(): void {
    // Step 1: Type
    this.typeForm = this.fb.group({
      typeInscription: ['', Validators.required]
    });

    this.typeForm.get('typeInscription')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(type => {
        if (type) {
          this.documentsRequis = getDocumentsRequis(type);
        }
      });

    // Step 2: Entreprise
    this.entrepriseForm = this.fb.group({
      raisonSociale: ['', Validators.required],
      formeJuridique: ['', Validators.required],
      ninea: ['', [Validators.required, Validators.pattern(/^M\d{13}$/)]],
      numeroRegistreCommerce: ['', Validators.required],
      capitalSocial: [null, [Validators.required, Validators.min(100000)]],
      dateCreation: [null, Validators.required],
      secteurActivite: [[], Validators.required],
      activitesPrincipales: ['', Validators.required],
      siege: this.fb.group({
        adresseComplete: ['', Validators.required],
        ville: ['', Validators.required],
        region: ['', Validators.required],
        boitePostale: [''],
        telephone: ['', [Validators.required, Validators.pattern(/^\+237[26]\d{8}$/)]],
        email: ['', [Validators.required, Validators.email]],
        siteWeb: ['']
      }),
      fiscalite: this.fb.group({
        numeroCarteContribuable: ['', Validators.required],
        centreImpots: ['', Validators.required],
        dateValiditeAttestation: [null, Validators.required]
      })
    });

    // Step 3: Représentant
    this.representantForm = this.fb.group({
      civilite: ['', Validators.required],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      fonction: ['', Validators.required],
      nationalite: ['', Validators.required],
      numeroCNI: ['', Validators.required],
      dateNaissance: [null, Validators.required],
      lieuNaissance: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern(/^\+237[26]\d{8}$/)]],
      email: ['', [Validators.required, Validators.email]]
    });

    // Step 4: Documents
    this.documentsForm = this.fb.group({
      documents: this.fb.array([])
    });
  }

  private loadReferenceData(): void {
    // Load regions
    this.fimexService.getRegions().subscribe({
      next: (regions) => this.regions = regions,
      error: () => {
        // Fallback data
        this.regions = [
          { code: 'AD', nom: 'Adamaoua', chefLieu: 'Ngaoundéré' },
          { code: 'CE', nom: 'Centre', chefLieu: 'Yaoundé' },
          { code: 'EN', nom: 'Extrême-Nord', chefLieu: 'Maroua' },
          { code: 'ES', nom: 'Est', chefLieu: 'Bertoua' },
          { code: 'LT', nom: 'Littoral', chefLieu: 'Douala' },
          { code: 'NO', nom: 'Nord', chefLieu: 'Garoua' },
          { code: 'NW', nom: 'Nord-Ouest', chefLieu: 'Bamenda' },
          { code: 'OU', nom: 'Ouest', chefLieu: 'Bafoussam' },
          { code: 'SU', nom: 'Sud', chefLieu: 'Ebolowa' },
          { code: 'SW', nom: 'Sud-Ouest', chefLieu: 'Buea' }
        ];
      }
    });

    // Load secteurs activite
    this.fimexService.getSecteursActivite().subscribe({
      next: (secteurs) => this.secteursActivite = secteurs,
      error: () => {
        this.secteursActivite = [
          { code: 'COMM', libelle: 'Commerce général' },
          { code: 'AGRO', libelle: 'Agroalimentaire' },
          { code: 'BTP', libelle: 'BTP / Construction' },
          { code: 'TECH', libelle: 'Technologies / Informatique' },
          { code: 'SANTE', libelle: 'Santé / Pharmacie' },
          { code: 'TEXT', libelle: 'Textile / Habillement' },
          { code: 'AUTO', libelle: 'Automobile' },
          { code: 'ELEC', libelle: 'Électronique / Électroménager' },
          { code: 'PETROL', libelle: 'Pétrole / Gaz' },
          { code: 'AUTRE', libelle: 'Autre' }
        ];
      }
    });

    // Load centres impots
    this.fimexService.getCentresImpots().subscribe({
      next: (centres) => this.centresImpots = centres,
      error: () => {
        this.centresImpots = [
          { code: 'DLA1', nom: 'Centre des Impôts de Douala 1er', region: 'LT', ville: 'Douala' },
          { code: 'DLA2', nom: 'Centre des Impôts de Douala 2ème', region: 'LT', ville: 'Douala' },
          { code: 'YDE1', nom: 'Centre des Impôts de Yaoundé 1er', region: 'CE', ville: 'Yaoundé' },
          { code: 'YDE2', nom: 'Centre des Impôts de Yaoundé 2ème', region: 'CE', ville: 'Yaoundé' },
          { code: 'BAF', nom: 'Centre des Impôts de Bafoussam', region: 'OU', ville: 'Bafoussam' }
        ];
      }
    });
  }

  selectType(type: TypeInscriptionFIMEX): void {
    this.typeForm.patchValue({ typeInscription: type });
  }

  getDocumentLabel(type: TypeDocument): string {
    return getTypeDocumentLabel(type);
  }

  getTypeLabel(): string {
    const type = this.typeForm.get('typeInscription')?.value;
    return type ? getTypeInscriptionLabel(type) : '';
  }

  getUploadedDocument(type: TypeDocument): PieceJointe | undefined {
    return this.uploadedDocuments.find(d => d.type === type);
  }

  onFileSelected(event: Event, type: TypeDocument): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('Le fichier dépasse la taille maximale de 5 Mo', 'Fermer', { duration: 5000 });
        return;
      }

      // Simulate upload (in real app, would call service)
      this.uploading = true;
      this.uploadProgress = 0;

      const interval = setInterval(() => {
        this.uploadProgress += 10;
        if (this.uploadProgress >= 100) {
          clearInterval(interval);
          this.uploading = false;

          // Add to uploaded documents
          const doc: PieceJointe = {
            id: 'temp-' + Date.now(),
            type: type,
            nom: file.name,
            tailleOctets: file.size,
            mimeType: file.type,
            cheminStockage: '',
            obligatoire: true,
            statut: 'EN_ATTENTE',
            dateUpload: new Date(),
            uploadePar: 'current-user'
          };

          this.uploadedDocuments = [...this.uploadedDocuments.filter(d => d.type !== type), doc];
          this.snackBar.open('Document téléchargé avec succès', 'OK', { duration: 3000 });
        }
      }, 100);
    }
  }

  removeDocument(type: TypeDocument): void {
    this.uploadedDocuments = this.uploadedDocuments.filter(d => d.type !== type);
  }

  onStepChange(event: any): void {
    this.currentStep = event.selectedIndex;
  }

  goToStep(index: number): void {
    this.stepper.selectedIndex = index;
  }

  canSubmit(): boolean {
    return this.typeForm.valid &&
           this.entrepriseForm.valid &&
           this.representantForm.valid &&
           this.allDocumentsUploaded &&
           this.acceptTerms;
  }

  saveDraft(): void {
    this.saving = true;
    // TODO: Implement draft saving
    setTimeout(() => {
      this.saving = false;
      this.snackBar.open('Brouillon enregistré', 'OK', { duration: 3000 });
    }, 1000);
  }

  submit(): void {
    if (!this.canSubmit()) return;

    this.submitting = true;

    const activites = this.entrepriseForm.get('activitesPrincipales')?.value;
    const request = {
      typeInscription: this.typeForm.get('typeInscription')?.value,
      entreprise: {
        raisonSociale: this.entrepriseForm.get('raisonSociale')?.value,
        formeJuridique: this.entrepriseForm.get('formeJuridique')?.value,
        ninea: this.entrepriseForm.get('ninea')?.value,
        numeroRegistreCommerce: this.entrepriseForm.get('numeroRegistreCommerce')?.value,
        capitalSocial: this.entrepriseForm.get('capitalSocial')?.value,
        dateCreation: this.entrepriseForm.get('dateCreation')?.value,
        secteurActivite: this.entrepriseForm.get('secteurActivite')?.value,
        activitesPrincipales: typeof activites === 'string' ? activites.split(',').map((a: string) => a.trim()) : activites
      },
      siege: this.entrepriseForm.get('siege')?.value,
      representantLegal: this.representantForm.value,
      fiscalite: this.entrepriseForm.get('fiscalite')?.value
    };

    this.fimexService.createInscription(request).subscribe({
      next: (inscription) => {
        this.snackBar.open('Inscription créée avec succès!', 'OK', { duration: 3000 });
        // Redirect to payment
        this.fimexService.initiatePayment(inscription.numeroFIMEX).subscribe({
          next: (payment) => {
            window.location.href = payment.paymentUrl;
          },
          error: () => {
            this.router.navigate(['/e-force/fimex/inscription', inscription.numeroFIMEX]);
          }
        });
      },
      error: (error) => {
        this.submitting = false;
        this.snackBar.open(error.message || 'Erreur lors de la création', 'Fermer', { duration: 5000 });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/e-force/fimex']);
  }
}
