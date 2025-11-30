/**
 * FIMEX - Fichier des Importateurs et Exportateurs
 * Modèles pour le système e-GUCE 3G Cameroun
 */

// =====================================
// ENUMERATIONS
// =====================================

export enum TypeInscriptionFIMEX {
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT',
  IMPORT_EXPORT = 'IMPORT_EXPORT'
}

export enum StatutFIMEX {
  BROUILLON = 'BROUILLON',
  SOUMIS = 'SOUMIS',
  EN_VERIFICATION = 'EN_VERIFICATION',
  EN_ATTENTE_DOCUMENTS = 'EN_ATTENTE_DOCUMENTS',
  EN_ATTENTE_PAIEMENT = 'EN_ATTENTE_PAIEMENT',
  APPROUVE = 'APPROUVE',
  ACTIF = 'ACTIF',
  EXPIRE = 'EXPIRE',
  SUSPENDU = 'SUSPENDU',
  REJETE = 'REJETE',
  ANNULE = 'ANNULE'
}

export enum TypeDocument {
  ATTESTATION_CONFORMITE_FISCALE = 'ATTESTATION_CONFORMITE_FISCALE',
  REGISTRE_COMMERCE = 'REGISTRE_COMMERCE',
  CARTE_CONTRIBUABLE = 'CARTE_CONTRIBUABLE',
  ATTESTATION_IMMATRICULATION = 'ATTESTATION_IMMATRICULATION',
  ATTESTATION_LOCALISATION = 'ATTESTATION_LOCALISATION',
  CNI = 'CNI',
  AGREMENT_ACTIVITE = 'AGREMENT_ACTIVITE',
  AUTORISATION_EXPORTATION = 'AUTORISATION_EXPORTATION',
  DECLARATION_HONNEUR = 'DECLARATION_HONNEUR'
}

export enum FormeJuridique {
  SA = 'SA',
  SARL = 'SARL',
  SAS = 'SAS',
  SNC = 'SNC',
  ETS = 'ETS',
  GIE = 'GIE',
  AUTRE = 'AUTRE'
}

export enum Civilite {
  M = 'M',
  MME = 'Mme',
  MLLE = 'Mlle'
}

// =====================================
// INTERFACES
// =====================================

export interface InscriptionFIMEX {
  id: string;
  numeroFIMEX: string;
  typeInscription: TypeInscriptionFIMEX;
  statut: StatutFIMEX;

  // Informations Entreprise
  entreprise: EntrepriseFIMEX;

  // Adresse Siège
  siege: AdresseSiege;

  // Représentant Légal
  representantLegal: RepresentantLegal;

  // Informations Fiscales
  fiscalite: InformationsFiscales;

  // Documents
  piecesJointes: PieceJointe[];

  // Validité
  dateInscription: Date;
  dateExpiration: Date;
  dateRenouvellement?: Date;
  inscriptionPrecedenteId?: string;

  // Paiement
  montantAPayer: number;
  paye: boolean;
  referencePaiement?: string;
  datePaiement?: Date;

  // Workflow
  workflowInstanceId?: string;
  tacheEnCours?: string;

  // Historique
  historiqueTraitement: EvenementFIMEX[];

  // Audit
  dateCreation: Date;
  dateModification?: Date;
  creePar: string;
  modifiePar?: string;
}

export interface EntrepriseFIMEX {
  raisonSociale: string;
  formeJuridique: FormeJuridique;
  numeroRegistreCommerce: string;
  ninea: string;
  capitalSocial: number;
  dateCreation: Date;
  secteurActivite: string[];
  activitesPrincipales: string[];
}

export interface AdresseSiege {
  adresseComplete: string;
  ville: string;
  region: string;
  boitePostale?: string;
  telephone: string;
  fax?: string;
  email: string;
  siteWeb?: string;
}

export interface RepresentantLegal {
  civilite: Civilite;
  nom: string;
  prenom: string;
  fonction: string;
  nationalite: string;
  numeroCNI: string;
  dateNaissance: Date;
  lieuNaissance: string;
  telephone: string;
  email: string;
}

export interface InformationsFiscales {
  numeroCarteContribuable: string;
  centreImpots: string;
  dateValiditeAttestation: Date;
}

export interface PieceJointe {
  id: string;
  type: TypeDocument;
  nom: string;
  tailleOctets: number;
  mimeType: string;
  cheminStockage: string;
  obligatoire: boolean;
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REJETE';
  dateUpload: Date;
  uploadePar: string;
  commentaire?: string;
}

export interface EvenementFIMEX {
  id: string;
  typeEvenement: string;
  description: string;
  statutAvant?: StatutFIMEX;
  statutApres?: StatutFIMEX;
  utilisateur: string;
  dateEvenement: Date;
  donneesSupplementaires?: Record<string, any>;
}

// =====================================
// DTOs (Data Transfer Objects)
// =====================================

export interface CreateInscriptionRequest {
  typeInscription: TypeInscriptionFIMEX;
  entreprise: EntrepriseFIMEX;
  siege: AdresseSiege;
  representantLegal: RepresentantLegal;
  fiscalite: InformationsFiscales;
}

export interface RenewInscriptionRequest {
  modificationAdresse: boolean;
  nouvelleAdresse?: AdresseSiege;
  documentsRenouveles: string[]; // IDs des nouveaux documents
}

export interface AmendInscriptionRequest {
  typeAmendement: 'ADRESSE' | 'REPRESENTANT' | 'ACTIVITES' | 'DENOMINATION' | 'DOCUMENTS';
  nouvellesDonnees: Partial<InscriptionFIMEX>;
  motif: string;
}

export interface ApprovalRequest {
  taskId: string;
  commentaire?: string;
}

export interface RejectionRequest {
  taskId: string;
  motif: string;
  commentaire?: string;
}

export interface ValidationResponse {
  valid: boolean;
  message: string;
  numeroFIMEX?: string;
  raisonSociale?: string;
  typeInscription?: TypeInscriptionFIMEX;
  dateExpiration?: Date;
}

// =====================================
// SEARCH & FILTER
// =====================================

export interface FIMEXSearchParams {
  numeroFIMEX?: string;
  ninea?: string;
  raisonSociale?: string;
  typeInscription?: TypeInscriptionFIMEX;
  statut?: StatutFIMEX;
  dateDebutInscription?: Date;
  dateFinInscription?: Date;
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface FIMEXStats {
  total: number;
  actifs: number;
  expires: number;
  enAttente: number;
  rejetes: number;
  parType: {
    import: number;
    export: number;
    importExport: number;
  };
}

// =====================================
// REFERENCE DATA
// =====================================

export interface RegionCameroun {
  code: string;
  nom: string;
  chefLieu: string;
}

export interface SecteurActivite {
  code: string;
  libelle: string;
  description?: string;
}

export interface CentreImpots {
  code: string;
  nom: string;
  region: string;
  ville: string;
}

// =====================================
// DOCUMENTS REQUIRED BY TYPE
// =====================================

export const DOCUMENTS_REQUIS_IMPORT: TypeDocument[] = [
  TypeDocument.ATTESTATION_CONFORMITE_FISCALE,
  TypeDocument.REGISTRE_COMMERCE,
  TypeDocument.CARTE_CONTRIBUABLE
];

export const DOCUMENTS_REQUIS_EXPORT: TypeDocument[] = [
  TypeDocument.ATTESTATION_CONFORMITE_FISCALE,
  TypeDocument.REGISTRE_COMMERCE,
  TypeDocument.CARTE_CONTRIBUABLE,
  TypeDocument.ATTESTATION_IMMATRICULATION,
  TypeDocument.ATTESTATION_LOCALISATION,
  TypeDocument.CNI
];

export const DOCUMENTS_REQUIS_IMPORT_EXPORT: TypeDocument[] = [
  ...new Set([...DOCUMENTS_REQUIS_IMPORT, ...DOCUMENTS_REQUIS_EXPORT])
];

// =====================================
// FRAIS INSCRIPTION
// =====================================

export const FRAIS_INSCRIPTION: Record<TypeInscriptionFIMEX, number> = {
  [TypeInscriptionFIMEX.IMPORT]: 50000,
  [TypeInscriptionFIMEX.EXPORT]: 75000,
  [TypeInscriptionFIMEX.IMPORT_EXPORT]: 100000
};

// =====================================
// HELPERS
// =====================================

export function getDocumentsRequis(type: TypeInscriptionFIMEX): TypeDocument[] {
  switch (type) {
    case TypeInscriptionFIMEX.IMPORT:
      return DOCUMENTS_REQUIS_IMPORT;
    case TypeInscriptionFIMEX.EXPORT:
      return DOCUMENTS_REQUIS_EXPORT;
    case TypeInscriptionFIMEX.IMPORT_EXPORT:
      return DOCUMENTS_REQUIS_IMPORT_EXPORT;
    default:
      return [];
  }
}

export function getFraisInscription(type: TypeInscriptionFIMEX): number {
  return FRAIS_INSCRIPTION[type] || 0;
}

export function isStatutActif(statut: StatutFIMEX): boolean {
  return statut === StatutFIMEX.ACTIF;
}

export function isStatutModifiable(statut: StatutFIMEX): boolean {
  return [StatutFIMEX.BROUILLON, StatutFIMEX.EN_ATTENTE_DOCUMENTS].includes(statut);
}

export function getStatutLabel(statut: StatutFIMEX): string {
  const labels: Record<StatutFIMEX, string> = {
    [StatutFIMEX.BROUILLON]: 'Brouillon',
    [StatutFIMEX.SOUMIS]: 'Soumis',
    [StatutFIMEX.EN_VERIFICATION]: 'En vérification',
    [StatutFIMEX.EN_ATTENTE_DOCUMENTS]: 'En attente de documents',
    [StatutFIMEX.EN_ATTENTE_PAIEMENT]: 'En attente de paiement',
    [StatutFIMEX.APPROUVE]: 'Approuvé',
    [StatutFIMEX.ACTIF]: 'Actif',
    [StatutFIMEX.EXPIRE]: 'Expiré',
    [StatutFIMEX.SUSPENDU]: 'Suspendu',
    [StatutFIMEX.REJETE]: 'Rejeté',
    [StatutFIMEX.ANNULE]: 'Annulé'
  };
  return labels[statut] || statut;
}

export function getTypeInscriptionLabel(type: TypeInscriptionFIMEX): string {
  const labels: Record<TypeInscriptionFIMEX, string> = {
    [TypeInscriptionFIMEX.IMPORT]: 'Import',
    [TypeInscriptionFIMEX.EXPORT]: 'Export',
    [TypeInscriptionFIMEX.IMPORT_EXPORT]: 'Import/Export'
  };
  return labels[type] || type;
}

export function getTypeDocumentLabel(type: TypeDocument): string {
  const labels: Record<TypeDocument, string> = {
    [TypeDocument.ATTESTATION_CONFORMITE_FISCALE]: 'Attestation de conformité fiscale',
    [TypeDocument.REGISTRE_COMMERCE]: 'Registre de commerce',
    [TypeDocument.CARTE_CONTRIBUABLE]: 'Carte de contribuable',
    [TypeDocument.ATTESTATION_IMMATRICULATION]: 'Attestation d\'immatriculation',
    [TypeDocument.ATTESTATION_LOCALISATION]: 'Attestation de localisation',
    [TypeDocument.CNI]: 'Carte nationale d\'identité',
    [TypeDocument.AGREMENT_ACTIVITE]: 'Agrément d\'activité commerciale',
    [TypeDocument.AUTORISATION_EXPORTATION]: 'Autorisation d\'exportation',
    [TypeDocument.DECLARATION_HONNEUR]: 'Déclaration sur l\'honneur'
  };
  return labels[type] || type;
}
