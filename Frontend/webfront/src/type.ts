// ─── Utilisateurs ─────────────────────────────────────────────────────────────
export interface ActesResponse {
  total : number;
  types : { id: number; libelle: string }[];
  actes : ActeDetail[];
}
// src/types.ts
export interface CreateAgentPayload {
  nom_user         : string;
  prenom_user      : string;
  email            : string;
  matricule        : string;
  id_commune       : string;
  id_arondissement : string;
}

export interface Utilisateur {
  id_user          : number;
  nom_user         : string;
  prenom_user      : string;
  email            : string;
  role             : 'citoyen' | 'agent' | 'administrateur';
  nom_commune      : string;
  nom_arondissement: string;
}

export interface Citoyen extends Utilisateur {
  total      : number;
  en_attente : number;
  validees   : number;
  terminees  : number;
}

export interface Agent extends Utilisateur {
  matricule: string;
}

// ─── Localisation ─────────────────────────────────────────────────────────────

export interface Commune {
  id_commune  : number;
  nom_commune : string;
  nom_maire   : string;
}

export interface Arrondissement {
  id_arondissement  : number;
  nom_arondissement : string;
  statut            : 'disponible' | 'indisponible';
  nom_commune?      : string;
}

export interface DijkstraResult {
  disponible          : boolean;
  arrondissement_ferme: string;
  message             : string;
  redirection?        : {
    arrondissement : string;
    commune        : string;
    distance_km    : number;
  };
}

// ─── Actes ────────────────────────────────────────────────────────────────────

export type TypeActe = 'acte naissance' | 'acte mariage' | 'acte décès';

export type RolePersonne =
  | 'enfant'
  | 'pere'
  | 'mere'
  | 'epoux1'
  | 'epoux2'
  | 'defunt'
  | 'temoin'
  | 'temoin2'
  | 'pere_epoux1'
  | 'mere_epoux1'
  | 'pere_epoux2'
  | 'mere_epoux2'
  | 'pere_defunt'
  | 'mere_defunt';

export interface Personne {
  role            : RolePersonne;
  nom_personne    : string;
  prenom_personne : string;
  date_naissance  : string;
  lieu_naiss      : string;
  sexe            : 'Masculin' | 'Féminin';
  profession      : string;
}

export interface Acte {
  id_acte   : number;
  num_acte  : string;
  type_acte : TypeActe;
  date_acte : string;
  personnes : Personne[];
}

// ─── Demandes ─────────────────────────────────────────────────────────────────

export type StatutDemande = 'EN ATTENTE' | 'VALIDER' | 'REFUSER' | 'TERMINER';

export interface Demande {
  id_demande        : number;
  num_demande       : string;
  num_acte          : string;
  statut_demande    : StatutDemande;
  type_acte         : string;
  date_depot        : string;      // ← pas date_demande
  email_citoyen?    : string;
  nom_citoyen?      : string;
  prenom_citoyen?   : string;
  citoyen           : string;      // ← nom complet direct
  arrondissement    : string;      // ← nom direct
  commune           : string;      // ← nom direct
  photo_cin?        : string | null;
  personnes         : Personne[];
  paiement_ok?      : boolean;
  id_agent?         : number | null;
  id_arrondissement : number;
  id_citoyen        : number;
  id_commune        : number;
  id_type_acte      : number;
  motif_refus?      : string | null;
  url_pdf?          : string | null;
}
export interface DemandeResume {
  id_demande     : number;
  num_demande    : string;
  type_acte      : TypeActe;
  statut_demande : StatutDemande;
  date_demande   : string;
  citoyen?       : string;
  date_depot?    : string;
}

// ─── Paiement ─────────────────────────────────────────────────────────────────

export type StatutPaiement = 'EN ATTENTE' | 'CONFIRME' | 'ECHOUE';

export interface Paiement {
  id_paiement     : number;
  montant         : number;
  statut_paiement : StatutPaiement;
  ref_transaction : string;
  date_paiement   : string;
}

export interface SoumettreDemandePayload {
  type_acte         : TypeActe;
  id_arrondissement : number;
  personnes         : Personne[];
  nb_exemplaires    : number;
  montant           : number;
  ref_transaction?  : string;
  num_acte?         : string;
}

// ─── Journal / Historique ─────────────────────────────────────────────────────

export interface JournalEntry {
  id_journal  : number;
  action      : 'VALIDER' | 'REFUSER' | 'CONSULTER';
  motif       : string;
  horodatage  : string;
  num_demande : string;
  type_acte   : string;
  citoyen     : string;
}

// ─── Stats Admin ──────────────────────────────────────────────────────────────

export interface Stats {
  total_demandes       : number;
  en_attente           : number;
  validees             : number;
  refusees             : number;
  terminees            : number;
  paiements_confirmes  : number;
  par_type?            : Record<TypeActe, number>;
  journal_recent?      : JournalEntry[];
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  token : string;
  role  : string;
}

export interface RegisterPayload {
  nom_user         : string;
  prenom_user      : string;
  email            : string;
  mdp_user         : string;
  id_commune       : string;
  id_arondissement : string;
}

export interface UpdateProfilPayload {
  nom_user?    : string;
  prenom_user? : string;
  ancien_mdp?  : string;
  mdp_user?    : string; // ← pas nouveau_mdp
}
// src/types.ts
// Remplacez SuggestionsResponse par :
export interface SuggestionsResponse {
  suggestions: ActeDetail[];
}
// ─── Acte retourné par le backend ─────────────────────────────────────────────
export interface PersonneActe {
  role    : string;
  personne: {
    nom_personne    : string;
    prenom_personne : string;
    date_naissance  : string;
    lieu_naiss      : string;
    sexe            : string;
    profession      : string;
  };
}
export interface ActePersonne {
  role            : string;
  nom_personne    : string;
  prenom_personne : string;
  date_naissance  : string;
  lieu_naiss      : string;
  sexe            : string;
  profession      : string;
}
export interface ActeDetail {
  id_acte        : number;
  num_acte       : string;
  date_acte      : string;
  type_acte      : string;
  email_citoyen? : string;
  paiement_ok?   : boolean;
  id_demande?    : number;
  statut_demande?: string;
  personnes      : ActePersonne[];  // ← champs directs
}

// ─── Demande retournée par le backend ─────────────────────────────────────────
export interface DemandeDetail {
  id_demande        : number;
  num_demande       : string;
  num_acte          : string;
  statut_demande    : string;
  type_acte         : string;
  date_depot        : string;
  citoyen           : string;
  arrondissement    : string;
  commune           : string;
  photo_cin         : string | null;
  personnes         : PersonneActe[];
  id_agent          : number | null;
  id_acte           : number | null;
  email_citoyen     : string;
  paiement_ok       : boolean;
  url_pdf           : string | null;  // ← ajouter
}

export interface HistoriqueResponse {
  total      : number;
  historique : JournalEntry[];
}