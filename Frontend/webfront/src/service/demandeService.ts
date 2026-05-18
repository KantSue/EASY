import api from '../lib/api';
import type { DemandeDetail, HistoriqueResponse } from '../type';

export const demandeService = {

  getMesDemandes: () =>
    api.get<DemandeDetail[]>('/dashboard/demandes/citoyen/'),

  getPDFCitoyen: (id: number) =>
    api.get<{ url_pdf: string }>(`/dashboard/demandes/${id}/pdf/`),

  getFileAttente: () =>
    api.get<DemandeDetail[]>('/dashboard/demandes/'),

  getDetail: (id: number) =>
    api.get<DemandeDetail>(`/dashboard/demandes/${id}/`),
valider: (idAgent: number, idDemande: number) =>
  api.patch(`/dashboard/demandes/${idAgent}/${idDemande}/`, { action: 'VALIDER' }),

refuser: (idAgent: number, idDemande: number, motif: string) =>
  api.patch(`/dashboard/demandes/${idAgent}/${idDemande}/`, { action: 'REFUSER', motif }),

  genererPDF: (id: number) =>
    api.get(`/dashboard/demandes/${id}/acte/pdf/`, { responseType: 'blob' }),

 // Changer la signature — plus besoin d'email en paramètre
  envoyerPDF: (idDemande: number) =>
    api.post(`/dashboard/demandes/${idDemande}/envoyer-pdf/`),
  getHistorique: () =>
    api.get<HistoriqueResponse>('/dashboard/demandes/historique/'),
};