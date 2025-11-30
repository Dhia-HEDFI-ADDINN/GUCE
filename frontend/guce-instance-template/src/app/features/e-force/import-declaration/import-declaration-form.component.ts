import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

/**
 * Composant de formulaire pour la Déclaration d'Importation (DI).
 *
 * Implémente les règles métier GUCE Cameroun:
 * - Routage automatique SGS vs Douane
 * - Calculs selon INCOTERMS
 * - Support types: Classique, Groupage, Médicaments, Transit
 * - Gestion prorogation et amendement
 */
@Component({
  selector: 'guce-import-declaration-form',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatStepperModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatButtonModule, MatIconModule,
    MatCheckboxModule, MatRadioModule, MatDividerModule, MatTabsModule,
    MatExpansionModule, MatChipsModule, MatSnackBarModule, MatProgressBarModule,
    MatDialogModule, MatTooltipModule
  ],
  template: `
    <div class="di-form-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <button mat-icon-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h1>{{ isEdit ? 'Modifier la DI' : 'Nouvelle Déclaration d\\'Importation' }}</h1>
            <p *ngIf="isEdit">Référence: {{ declarationReference }}</p>
          </div>
        </div>
        <div class="header-actions">
          <button mat-stroked-button (click)="saveDraft()" [disabled]="saving">
            <mat-icon>save</mat-icon>
            Enregistrer brouillon
          </button>
          <button mat-flat-button color="primary" (click)="submit()" [disabled]="saving || !canSubmit()">
            <mat-icon>send</mat-icon>
            Soumettre
          </button>
        </div>
      </div>

      <!-- Type Selection -->
      <mat-card class="type-selection-card" *ngIf="!isEdit">
        <mat-card-header>
          <mat-card-title>Type d'importation</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-radio-group [(ngModel)]="importType" (change)="onImportTypeChange()">
            <mat-radio-button value="CLASSIQUE" class="type-option">
              <div class="type-content">
                <mat-icon>inventory_2</mat-icon>
                <div>
                  <strong>Classique</strong>
                  <span>Importation standard de marchandises</span>
                </div>
              </div>
            </mat-radio-button>
            <mat-radio-button value="GROUPAGE" class="type-option">
              <div class="type-content">
                <mat-icon>view_module</mat-icon>
                <div>
                  <strong>Groupage</strong>
                  <span>Importation de marchandises groupées</span>
                </div>
              </div>
            </mat-radio-button>
            <mat-radio-button value="MEDICAMENTS" class="type-option">
              <div class="type-content">
                <mat-icon>medical_services</mat-icon>
                <div>
                  <strong>Médicaments</strong>
                  <span>Nécessite visa technique MINSANTE</span>
                </div>
              </div>
            </mat-radio-button>
            <mat-radio-button value="TRANSIT" class="type-option">
              <div class="type-content">
                <mat-icon>multiple_stop</mat-icon>
                <div>
                  <strong>Transit</strong>
                  <span>Marchandises en transit</span>
                </div>
              </div>
            </mat-radio-button>
          </mat-radio-group>
        </mat-card-content>
      </mat-card>

      <!-- Main Stepper Form -->
      <mat-stepper [linear]="false" #stepper *ngIf="importType">
        <!-- Step 1: Importateur -->
        <mat-step [stepControl]="importerForm" label="Importateur">
          <mat-card class="step-card">
            <mat-card-content>
              <form [formGroup]="importerForm">
                <h3>Informations de l'importateur</h3>
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Numéro contribuable (NIU)</mat-label>
                    <input matInput formControlName="niu" placeholder="M123456789">
                    <mat-error *ngIf="importerForm.get('niu')?.hasError('required')">NIU obligatoire</mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Raison sociale / Nom</mat-label>
                    <input matInput formControlName="name">
                    <mat-error *ngIf="importerForm.get('name')?.hasError('required')">Nom obligatoire</mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Adresse</mat-label>
                    <textarea matInput formControlName="address" rows="2"></textarea>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Téléphone</mat-label>
                    <input matInput formControlName="phone" placeholder="+237 6XX XXX XXX">
                    <mat-error *ngIf="importerForm.get('phone')?.hasError('required')">Téléphone obligatoire</mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Email</mat-label>
                    <input matInput formControlName="email" type="email">
                    <mat-error *ngIf="importerForm.get('email')?.hasError('email')">Email invalide</mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Personne à contacter</mat-label>
                    <input matInput formControlName="contactPerson">
                  </mat-form-field>
                </div>

                <mat-divider></mat-divider>

                <h3>Commissionnaire Agréé en Douane (CAD) - Optionnel</h3>
                <div class="form-grid" formGroupName="cad">
                  <mat-form-field appearance="outline">
                    <mat-label>NIU du CAD</mat-label>
                    <input matInput formControlName="niu">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Nom du CAD</mat-label>
                    <input matInput formControlName="name">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Numéro d'agrément</mat-label>
                    <input matInput formControlName="agreementNumber">
                  </mat-form-field>
                </div>
              </form>
            </mat-card-content>
            <mat-card-actions align="end">
              <button mat-flat-button color="primary" matStepperNext>
                Suivant <mat-icon>arrow_forward</mat-icon>
              </button>
            </mat-card-actions>
          </mat-card>
        </mat-step>

        <!-- Step 2: Fournisseur -->
        <mat-step [stepControl]="supplierForm" label="Fournisseur">
          <mat-card class="step-card">
            <mat-card-content>
              <form [formGroup]="supplierForm">
                <h3>Informations du fournisseur</h3>
                <div class="form-grid">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Nom du fournisseur</mat-label>
                    <input matInput formControlName="name">
                    <mat-error *ngIf="supplierForm.get('name')?.hasError('required')">Nom obligatoire</mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Référence fournisseur</mat-label>
                    <input matInput formControlName="reference">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Adresse</mat-label>
                    <textarea matInput formControlName="address" rows="2"></textarea>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Boîte postale</mat-label>
                    <input matInput formControlName="postalBox">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Pays</mat-label>
                    <mat-select formControlName="country">
                      <mat-option *ngFor="let country of countries" [value]="country.code">
                        {{ country.name }}
                      </mat-option>
                    </mat-select>
                    <mat-error *ngIf="supplierForm.get('country')?.hasError('required')">Pays obligatoire</mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Ville</mat-label>
                    <input matInput formControlName="city">
                    <mat-error *ngIf="supplierForm.get('city')?.hasError('required')">Ville obligatoire</mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Téléphone</mat-label>
                    <input matInput formControlName="phone">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Email</mat-label>
                    <input matInput formControlName="email" type="email">
                  </mat-form-field>
                </div>
              </form>
            </mat-card-content>
            <mat-card-actions align="end">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon> Précédent
              </button>
              <button mat-flat-button color="primary" matStepperNext>
                Suivant <mat-icon>arrow_forward</mat-icon>
              </button>
            </mat-card-actions>
          </mat-card>
        </mat-step>

        <!-- Step 3: Informations générales -->
        <mat-step [stepControl]="generalForm" label="Informations générales">
          <mat-card class="step-card">
            <mat-card-content>
              <form [formGroup]="generalForm">
                <h3>Détails de l'importation</h3>
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Pays d'origine</mat-label>
                    <mat-select formControlName="originCountry">
                      <mat-option *ngFor="let country of countries" [value]="country.code">
                        {{ country.name }}
                      </mat-option>
                    </mat-select>
                    <mat-error *ngIf="generalForm.get('originCountry')?.hasError('required')">Obligatoire</mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Pays de provenance</mat-label>
                    <mat-select formControlName="provenanceCountry">
                      <mat-option *ngFor="let country of countries" [value]="country.code">
                        {{ country.name }}
                      </mat-option>
                    </mat-select>
                    <mat-error *ngIf="generalForm.get('provenanceCountry')?.hasError('required')">Obligatoire</mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Lieu de déchargement</mat-label>
                    <mat-select formControlName="unloadingPlace">
                      <mat-option value="DOUALA_PORT">Port de Douala</mat-option>
                      <mat-option value="DOUALA_AIRPORT">Aéroport de Douala</mat-option>
                      <mat-option value="KRIBI_PORT">Port de Kribi</mat-option>
                      <mat-option value="YAOUNDE_AIRPORT">Aéroport de Yaoundé</mat-option>
                      <mat-option value="GAROUA">Garoua</mat-option>
                    </mat-select>
                    <mat-error *ngIf="generalForm.get('unloadingPlace')?.hasError('required')">Obligatoire</mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Mode de transport</mat-label>
                    <mat-select formControlName="transportMode">
                      <mat-option value="MARITIME">Maritime</mat-option>
                      <mat-option value="AERIEN">Aérien</mat-option>
                      <mat-option value="ROUTIER">Routier</mat-option>
                      <mat-option value="FERROVIAIRE">Ferroviaire</mat-option>
                      <mat-option value="MULTIMODAL">Multimodal</mat-option>
                    </mat-select>
                    <mat-error *ngIf="generalForm.get('transportMode')?.hasError('required')">Obligatoire</mat-error>
                  </mat-form-field>
                </div>

                <mat-divider></mat-divider>

                <h3>Facture proforma</h3>
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Numéro de facture</mat-label>
                    <input matInput formControlName="proformaNumber">
                    <mat-error *ngIf="generalForm.get('proformaNumber')?.hasError('required')">Obligatoire</mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Date de la facture</mat-label>
                    <input matInput [matDatepicker]="proformaDatePicker" formControlName="proformaDate">
                    <mat-datepicker-toggle matSuffix [for]="proformaDatePicker"></mat-datepicker-toggle>
                    <mat-datepicker #proformaDatePicker></mat-datepicker>
                    <mat-error *ngIf="generalForm.get('proformaDate')?.hasError('required')">Obligatoire</mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Devise</mat-label>
                    <mat-select formControlName="currency" (selectionChange)="onCurrencyChange()">
                      <mat-option value="EUR">Euro (EUR)</mat-option>
                      <mat-option value="USD">Dollar US (USD)</mat-option>
                      <mat-option value="GBP">Livre Sterling (GBP)</mat-option>
                      <mat-option value="CNY">Yuan (CNY)</mat-option>
                      <mat-option value="XAF">Franc CFA (XAF)</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>INCOTERM</mat-label>
                    <mat-select formControlName="incoterm" (selectionChange)="onIncotermChange()">
                      <mat-option value="FOB">FOB - Free On Board</mat-option>
                      <mat-option value="CIF">CIF - Cost, Insurance and Freight</mat-option>
                      <mat-option value="FAS">FAS - Free Alongside Ship</mat-option>
                      <mat-option value="CFR">CFR - Cost and Freight</mat-option>
                      <mat-option value="CIP">CIP - Carriage and Insurance Paid</mat-option>
                      <mat-option value="CPT">CPT - Carriage Paid To</mat-option>
                      <mat-option value="DAP">DAP - Delivered At Place</mat-option>
                      <mat-option value="DPU">DPU - Delivered at Place Unloaded</mat-option>
                      <mat-option value="DDP">DDP - Delivered Duty Paid</mat-option>
                      <mat-option value="EXW">EXW - Ex Works</mat-option>
                      <mat-option value="FCA">FCA - Free Carrier</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <mat-divider></mat-divider>

                <h3>Valeurs et frais</h3>
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Frais de mise FOB</mat-label>
                    <input matInput type="number" formControlName="fobCharges" (change)="calculateTotals()">
                  </mat-form-field>

                  <mat-form-field appearance="outline" *ngIf="showFreightInsurance">
                    <mat-label>Montant fret</mat-label>
                    <input matInput type="number" formControlName="freightAmount" (change)="calculateTotals()">
                  </mat-form-field>

                  <mat-form-field appearance="outline" *ngIf="showFreightInsurance">
                    <mat-label>Montant assurance</mat-label>
                    <input matInput type="number" formControlName="insuranceAmount" (change)="calculateTotals()">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Taux de change (vers XAF)</mat-label>
                    <input matInput type="number" formControlName="exchangeRate" (change)="calculateTotals()">
                    <mat-hint>1 {{ generalForm.get('currency')?.value }} = ? XAF</mat-hint>
                  </mat-form-field>
                </div>

                <mat-checkbox formControlName="isPviExempt" class="pvi-checkbox">
                  Marchandises exemptées du Programme de Vérification des Importations (PVI)
                </mat-checkbox>
              </form>
            </mat-card-content>
            <mat-card-actions align="end">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon> Précédent
              </button>
              <button mat-flat-button color="primary" matStepperNext>
                Suivant <mat-icon>arrow_forward</mat-icon>
              </button>
            </mat-card-actions>
          </mat-card>
        </mat-step>

        <!-- Step 4: Marchandises -->
        <mat-step [stepControl]="goodsForm" label="Marchandises">
          <mat-card class="step-card">
            <mat-card-content>
              <form [formGroup]="goodsForm">
                <div class="goods-header">
                  <h3>Articles ({{ goodsItems.length }})</h3>
                  <button mat-stroked-button color="primary" (click)="addGoodsItem()">
                    <mat-icon>add</mat-icon> Ajouter un article
                  </button>
                </div>

                <div formArrayName="items">
                  <mat-expansion-panel *ngFor="let item of goodsItems.controls; let i = index" [formGroupName]="i" class="goods-item-panel">
                    <mat-expansion-panel-header>
                      <mat-panel-title>
                        <span class="item-number">Article {{ i + 1 }}</span>
                        <span class="item-designation">{{ item.get('designation')?.value || 'Sans désignation' }}</span>
                      </mat-panel-title>
                      <mat-panel-description>
                        {{ formatCurrency(item.get('fobValue')?.value || 0) }}
                        <button mat-icon-button color="warn" (click)="removeGoodsItem(i); $event.stopPropagation()" *ngIf="goodsItems.length > 1">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </mat-panel-description>
                    </mat-expansion-panel-header>

                    <div class="form-grid">
                      <mat-form-field appearance="outline">
                        <mat-label>Code tarifaire (SH)</mat-label>
                        <input matInput formControlName="hsCode" placeholder="8471.30.00">
                        <mat-error>Code tarifaire obligatoire</mat-error>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Désignation</mat-label>
                        <input matInput formControlName="designation">
                        <mat-error>Désignation obligatoire</mat-error>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Description détaillée</mat-label>
                        <textarea matInput formControlName="description" rows="2"></textarea>
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Quantité</mat-label>
                        <input matInput type="number" formControlName="quantity" (change)="calculateItemFob(i)">
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Unité</mat-label>
                        <mat-select formControlName="unitOfMeasure">
                          <mat-option value="KG">Kilogrammes</mat-option>
                          <mat-option value="U">Unités</mat-option>
                          <mat-option value="L">Litres</mat-option>
                          <mat-option value="M">Mètres</mat-option>
                          <mat-option value="M2">Mètres carrés</mat-option>
                          <mat-option value="M3">Mètres cubes</mat-option>
                        </mat-select>
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Poids net (kg)</mat-label>
                        <input matInput type="number" formControlName="netWeight">
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Poids brut (kg)</mat-label>
                        <input matInput type="number" formControlName="grossWeight">
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Valeur FOB unitaire</mat-label>
                        <input matInput type="number" formControlName="unitFobValue" (change)="calculateItemFob(i)">
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Valeur FOB totale</mat-label>
                        <input matInput type="number" formControlName="fobValue" readonly>
                      </mat-form-field>
                    </div>

                    <!-- Champs spéciaux -->
                    <mat-accordion>
                      <mat-expansion-panel>
                        <mat-expansion-panel-header>
                          <mat-panel-title>
                            <mat-icon>settings</mat-icon>
                            Champs spéciaux (Véhicules, Aviculture, Médicaments)
                          </mat-panel-title>
                        </mat-expansion-panel-header>

                        <div class="special-fields">
                          <mat-checkbox formControlName="isUsedVehicle" (change)="onSpecialMerchandiseChange()">
                            Véhicule d'occasion
                          </mat-checkbox>

                          <mat-checkbox formControlName="isPoultryChicks" (change)="onSpecialMerchandiseChange()">
                            Poussins
                          </mat-checkbox>

                          <mat-checkbox formControlName="isEggs" (change)="onSpecialMerchandiseChange()">
                            Œufs
                          </mat-checkbox>

                          <mat-checkbox formControlName="isMedication" *ngIf="importType === 'MEDICAMENTS'">
                            Médicament
                          </mat-checkbox>

                          <!-- Champs véhicule d'occasion -->
                          <div class="form-grid" *ngIf="item.get('isUsedVehicle')?.value">
                            <mat-form-field appearance="outline">
                              <mat-label>Immatriculation</mat-label>
                              <input matInput formControlName="vehicleRegistration">
                            </mat-form-field>
                            <mat-form-field appearance="outline">
                              <mat-label>Numéro de châssis</mat-label>
                              <input matInput formControlName="vehicleChassisNumber">
                            </mat-form-field>
                            <mat-form-field appearance="outline">
                              <mat-label>Kilométrage</mat-label>
                              <input matInput type="number" formControlName="vehicleMileage">
                            </mat-form-field>
                          </div>

                          <!-- Champs médicament -->
                          <div class="form-grid" *ngIf="item.get('isMedication')?.value">
                            <mat-form-field appearance="outline">
                              <mat-label>Numéro AMM</mat-label>
                              <input matInput formControlName="medicationAmmNumber">
                            </mat-form-field>
                            <mat-form-field appearance="outline">
                              <mat-label>DCI</mat-label>
                              <input matInput formControlName="medicationDci">
                            </mat-form-field>
                            <mat-form-field appearance="outline">
                              <mat-label>Dosage</mat-label>
                              <input matInput formControlName="medicationDosage">
                            </mat-form-field>
                          </div>
                        </div>
                      </mat-expansion-panel>
                    </mat-accordion>
                  </mat-expansion-panel>
                </div>

                <!-- Totaux et routage -->
                <div class="totals-routing-section">
                  <div class="totals-box">
                    <h4>Récapitulatif des valeurs</h4>
                    <div class="total-row">
                      <span>Total FOB ({{ generalForm.get('currency')?.value }}):</span>
                      <strong>{{ formatCurrency(totalFobValue) }}</strong>
                    </div>
                    <div class="total-row">
                      <span>Total FOB (XAF):</span>
                      <strong>{{ formatCurrency(totalFobValueXaf, 'XAF') }}</strong>
                    </div>
                    <div class="total-row" *ngIf="showFreightInsurance">
                      <span>+ Fret + Assurance:</span>
                      <strong>{{ formatCurrency(totalFreightInsurance) }}</strong>
                    </div>
                    <mat-divider></mat-divider>
                    <div class="total-row highlight">
                      <span>Montant total (XAF):</span>
                      <strong>{{ formatCurrency(totalAmountXaf, 'XAF') }}</strong>
                    </div>
                  </div>

                  <div class="routing-box" [class.sgs]="routingDestination === 'SGS'" [class.customs]="routingDestination === 'CUSTOMS'">
                    <h4>Routage automatique</h4>
                    <div class="routing-result">
                      <mat-icon>{{ routingDestination === 'SGS' ? 'verified' : 'account_balance' }}</mat-icon>
                      <div>
                        <strong>{{ routingDestination === 'SGS' ? 'SGS' : 'DOUANE' }}</strong>
                        <span>{{ routingReason }}</span>
                      </div>
                    </div>
                    <mat-divider></mat-divider>
                    <div class="fees-breakdown">
                      <div class="fee-row">
                        <span>Taxe d'inspection:</span>
                        <strong>{{ formatCurrency(inspectionFee, 'XAF') }}</strong>
                      </div>
                      <div class="fee-row">
                        <span>Timbre fiscal:</span>
                        <strong>{{ formatCurrency(1500, 'XAF') }}</strong>
                      </div>
                      <div class="fee-row highlight">
                        <span>Total frais:</span>
                        <strong>{{ formatCurrency(totalFees, 'XAF') }}</strong>
                      </div>
                    </div>
                    <div class="payment-channel">
                      <mat-icon>payment</mat-icon>
                      <span>Canal de paiement: <strong>{{ paymentChannelLabel }}</strong></span>
                    </div>
                  </div>
                </div>
              </form>
            </mat-card-content>
            <mat-card-actions align="end">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon> Précédent
              </button>
              <button mat-flat-button color="primary" matStepperNext>
                Suivant <mat-icon>arrow_forward</mat-icon>
              </button>
            </mat-card-actions>
          </mat-card>
        </mat-step>

        <!-- Step 5: Extension Médicaments (si applicable) -->
        <mat-step *ngIf="importType === 'MEDICAMENTS'" [stepControl]="medicationForm" label="Médicaments">
          <mat-card class="step-card">
            <mat-card-content>
              <form [formGroup]="medicationForm">
                <div class="medication-warning">
                  <mat-icon>warning</mat-icon>
                  <div>
                    <strong>Importation de médicaments</strong>
                    <p>Le Visa Technique Provisoire MINSANTE doit être signé AVANT la validation de la DI.</p>
                  </div>
                </div>

                <h3>Informations MINSANTE</h3>
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Code bureau douanier</mat-label>
                    <input matInput formControlName="customsOfficeCode">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Numéro AOI</mat-label>
                    <input matInput formControlName="aoiNumber">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Date agrément MINSANTE</mat-label>
                    <input matInput [matDatepicker]="agreementDatePicker" formControlName="minsanteAgreementDate">
                    <mat-datepicker-toggle matSuffix [for]="agreementDatePicker"></mat-datepicker-toggle>
                    <mat-datepicker #agreementDatePicker></mat-datepicker>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Numéro agrément/AMM</mat-label>
                    <input matInput formControlName="minsanteAgreementNumber">
                  </mat-form-field>
                </div>

                <h3>Pharmacien responsable</h3>
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Nom du pharmacien</mat-label>
                    <input matInput formControlName="pharmacistName">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Téléphone</mat-label>
                    <input matInput formControlName="pharmacistPhone">
                  </mat-form-field>
                </div>
              </form>
            </mat-card-content>
            <mat-card-actions align="end">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon> Précédent
              </button>
              <button mat-flat-button color="primary" matStepperNext>
                Suivant <mat-icon>arrow_forward</mat-icon>
              </button>
            </mat-card-actions>
          </mat-card>
        </mat-step>

        <!-- Step 6: Documents -->
        <mat-step [stepControl]="documentsForm" label="Documents">
          <mat-card class="step-card">
            <mat-card-content>
              <h3>Pièces jointes</h3>
              <p class="hint">Documents obligatoires marqués d'un astérisque (*)</p>

              <div class="documents-list">
                <div class="document-item" *ngFor="let doc of requiredDocuments" [class.uploaded]="doc.uploaded" [class.mandatory]="doc.mandatory">
                  <div class="doc-info">
                    <mat-icon [class.success]="doc.uploaded">{{ doc.uploaded ? 'check_circle' : 'description' }}</mat-icon>
                    <div>
                      <span class="doc-name">{{ doc.name }}{{ doc.mandatory ? ' *' : '' }}</span>
                      <span class="doc-status">{{ doc.uploaded ? doc.fileName : (doc.mandatory ? 'Obligatoire' : 'Optionnel') }}</span>
                    </div>
                  </div>
                  <button mat-stroked-button (click)="uploadDocument(doc)">
                    <mat-icon>{{ doc.uploaded ? 'refresh' : 'upload' }}</mat-icon>
                    {{ doc.uploaded ? 'Remplacer' : 'Télécharger' }}
                  </button>
                </div>
              </div>
            </mat-card-content>
            <mat-card-actions align="end">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon> Précédent
              </button>
              <button mat-flat-button color="primary" matStepperNext>
                Suivant <mat-icon>arrow_forward</mat-icon>
              </button>
            </mat-card-actions>
          </mat-card>
        </mat-step>

        <!-- Step 7: Récapitulatif -->
        <mat-step label="Récapitulatif">
          <mat-card class="step-card summary-card">
            <mat-card-content>
              <h3>Récapitulatif de la Déclaration d'Importation</h3>

              <div class="summary-grid">
                <div class="summary-section">
                  <h4>Type et routage</h4>
                  <div class="summary-item">
                    <span>Type d'importation:</span>
                    <strong>{{ getImportTypeLabel() }}</strong>
                  </div>
                  <div class="summary-item">
                    <span>Routage:</span>
                    <mat-chip [class]="routingDestination === 'SGS' ? 'sgs-chip' : 'customs-chip'">
                      {{ routingDestination }}
                    </mat-chip>
                  </div>
                </div>

                <div class="summary-section">
                  <h4>Importateur</h4>
                  <div class="summary-item">
                    <span>NIU:</span>
                    <strong>{{ importerForm.get('niu')?.value }}</strong>
                  </div>
                  <div class="summary-item">
                    <span>Nom:</span>
                    <strong>{{ importerForm.get('name')?.value }}</strong>
                  </div>
                </div>

                <div class="summary-section">
                  <h4>Fournisseur</h4>
                  <div class="summary-item">
                    <span>Nom:</span>
                    <strong>{{ supplierForm.get('name')?.value }}</strong>
                  </div>
                  <div class="summary-item">
                    <span>Pays:</span>
                    <strong>{{ getCountryName(supplierForm.get('country')?.value) }}</strong>
                  </div>
                </div>

                <div class="summary-section">
                  <h4>Valeurs</h4>
                  <div class="summary-item">
                    <span>Total FOB (XAF):</span>
                    <strong>{{ formatCurrency(totalFobValueXaf, 'XAF') }}</strong>
                  </div>
                  <div class="summary-item highlight">
                    <span>Total frais:</span>
                    <strong>{{ formatCurrency(totalFees, 'XAF') }}</strong>
                  </div>
                </div>

                <div class="summary-section">
                  <h4>Marchandises</h4>
                  <div class="summary-item">
                    <span>Nombre d'articles:</span>
                    <strong>{{ goodsItems.length }}</strong>
                  </div>
                  <div class="summary-item">
                    <span>INCOTERM:</span>
                    <strong>{{ generalForm.get('incoterm')?.value }}</strong>
                  </div>
                </div>

                <div class="summary-section">
                  <h4>Documents</h4>
                  <div class="summary-item">
                    <span>Téléchargés:</span>
                    <strong>{{ uploadedDocumentsCount }} / {{ requiredDocuments.length }}</strong>
                  </div>
                </div>
              </div>

              <div class="confirmation-box">
                <mat-checkbox [(ngModel)]="confirmed">
                  Je certifie que les informations fournies sont exactes et complètes.
                  Je comprends que toute fausse déclaration peut entraîner des sanctions
                  conformément à la législation douanière en vigueur.
                </mat-checkbox>
              </div>
            </mat-card-content>
            <mat-card-actions align="end">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon> Précédent
              </button>
              <button mat-stroked-button (click)="saveDraft()" [disabled]="saving">
                <mat-icon>save</mat-icon> Enregistrer brouillon
              </button>
              <button mat-flat-button color="primary" (click)="submit()" [disabled]="saving || !canSubmit()">
                <mat-icon>send</mat-icon> Soumettre la déclaration
              </button>
            </mat-card-actions>
          </mat-card>
        </mat-step>
      </mat-stepper>
    </div>
  `,
  styles: [`
    .di-form-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      .header-left {
        display: flex;
        align-items: center;
        gap: 16px;

        h1 { margin: 0; font-size: 24px; }
        p { margin: 4px 0 0; color: #757575; }
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }

    .type-selection-card {
      margin-bottom: 24px;

      mat-radio-group {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
      }

      .type-option {
        flex: 1;
        min-width: 200px;

        .type-content {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;

          mat-icon { color: #1976d2; font-size: 32px; width: 32px; height: 32px; }
          strong { display: block; }
          span { font-size: 12px; color: #757575; }
        }
      }

      ::ng-deep .mat-radio-button.mat-radio-checked .type-content {
        border-color: #1976d2;
        background: #e3f2fd;
      }
    }

    .step-card {
      margin: 24px 0;

      h3 { margin: 0 0 16px; font-size: 18px; font-weight: 500; }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;

      .full-width { grid-column: 1 / -1; }

      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }

    mat-divider { margin: 24px 0; }

    .pvi-checkbox { margin-top: 16px; }

    .goods-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .goods-item-panel {
      margin-bottom: 8px;

      .item-number { font-weight: 600; color: #1976d2; margin-right: 16px; }
      .item-designation { color: #616161; }
    }

    .special-fields {
      padding: 16px;
      background: #fafafa;
      border-radius: 8px;

      mat-checkbox { margin-right: 24px; margin-bottom: 16px; }
    }

    .totals-routing-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-top: 24px;

      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }

    .totals-box, .routing-box {
      padding: 20px;
      border-radius: 8px;
      background: #fafafa;

      h4 { margin: 0 0 16px; font-size: 14px; text-transform: uppercase; color: #757575; }

      .total-row, .fee-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;

        &.highlight {
          background: #e3f2fd;
          padding: 12px;
          margin: 8px -12px;
          border-radius: 4px;

          strong { color: #1976d2; font-size: 18px; }
        }
      }
    }

    .routing-box {
      &.sgs { border-left: 4px solid #4caf50; }
      &.customs { border-left: 4px solid #ff9800; }

      .routing-result {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;

        mat-icon { font-size: 40px; width: 40px; height: 40px; }
        strong { display: block; font-size: 20px; }
        span { color: #757575; font-size: 12px; }
      }

      &.sgs .routing-result mat-icon { color: #4caf50; }
      &.customs .routing-result mat-icon { color: #ff9800; }

      .payment-channel {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 16px;
        padding: 12px;
        background: #fff;
        border-radius: 4px;

        mat-icon { color: #757575; }
      }
    }

    .medication-warning {
      display: flex;
      gap: 16px;
      padding: 16px;
      background: #fff3e0;
      border-radius: 8px;
      margin-bottom: 24px;

      mat-icon { color: #f57c00; font-size: 32px; width: 32px; height: 32px; }
      strong { display: block; color: #e65100; }
      p { margin: 8px 0 0; color: #757575; }
    }

    .documents-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .document-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #fafafa;
      border-radius: 8px;
      border: 1px solid #e0e0e0;

      &.uploaded { border-color: #4caf50; background: #e8f5e9; }
      &.mandatory:not(.uploaded) { border-color: #ff9800; }

      .doc-info {
        display: flex;
        align-items: center;
        gap: 12px;

        mat-icon { color: #9e9e9e; &.success { color: #4caf50; } }
        .doc-name { font-weight: 500; display: block; }
        .doc-status { font-size: 12px; color: #757575; }
      }
    }

    .summary-card {
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;

        @media (max-width: 768px) { grid-template-columns: 1fr; }
      }

      .summary-section {
        padding: 16px;
        background: #fafafa;
        border-radius: 8px;

        h4 { margin: 0 0 12px; font-size: 12px; text-transform: uppercase; color: #757575; }

        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;

          &:last-child { border-bottom: none; }
          &.highlight strong { color: #1976d2; }
        }
      }

      .confirmation-box {
        margin-top: 24px;
        padding: 20px;
        background: #fff3e0;
        border-radius: 8px;
      }
    }

    ::ng-deep {
      .sgs-chip { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
      .customs-chip { background-color: #fff3e0 !important; color: #e65100 !important; }
    }
  `]
})
export class ImportDeclarationFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // State
  importType: 'CLASSIQUE' | 'GROUPAGE' | 'MEDICAMENTS' | 'TRANSIT' | null = null;
  isEdit = false;
  declarationReference = '';
  saving = false;
  confirmed = false;

  // Forms
  importerForm!: FormGroup;
  supplierForm!: FormGroup;
  generalForm!: FormGroup;
  goodsForm!: FormGroup;
  medicationForm!: FormGroup;
  documentsForm!: FormGroup;

  // Calculated values
  totalFobValue = 0;
  totalFobValueXaf = 0;
  totalFreightInsurance = 0;
  totalAmountXaf = 0;
  inspectionFee = 0;
  totalFees = 0;
  routingDestination: 'SGS' | 'CUSTOMS' = 'CUSTOMS';
  routingReason = '';
  paymentChannelLabel = 'Campost / CNCC';

  // Reference data
  countries = [
    { code: 'CN', name: 'Chine' },
    { code: 'FR', name: 'France' },
    { code: 'US', name: 'États-Unis' },
    { code: 'DE', name: 'Allemagne' },
    { code: 'BE', name: 'Belgique' },
    { code: 'NL', name: 'Pays-Bas' },
    { code: 'IT', name: 'Italie' },
    { code: 'ES', name: 'Espagne' },
    { code: 'GB', name: 'Royaume-Uni' },
    { code: 'JP', name: 'Japon' },
    { code: 'KR', name: 'Corée du Sud' },
    { code: 'IN', name: 'Inde' },
    { code: 'TR', name: 'Turquie' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'CI', name: 'Côte d\'Ivoire' },
    { code: 'SN', name: 'Sénégal' },
    { code: 'GA', name: 'Gabon' },
    { code: 'CG', name: 'Congo' },
    { code: 'CM', name: 'Cameroun' }
  ];

  requiredDocuments = [
    { id: 'proforma', name: 'Facture proforma', mandatory: true, uploaded: false, fileName: '' },
    { id: 'fimex', name: 'Certificat FIMEX', mandatory: true, uploaded: false, fileName: '' },
    { id: 'bl', name: 'Connaissement / LTA', mandatory: false, uploaded: false, fileName: '' },
    { id: 'packing', name: 'Liste de colisage', mandatory: false, uploaded: false, fileName: '' },
    { id: 'origin', name: 'Certificat d\'origine', mandatory: false, uploaded: false, fileName: '' },
    { id: 'amm', name: 'AMM / Dérogation MINSANTE', mandatory: false, uploaded: false, fileName: '' }
  ];

  // Constants
  private readonly SGS_THRESHOLD = 1000000;
  private readonly BANK_PAYMENT_THRESHOLD = 2000000;
  private readonly SGS_RATE = 0.0095;
  private readonly SGS_MINIMUM = 110000;
  private readonly CUSTOMS_FEE = 6000;
  private readonly FISCAL_STAMP = 1500;

  ngOnInit() {
    this.initForms();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.declarationReference = params['id'];
        this.loadDeclaration();
      }
      if (params['type']) {
        this.importType = params['type'];
        this.updateRequiredDocuments();
      }
    });
  }

  initForms() {
    this.importerForm = this.fb.group({
      niu: ['', Validators.required],
      name: ['', Validators.required],
      address: [''],
      phone: ['', Validators.required],
      email: ['', Validators.email],
      contactPerson: [''],
      cad: this.fb.group({
        niu: [''],
        name: [''],
        agreementNumber: ['']
      })
    });

    this.supplierForm = this.fb.group({
      name: ['', Validators.required],
      reference: [''],
      address: [''],
      postalBox: [''],
      country: ['', Validators.required],
      city: ['', Validators.required],
      phone: [''],
      email: ['', Validators.email]
    });

    this.generalForm = this.fb.group({
      originCountry: ['', Validators.required],
      provenanceCountry: ['', Validators.required],
      unloadingPlace: ['', Validators.required],
      transportMode: ['', Validators.required],
      proformaNumber: ['', Validators.required],
      proformaDate: ['', Validators.required],
      currency: ['EUR', Validators.required],
      incoterm: ['FOB', Validators.required],
      fobCharges: [0, Validators.required],
      freightAmount: [0],
      insuranceAmount: [0],
      exchangeRate: [655.957, Validators.required],
      isPviExempt: [false]
    });

    this.goodsForm = this.fb.group({
      items: this.fb.array([this.createGoodsItem()])
    });

    this.medicationForm = this.fb.group({
      customsOfficeCode: [''],
      aoiNumber: [''],
      minsanteAgreementDate: [''],
      minsanteAgreementNumber: [''],
      pharmacistName: [''],
      pharmacistPhone: ['']
    });

    this.documentsForm = this.fb.group({});
  }

  createGoodsItem(): FormGroup {
    return this.fb.group({
      hsCode: ['', Validators.required],
      designation: ['', Validators.required],
      description: [''],
      quantity: [1, [Validators.required, Validators.min(0.001)]],
      unitOfMeasure: ['KG'],
      netWeight: [0],
      grossWeight: [0],
      unitFobValue: [0, Validators.required],
      fobValue: [0],
      // Special fields
      isUsedVehicle: [false],
      isPoultryChicks: [false],
      isEggs: [false],
      isMedication: [false],
      // Vehicle fields
      vehicleRegistration: [''],
      vehicleChassisNumber: [''],
      vehicleMileage: [0],
      // Medication fields
      medicationAmmNumber: [''],
      medicationDci: [''],
      medicationDosage: ['']
    });
  }

  get goodsItems(): FormArray {
    return this.goodsForm.get('items') as FormArray;
  }

  get showFreightInsurance(): boolean {
    const incoterm = this.generalForm.get('incoterm')?.value;
    return ['CIF', 'CFR', 'CIP', 'CPT', 'DAP', 'DPU', 'DDP'].includes(incoterm);
  }

  get uploadedDocumentsCount(): number {
    return this.requiredDocuments.filter(d => d.uploaded).length;
  }

  onImportTypeChange() {
    this.updateRequiredDocuments();
  }

  updateRequiredDocuments() {
    // Add AMM as mandatory for medications
    const ammDoc = this.requiredDocuments.find(d => d.id === 'amm');
    if (ammDoc) {
      ammDoc.mandatory = this.importType === 'MEDICAMENTS';
    }
  }

  addGoodsItem() {
    this.goodsItems.push(this.createGoodsItem());
  }

  removeGoodsItem(index: number) {
    this.goodsItems.removeAt(index);
    this.calculateTotals();
  }

  calculateItemFob(index: number) {
    const item = this.goodsItems.at(index);
    const quantity = item.get('quantity')?.value || 0;
    const unitValue = item.get('unitFobValue')?.value || 0;
    item.patchValue({ fobValue: quantity * unitValue });
    this.calculateTotals();
  }

  onIncotermChange() {
    this.calculateTotals();
  }

  onCurrencyChange() {
    // Update exchange rate based on currency
    const rates: Record<string, number> = {
      'EUR': 655.957,
      'USD': 600,
      'GBP': 760,
      'CNY': 85,
      'XAF': 1
    };
    const currency = this.generalForm.get('currency')?.value;
    this.generalForm.patchValue({ exchangeRate: rates[currency] || 1 });
    this.calculateTotals();
  }

  onSpecialMerchandiseChange() {
    this.calculateRouting();
  }

  calculateTotals() {
    // Calculate total FOB from items
    this.totalFobValue = this.goodsItems.controls.reduce((sum, item) => {
      return sum + (item.get('fobValue')?.value || 0);
    }, 0);

    const exchangeRate = this.generalForm.get('exchangeRate')?.value || 1;
    const fobCharges = this.generalForm.get('fobCharges')?.value || 0;
    const freightAmount = this.generalForm.get('freightAmount')?.value || 0;
    const insuranceAmount = this.generalForm.get('insuranceAmount')?.value || 0;

    this.totalFobValueXaf = (this.totalFobValue + fobCharges) * exchangeRate;
    this.totalFreightInsurance = (freightAmount + insuranceAmount) * exchangeRate;
    this.totalAmountXaf = this.totalFobValueXaf + this.totalFreightInsurance;

    this.calculateRouting();
  }

  calculateRouting() {
    const hasSpecialMerchandise = this.goodsItems.controls.some(item =>
      item.get('isUsedVehicle')?.value ||
      item.get('isPoultryChicks')?.value ||
      item.get('isEggs')?.value
    );

    const isPviExempt = this.generalForm.get('isPviExempt')?.value;

    // Determine routing
    if (hasSpecialMerchandise) {
      this.routingDestination = 'CUSTOMS';
      this.routingReason = 'Marchandises spéciales (véhicules occasion, poussins, œufs)';
    } else if (this.totalFobValueXaf > this.SGS_THRESHOLD) {
      this.routingDestination = 'SGS';
      this.routingReason = 'Valeur FOB > 1 000 000 FCFA';
    } else {
      this.routingDestination = 'CUSTOMS';
      this.routingReason = 'Valeur FOB ≤ 1 000 000 FCFA';
    }

    // Calculate inspection fee
    if (isPviExempt) {
      this.inspectionFee = 0;
    } else if (this.routingDestination === 'SGS') {
      const calculated = this.totalFobValueXaf * this.SGS_RATE;
      this.inspectionFee = Math.max(calculated, this.SGS_MINIMUM);
    } else {
      this.inspectionFee = this.CUSTOMS_FEE;
    }

    this.totalFees = this.inspectionFee + this.FISCAL_STAMP;

    // Determine payment channel
    if (this.totalFobValueXaf >= this.BANK_PAYMENT_THRESHOLD) {
      this.paymentChannelLabel = 'Banque (PayOnline)';
    } else {
      this.paymentChannelLabel = 'Campost / CNCC';
    }
  }

  loadDeclaration() {
    // Load existing declaration data
    console.log('Loading declaration', this.declarationReference);
  }

  uploadDocument(doc: any) {
    // Simulate file upload
    doc.uploaded = true;
    doc.fileName = 'document.pdf';
  }

  getImportTypeLabel(): string {
    const labels: Record<string, string> = {
      'CLASSIQUE': 'Classique',
      'GROUPAGE': 'Groupage',
      'MEDICAMENTS': 'Médicaments',
      'TRANSIT': 'Transit'
    };
    return labels[this.importType || ''] || '';
  }

  getCountryName(code: string): string {
    return this.countries.find(c => c.code === code)?.name || code;
  }

  formatCurrency(amount: number, currency = 'XAF'): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount);
  }

  canSubmit(): boolean {
    return this.importerForm.valid &&
           this.supplierForm.valid &&
           this.generalForm.valid &&
           this.goodsForm.valid &&
           this.confirmed;
  }

  saveDraft() {
    this.saving = true;
    setTimeout(() => {
      this.saving = false;
      this.snackBar.open('Brouillon enregistré', 'Fermer', { duration: 3000 });
    }, 1000);
  }

  submit() {
    if (!this.canSubmit()) return;

    this.saving = true;
    setTimeout(() => {
      this.saving = false;
      this.snackBar.open(
        `Déclaration soumise avec succès. Routage: ${this.routingDestination}`,
        'Fermer',
        { duration: 5000 }
      );
      this.router.navigate(['/e-force/import-declarations']);
    }, 1500);
  }

  goBack() {
    this.router.navigate(['/e-force/import-declarations']);
  }
}
