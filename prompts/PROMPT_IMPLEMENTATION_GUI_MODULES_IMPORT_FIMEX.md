# PROMPT D'IMPLÉMENTATION DES INTERFACES GRAPHIQUES UTILISATEURS
## MODULES : DÉCLARATION D'IMPORTATION COMPLÈTE & FIMEX
### Projet e-GUCE 3G - Cameroun

---

## 🎯 OBJECTIF GLOBAL

Implémenter les interfaces graphiques utilisateurs (GUI) front-end complètes pour deux modules critiques du système e-GUCE 3G Cameroun :
1. **Module Déclaration d'Importation Complète** (Circuit complet Import)
2. **Module FIMEX** (Fichier des Importateurs et Exportateurs)

L'implémentation doit suivre l'approche **Low-Code à 80%** avec génération automatique de code, tout en assurant une intégration complète avec les back-ends, les bases de données et l'alimentation initiale des données de référence.

---

## 📋 CONTEXTE DU PROJET e-GUCE 3G

### Vision Stratégique
- **Plateforme Socle Générique** pour Guichets Uniques du Commerce Extérieur
- **Multi-Instance** : Déploiement pour différents pays (Cameroun, Tchad, RCA)
- **Configuration vs Développement** : 80% configuration / 20% code personnalisé
- **Conformité Internationale** : Alignement UN/CEFACT (Modèle Buy-Ship-Pay), OMD, Recommandation 33
- **Time-to-Market** : Réduction drastique du délai de mise en œuvre de nouvelles procédures

### Hiérarchie des Processus Métier (5 niveaux)
```
1. SENS (Import / Export / Transit)
   └── 2. PHASE (Préalables / Transaction / Expédition / Prise en charge / Dédouanement / Enlèvement)
       └── 3. CIRCUIT (Préalables / Dédouanement / etc.)
           └── 4. PROCÉDURE (FIMEX, Déclaration Import, Visa Technique, etc.)
               └── 5. PROCESSUS (NEW / MODIFICATION / ANNULATION / PROROGATION / PAYEMENT / RENOUVELLEMENT)
```

---

## 🏗️ ARCHITECTURE TECHNIQUE

### Stack Technologique

#### Frontend
- **Framework Principal** : Angular 20
- **Langage** : TypeScript
- **Formulaires** : Angular Reactive Forms (FormBuilder, FormGroup, Validators)
- **État** : RxJS (Observable, BehaviorSubject)
- **HTTP Client** : Angular HttpClient
- **Routing** : Angular Router avec Guards
- **UI Components** : Material Design / PrimeNG / Composants personnalisés
- **Validation** : Côté client (Angular) + Côté serveur
- **Internationalisation** : i18n (Français / Anglais minimum)
- **Responsive Design** : Desktop / Tablette / Mobile
- **Tests** : Jasmine/Karma (unitaires) + Cypress/Playwright (E2E)

#### Backend
- **Framework** : Spring Boot 3.x
- **Langage** : Java
- **Architecture** : Microservices
- **API** : REST (Controllers avec @RestController)
- **Sécurité** : Spring Security + Keycloak (SSO)
- **Base de Données** : 
  - PostgreSQL (données relationnelles)
  - MongoDB (documents NoSQL si nécessaire)
- **ORM** : JPA / Hibernate
- **DTO/Entity Mapping** : MapStruct
- **Migration DB** : Liquibase / Flyway
- **Tests** : JUnit 5 + Mockito

#### Orchestration & Règles Métier
- **Moteur Workflow** : Camunda 8 (BPMN 2.0)
- **Moteur de Règles** : Drools 8 (DMN - Decision Model and Notation)
- **Event Streaming** : Apache Kafka 4.x
- **API Gateway** : Spring Cloud Gateway

#### Déploiement
- **Conteneurisation** : Docker
- **Orchestration** : Kubernetes
- **CI/CD** : GitLab CI / Jenkins
- **Monitoring** : Prometheus + Grafana
- **Logging** : ELK Stack (Elasticsearch, Logstash, Kibana)

---

## 📦 MODULE 1 : DÉCLARATION D'IMPORTATION COMPLÈTE

### Vue d'ensemble
Circuit complet d'importation couvrant toutes les phases depuis les préalables jusqu'à l'enlèvement des marchandises.

### Phases du Circuit d'Importation

#### PHASE 1 : PRÉALABLES
**Procédures incluses :**
1. **Échange données fiscales et commerce** (DGI) - Service
2. **AMM** - Autorisation Mise sur le Marché (MINSANTE) - Registre
3. **Inscription FIMEX** (MINCOMMERCE) - Voir Module 2
4. **Autorisation spéciale** (MINCOMMERCE)
5. **Déclaration importation engrais/pesticides** (MINADER)
6. **Avis technique** (MINEPIA)
7. **Autorisation d'importation** (MINMIDT / MINADER)
8. **Permis d'importation** (MINADER)

#### PHASE 2 : TRANSACTION
**Procédures incluses :**
1. **Déclaration d'importation** (Opérateur via e-Force)
2. **Spécification** (SGS)
3. **Domiciliation bancaire** (Banques)
4. **Réglementation de changes** (Banques)

#### PHASE 3 : EXPÉDITION
**Procédures incluses :**
1. **BESC** - Bulletin d'Engagement de Suivi de Cargaison (CNCC / COC TCHAD)
2. **CIVIC** - Certificat d'Inspection des Véhicules d'Occasion (SGS)
3. **Visa technique** (MINEPDED / MINSANTE)
4. **Attestation vérification à l'import** (SGS)
5. **Certificat phytosanitaire** (MINADER)
6. **PVI** - Procès-Verbal d'Inspection Phytosanitaire (MINADER)
7. **RVC** - Rapport de Vérification à la Cargaison (SGS)
8. **CAH** - Certificat d'Assurance Harmonisé (ASAC)

#### PHASE 4 : PRISE EN CHARGE
**Procédures incluses :**
1. **Manifeste Import** (Douane)
2. **Formulaires OMI** (DAMVN)
3. **Formulaires OACI** (OACI)
4. **Inspection navires** (MINT - DAMVN)
5. **Données inspection navires Convention d'Abuja** (MINT)

#### PHASE 5 : DÉDOUANEMENT
**Procédures incluses :**
1. **Déclaration Douane DAU** (Douane)
2. **Avis de paiement** (Douane)
3. **Quittance Douane** (Douane)
4. **Redevance Marchandise** (PAK)
5. **Déclaration de Fret** (BGFT)
6. **Lettre Voiture Internationale** (BGFT)
7. **Paiement électronique** (Banques)

#### PHASE 6 : ENLÈVEMENT
**Procédures incluses :**
1. **Données d'enlèvement** (Douane - Service CAMCIS)
2. **Document unique de sortie**
3. **Bon de livraison**
4. **Constat de sortie**
5. **BAE** - Bon à Enlever (Douane)
6. **BAD** - Bon à Délivrer (Consignataire)

### Processus Métier Transversaux
Pour chaque procédure, gérer les processus suivants :
- **NEW** : Nouvelle demande/déclaration
- **MODIFICATION/AMENDEMENT** : Modification d'une demande existante
- **ANNULATION** : Annulation d'une procédure
- **PROROGATION** : Extension de validité
- **PAYEMENT** : Traitement des paiements
- **RENOUVELLEMENT** : Renouvellement annuel (pour certaines procédures)

### Données Principales - Déclaration d'Importation

#### Informations Opérateur
```typescript
interface Operateur {
  numeroFIMEX: string;
  raisonSociale: string;
  ninea: string; // Numéro identification nationale des entreprises
  registreCommerce: string;
  adresse: Adresse;
  telephone: string;
  email: string;
  representantLegal: PersonnePhysique;
}
```

#### Informations Marchandises
```typescript
interface Marchandise {
  designationCommerciale: string;
  codeDouanier: string; // Code SH (Système Harmonisé)
  positionTarifaire: string;
  quantite: number;
  unite: string;
  poidsBrut: number;
  poidsNet: number;
  valeurFOB: number;
  valeurCAF: number;
  devise: string;
  paysOrigine: string;
  familleProducteur?: string;
  sousFamille?: string;
}
```

#### Documents Justificatifs
```typescript
interface PieceJointe {
  id: string;
  type: TypeDocument;
  nom: string;
  tailleOctets: number;
  dateUpload: Date;
  chemin: string;
  obligatoire: boolean;
  statut: 'EN_ATTENTE' | 'VALIDÉ' | 'REJETÉ';
}

enum TypeDocument {
  FACTURE_PROFORMA = 'FACTURE_PROFORMA',
  FACTURE_FINALE = 'FACTURE_FINALE',
  BL = 'BL', // Connaissement (Bill of Lading)
  LISTE_COLISAGE = 'LISTE_COLISAGE',
  CERTIFICAT_ORIGINE = 'CERTIFICAT_ORIGINE',
  ATTESTATION_CONFORMITE_FISCALE = 'ATTESTATION_CONFORMITE_FISCALE',
  CARTE_CONTRIBUABLE = 'CARTE_CONTRIBUABLE',
  AUTORISATION_IMPORTATION = 'AUTORISATION_IMPORTATION',
  // ... autres documents
}
```

#### Workflow et Statuts
```typescript
interface DossierImportation {
  numeroDossier: string;
  dateCreation: Date;
  operateur: Operateur;
  marchandises: Marchandise[];
  piecesJointes: PieceJointe[];
  phase: PhaseCircuit;
  procedures: ProcedureStatus[];
  statut: StatutDossier;
  historique: EvenementDossier[];
}

enum StatutDossier {
  BROUILLON = 'BROUILLON',
  SOUMIS = 'SOUMIS',
  EN_TRAITEMENT = 'EN_TRAITEMENT',
  EN_ATTENTE_DOCUMENTS = 'EN_ATTENTE_DOCUMENTS',
  EN_ATTENTE_PAIEMENT = 'EN_ATTENTE_PAIEMENT',
  APPROUVÉ = 'APPROUVÉ',
  REJETÉ = 'REJETÉ',
  CLOTURÉ = 'CLOTURÉ',
  ANNULÉ = 'ANNULÉ'
}
```

### Écrans à Implémenter - Module Déclaration Import

#### 1. Dashboard Opérateur
**Chemin** : `/import/dashboard`

**Fonctionnalités** :
- Vue d'ensemble des dossiers en cours
- Statistiques (nombre de dossiers par statut)
- Alertes et notifications
- Raccourcis vers actions principales
- Recherche rapide de dossiers

**Composants Angular** :
```typescript
@Component({
  selector: 'app-import-dashboard',
  templateUrl: './import-dashboard.component.html',
  styleUrls: ['./import-dashboard.component.scss']
})
export class ImportDashboardComponent implements OnInit {
  dossiers$: Observable<DossierImportation[]>;
  statistiques$: Observable<StatistiquesDossiers>;
  notifications$: Observable<Notification[]>;
  
  constructor(
    private dossierService: DossierImportationService,
    private notificationService: NotificationService
  ) {}
}
```

#### 2. Création Nouveau Dossier d'Importation
**Chemin** : `/import/nouveau-dossier`

**Étapes (Wizard Multi-Steps)** :
1. **Étape 1 : Informations Générales**
   - Type d'importation
   - Régime douanier
   - Mode de transport
   - Port/Aéroport d'entrée

2. **Étape 2 : Informations Opérateur**
   - Sélection/Vérification profil opérateur
   - Vérification validité FIMEX
   - Représentant déclarant

3. **Étape 3 : Marchandises**
   - Liste des marchandises (table dynamique)
   - Recherche codes douaniers (autocomplete)
   - Calculs automatiques (valeurs, taxes)

4. **Étape 4 : Documents Justificatifs**
   - Upload multi-fichiers
   - Prévisualisation
   - Validation format/taille

5. **Étape 5 : Révision et Soumission**
   - Récapitulatif complet
   - Aperçu PDF
   - Signature électronique (si requis)
   - Soumission finale

**Formulaire Réactif** :
```typescript
@Component({
  selector: 'app-nouveau-dossier-import',
  templateUrl: './nouveau-dossier-import.component.html'
})
export class NouveauDossierImportComponent implements OnInit {
  dossierForm: FormGroup;
  currentStep = 1;
  totalSteps = 5;
  
  constructor(
    private fb: FormBuilder,
    private dossierService: DossierImportationService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.initializeForm();
  }
  
  private initializeForm(): void {
    this.dossierForm = this.fb.group({
      informationsGenerales: this.fb.group({
        typeImportation: ['', Validators.required],
        regimeDouanier: ['', Validators.required],
        modeTransport: ['', Validators.required],
        lieuEntree: ['', Validators.required]
      }),
      operateur: this.fb.group({
        numeroFIMEX: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{10}$/)]],
        // ... autres champs
      }),
      marchandises: this.fb.array([
        this.createMarchandiseFormGroup()
      ], Validators.minLength(1)),
      piecesJointes: this.fb.array([])
    });
  }
  
  private createMarchandiseFormGroup(): FormGroup {
    return this.fb.group({
      designation: ['', Validators.required],
      codeDouanier: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      quantite: [null, [Validators.required, Validators.min(0.01)]],
      unite: ['', Validators.required],
      valeurFOB: [null, [Validators.required, Validators.min(0)]],
      paysOrigine: ['', Validators.required]
    });
  }
  
  nextStep(): void {
    if (this.isCurrentStepValid()) {
      this.currentStep++;
    }
  }
  
  submitDossier(): void {
    if (this.dossierForm.valid) {
      this.dossierService.createDossier(this.dossierForm.value)
        .subscribe({
          next: (response) => {
            this.router.navigate(['/import/dossier', response.numeroDossier]);
          },
          error: (error) => this.handleError(error)
        });
    }
  }
}
```

#### 3. Détail Dossier d'Importation
**Chemin** : `/import/dossier/:numeroDossier`

**Sections** :
- Informations générales (lecture seule sauf si statut = BROUILLON)
- Procédures associées (liste avec statuts)
- Documents justificatifs
- Historique des actions
- Commentaires/Messages
- Actions disponibles (selon statut)

**Tabs** :
```html
<mat-tab-group>
  <mat-tab label="Vue d'ensemble">
    <app-dossier-overview [dossier]="dossier"></app-dossier-overview>
  </mat-tab>
  <mat-tab label="Marchandises">
    <app-dossier-marchandises [marchandises]="dossier.marchandises"></app-dossier-marchandises>
  </mat-tab>
  <mat-tab label="Procédures">
    <app-dossier-procedures [procedures]="dossier.procedures"></app-dossier-procedures>
  </mat-tab>
  <mat-tab label="Documents">
    <app-dossier-documents [documents]="dossier.piecesJointes"></app-dossier-documents>
  </mat-tab>
  <mat-tab label="Paiements">
    <app-dossier-paiements [paiements]="dossier.paiements"></app-dossier-paiements>
  </mat-tab>
  <mat-tab label="Historique">
    <app-dossier-historique [historique]="dossier.historique"></app-dossier-historique>
  </mat-tab>
</mat-tab-group>
```

#### 4. Gestion des Procédures
**Chemin** : `/import/dossier/:numeroDossier/procedure/:codeProcedure`

**Fonctionnalités** :
- Formulaire spécifique à chaque procédure
- Validation selon règles métier (Drools)
- Workflow BPMN (Camunda)
- Upload documents spécifiques
- Calcul automatique des frais
- Interface paiement

#### 5. Liste des Dossiers d'Importation
**Chemin** : `/import/dossiers`

**Fonctionnalités** :
- Tableau paginé avec tri/filtres
- Recherche avancée multi-critères
- Export Excel/PDF
- Actions groupées
- Filtres par statut, date, opérateur, etc.

```typescript
@Component({
  selector: 'app-liste-dossiers-import',
  templateUrl: './liste-dossiers-import.component.html'
})
export class ListeDossiersImportComponent implements OnInit {
  dataSource: MatTableDataSource<DossierImportation>;
  displayedColumns = ['numeroDossier', 'dateCreation', 'operateur', 'statut', 'actions'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  filterForm: FormGroup;
  
  constructor(
    private dossierService: DossierImportationService,
    private fb: FormBuilder
  ) {}
  
  ngOnInit(): void {
    this.initializeFilters();
    this.loadDossiers();
  }
  
  private initializeFilters(): void {
    this.filterForm = this.fb.group({
      numeroDossier: [''],
      statut: [null],
      dateDebut: [null],
      dateFin: [null],
      operateur: ['']
    });
    
    this.filterForm.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => this.applyFilters());
  }
  
  loadDossiers(): void {
    this.dossierService.getDossiers(this.filterForm.value)
      .subscribe(dossiers => {
        this.dataSource = new MatTableDataSource(dossiers);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
  }
}
```

#### 6. Traitement Administration (e-Gov)
**Chemin** : `/admin/import/traitement`

**Fonctionnalités** :
- File d'attente des demandes
- Traitement par lot
- Validation/Rejet
- Génération documents officiels
- Envoi notifications

---

## 📦 MODULE 2 : FIMEX (Fichier des Importateurs et Exportateurs)

### Vue d'ensemble
Le FIMEX est un registre obligatoire géré par le MINCOMMERCE pour tous les opérateurs du commerce extérieur au Cameroun. C'est une procédure préalable indispensable pour pouvoir effectuer des opérations d'importation ou d'exportation.

### Processus FIMEX

#### 1. NEW - Nouvelle Inscription
**Acteur** : MINCOMMERCE
**Type** : Procédure (P)
**Durée de validité** : 1 an (renouvellement annuel obligatoire)

**Pièces Justificatives Obligatoires - IMPORT** :
- Attestation de conformité fiscale
- Registre de commerce
- Carte de contribuable

**Pièces Justificatives Obligatoires - EXPORT** :
- Attestation de conformité fiscale
- Registre de commerce et du crédit immobilier
- Carte de contribuable
- Attestation d'immatriculation
- Attestation de localisation signée par services fiscaux
- Carte nationale d'identité
- Copie agrément activité commerciale (le cas échéant)
- Copie autorisation exportation produits concernés (le cas échéant)
- Déclaration sur l'honneur (exportateurs cacao, café, bois, plantes médicinales)

#### 2. RENOUVELLEMENT ANNUEL
**Déclenchement** : Automatique 60 jours avant expiration
**Notification** : Email/SMS à l'opérateur
**Particularité** : Nouveau numéro FIMEX généré lors du renouvellement

#### 3. AMENDEMENT
**Cas d'usage** : Modification des informations de l'entreprise
- Changement d'adresse
- Changement de représentant légal
- Modification activités
- Changement dénomination sociale

#### 4. PAYEMENT
**Montants** : Selon grille tarifaire MINCOMMERCE
**Modes de paiement** : 
- Paiement électronique (e-Payment)
- Virement bancaire
- Chèque certifié

### Données FIMEX

```typescript
interface InscriptionFIMEX {
  numeroFIMEX: string; // Format: FIMEX-YYYY-XXXXXX
  typeInscription: 'IMPORT' | 'EXPORT' | 'IMPORT_EXPORT';
  statut: StatutFIMEX;
  
  // Informations Entreprise
  entreprise: {
    raisonSociale: string;
    formeJuridique: string;
    numeroRegistreCommerce: string;
    ninea: string;
    capitalSocial: number;
    dateCreation: Date;
    secteurActivite: string[];
    activitesPrincipales: string[];
  };
  
  // Adresse
  siege: {
    adresseComplete: string;
    ville: string;
    region: string;
    boitePostale?: string;
    telephone: string;
    fax?: string;
    email: string;
    siteWeb?: string;
  };
  
  // Représentant Légal
  representantLegal: {
    civilite: 'M' | 'Mme' | 'Mlle';
    nom: string;
    prenom: string;
    fonction: string;
    nationalite: string;
    numeroCNI: string;
    dateNaissanceCNI: Date;
    lieuNaissance: string;
    telephone: string;
    email: string;
  };
  
  // Informations Fiscales
  fiscalite: {
    numeroCarteContribuable: string;
    centreImpots: string;
    attestationConformiteFiscale: PieceJointe;
    dateValiditeAttestation: Date;
  };
  
  // Validité
  dateInscription: Date;
  dateExpiration: Date;
  dateRenouvellement?: Date;
  
  // Documents
  piecesJointes: PieceJointe[];
  
  // Workflow
  workflowInstanceId?: string;
  tachemEnCours?: string;
  historiqueTraitement: EvenementFIMEX[];
}

enum StatutFIMEX {
  BROUILLON = 'BROUILLON',
  SOUMIS = 'SOUMIS',
  EN_VERIFICATION = 'EN_VERIFICATION',
  EN_ATTENTE_DOCUMENTS = 'EN_ATTENTE_DOCUMENTS',
  EN_ATTENTE_PAIEMENT = 'EN_ATTENTE_PAIEMENT',
  APPROUVÉ = 'APPROUVÉ',
  ACTIF = 'ACTIF',
  EXPIRE = 'EXPIRE',
  SUSPENDU = 'SUSPENDU',
  REJETÉ = 'REJETÉ',
  ANNULÉ = 'ANNULÉ'
}
```

### Écrans à Implémenter - Module FIMEX

#### 1. Dashboard FIMEX Opérateur
**Chemin** : `/fimex/dashboard`

**Widgets** :
- Statut inscription courante
- Alertes renouvellement
- Historique inscriptions
- Documents à jour / à renouveler
- Statistiques d'utilisation

#### 2. Nouvelle Inscription FIMEX
**Chemin** : `/fimex/nouvelle-inscription`

**Wizard 5 Étapes** :

**Étape 1 : Type d'Inscription**
```typescript
typeInscription: FormControl<'IMPORT' | 'EXPORT' | 'IMPORT_EXPORT'>
```

**Étape 2 : Informations Entreprise**
- Données juridiques
- Activités principales
- Capital social

**Étape 3 : Représentant Légal**
- État civil complet
- Coordonnées
- CNI

**Étape 4 : Documents Justificatifs**
- Upload selon type inscription (Import/Export)
- Validation format/taille
- Vérification obligatoire

**Étape 5 : Révision & Paiement**
- Récapitulatif
- Calcul frais
- Redirection e-Payment
- Soumission

```typescript
@Component({
  selector: 'app-nouvelle-inscription-fimex',
  templateUrl: './nouvelle-inscription-fimex.component.html'
})
export class NouvelleInscriptionFimexComponent implements OnInit, OnDestroy {
  inscriptionForm: FormGroup;
  currentStep = 1;
  totalSteps = 5;
  
  pieceJustificativesRequises: TypeDocument[] = [];
  
  constructor(
    private fb: FormBuilder,
    private fimexService: FimexService,
    private paymentService: PaymentService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.initializeForm();
    this.watchTypeInscription();
  }
  
  private initializeForm(): void {
    this.inscriptionForm = this.fb.group({
      typeInscription: ['', Validators.required],
      entreprise: this.fb.group({
        raisonSociale: ['', Validators.required],
        formeJuridique: ['', Validators.required],
        numeroRegistreCommerce: ['', [Validators.required, Validators.pattern(/^RC\/[A-Z]{3}\/\d+\/[A-Z]\/\d+$/)]],
        ninea: ['', [Validators.required, Validators.pattern(/^M\d{13}$/)]],
        capitalSocial: [null, [Validators.required, Validators.min(0)]],
        dateCreation: [null, Validators.required],
        secteurActivite: [[], Validators.required],
        activitesPrincipales: [[], [Validators.required, Validators.minLength(1)]]
      }),
      siege: this.fb.group({
        adresseComplete: ['', Validators.required],
        ville: ['', Validators.required],
        region: ['', Validators.required],
        boitePostale: [''],
        telephone: ['', [Validators.required, Validators.pattern(/^\+237[26]\d{8}$/)]],
        email: ['', [Validators.required, Validators.email]],
        siteWeb: ['', Validators.pattern(/^https?:\/\/.+$/)]
      }),
      representantLegal: this.fb.group({
        civilite: ['', Validators.required],
        nom: ['', Validators.required],
        prenom: ['', Validators.required],
        fonction: ['', Validators.required],
        nationalite: ['', Validators.required],
        numeroCNI: ['', [Validators.required, Validators.pattern(/^\d{9,12}$/)]],
        dateNaissanceCNI: [null, Validators.required],
        lieuNaissance: ['', Validators.required],
        telephone: ['', [Validators.required, Validators.pattern(/^\+237[26]\d{8}$/)]],
        email: ['', [Validators.required, Validators.email]]
      }),
      fiscalite: this.fb.group({
        numeroCarteContribuable: ['', Validators.required],
        centreImpots: ['', Validators.required],
        dateValiditeAttestation: [null, Validators.required]
      }),
      piecesJointes: this.fb.array([], Validators.required)
    });
  }
  
  private watchTypeInscription(): void {
    this.inscriptionForm.get('typeInscription')?.valueChanges
      .subscribe(type => {
        this.updateRequiredDocuments(type);
      });
  }
  
  private updateRequiredDocuments(type: 'IMPORT' | 'EXPORT' | 'IMPORT_EXPORT'): void {
    if (type === 'IMPORT') {
      this.pieceJustificativesRequises = [
        TypeDocument.ATTESTATION_CONFORMITE_FISCALE,
        TypeDocument.REGISTRE_COMMERCE,
        TypeDocument.CARTE_CONTRIBUABLE
      ];
    } else if (type === 'EXPORT') {
      this.pieceJustificativesRequises = [
        TypeDocument.ATTESTATION_CONFORMITE_FISCALE,
        TypeDocument.REGISTRE_COMMERCE,
        TypeDocument.CARTE_CONTRIBUABLE,
        TypeDocument.ATTESTATION_IMMATRICULATION,
        TypeDocument.ATTESTATION_LOCALISATION,
        TypeDocument.CNI,
        // ... autres documents export
      ];
    } else { // IMPORT_EXPORT
      this.pieceJustificativesRequises = [
        ...new Set([
          // Union des documents import + export
        ])
      ];
    }
  }
  
  submitInscription(): void {
    if (this.inscriptionForm.valid) {
      this.fimexService.createInscription(this.inscriptionForm.value)
        .pipe(
          switchMap(inscription => {
            // Redirection vers paiement si requis
            if (inscription.montantAPayer > 0) {
              return this.paymentService.initiatePayment({
                reference: inscription.numeroFIMEX,
                montant: inscription.montantAPayer,
                description: 'Inscription FIMEX'
              });
            }
            return of(inscription);
          })
        )
        .subscribe({
          next: (response) => {
            this.router.navigate(['/fimex/inscription', response.numeroFIMEX]);
          },
          error: (error) => this.handleError(error)
        });
    }
  }
}
```

#### 3. Détail Inscription FIMEX
**Chemin** : `/fimex/inscription/:numeroFIMEX`

**Sections** :
- Carte récapitulative (statut, validité, actions)
- Informations entreprise
- Représentant légal
- Documents
- Historique
- Actions : Renouveler / Amender / Télécharger Certificat

**Alertes** :
- Expiration imminente (< 30 jours)
- Documents manquants
- Paiement en attente

#### 4. Renouvellement FIMEX
**Chemin** : `/fimex/renouvellement/:numeroFIMEX`

**Fonctionnalités** :
- Pré-remplissage avec données existantes
- Mise à jour informations si nécessaire
- Vérification/Upload nouveaux documents
- Paiement
- Génération nouveau numéro FIMEX

```typescript
@Component({
  selector: 'app-renouvellement-fimex',
  templateUrl: './renouvellement-fimex.component.html'
})
export class RenouvellementFimexComponent implements OnInit {
  inscriptionActuelle: InscriptionFIMEX;
  renouvellementForm: FormGroup;
  
  constructor(
    private route: ActivatedRoute,
    private fimexService: FimexService,
    private fb: FormBuilder
  ) {}
  
  ngOnInit(): void {
    const numeroFIMEX = this.route.snapshot.paramMap.get('numeroFIMEX');
    this.loadInscriptionActuelle(numeroFIMEX);
  }
  
  private loadInscriptionActuelle(numeroFIMEX: string): void {
    this.fimexService.getInscription(numeroFIMEX)
      .subscribe(inscription => {
        this.inscriptionActuelle = inscription;
        this.initializeFormWithExistingData(inscription);
      });
  }
  
  private initializeFormWithExistingData(inscription: InscriptionFIMEX): void {
    this.renouvellementForm = this.fb.group({
      // Pré-remplir avec données existantes
      entreprise: this.fb.group({
        raisonSociale: [inscription.entreprise.raisonSociale, Validators.required],
        // ... autres champs
      }),
      // Champs modifiables
      modificationAdresse: [false],
      nouvelleAdresse: this.fb.group({
        // Optionnel selon checkbox
      }),
      documentsRenouveles: this.fb.array([])
    });
  }
  
  submitRenouvellement(): void {
    if (this.renouvellementForm.valid) {
      this.fimexService.renewInscription(
        this.inscriptionActuelle.numeroFIMEX,
        this.renouvellementForm.value
      ).subscribe({
        next: (nouvelleInscription) => {
          this.router.navigate(['/fimex/inscription', nouvelleInscription.numeroFIMEX]);
        },
        error: (error) => this.handleError(error)
      });
    }
  }
}
```

#### 5. Amendement FIMEX
**Chemin** : `/fimex/amendement/:numeroFIMEX`

**Types de modifications** :
- Changement adresse siège
- Changement représentant légal
- Modification activités
- Changement dénomination sociale
- Mise à jour documents

#### 6. Liste Inscriptions FIMEX (Admin MINCOMMERCE)
**Chemin** : `/admin/fimex/inscriptions`

**Fonctionnalités** :
- Table avec filtres avancés
- Export rapports
- Validation/Rejet en masse
- Statistiques (nouveaux, renouvellements, actifs, expirés)
- Recherche multi-critères

#### 7. Traitement Inscription (Admin MINCOMMERCE)
**Chemin** : `/admin/fimex/traitement/:numeroFIMEX`

**Fonctionnalités** :
- Vérification documents
- Validation conformité
- Génération numéro FIMEX
- Édition certificat FIMEX
- Notification opérateur
- Rejet avec motifs

---

## 🔗 INTÉGRATION BACKEND

### Architecture API REST

#### Controllers Spring Boot

```java
@RestController
@RequestMapping("/api/v1/import")
@Validated
public class DossierImportationController {
    
    @Autowired
    private DossierImportationService dossierService;
    
    @Autowired
    private WorkflowService workflowService;
    
    @PostMapping("/dossiers")
    @PreAuthorize("hasRole('OPERATEUR')")
    public ResponseEntity<DossierImportationDTO> createDossier(
        @Valid @RequestBody CreateDossierRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        DossierImportationDTO dossier = dossierService.createDossier(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(dossier);
    }
    
    @GetMapping("/dossiers/{numeroDossier}")
    @PreAuthorize("hasAnyRole('OPERATEUR', 'ADMIN')")
    public ResponseEntity<DossierImportationDTO> getDossier(
        @PathVariable String numeroDossier
    ) {
        return dossierService.getDossierByNumero(numeroDossier)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/dossiers")
    @PreAuthorize("hasAnyRole('OPERATEUR', 'ADMIN')")
    public ResponseEntity<Page<DossierImportationDTO>> getDossiers(
        @RequestParam(required = false) StatutDossier statut,
        @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate dateDebut,
        @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate dateFin,
        @PageableDefault(size = 20, sort = "dateCreation", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<DossierImportationDTO> dossiers = dossierService.searchDossiers(
            statut, dateDebut, dateFin, pageable
        );
        return ResponseEntity.ok(dossiers);
    }
    
    @PutMapping("/dossiers/{numeroDossier}")
    @PreAuthorize("hasRole('OPERATEUR')")
    public ResponseEntity<DossierImportationDTO> updateDossier(
        @PathVariable String numeroDossier,
        @Valid @RequestBody UpdateDossierRequest request
    ) {
        DossierImportationDTO updated = dossierService.updateDossier(numeroDossier, request);
        return ResponseEntity.ok(updated);
    }
    
    @PostMapping("/dossiers/{numeroDossier}/submit")
    @PreAuthorize("hasRole('OPERATEUR')")
    public ResponseEntity<Void> submitDossier(
        @PathVariable String numeroDossier
    ) {
        // Démarrage du workflow Camunda
        workflowService.startProcessInstance(
            "ProcessDeclarationImportation",
            numeroDossier
        );
        dossierService.changeStatut(numeroDossier, StatutDossier.SOUMIS);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/dossiers/{numeroDossier}/documents")
    @PreAuthorize("hasRole('OPERATEUR')")
    public ResponseEntity<PieceJointeDTO> uploadDocument(
        @PathVariable String numeroDossier,
        @RequestParam("file") MultipartFile file,
        @RequestParam("typeDocument") TypeDocument typeDocument
    ) {
        PieceJointeDTO document = dossierService.addDocument(numeroDossier, file, typeDocument);
        return ResponseEntity.status(HttpStatus.CREATED).body(document);
    }
    
    @DeleteMapping("/dossiers/{numeroDossier}/documents/{documentId}")
    @PreAuthorize("hasRole('OPERATEUR')")
    public ResponseEntity<Void> deleteDocument(
        @PathVariable String numeroDossier,
        @PathVariable String documentId
    ) {
        dossierService.removeDocument(numeroDossier, documentId);
        return ResponseEntity.noContent().build();
    }
}
```

```java
@RestController
@RequestMapping("/api/v1/fimex")
@Validated
public class FimexController {
    
    @Autowired
    private FimexService fimexService;
    
    @Autowired
    private WorkflowService workflowService;
    
    @PostMapping("/inscriptions")
    @PreAuthorize("hasRole('OPERATEUR')")
    public ResponseEntity<InscriptionFimexDTO> createInscription(
        @Valid @RequestBody CreateInscriptionRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        InscriptionFimexDTO inscription = fimexService.createInscription(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(inscription);
    }
    
    @GetMapping("/inscriptions/{numeroFIMEX}")
    @PreAuthorize("hasAnyRole('OPERATEUR', 'ADMIN_MINCOMMERCE')")
    public ResponseEntity<InscriptionFimexDTO> getInscription(
        @PathVariable String numeroFIMEX
    ) {
        return fimexService.getInscriptionByNumero(numeroFIMEX)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/inscriptions/{numeroFIMEX}/renew")
    @PreAuthorize("hasRole('OPERATEUR')")
    public ResponseEntity<InscriptionFimexDTO> renewInscription(
        @PathVariable String numeroFIMEX,
        @Valid @RequestBody RenewInscriptionRequest request
    ) {
        InscriptionFimexDTO renewed = fimexService.renewInscription(numeroFIMEX, request);
        return ResponseEntity.ok(renewed);
    }
    
    @PostMapping("/inscriptions/{numeroFIMEX}/amend")
    @PreAuthorize("hasRole('OPERATEUR')")
    public ResponseEntity<InscriptionFimexDTO> amendInscription(
        @PathVariable String numeroFIMEX,
        @Valid @RequestBody AmendInscriptionRequest request
    ) {
        InscriptionFimexDTO amended = fimexService.amendInscription(numeroFIMEX, request);
        return ResponseEntity.ok(amended);
    }
    
    @GetMapping("/inscriptions/{numeroFIMEX}/validate")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ValidationResponse> validateFimex(
        @PathVariable String numeroFIMEX
    ) {
        ValidationResponse validation = fimexService.validateFimex(numeroFIMEX);
        return ResponseEntity.ok(validation);
    }
    
    @PostMapping("/inscriptions/{numeroFIMEX}/approve")
    @PreAuthorize("hasRole('ADMIN_MINCOMMERCE')")
    public ResponseEntity<Void> approveInscription(
        @PathVariable String numeroFIMEX,
        @Valid @RequestBody ApprovalRequest request
    ) {
        fimexService.approveInscription(numeroFIMEX, request);
        workflowService.completeTask(request.getTaskId(), Map.of("approved", true));
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/inscriptions/{numeroFIMEX}/reject")
    @PreAuthorize("hasRole('ADMIN_MINCOMMERCE')")
    public ResponseEntity<Void> rejectInscription(
        @PathVariable String numeroFIMEX,
        @Valid @RequestBody RejectionRequest request
    ) {
        fimexService.rejectInscription(numeroFIMEX, request);
        workflowService.completeTask(request.getTaskId(), Map.of("approved", false, "reason", request.getReason()));
        return ResponseEntity.ok().build();
    }
}
```

### Services Métier

```java
@Service
@Transactional
public class DossierImportationService {
    
    @Autowired
    private DossierImportationRepository dossierRepository;
    
    @Autowired
    private MarchandiseRepository marchandiseRepository;
    
    @Autowired
    private PieceJointeRepository pieceJointeRepository;
    
    @Autowired
    private DossierMapper dossierMapper;
    
    @Autowired
    private RulesService rulesService;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private DocumentStorageService documentStorageService;
    
    public DossierImportationDTO createDossier(CreateDossierRequest request, String username) {
        // Validation métier via Drools
        ValidationResult validation = rulesService.validateDossierCreation(request);
        if (!validation.isValid()) {
            throw new BusinessValidationException(validation.getErrors());
        }
        
        // Création entité
        DossierImportation dossier = new DossierImportation();
        dossier.setNumeroDossier(generateNumeroDossier());
        dossier.setDateCreation(LocalDateTime.now());
        dossier.setStatut(StatutDossier.BROUILLON);
        dossier.setCreePar(username);
        
        // Mapping des données
        dossierMapper.updateEntityFromRequest(dossier, request);
        
        // Sauvegarde
        DossierImportation saved = dossierRepository.save(dossier);
        
        // Notification
        notificationService.notifyDossierCreated(saved);
        
        return dossierMapper.toDTO(saved);
    }
    
    public DossierImportationDTO updateDossier(String numeroDossier, UpdateDossierRequest request) {
        DossierImportation dossier = dossierRepository.findByNumeroDossier(numeroDossier)
            .orElseThrow(() -> new ResourceNotFoundException("Dossier non trouvé"));
        
        // Vérification autorisations
        if (!dossier.getStatut().equals(StatutDossier.BROUILLON)) {
            throw new BusinessException("Modification impossible - Dossier déjà soumis");
        }
        
        // Mise à jour
        dossierMapper.updateEntityFromRequest(dossier, request);
        dossier.setDateModification(LocalDateTime.now());
        
        DossierImportation updated = dossierRepository.save(dossier);
        return dossierMapper.toDTO(updated);
    }
    
    public PieceJointeDTO addDocument(String numeroDossier, MultipartFile file, TypeDocument typeDocument) {
        DossierImportation dossier = dossierRepository.findByNumeroDossier(numeroDossier)
            .orElseThrow(() -> new ResourceNotFoundException("Dossier non trouvé"));
        
        // Validation fichier
        validateDocument(file, typeDocument);
        
        // Stockage
        String storagePath = documentStorageService.store(file, numeroDossier);
        
        // Création entité
        PieceJointe document = new PieceJointe();
        document.setType(typeDocument);
        document.setNom(file.getOriginalFilename());
        document.setTailleOctets(file.getSize());
        document.setChemin(storagePath);
        document.setDateUpload(LocalDateTime.now());
        document.setDossier(dossier);
        
        PieceJointe saved = pieceJointeRepository.save(document);
        
        return dossierMapper.toPieceJointeDTO(saved);
    }
    
    private String generateNumeroDossier() {
        // Format: IMP-YYYY-NNNNNN
        String year = String.valueOf(LocalDate.now().getYear());
        Long sequence = dossierRepository.countByAnnee(year) + 1;
        return String.format("IMP-%s-%06d", year, sequence);
    }
    
    private void validateDocument(MultipartFile file, TypeDocument typeDocument) {
        // Validation taille
        if (file.getSize() > 10_000_000) { // 10 MB
            throw new DocumentValidationException("Fichier trop volumineux (max 10 MB)");
        }
        
        // Validation format
        String contentType = file.getContentType();
        List<String> allowedTypes = Arrays.asList("application/pdf", "image/jpeg", "image/png");
        if (!allowedTypes.contains(contentType)) {
            throw new DocumentValidationException("Format non autorisé");
        }
    }
}
```

```java
@Service
@Transactional
public class FimexService {
    
    @Autowired
    private InscriptionFimexRepository inscriptionRepository;
    
    @Autowired
    private FimexMapper fimexMapper;
    
    @Autowired
    private RulesService rulesService;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private PaymentService paymentService;
    
    public InscriptionFimexDTO createInscription(CreateInscriptionRequest request, String username) {
        // Validation métier
        ValidationResult validation = rulesService.validateFimexCreation(request);
        if (!validation.isValid()) {
            throw new BusinessValidationException(validation.getErrors());
        }
        
        // Vérification unicité (1 seule inscription active par entreprise)
        if (inscriptionRepository.existsActiveByNinea(request.getEntreprise().getNinea())) {
            throw new BusinessException("Une inscription active existe déjà pour cette entreprise");
        }
        
        // Création
        InscriptionFimex inscription = new InscriptionFimex();
        inscription.setNumeroFIMEX(generateNumeroFIMEX(request.getTypeInscription()));
        inscription.setDateInscription(LocalDate.now());
        inscription.setDateExpiration(LocalDate.now().plusYears(1));
        inscription.setStatut(StatutFIMEX.BROUILLON);
        inscription.setCreePar(username);
        
        fimexMapper.updateEntityFromRequest(inscription, request);
        
        InscriptionFimex saved = inscriptionRepository.save(inscription);
        
        return fimexMapper.toDTO(saved);
    }
    
    public InscriptionFimexDTO renewInscription(String numeroFIMEX, RenewInscriptionRequest request) {
        InscriptionFimex ancienneInscription = inscriptionRepository.findByNumeroFIMEX(numeroFIMEX)
            .orElseThrow(() -> new ResourceNotFoundException("Inscription FIMEX non trouvée"));
        
        // Vérification éligibilité renouvellement
        if (ancienneInscription.getDateExpiration().isAfter(LocalDate.now().plusDays(60))) {
            throw new BusinessException("Renouvellement possible uniquement 60 jours avant expiration");
        }
        
        // Création nouvelle inscription
        InscriptionFimex nouvelleInscription = new InscriptionFimex();
        nouvelleInscription.setNumeroFIMEX(generateNumeroFIMEX(ancienneInscription.getTypeInscription()));
        nouvelleInscription.setTypeInscription(ancienneInscription.getTypeInscription());
        nouvelleInscription.setDateInscription(LocalDate.now());
        nouvelleInscription.setDateExpiration(LocalDate.now().plusYears(1));
        nouvelleInscription.setStatut(StatutFIMEX.SOUMIS);
        nouvelleInscription.setInscriptionPrecedente(ancienneInscription);
        
        // Copie données entreprise avec mises à jour
        fimexMapper.copyWithUpdates(nouvelleInscription, ancienneInscription, request);
        
        InscriptionFimex saved = inscriptionRepository.save(nouvelleInscription);
        
        // Notification
        notificationService.notifyFimexRenewal(saved);
        
        return fimexMapper.toDTO(saved);
    }
    
    public ValidationResponse validateFimex(String numeroFIMEX) {
        Optional<InscriptionFimex> inscription = inscriptionRepository.findByNumeroFIMEX(numeroFIMEX);
        
        if (inscription.isEmpty()) {
            return ValidationResponse.builder()
                .valid(false)
                .message("Numéro FIMEX invalide")
                .build();
        }
        
        InscriptionFimex fimex = inscription.get();
        
        if (!fimex.getStatut().equals(StatutFIMEX.ACTIF)) {
            return ValidationResponse.builder()
                .valid(false)
                .message("FIMEX non actif - Statut: " + fimex.getStatut())
                .build();
        }
        
        if (fimex.getDateExpiration().isBefore(LocalDate.now())) {
            return ValidationResponse.builder()
                .valid(false)
                .message("FIMEX expiré le " + fimex.getDateExpiration())
                .build();
        }
        
        return ValidationResponse.builder()
            .valid(true)
            .message("FIMEX valide")
            .numeroFIMEX(numeroFIMEX)
            .raisonSociale(fimex.getEntreprise().getRaisonSociale())
            .typeInscription(fimex.getTypeInscription())
            .dateExpiration(fimex.getDateExpiration())
            .build();
    }
    
    private String generateNumeroFIMEX(String typeInscription) {
        // Format: FIMEX-YYYY-TNNNNNN (T = I pour Import, E pour Export, IE pour les deux)
        String year = String.valueOf(LocalDate.now().getYear());
        String prefix = typeInscription.equals("IMPORT") ? "I" :
                       typeInscription.equals("EXPORT") ? "E" : "IE";
        Long sequence = inscriptionRepository.countByAnneeAndType(year, typeInscription) + 1;
        return String.format("FIMEX-%s-%s%06d", year, prefix, sequence);
    }
}
```

### Intégration Camunda (Workflow)

```java
@Service
public class WorkflowService {
    
    @Autowired
    private RuntimeService runtimeService;
    
    @Autowired
    private TaskService taskService;
    
    @Autowired
    private HistoryService historyService;
    
    public String startProcessInstance(String processDefinitionKey, String businessKey) {
        ProcessInstance processInstance = runtimeService
            .startProcessInstanceByKey(processDefinitionKey, businessKey);
        return processInstance.getProcessInstanceId();
    }
    
    public void completeTask(String taskId, Map<String, Object> variables) {
        taskService.complete(taskId, variables);
    }
    
    public List<Task> getTasksForUser(String username) {
        return taskService.createTaskQuery()
            .taskAssignee(username)
            .orderByTaskCreateTime()
            .desc()
            .list();
    }
    
    public List<Task> getTasksForGroup(String groupId) {
        return taskService.createTaskQuery()
            .taskCandidateGroup(groupId)
            .orderByTaskCreateTime()
            .desc()
            .list();
    }
}
```

**Fichier BPMN - Déclaration Importation** : `ProcessDeclarationImportation.bpmn`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
                  targetNamespace="http://eguce.cm">
  
  <bpmn:process id="ProcessDeclarationImportation" name="Processus Déclaration Importation" isExecutable="true">
    
    <bpmn:startEvent id="StartEvent" name="Soumission Dossier">
      <bpmn:outgoing>Flow1</bpmn:outgoing>
    </bpmn:startEvent>
    
    <!-- Validation automatique documents -->
    <bpmn:serviceTask id="ValidateDocuments" name="Validation Documents" 
                      camunda:delegateExpression="${documentValidationDelegate}">
      <bpmn:incoming>Flow1</bpmn:incoming>
      <bpmn:outgoing>Flow2</bpmn:outgoing>
    </bpmn:serviceTask>
    
    <!-- Gateway: Documents complets? -->
    <bpmn:exclusiveGateway id="Gateway1" name="Documents complets?">
      <bpmn:incoming>Flow2</bpmn:incoming>
      <bpmn:outgoing>FlowDocumentsOK</bpmn:outgoing>
      <bpmn:outgoing>FlowDocumentsKO</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    
    <!-- Tâche utilisateur: Compléter documents -->
    <bpmn:userTask id="CompleteDocuments" name="Compléter Documents Manquants"
                   camunda:assignee="${operateur}">
      <bpmn:incoming>FlowDocumentsKO</bpmn:incoming>
      <bpmn:outgoing>Flow3</bpmn:outgoing>
    </bpmn:userTask>
    
    <!-- Vérification FIMEX -->
    <bpmn:serviceTask id="VerifyFIMEX" name="Vérification FIMEX"
                      camunda:delegateExpression="${fimexVerificationDelegate}">
      <bpmn:incoming>FlowDocumentsOK</bpmn:incoming>
      <bpmn:incoming>Flow3</bpmn:incoming>
      <bpmn:outgoing>Flow4</bpmn:outgoing>
    </bpmn:serviceTask>
    
    <!-- Déclenchement procédures selon SH -->
    <bpmn:serviceTask id="TriggerProcedures" name="Déclenchement Procédures Sectorielles"
                      camunda:delegateExpression="${procedureTriggerDelegate}">
      <bpmn:incoming>Flow4</bpmn:incoming>
      <bpmn:outgoing>Flow5</bpmn:outgoing>
    </bpmn:serviceTask>
    
    <!-- Sous-processus: Traitement procédures -->
    <bpmn:subProcess id="SubProcessProcedures" name="Traitement Procédures">
      <bpmn:incoming>Flow5</bpmn:incoming>
      <bpmn:outgoing>Flow6</bpmn:outgoing>
      
      <!-- Multi-instance pour chaque procédure -->
      <bpmn:multiInstanceLoopCharacteristics isSequential="false"
                                             camunda:collection="${procedures}"
                                             camunda:elementVariable="procedure"/>
      
      <!-- Tâche utilisateur admin -->
      <bpmn:userTask id="TraiterProcedure" name="Traiter Procédure"
                     camunda:candidateGroups="${procedure.administration}">
        <!-- Configuration dynamique selon type procédure -->
      </bpmn:userTask>
    </bpmn:subProcess>
    
    <!-- Calcul droits et taxes -->
    <bpmn:serviceTask id="CalculateFees" name="Calcul Droits et Taxes"
                      camunda:delegateExpression="${feeCalculationDelegate}">
      <bpmn:incoming>Flow6</bpmn:incoming>
      <bpmn:outgoing>Flow7</bpmn:outgoing>
    </bpmn:serviceTask>
    
    <!-- Paiement -->
    <bpmn:userTask id="Payment" name="Effectuer Paiement"
                   camunda:assignee="${operateur}">
      <bpmn:incoming>Flow7</bpmn:incoming>
      <bpmn:outgoing>Flow8</bpmn:outgoing>
    </bpmn:userTask>
    
    <!-- Génération documents officiels -->
    <bpmn:serviceTask id="GenerateDocuments" name="Génération Documents"
                      camunda:delegateExpression="${documentGenerationDelegate}">
      <bpmn:incoming>Flow8</bpmn:incoming>
      <bpmn:outgoing>Flow9</bpmn:outgoing>
    </bpmn:serviceTask>
    
    <!-- Notification -->
    <bpmn:serviceTask id="SendNotification" name="Notification Opérateur"
                      camunda:delegateExpression="${notificationDelegate}">
      <bpmn:incoming>Flow9</bpmn:incoming>
      <bpmn:outgoing>Flow10</bpmn:outgoing>
    </bpmn:serviceTask>
    
    <bpmn:endEvent id="EndEvent" name="Dossier Cloturé">
      <bpmn:incoming>Flow10</bpmn:incoming>
    </bpmn:endEvent>
    
    <!-- Flows -->
    <bpmn:sequenceFlow id="Flow1" sourceRef="StartEvent" targetRef="ValidateDocuments"/>
    <bpmn:sequenceFlow id="Flow2" sourceRef="ValidateDocuments" targetRef="Gateway1"/>
    <bpmn:sequenceFlow id="FlowDocumentsOK" sourceRef="Gateway1" targetRef="VerifyFIMEX">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">${documentsComplets == true}</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="FlowDocumentsKO" sourceRef="Gateway1" targetRef="CompleteDocuments">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">${documentsComplets == false}</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <!-- ... autres flows -->
    
  </bpmn:process>
</bpmn:definitions>
```

### Intégration Drools (Règles Métier)

**Fichier DRL - Validation FIMEX**

```drools
package cm.eguce.rules.fimex

import cm.eguce.model.InscriptionFimex
import cm.eguce.model.ValidationResult
import cm.eguce.model.TypeDocument
import java.time.LocalDate

global ValidationResult validationResult

rule "FIMEX - Documents Import Obligatoires"
    when
        $inscription : InscriptionFimex(typeInscription == "IMPORT" || typeInscription == "IMPORT_EXPORT")
        not(PieceJointe(type == TypeDocument.ATTESTATION_CONFORMITE_FISCALE) from $inscription.piecesJointes)
    then
        validationResult.addError("L'attestation de conformité fiscale est obligatoire");
end

rule "FIMEX - Validité Attestation Fiscale"
    when
        $inscription : InscriptionFimex()
        $attestation : PieceJointe(type == TypeDocument.ATTESTATION_CONFORMITE_FISCALE) from $inscription.piecesJointes
        eval($inscription.getFiscalite().getDateValiditeAttestation().isBefore(LocalDate.now()))
    then
        validationResult.addError("L'attestation de conformité fiscale est expirée");
end

rule "FIMEX - Capital Social Minimum"
    when
        $inscription : InscriptionFimex(entreprise.capitalSocial < 1000000)
    then
        validationResult.addWarning("Capital social inférieur au minimum recommandé (1 000 000 FCFA)");
end

rule "FIMEX - Calcul Frais Inscription"
    when
        $inscription : InscriptionFimex(typeInscription == "IMPORT")
    then
        $inscription.setMontantAPayer(50000); // 50 000 FCFA
end

rule "FIMEX - Calcul Frais Inscription Export"
    when
        $inscription : InscriptionFimex(typeInscription == "EXPORT")
    then
        $inscription.setMontantAPayer(75000); // 75 000 FCFA
end

rule "FIMEX - Calcul Frais Inscription Import-Export"
    when
        $inscription : InscriptionFimex(typeInscription == "IMPORT_EXPORT")
    then
        $inscription.setMontantAPayer(100000); // 100 000 FCFA
end
```

**Fichier DMN - Déclenchement Procédures selon SH**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"
             xmlns:camunda="http://camunda.org/schema/1.0/dmn"
             id="DecisionDeclenchementProcedures"
             name="Déclenchement Procédures selon Code SH"
             namespace="http://eguce.cm/dmn">
  
  <decision id="ProceduresRequises" name="Détermination Procédures Requises">
    <decisionTable id="DecisionTable1" hitPolicy="COLLECT">
      
      <input id="Input1" label="Code SH" camunda:inputVariable="codeSH">
        <inputExpression typeRef="string">
          <text>codeSH</text>
        </inputExpression>
      </input>
      
      <input id="Input2" label="Pays Origine" camunda:inputVariable="paysOrigine">
        <inputExpression typeRef="string">
          <text>paysOrigine</text>
        </inputExpression>
      </input>
      
      <output id="Output1" label="Procédure" name="procedure" typeRef="string"/>
      <output id="Output2" label="Obligatoire" name="obligatoire" typeRef="boolean"/>
      
      <!-- Règles -->
      <rule id="Rule1">
        <inputEntry>
          <text><![CDATA[starts with(codeSH, "30")]]></text> <!-- Produits pharmaceutiques -->
        </inputEntry>
        <inputEntry>
          <text>-</text>
        </inputEntry>
        <outputEntry>
          <text>"AMM"</text>
        </outputEntry>
        <outputEntry>
          <text>true</text>
        </outputEntry>
      </rule>
      
      <rule id="Rule2">
        <inputEntry>
          <text><![CDATA[starts with(codeSH, "31")]]></text> <!-- Engrais -->
        </inputEntry>
        <inputEntry>
          <text>-</text>
        </inputEntry>
        <outputEntry>
          <text>"DECLARATION_ENGRAIS_MINADER"</text>
        </outputEntry>
        <outputEntry>
          <text>true</text>
        </outputEntry>
      </rule>
      
      <rule id="Rule3">
        <inputEntry>
          <text><![CDATA[starts with(codeSH, "38")]]></text> <!-- Pesticides -->
        </inputEntry>
        <inputEntry>
          <text>-</text>
        </inputEntry>
        <outputEntry>
          <text>"DECLARATION_PESTICIDES_MINADER"</text>
        </outputEntry>
        <outputEntry>
          <text>true</text>
        </outputEntry>
      </rule>
      
      <rule id="Rule4">
        <inputEntry>
          <text><![CDATA[starts with(codeSH, "87")]]></text> <!-- Véhicules -->
        </inputEntry>
        <inputEntry>
          <text>-</text>
        </inputEntry>
        <outputEntry>
          <text>"CIVIC"</text>
        </outputEntry>
        <outputEntry>
          <text>true</text>
        </outputEntry>
      </rule>
      
      <!-- Règle générique pour tous les imports -->
      <rule id="RuleGeneric1">
        <inputEntry>
          <text>-</text>
        </inputEntry>
        <inputEntry>
          <text>-</text>
        </inputEntry>
        <outputEntry>
          <text>"BESC"</text>
        </outputEntry>
        <outputEntry>
          <text>true</text>
        </outputEntry>
      </rule>
      
      <rule id="RuleGeneric2">
        <inputEntry>
          <text>-</text>
        </inputEntry>
        <inputEntry>
          <text>-</text>
        </inputEntry>
        <outputEntry>
          <text>"CAH"</text>
        </outputEntry>
        <outputEntry>
          <text>true</text>
        </outputEntry>
      </rule>
      
    </decisionTable>
  </decision>
  
</definitions>
```

---

## 💾 INTÉGRATION BASE DE DONNÉES

### Schéma de Base de Données PostgreSQL

```sql
-- =====================================================
-- SCHÉMA : GESTION DES DOSSIERS D'IMPORTATION
-- =====================================================

-- Table: Opérateurs Économiques
CREATE TABLE operateur (
    id BIGSERIAL PRIMARY KEY,
    numero_fimex VARCHAR(20) NOT NULL UNIQUE,
    raison_sociale VARCHAR(255) NOT NULL,
    ninea VARCHAR(20) NOT NULL UNIQUE,
    numero_registre_commerce VARCHAR(50),
    adresse TEXT,
    ville VARCHAR(100),
    region VARCHAR(100),
    telephone VARCHAR(20),
    email VARCHAR(255),
    statut VARCHAR(20) DEFAULT 'ACTIF',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP,
    cree_par VARCHAR(100),
    modifie_par VARCHAR(100)
);

CREATE INDEX idx_operateur_fimex ON operateur(numero_fimex);
CREATE INDEX idx_operateur_ninea ON operateur(ninea);

-- Table: Représentants Légaux
CREATE TABLE representant_legal (
    id BIGSERIAL PRIMARY KEY,
    operateur_id BIGINT NOT NULL REFERENCES operateur(id),
    civilite VARCHAR(5),
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    fonction VARCHAR(100),
    nationalite VARCHAR(50),
    numero_cni VARCHAR(20),
    date_naissance DATE,
    lieu_naissance VARCHAR(100),
    telephone VARCHAR(20),
    email VARCHAR(255),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Dossiers d'Importation
CREATE TABLE dossier_importation (
    id BIGSERIAL PRIMARY KEY,
    numero_dossier VARCHAR(30) NOT NULL UNIQUE,
    operateur_id BIGINT NOT NULL REFERENCES operateur(id),
    type_importation VARCHAR(50),
    regime_douanier VARCHAR(50),
    mode_transport VARCHAR(50),
    lieu_entree VARCHAR(100),
    phase_actuelle VARCHAR(50),
    statut VARCHAR(30) NOT NULL,
    valeur_totale_fob DECIMAL(15, 2),
    valeur_totale_caf DECIMAL(15, 2),
    devise VARCHAR(3) DEFAULT 'XAF',
    workflow_instance_id VARCHAR(100),
    tache_en_cours VARCHAR(100),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP,
    date_soumission TIMESTAMP,
    date_cloture TIMESTAMP,
    cree_par VARCHAR(100),
    modifie_par VARCHAR(100),
    version INT DEFAULT 1
);

CREATE INDEX idx_dossier_numero ON dossier_importation(numero_dossier);
CREATE INDEX idx_dossier_operateur ON dossier_importation(operateur_id);
CREATE INDEX idx_dossier_statut ON dossier_importation(statut);
CREATE INDEX idx_dossier_date_creation ON dossier_importation(date_creation);

-- Table: Marchandises
CREATE TABLE marchandise (
    id BIGSERIAL PRIMARY KEY,
    dossier_id BIGINT NOT NULL REFERENCES dossier_importation(id) ON DELETE CASCADE,
    ligne_numero INT NOT NULL,
    designation_commerciale TEXT NOT NULL,
    code_douanier VARCHAR(10) NOT NULL,
    position_tarifaire VARCHAR(20),
    famille VARCHAR(100),
    sous_famille VARCHAR(100),
    quantite DECIMAL(15, 3) NOT NULL,
    unite VARCHAR(20) NOT NULL,
    poids_brut DECIMAL(15, 3),
    poids_net DECIMAL(15, 3),
    valeur_fob DECIMAL(15, 2) NOT NULL,
    valeur_caf DECIMAL(15, 2),
    pays_origine VARCHAR(3),
    pays_provenance VARCHAR(3),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_ligne_marchandise UNIQUE (dossier_id, ligne_numero)
);

CREATE INDEX idx_marchandise_dossier ON marchandise(dossier_id);
CREATE INDEX idx_marchandise_code_sh ON marchandise(code_douanier);

-- Table: Pièces Jointes
CREATE TABLE piece_jointe (
    id BIGSERIAL PRIMARY KEY,
    dossier_id BIGINT REFERENCES dossier_importation(id) ON DELETE CASCADE,
    fimex_id BIGINT REFERENCES inscription_fimex(id) ON DELETE CASCADE,
    type_document VARCHAR(50) NOT NULL,
    nom VARCHAR(255) NOT NULL,
    taille_octets BIGINT,
    mime_type VARCHAR(100),
    chemin_stockage TEXT NOT NULL,
    obligatoire BOOLEAN DEFAULT false,
    statut VARCHAR(20) DEFAULT 'EN_ATTENTE',
    date_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploade_par VARCHAR(100),
    CONSTRAINT check_rattachement CHECK (
        (dossier_id IS NOT NULL AND fimex_id IS NULL) OR
        (dossier_id IS NULL AND fimex_id IS NOT NULL)
    )
);

CREATE INDEX idx_piece_dossier ON piece_jointe(dossier_id);
CREATE INDEX idx_piece_fimex ON piece_jointe(fimex_id);

-- Table: Procédures Associées
CREATE TABLE procedure_dossier (
    id BIGSERIAL PRIMARY KEY,
    dossier_id BIGINT NOT NULL REFERENCES dossier_importation(id) ON DELETE CASCADE,
    code_procedure VARCHAR(50) NOT NULL,
    libelle_procedure VARCHAR(255),
    administration VARCHAR(100),
    statut VARCHAR(30),
    obligatoire BOOLEAN DEFAULT true,
    numero_reference VARCHAR(50),
    date_initiation TIMESTAMP,
    date_completion TIMESTAMP,
    workflow_task_id VARCHAR(100),
    montant_frais DECIMAL(15, 2),
    payee BOOLEAN DEFAULT false,
    commentaire TEXT
);

CREATE INDEX idx_procedure_dossier ON procedure_dossier(dossier_id);
CREATE INDEX idx_procedure_code ON procedure_dossier(code_procedure);

-- Table: Historique Dossier
CREATE TABLE evenement_dossier (
    id BIGSERIAL PRIMARY KEY,
    dossier_id BIGINT NOT NULL REFERENCES dossier_importation(id) ON DELETE CASCADE,
    type_evenement VARCHAR(50) NOT NULL,
    description TEXT,
    statut_avant VARCHAR(30),
    statut_apres VARCHAR(30),
    utilisateur VARCHAR(100),
    date_evenement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    donnees_supplementaires JSONB
);

CREATE INDEX idx_evenement_dossier ON evenement_dossier(dossier_id);
CREATE INDEX idx_evenement_date ON evenement_dossier(date_evenement);

-- =====================================================
-- SCHÉMA : GESTION FIMEX
-- =====================================================

-- Table: Inscriptions FIMEX
CREATE TABLE inscription_fimex (
    id BIGSERIAL PRIMARY KEY,
    numero_fimex VARCHAR(20) NOT NULL UNIQUE,
    type_inscription VARCHAR(20) NOT NULL, -- IMPORT, EXPORT, IMPORT_EXPORT
    statut VARCHAR(30) NOT NULL,
    
    -- Entreprise
    raison_sociale VARCHAR(255) NOT NULL,
    forme_juridique VARCHAR(50),
    numero_registre_commerce VARCHAR(50) NOT NULL,
    ninea VARCHAR(20) NOT NULL,
    capital_social DECIMAL(15, 2),
    date_creation_entreprise DATE,
    secteur_activite VARCHAR(100)[],
    activites_principales VARCHAR(255)[],
    
    -- Adresse Siège
    adresse_complete TEXT NOT NULL,
    ville VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    boite_postale VARCHAR(50),
    telephone VARCHAR(20) NOT NULL,
    fax VARCHAR(20),
    email VARCHAR(255) NOT NULL,
    site_web VARCHAR(255),
    
    -- Représentant Légal
    rep_civilite VARCHAR(5),
    rep_nom VARCHAR(100) NOT NULL,
    rep_prenom VARCHAR(100) NOT NULL,
    rep_fonction VARCHAR(100),
    rep_nationalite VARCHAR(50),
    rep_numero_cni VARCHAR(20),
    rep_date_naissance DATE,
    rep_lieu_naissance VARCHAR(100),
    rep_telephone VARCHAR(20),
    rep_email VARCHAR(255),
    
    -- Fiscalité
    numero_carte_contribuable VARCHAR(50) NOT NULL,
    centre_impots VARCHAR(100),
    date_validite_attestation_fiscale DATE,
    
    -- Validité FIMEX
    date_inscription DATE NOT NULL,
    date_expiration DATE NOT NULL,
    date_renouvellement DATE,
    inscription_precedente_id BIGINT REFERENCES inscription_fimex(id),
    
    -- Paiement
    montant_a_payer DECIMAL(15, 2),
    paye BOOLEAN DEFAULT false,
    reference_paiement VARCHAR(100),
    date_paiement TIMESTAMP,
    
    -- Workflow
    workflow_instance_id VARCHAR(100),
    tache_en_cours VARCHAR(100),
    
    -- Audit
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP,
    cree_par VARCHAR(100),
    modifie_par VARCHAR(100),
    version INT DEFAULT 1
);

CREATE INDEX idx_fimex_numero ON inscription_fimex(numero_fimex);
CREATE INDEX idx_fimex_ninea ON inscription_fimex(ninea);
CREATE INDEX idx_fimex_statut ON inscription_fimex(statut);
CREATE INDEX idx_fimex_expiration ON inscription_fimex(date_expiration);

-- Table: Historique FIMEX
CREATE TABLE evenement_fimex (
    id BIGSERIAL PRIMARY KEY,
    fimex_id BIGINT NOT NULL REFERENCES inscription_fimex(id) ON DELETE CASCADE,
    type_evenement VARCHAR(50) NOT NULL,
    description TEXT,
    statut_avant VARCHAR(30),
    statut_apres VARCHAR(30),
    utilisateur VARCHAR(100),
    date_evenement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    donnees_supplementaires JSONB
);

CREATE INDEX idx_evenement_fimex ON evenement_fimex(fimex_id);
CREATE INDEX idx_evenement_fimex_date ON evenement_fimex(date_evenement);

-- =====================================================
-- TABLES DE RÉFÉRENCE
-- =====================================================

-- Table: Codes Douaniers (SH - Système Harmonisé)
CREATE TABLE code_douanier (
    id BIGSERIAL PRIMARY KEY,
    code_sh VARCHAR(10) NOT NULL UNIQUE,
    libelle TEXT NOT NULL,
    famille VARCHAR(100),
    sous_famille VARCHAR(100),
    unite_statistique VARCHAR(20),
    taux_droit_douane DECIMAL(5, 2),
    taux_tva DECIMAL(5, 2),
    restrictions TEXT,
    actif BOOLEAN DEFAULT true
);

CREATE INDEX idx_code_sh ON code_douanier(code_sh);
CREATE INDEX idx_code_famille ON code_douanier(famille);

-- Table: Pays
CREATE TABLE pays (
    id BIGSERIAL PRIMARY KEY,
    code_iso2 VARCHAR(2) NOT NULL UNIQUE,
    code_iso3 VARCHAR(3) NOT NULL UNIQUE,
    nom_fr VARCHAR(100) NOT NULL,
    nom_en VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    actif BOOLEAN DEFAULT true
);

-- Table: Régimes Douaniers
CREATE TABLE regime_douanier (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    libelle VARCHAR(255) NOT NULL,
    description TEXT,
    actif BOOLEAN DEFAULT true
);

-- Table: Unités de Mesure
CREATE TABLE unite_mesure (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    libelle VARCHAR(50) NOT NULL,
    type VARCHAR(20), -- POIDS, VOLUME, QUANTITE, etc.
    actif BOOLEAN DEFAULT true
);

-- Table: Types de Documents
CREATE TABLE type_document_ref (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    libelle VARCHAR(255) NOT NULL,
    formats_acceptes VARCHAR(50)[], -- ['PDF', 'JPEG', 'PNG']
    taille_max_mo INT,
    description TEXT,
    actif BOOLEAN DEFAULT true
);

-- =====================================================
-- VUES
-- =====================================================

-- Vue: Dossiers avec Opérateurs
CREATE OR REPLACE VIEW v_dossiers_import AS
SELECT 
    d.id,
    d.numero_dossier,
    d.type_importation,
    d.regime_douanier,
    d.statut,
    d.date_creation,
    d.date_soumission,
    o.numero_fimex,
    o.raison_sociale,
    o.ninea,
    COUNT(DISTINCT m.id) AS nb_marchandises,
    COUNT(DISTINCT p.id) AS nb_documents,
    SUM(m.valeur_fob) AS valeur_totale_fob
FROM dossier_importation d
JOIN operateur o ON d.operateur_id = o.id
LEFT JOIN marchandise m ON d.id = m.dossier_id
LEFT JOIN piece_jointe p ON d.id = p.dossier_id
GROUP BY d.id, o.id;

-- Vue: FIMEX Actifs
CREATE OR REPLACE VIEW v_fimex_actifs AS
SELECT 
    numero_fimex,
    type_inscription,
    raison_sociale,
    ninea,
    date_inscription,
    date_expiration,
    CASE 
        WHEN date_expiration < CURRENT_DATE THEN 'EXPIRÉ'
        WHEN date_expiration < CURRENT_DATE + INTERVAL '30 days' THEN 'EXPIRATION IMMINENTE'
        ELSE 'ACTIF'
    END AS etat_validite
FROM inscription_fimex
WHERE statut = 'ACTIF';

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction: Génération Numéro Dossier
CREATE OR REPLACE FUNCTION generate_numero_dossier()
RETURNS VARCHAR(30) AS $$
DECLARE
    annee VARCHAR(4);
    sequence_num INT;
    numero VARCHAR(30);
BEGIN
    annee := EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_dossier FROM 10) AS INT)), 0) + 1
    INTO sequence_num
    FROM dossier_importation
    WHERE numero_dossier LIKE 'IMP-' || annee || '-%';
    
    numero := 'IMP-' || annee || '-' || LPAD(sequence_num::VARCHAR, 6, '0');
    
    RETURN numero;
END;
$$ LANGUAGE plpgsql;

-- Fonction: Génération Numéro FIMEX
CREATE OR REPLACE FUNCTION generate_numero_fimex(p_type_inscription VARCHAR)
RETURNS VARCHAR(20) AS $$
DECLARE
    annee VARCHAR(4);
    prefix_type VARCHAR(2);
    sequence_num INT;
    numero VARCHAR(20);
BEGIN
    annee := EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR;
    
    prefix_type := CASE p_type_inscription
        WHEN 'IMPORT' THEN 'I'
        WHEN 'EXPORT' THEN 'E'
        WHEN 'IMPORT_EXPORT' THEN 'IE'
        ELSE 'X'
    END;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_fimex FROM LENGTH(numero_fimex) - 5) AS INT)), 0) + 1
    INTO sequence_num
    FROM inscription_fimex
    WHERE numero_fimex LIKE 'FIMEX-' || annee || '-' || prefix_type || '%';
    
    numero := 'FIMEX-' || annee || '-' || prefix_type || LPAD(sequence_num::VARCHAR, 6, '0');
    
    RETURN numero;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-génération Numéro Dossier
CREATE OR REPLACE FUNCTION trigger_generate_numero_dossier()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_dossier IS NULL THEN
        NEW.numero_dossier := generate_numero_dossier();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_dossier
BEFORE INSERT ON dossier_importation
FOR EACH ROW
EXECUTE FUNCTION trigger_generate_numero_dossier();

-- Trigger: Auto-génération Numéro FIMEX
CREATE OR REPLACE FUNCTION trigger_generate_numero_fimex()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_fimex IS NULL THEN
        NEW.numero_fimex := generate_numero_fimex(NEW.type_inscription);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_fimex
BEFORE INSERT ON inscription_fimex
FOR EACH ROW
EXECUTE FUNCTION trigger_generate_numero_fimex();

-- =====================================================
-- CONTRAINTES D'INTÉGRITÉ
-- =====================================================

-- Contrainte: Un seul FIMEX actif par entreprise
CREATE UNIQUE INDEX unique_fimex_actif_par_ninea
ON inscription_fimex(ninea)
WHERE statut = 'ACTIF';

-- =====================================================
-- DONNÉES DE RÉFÉRENCE (SEED DATA)
-- =====================================================

-- Insertion Régimes Douaniers
INSERT INTO regime_douanier (code, libelle, description) VALUES
('IM4', 'Mise à la consommation', 'Importation pour consommation directe'),
('IM5', 'Admission temporaire', 'Importation temporaire avec réexportation'),
('IM7', 'Entrepôt de stockage', 'Stockage sous douane'),
('IM8', 'Perfectionnement actif', 'Transformation puis réexportation');

-- Insertion Unités de Mesure
INSERT INTO unite_mesure (code, libelle, type) VALUES
('KG', 'Kilogramme', 'POIDS'),
('T', 'Tonne', 'POIDS'),
('L', 'Litre', 'VOLUME'),
('M3', 'Mètre cube', 'VOLUME'),
('U', 'Unité', 'QUANTITE'),
('M', 'Mètre', 'LONGUEUR');

-- Insertion Types Documents
INSERT INTO type_document_ref (code, libelle, formats_acceptes, taille_max_mo) VALUES
('FACTURE_PROFORMA', 'Facture Pro-forma', ARRAY['PDF', 'JPEG', 'PNG'], 5),
('FACTURE_FINALE', 'Facture Finale', ARRAY['PDF', 'JPEG', 'PNG'], 5),
('BL', 'Connaissement (Bill of Lading)', ARRAY['PDF'], 5),
('LISTE_COLISAGE', 'Liste de Colisage', ARRAY['PDF', 'XLSX'], 5),
('CERTIFICAT_ORIGINE', 'Certificat d''Origine', ARRAY['PDF'], 3),
('ATTESTATION_CONFORMITE_FISCALE', 'Attestation Conformité Fiscale', ARRAY['PDF'], 3),
('CARTE_CONTRIBUABLE', 'Carte de Contribuable', ARRAY['PDF', 'JPEG', 'PNG'], 2),
('REGISTRE_COMMERCE', 'Registre de Commerce', ARRAY['PDF'], 3),
('CNI', 'Carte Nationale d''Identité', ARRAY['PDF', 'JPEG', 'PNG'], 2);
```

### Migrations Liquibase

**Fichier** : `src/main/resources/db/changelog/db.changelog-master.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
                        http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.9.xsd">

    <include file="db/changelog/v1.0/01-create-tables-operateur.xml"/>
    <include file="db/changelog/v1.0/02-create-tables-dossier-importation.xml"/>
    <include file="db/changelog/v1.0/03-create-tables-fimex.xml"/>
    <include file="db/changelog/v1.0/04-create-tables-reference.xml"/>
    <include file="db/changelog/v1.0/05-create-views.xml"/>
    <include file="db/changelog/v1.0/06-create-functions.xml"/>
    <include file="db/changelog/v1.0/07-seed-data.xml"/>

</databaseChangeLog>
```

---

## 📊 ALIMENTATION DES DONNÉES

### Stratégie d'Alimentation Initiale

#### 1. Données de Référence

**Script SQL** : `data-seed-reference.sql`

```sql
-- Insertion des Codes Douaniers (échantillon)
-- NOTE: En production, importer depuis fichier CSV OMD
INSERT INTO code_douanier (code_sh, libelle, famille, sous_famille, unite_statistique, taux_droit_douane, taux_tva) VALUES
('0101210000', 'Chevaux reproducteurs de race pure', 'Animaux vivants', 'Chevaux', 'U', 5.0, 19.25),
('3004909900', 'Médicaments, autres', 'Produits pharmaceutiques', 'Médicaments', 'KG', 10.0, 19.25),
('3102100000', 'Urée, même en solution aqueuse', 'Engrais chimiques', 'Urée', 'KG', 5.0, 19.25),
('3808911000', 'Insecticides conditionnés pour la vente au détail', 'Pesticides', 'Insecticides', 'KG', 10.0, 19.25),
('8703221090', 'Véhicules automobiles à essence, cylindrée 1000-1500 cm³', 'Véhicules', 'Voitures particulières', 'U', 30.0, 19.25),
('4407110000', 'Bois de conifères, sciés ou dédossés', 'Bois', 'Bois sciés', 'M3', 0.0, 19.25);

-- Insertion des Pays (échantillon CEMAC + principaux partenaires)
INSERT INTO pays (code_iso2, code_iso3, nom_fr, nom_en, region) VALUES
('CM', 'CMR', 'Cameroun', 'Cameroon', 'CEMAC'),
('TD', 'TCD', 'Tchad', 'Chad', 'CEMAC'),
('CF', 'CAF', 'République Centrafricaine', 'Central African Republic', 'CEMAC'),
('GA', 'GAB', 'Gabon', 'Gabon', 'CEMAC'),
('GQ', 'GNQ', 'Guinée Équatoriale', 'Equatorial Guinea', 'CEMAC'),
('CG', 'COG', 'Congo-Brazzaville', 'Republic of the Congo', 'CEMAC'),
('FR', 'FRA', 'France', 'France', 'Europe'),
('CN', 'CHN', 'Chine', 'China', 'Asie'),
('US', 'USA', 'États-Unis', 'United States', 'Amérique'),
('DE', 'DEU', 'Allemagne', 'Germany', 'Europe');
```

#### 2. Données de Test

**Service Java** : `DataSeederService.java`

```java
@Service
public class DataSeederService {
    
    @Autowired
    private OperateurRepository operateurRepository;
    
    @Autowired
    private InscriptionFimexRepository fimexRepository;
    
    @Autowired
    private DossierImportationRepository dossierRepository;
    
    @Value("${app.seed-data.enabled:false}")
    private boolean seedDataEnabled;
    
    @EventListener(ApplicationReadyEvent.class)
    public void seedData() {
        if (!seedDataEnabled) {
            return;
        }
        
        log.info("Début de l'alimentation des données de test...");
        
        seedOperateurs();
        seedInscriptionsFimex();
        seedDossiersImportation();
        
        log.info("Alimentation des données de test terminée.");
    }
    
    private void seedOperateurs() {
        if (operateurRepository.count() > 0) {
            log.info("Opérateurs déjà présents, skip.");
            return;
        }
        
        List<Operateur> operateurs = Arrays.asList(
            createOperateur("FIMEX-2025-I000001", "SARL IMPORT TRADING", "M123456789012", "RC/DLA/2020/B/1234"),
            createOperateur("FIMEX-2025-E000001", "SA EXPORT PLUS", "M987654321098", "RC/DLA/2019/A/5678"),
            createOperateur("FIMEX-2025-IE000001", "GLOBAL TRADE COMPANY", "M456789012345", "RC/DLA/2021/B/9012")
        );
        
        operateurRepository.saveAll(operateurs);
        log.info("{} opérateurs créés", operateurs.size());
    }
    
    private Operateur createOperateur(String numeroFimex, String raisonSociale, String ninea, String rc) {
        Operateur operateur = new Operateur();
        operateur.setNumeroFimex(numeroFimex);
        operateur.setRaisonSociale(raisonSociale);
        operateur.setNinea(ninea);
        operateur.setNumeroRegistreCommerce(rc);
        operateur.setAdresse("Rue de la Réunification, Douala");
        operateur.setVille("Douala");
        operateur.setRegion("Littoral");
        operateur.setTelephone("+237677777777");
        operateur.setEmail(raisonSociale.toLowerCase().replace(" ", "") + "@example.cm");
        operateur.setStatut("ACTIF");
        operateur.setCreePar("SYSTEM");
        return operateur;
    }
    
    private void seedInscriptionsFimex() {
        if (fimexRepository.count() > 0) {
            log.info("Inscriptions FIMEX déjà présentes, skip.");
            return;
        }
        
        List<InscriptionFimex> inscriptions = Arrays.asList(
            createInscriptionFimex("FIMEX-2025-I000001", "IMPORT", "SARL IMPORT TRADING", "M123456789012"),
            createInscriptionFimex("FIMEX-2025-E000001", "EXPORT", "SA EXPORT PLUS", "M987654321098"),
            createInscriptionFimex("FIMEX-2025-IE000001", "IMPORT_EXPORT", "GLOBAL TRADE COMPANY", "M456789012345")
        );
        
        fimexRepository.saveAll(inscriptions);
        log.info("{} inscriptions FIMEX créées", inscriptions.size());
    }
    
    private InscriptionFimex createInscriptionFimex(String numeroFimex, String type, String raisonSociale, String ninea) {
        InscriptionFimex fimex = new InscriptionFimex();
        fimex.setNumeroFimex(numeroFimex);
        fimex.setTypeInscription(type);
        fimex.setStatut(StatutFIMEX.ACTIF);
        fimex.setRaisonSociale(raisonSociale);
        fimex.setFormeJuridique("SARL");
        fimex.setNumeroRegistreCommerce("RC/DLA/2020/B/1234");
        fimex.setNinea(ninea);
        fimex.setCapitalSocial(new BigDecimal("5000000"));
        fimex.setDateCreationEntreprise(LocalDate.of(2020, 1, 15));
        fimex.setSecteurActivite(new String[]{"Commerce général"});
        fimex.setActivitesPrincipales(new String[]{"Import-Export de marchandises diverses"});
        
        fimex.setAdresseComplete("123 Avenue du Président");
        fimex.setVille("Douala");
        fimex.setRegion("Littoral");
        fimex.setTelephone("+237677123456");
        fimex.setEmail(raisonSociale.toLowerCase().replace(" ", "") + "@example.cm");
        
        fimex.setRepNom("NGUEMA");
        fimex.setRepPrenom("Pierre");
        fimex.setRepCivilite("M");
        fimex.setRepFonction("Directeur Général");
        fimex.setRepNationalite("Camerounaise");
        fimex.setRepNumeroCni("123456789");
        fimex.setRepDateNaissance(LocalDate.of(1975, 6, 10));
        fimex.setRepLieuNaissance("Douala");
        fimex.setRepTelephone("+237699999999");
        fimex.setRepEmail("p.nguema@example.cm");
        
        fimex.setNumeroCarteContribuable("P123456789C");
        fimex.setCentreImpots("Centre des Impôts de Douala 1er");
        fimex.setDateValiditeAttestationFiscale(LocalDate.now().plusMonths(6));
        
        fimex.setDateInscription(LocalDate.now().minusMonths(6));
        fimex.setDateExpiration(LocalDate.now().plusMonths(6));
        
        fimex.setMontantAPayer(new BigDecimal(type.equals("IMPORT_EXPORT") ? "100000" : "50000"));
        fimex.setPaye(true);
        fimex.setReferencePaiement("PAY-" + System.currentTimeMillis());
        fimex.setDatePaiement(LocalDateTime.now().minusMonths(6));
        
        fimex.setCreePar("SYSTEM");
        
        return fimex;
    }
    
    private void seedDossiersImportation() {
        if (dossierRepository.count() > 0) {
            log.info("Dossiers d'importation déjà présents, skip.");
            return;
        }
        
        Operateur operateur = operateurRepository.findByNumeroFimex("FIMEX-2025-I000001")
            .orElseThrow();
        
        List<DossierImportation> dossiers = Arrays.asList(
            createDossierImportation(operateur, StatutDossier.BROUILLON),
            createDossierImportation(operateur, StatutDossier.SOUMIS),
            createDossierImportation(operateur, StatutDossier.EN_TRAITEMENT),
            createDossierImportation(operateur, StatutDossier.APPROUVÉ)
        );
        
        dossierRepository.saveAll(dossiers);
        log.info("{} dossiers d'importation créés", dossiers.size());
    }
    
    private DossierImportation createDossierImportation(Operateur operateur, StatutDossier statut) {
        DossierImportation dossier = new DossierImportation();
        dossier.setOperateur(operateur);
        dossier.setTypeImportation("Marchandise générale");
        dossier.setRegimeDouanier("IM4");
        dossier.setModeTransport("MARITIME");
        dossier.setLieuEntree("Port de Douala");
        dossier.setPhaseActuelle("TRANSACTION");
        dossier.setStatut(statut);
        dossier.setValeurTotaleFob(new BigDecimal("25000000"));
        dossier.setValeurTotaleCaf(new BigDecimal("28000000"));
        dossier.setDevise("XAF");
        dossier.setCreePar("SYSTEM");
        
        if (!statut.equals(StatutDossier.BROUILLON)) {
            dossier.setDateSoumission(LocalDateTime.now().minusDays(5));
        }
        
        return dossier;
    }
}
```

**Configuration** : `application.yml`

```yaml
app:
  seed-data:
    enabled: true  # Activer en DEV uniquement
```

#### 3. Import depuis fichiers Excel/CSV

**Service** : `DataImportService.java`

```java
@Service
public class DataImportService {
    
    @Autowired
    private CodeDouanierRepository codeDouanierRepository;
    
    public void importCodesDouaniers(MultipartFile file) throws IOException {
        try (InputStream inputStream = file.getInputStream()) {
            Workbook workbook = new XSSFWorkbook(inputStream);
            Sheet sheet = workbook.getSheetAt(0);
            
            List<CodeDouanier> codes = new ArrayList<>();
            
            for (int i = 1; i <= sheet.getLastRowNum(); i++) { // Skip header
                Row row = sheet.getRow(i);
                
                CodeDouanier code = new CodeDouanier();
                code.setCodeSh(row.getCell(0).getStringCellValue());
                code.setLibelle(row.getCell(1).getStringCellValue());
                code.setFamille(row.getCell(2).getStringCellValue());
                code.setSousFamille(row.getCell(3).getStringCellValue());
                code.setUniteStatistique(row.getCell(4).getStringCellValue());
                code.setTauxDroitDouane(BigDecimal.valueOf(row.getCell(5).getNumericCellValue()));
                code.setTauxTva(BigDecimal.valueOf(row.getCell(6).getNumericCellValue()));
                
                codes.add(code);
                
                if (codes.size() >= 1000) {
                    codeDouanierRepository.saveAll(codes);
                    codes.clear();
                }
            }
            
            if (!codes.empty()) {
                codeDouanierRepository.saveAll(codes);
            }
            
            workbook.close();
        }
    }
}
```

---

## 🔐 SÉCURITÉ & AUTHENTIFICATION

### Intégration Keycloak

**Configuration** : `application.yml`

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://keycloak.eguce.cm/realms/eguce-cameroun
          jwk-set-uri: https://keycloak.eguce.cm/realms/eguce-cameroun/protocol/openid-connect/certs

keycloak:
  realm: eguce-cameroun
  auth-server-url: https://keycloak.eguce.cm
  resource: eguce-frontend
  public-client: true
```

**Configuration Sécurité** : `SecurityConfig.java`

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors()
            .and()
            .csrf().disable()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/v1/fimex/inscriptions/*/validate").permitAll()
                .requestMatchers("/api/v1/import/**").hasAnyRole("OPERATEUR", "ADMIN")
                .requestMatchers("/api/v1/fimex/**").hasAnyRole("OPERATEUR", "ADMIN_MINCOMMERCE")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );
        
        return http.build();
    }
    
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        grantedAuthoritiesConverter.setAuthoritiesClaimName("realm_access.roles");
        grantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");
        
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        
        return jwtAuthenticationConverter;
    }
}
```

### Configuration Angular

**Service** : `auth.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private keycloakService: KeycloakService) {}
  
  async getUserProfile(): Promise<KeycloakProfile> {
    return await this.keycloakService.loadUserProfile();
  }
  
  getUserRoles(): string[] {
    return this.keycloakService.getUserRoles();
  }
  
  hasRole(role: string): boolean {
    return this.keycloakService.isUserInRole(role);
  }
  
  logout(): void {
    this.keycloakService.logout(window.location.origin);
  }
  
  getToken(): Promise<string> {
    return this.keycloakService.getToken();
  }
}
```

**Initializer** : `app.initializer.ts`

```typescript
import { KeycloakService } from 'keycloak-angular';

export function initializeKeycloak(keycloak: KeycloakService): () => Promise<boolean> {
  return () =>
    keycloak.init({
      config: {
        url: 'https://keycloak.eguce.cm',
        realm: 'eguce-cameroun',
        clientId: 'eguce-frontend'
      },
      initOptions: {
        onLoad: 'login-required',
        checkLoginIframe: false
      },
      enableBearerInterceptor: true,
      bearerPrefix: 'Bearer',
      bearerExcludedUrls: ['/assets', '/api/public']
    });
}
```

**Module** : `app.module.ts`

```typescript
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { initializeKeycloak } from './app.initializer';

@NgModule({
  imports: [
    KeycloakAngularModule,
    // ... autres imports
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    }
  ]
})
export class AppModule {}
```

---

## 🎨 STANDARDS UI/UX

### Design System

#### Palette de Couleurs e-GUCE

```scss
// Variables SCSS - _variables.scss

// Couleurs Primaires
$primary-green: #008751;      // Vert GUCE
$primary-green-dark: #006B3F;
$primary-green-light: #00A563;

// Couleurs Secondaires
$secondary-yellow: #FFD700;   // Or/Jaune
$secondary-blue: #0066CC;     // Bleu information

// Couleurs Statuts
$status-success: #28A745;
$status-warning: #FFC107;
$status-danger: #DC3545;
$status-info: #17A2B8;
$status-pending: #6C757D;

// Couleurs Neutres
$gray-100: #F8F9FA;
$gray-200: #E9ECEF;
$gray-300: #DEE2E6;
$gray-400: #CED4DA;
$gray-500: #ADB5BD;
$gray-600: #6C757D;
$gray-700: #495057;
$gray-800: #343A40;
$gray-900: #212529;

$white: #FFFFFF;
$black: #000000;

// Typographie
$font-family-base: 'Roboto', sans-serif;
$font-family-headings: 'Roboto', sans-serif;

$font-size-base: 14px;
$font-size-sm: 12px;
$font-size-lg: 16px;
$font-size-xl: 18px;

$line-height-base: 1.5;

// Espacements
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;

// Bordures
$border-radius: 4px;
$border-radius-lg: 8px;
$border-width: 1px;
$border-color: $gray-300;

// Ombres
$box-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
$box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
$box-shadow-lg: 0 4px 6px rgba(0, 0, 0, 0.1);
```

### Composants Réutilisables

#### Carte de Statut

```typescript
@Component({
  selector: 'app-status-card',
  template: `
    <div class="status-card" [ngClass]="'status-' + statut.toLowerCase()">
      <div class="status-icon">
        <mat-icon>{{ getStatusIcon() }}</mat-icon>
      </div>
      <div class="status-content">
        <h4>{{ titre }}</h4>
        <p>{{ description }}</p>
        <span class="status-badge">{{ statut }}</span>
      </div>
    </div>
  `,
  styles: [`
    .status-card {
      display: flex;
      padding: 16px;
      border-radius: 8px;
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      border-left: 4px solid;
    }
    
    .status-brouillon { border-left-color: #6C757D; }
    .status-soumis { border-left-color: #17A2B8; }
    .status-en_traitement { border-left-color: #FFC107; }
    .status-approuvé { border-left-color: #28A745; }
    .status-rejeté { border-left-color: #DC3545; }
    
    .status-icon {
      margin-right: 16px;
      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 8px;
    }
  `]
})
export class StatusCardComponent {
  @Input() titre: string;
  @Input() description: string;
  @Input() statut: StatutDossier;
  
  getStatusIcon(): string {
    const icons = {
      'BROUILLON': 'edit',
      'SOUMIS': 'send',
      'EN_TRAITEMENT': 'hourglass_empty',
      'APPROUVÉ': 'check_circle',
      'REJETÉ': 'cancel'
    };
    return icons[this.statut] || 'info';
  }
}
```

#### Timeline de Workflow

```typescript
@Component({
  selector: 'app-workflow-timeline',
  template: `
    <div class="workflow-timeline">
      <div class="timeline-item" 
           *ngFor="let event of events; let i = index"
           [ngClass]="{'completed': event.completed, 'current': event.current}">
        <div class="timeline-marker">
          <mat-icon>{{ event.completed ? 'check' : event.icon }}</mat-icon>
        </div>
        <div class="timeline-content">
          <h5>{{ event.titre }}</h5>
          <p>{{ event.description }}</p>
          <span class="timeline-date">{{ event.date | date:'dd/MM/yyyy HH:mm' }}</span>
        </div>
        <div class="timeline-connector" *ngIf="i < events.length - 1"></div>
      </div>
    </div>
  `,
  styles: [`
    .workflow-timeline {
      position: relative;
      padding: 20px 0;
    }
    
    .timeline-item {
      display: flex;
      margin-bottom: 24px;
      position: relative;
    }
    
    .timeline-marker {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #E9ECEF;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      z-index: 1;
    }
    
    .timeline-item.completed .timeline-marker {
      background: #28A745;
      color: white;
    }
    
    .timeline-item.current .timeline-marker {
      background: #0066CC;
      color: white;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(0, 102, 204, 0.7); }
      50% { box-shadow: 0 0 0 10px rgba(0, 102, 204, 0); }
    }
    
    .timeline-connector {
      position: absolute;
      left: 20px;
      top: 40px;
      width: 2px;
      height: calc(100% - 40px);
      background: #DEE2E6;
    }
    
    .timeline-item.completed .timeline-connector {
      background: #28A745;
    }
  `]
})
export class WorkflowTimelineComponent {
  @Input() events: TimelineEvent[];
}
```

### Responsive Design

**Breakpoints** :
```scss
$breakpoint-xs: 0;
$breakpoint-sm: 576px;
$breakpoint-md: 768px;
$breakpoint-lg: 992px;
$breakpoint-xl: 1200px;
$breakpoint-xxl: 1400px;
```

---

## 📱 NOTIFICATIONS & MESSAGERIE

### Service de Notifications

```typescript
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject } from 'rxjs';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  titre: string;
  message: string;
  dateCreation: Date;
  lue: boolean;
  actionUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new Subject<Notification>();
  notifications$: Observable<Notification> = this.notificationsSubject.asObservable();
  
  private unreadCount = 0;
  
  constructor(private snackBar: MatSnackBar) {
    // Connexion WebSocket pour notifications temps réel
    this.connectWebSocket();
  }
  
  private connectWebSocket(): void {
    const ws = new WebSocket('wss://api.eguce.cm/ws/notifications');
    
    ws.onmessage = (event) => {
      const notification: Notification = JSON.parse(event.data);
      this.notificationsSubject.next(notification);
      this.unreadCount++;
      this.showToast(notification);
    };
  }
  
  showToast(notification: Notification): void {
    this.snackBar.open(notification.message, 'Fermer', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`notification-${notification.type}`]
    });
  }
  
  showSuccess(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 3000,
      panelClass: ['notification-success']
    });
  }
  
  showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['notification-error']
    });
  }
  
  showWarning(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 4000,
      panelClass: ['notification-warning']
    });
  }
  
  getUnreadCount(): number {
    return this.unreadCount;
  }
}
```

### Backend - WebSocket Notifications

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/notifications")
            .setAllowedOrigins("https://eguce.cm")
            .withSockJS();
    }
}

@Service
public class NotificationWebSocketService {
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    public void sendNotificationToUser(String username, Notification notification) {
        messagingTemplate.convertAndSendToUser(
            username,
            "/queue/notifications",
            notification
        );
    }
    
    public void sendNotificationToAll(Notification notification) {
        messagingTemplate.convertAndSend(
            "/topic/notifications",
            notification
        );
    }
}
```

---

## 🧪 TESTS

### Tests Unitaires Angular

```typescript
describe('NouveauDossierImportComponent', () => {
  let component: NouveauDossierImportComponent;
  let fixture: ComponentFixture<NouveauDossierImportComponent>;
  let dossierService: jasmine.SpyObj<DossierImportationService>;
  
  beforeEach(async () => {
    const dossierServiceSpy = jasmine.createSpyObj('DossierImportationService', ['createDossier']);
    
    await TestBed.configureTestingModule({
      declarations: [NouveauDossierImportComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        MatStepperModule
      ],
      providers: [
        { provide: DossierImportationService, useValue: dossierServiceSpy }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(NouveauDossierImportComponent);
    component = fixture.componentInstance;
    dossierService = TestBed.inject(DossierImportationService) as jasmine.SpyObj<DossierImportationService>;
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should initialize form with empty values', () => {
    component.ngOnInit();
    expect(component.dossierForm).toBeDefined();
    expect(component.dossierForm.get('informationsGenerales.typeImportation')?.value).toBe('');
  });
  
  it('should validate required fields', () => {
    component.ngOnInit();
    const form = component.dossierForm;
    
    expect(form.valid).toBeFalsy();
    
    form.patchValue({
      informationsGenerales: {
        typeImportation: 'Marchandise générale',
        regimeDouanier: 'IM4',
        modeTransport: 'MARITIME',
        lieuEntree: 'Port de Douala'
      },
      operateur: {
        numeroFIMEX: 'FIMEX-2025-I000001'
      }
    });
    
    // Should still be invalid because marchandises array is empty
    expect(form.valid).toBeFalsy();
  });
  
  it('should create dossier on submit', () => {
    const mockDossier: DossierImportationDTO = {
      numeroDossier: 'IMP-2025-000001',
      statut: StatutDossier.BROUILLON
    };
    
    dossierService.createDossier.and.returnValue(of(mockDossier));
    
    component.submitDossier();
    
    expect(dossierService.createDossier).toHaveBeenCalled();
  });
});
```

### Tests E2E Cypress

```typescript
describe('Création Dossier d\'Importation', () => {
  beforeEach(() => {
    cy.login('operateur1', 'password'); // Custom command
    cy.visit('/import/nouveau-dossier');
  });
  
  it('devrait créer un nouveau dossier avec succès', () => {
    // Étape 1: Informations Générales
    cy.get('[formControlName="typeImportation"]').type('Marchandise générale');
    cy.get('[formControlName="regimeDouanier"]').select('IM4');
    cy.get('[formControlName="modeTransport"]').select('MARITIME');
    cy.get('[formControlName="lieuEntree"]').type('Port de Douala');
    cy.get('button:contains("Suivant")').click();
    
    // Étape 2: Opérateur
    cy.get('[formControlName="numeroFIMEX"]').type('FIMEX-2025-I000001');
    cy.get('button:contains("Vérifier FIMEX")').click();
    cy.get('.fimex-validation').should('contain', 'FIMEX valide');
    cy.get('button:contains("Suivant")').click();
    
    // Étape 3: Marchandises
    cy.get('button:contains("Ajouter Marchandise")').click();
    cy.get('[formControlName="designation"]').type('Ordinateurs portables');
    cy.get('[formControlName="codeDouanier"]').type('8471300000');
    cy.get('[formControlName="quantite"]').type('100');
    cy.get('[formControlName="unite"]').select('U');
    cy.get('[formControlName="valeurFOB"]').type('50000000');
    cy.get('[formControlName="paysOrigine"]').select('CN');
    cy.get('button:contains("Suivant")').click();
    
    // Étape 4: Documents
    cy.get('input[type="file"]').first().attachFile('facture-proforma.pdf');
    cy.wait(1000); // Attendre upload
    cy.get('button:contains("Suivant")').click();
    
    // Étape 5: Révision
    cy.get('.recap-dossier').should('be.visible');
    cy.get('button:contains("Soumettre")').click();
    
    // Vérification
    cy.url().should('include', '/import/dossier/');
    cy.get('.notification-success').should('contain', 'Dossier créé avec succès');
  });
});
```

### Tests d'Intégration Spring Boot

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class DossierImportationIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @MockBean
    private WorkflowService workflowService;
    
    @Test
    @WithMockUser(roles = "OPERATEUR")
    void shouldCreateDossierImportation() throws Exception {
        CreateDossierRequest request = new CreateDossierRequest();
        request.setTypeImportation("Marchandise générale");
        request.setRegimeDouanier("IM4");
        // ... autres champs
        
        mockMvc.perform(post("/api/v1/import/dossiers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.numeroDossier").exists())
            .andExpect(jsonPath("$.statut").value("BROUILLON"));
    }
    
    @Test
    @WithMockUser(roles = "OPERATEUR")
    void shouldReturnBadRequestWhenInvalidData() throws Exception {
        CreateDossierRequest request = new CreateDossierRequest();
        // Missing required fields
        
        mockMvc.perform(post("/api/v1/import/dossiers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }
}
```

---

## 📊 MONITORING & LOGGING

### Logging Angular

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private logLevel: LogLevel = LogLevel.INFO;
  
  constructor(private http: HttpClient) {}
  
  debug(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  }
  
  info(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.INFO) {
      console.info(`[INFO] ${message}`, data);
    }
  }
  
  warn(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, data);
      this.sendLogToBackend('WARN', message, data);
    }
  }
  
  error(message: string, error?: any): void {
    if (this.logLevel <= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, error);
      this.sendLogToBackend('ERROR', message, error);
    }
  }
  
  private sendLogToBackend(level: string, message: string, data?: any): void {
    this.http.post('/api/logs', {
      level,
      message,
      data,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }).subscribe();
  }
}
```

### Logging Spring Boot

```java
@Aspect
@Component
@Slf4j
public class LoggingAspect {
    
    @Around("execution(* cm.eguce.service.*.*(..))")
    public Object logServiceMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        
        log.info("Entering {}.{}", className, methodName);
        
        long start = System.currentTimeMillis();
        
        try {
            Object result = joinPoint.proceed();
            
            long duration = System.currentTimeMillis() - start;
            log.info("Exiting {}.{} - Duration: {}ms", className, methodName, duration);
            
            return result;
        } catch (Exception e) {
            log.error("Error in {}.{}: {}", className, methodName, e.getMessage(), e);
            throw e;
        }
    }
    
    @Around("@annotation(org.springframework.web.bind.annotation.PostMapping) || " +
            "@annotation(org.springframework.web.bind.annotation.PutMapping) || " +
            "@annotation(org.springframework.web.bind.annotation.DeleteMapping)")
    public Object logControllerMutations(ProceedingJoinPoint joinPoint) throws Throwable {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder
            .currentRequestAttributes()).getRequest();
        
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        String endpoint = request.getRequestURI();
        String method = request.getMethod();
        
        log.info("User {} called {} {}", username, method, endpoint);
        
        return joinPoint.proceed();
    }
}
```

---

## 📚 DOCUMENTATION

### Documentation API (Swagger/OpenAPI)

```java
@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "e-GUCE 3G API",
        version = "1.0",
        description = "API pour le Guichet Unique du Commerce Extérieur - Cameroun",
        contact = @Contact(
            name = "Support GUCE",
            email = "support@eguce.cm"
        )
    ),
    servers = {
        @Server(url = "https://api.eguce.cm", description = "Production"),
        @Server(url = "https://api-preprod.eguce.cm", description = "Pré-production"),
        @Server(url = "http://localhost:8080", description = "Développement")
    }
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT"
)
public class OpenAPIConfig {
}
```

### README du Projet

**Fichier** : `README.md`

```markdown
# e-GUCE 3G - Modules Import & FIMEX

## Description

Implémentation des interfaces graphiques utilisateurs pour les modules Déclaration d'Importation et FIMEX (Fichier des Importateurs et Exportateurs) du système e-GUCE 3G Cameroun.

## Stack Technique

### Frontend
- Angular 20
- TypeScript
- Material Design / PrimeNG
- RxJS
- Keycloak Angular

### Backend
- Spring Boot 3.x
- Java 17
- PostgreSQL
- Camunda 8
- Drools 8
- Apache Kafka

## Prérequis

- Node.js 20+
- npm 10+
- Java 17+
- Maven 3.9+
- Docker & Docker Compose
- PostgreSQL 15+

## Installation

### Frontend

```bash
cd frontend
npm install
npm start
```

L'application sera accessible sur http://localhost:4200

### Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

L'API sera accessible sur http://localhost:8080

## Structure du Projet

```
eguce-3g/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── modules/
│   │   │   │   ├── import/
│   │   │   │   │   ├── components/
│   │   │   │   │   ├── services/
│   │   │   │   │   ├── models/
│   │   │   │   │   └── import.module.ts
│   │   │   │   └── fimex/
│   │   │   │       ├── components/
│   │   │   │       ├── services/
│   │   │   │       ├── models/
│   │   │   │       └── fimex.module.ts
│   │   │   ├── shared/
│   │   │   └── core/
│   │   ├── assets/
│   │   └── environments/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── cm/eguce/
│   │   │   │       ├── controller/
│   │   │   │       ├── service/
│   │   │   │       ├── repository/
│   │   │   │       ├── model/
│   │   │   │       ├── dto/
│   │   │   │       ├── mapper/
│   │   │   │       ├── config/
│   │   │   │       └── EGuceApplication.java
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       ├── db/changelog/
│   │   │       └── processes/ (BPMN)
│   │   └── test/
│   └── pom.xml
├── docker-compose.yml
└── README.md
```

## Tests

### Frontend
```bash
npm test              # Tests unitaires
npm run test:e2e      # Tests E2E
npm run test:coverage # Couverture de code
```

### Backend
```bash
mvn test              # Tests unitaires
mvn verify            # Tests d'intégration
```

## Déploiement

Voir le fichier [DEPLOYMENT.md](./DEPLOYMENT.md) pour les instructions détaillées.

## Documentation

- [Guide Utilisateur](./docs/user-guide.md)
- [Documentation API](https://api.eguce.cm/swagger-ui.html)
- [Architecture Technique](./docs/architecture.md)

## Support

Pour toute question, contactez support@eguce.cm
```

---

## ✅ CHECKLIST D'IMPLÉMENTATION

### Phase 1 : Setup Projet (Semaine 1-2)
- [ ] Initialisation dépôt Git
- [ ] Configuration environnements DEV/REC/PREPROD
- [ ] Setup projets Angular & Spring Boot
- [ ] Configuration Keycloak
- [ ] Setup base de données PostgreSQL
- [ ] Configuration Docker & Docker Compose
- [ ] Setup CI/CD pipelines

### Phase 2 : Backend Core (Semaine 3-6)
- [ ] Modèles de données (Entities)
- [ ] Repositories Spring Data
- [ ] Services métier
- [ ] Controllers REST API
- [ ] Intégration Camunda
- [ ] Intégration Drools
- [ ] Migrations Liquibase
- [ ] Tests unitaires
- [ ] Documentation API (Swagger)

### Phase 3 : Frontend Core (Semaine 7-10)
- [ ] Setup Angular Material / PrimeNG
- [ ] Services HTTP
- [ ] Models TypeScript
- [ ] Routing & Guards
- [ ] Composants partagés
- [ ] Intégration Keycloak
- [ ] Service de notifications
- [ ] Tests unitaires

### Phase 4 : Module FIMEX (Semaine 11-13)
- [ ] Backend : Entities & Repositories
- [ ] Backend : Services & Controllers
- [ ] Backend : Workflow BPMN
- [ ] Backend : Règles Drools
- [ ] Frontend : Dashboard FIMEX
- [ ] Frontend : Formulaire inscription
- [ ] Frontend : Renouvellement
- [ ] Frontend : Amendement
- [ ] Frontend : Liste & recherche
- [ ] Tests E2E

### Phase 5 : Module Import (Semaine 14-18)
- [ ] Backend : Entities & Repositories
- [ ] Backend : Services & Controllers
- [ ] Backend : Workflow BPMN
- [ ] Backend : Règles Drools
- [ ] Frontend : Dashboard Import
- [ ] Frontend : Nouveau dossier (wizard)
- [ ] Frontend : Détail dossier
- [ ] Frontend : Gestion procédures
- [ ] Frontend : Liste & recherche
- [ ] Tests E2E

### Phase 6 : Intégrations (Semaine 19-20)
- [ ] Intégration e-Payment
- [ ] Intégration stockage documents (MinIO/S3)
- [ ] Intégration notifications (Email/SMS)
- [ ] Intégration WebSocket
- [ ] Génération documents PDF
- [ ] Tests d'intégration

### Phase 7 : Administration (Semaine 21-22)
- [ ] Interface admin FIMEX
- [ ] Interface admin Import
- [ ] Gestion utilisateurs
- [ ] Paramétrage système
- [ ] Reporting & statistiques
- [ ] Logs & monitoring

### Phase 8 : Finalisation (Semaine 23-24)
- [ ] Optimisation performances
- [ ] Sécurité : audit & corrections
- [ ] Accessibilité (WCAG)
- [ ] Documentation complète
- [ ] Formation utilisateurs
- [ ] Tests de charge
- [ ] Préparation déploiement production

---

## 🚀 DÉMARRAGE RAPIDE

### Commandes Essentielles

**Frontend** :
```bash
# Installation
npm install

# Démarrage dev
npm start

# Build production
npm run build:prod

# Tests
npm test
npm run test:e2e
```

**Backend** :
```bash
# Installation
mvn clean install

# Démarrage dev
mvn spring-boot:run

# Build production
mvn clean package -Pprod

# Tests
mvn test
mvn verify
```

**Docker** :
```bash
# Démarrage environnement complet
docker-compose up -d

# Arrêt
docker-compose down

# Logs
docker-compose logs -f [service-name]
```

---

## 📞 CONTACTS

**Équipe Projet** :
- Chef de Projet : contact@eguce.cm
- Architecte Technique : archi@eguce.cm
- Support : support@eguce.cm

**Liens Utiles** :
- Production : https://eguce.cm
- API : https://api.eguce.cm
- Documentation : https://docs.eguce.cm
- Repository : https://gitlab.eguce.cm/eguce-3g

---

**Document créé le** : 30 Novembre 2025  
**Version** : 1.0  
**Projet** : e-GUCE 3G Cameroun  
**Consortium** : BNS-ADDINN Group
