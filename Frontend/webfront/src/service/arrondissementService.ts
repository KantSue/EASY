// src/service/arrondissementService.ts
import api from '../lib/api';
import type { Arrondissement, DijkstraResult } from '../type';

export const arrondissementService = {

  getPublic: (idCommune?: string) => {
    const params = idCommune ? `?commune=${idCommune}` : '';
    return api.get<Arrondissement[]>(`/dashboard/arrondissements/public/${params}`);
  },

  getAll: () =>
    api.get<Arrondissement[]>('/dashboard/arrondissements/'),

  verifier: (id: number) =>
    api.get<DijkstraResult>(`/dashboard/arrondissements/${id}/verifier/`),

  updateStatut: (id: number, statut: 'disponible' | 'indisponible') =>
    api.patch(`/dashboard/arrondissements/${id}/`, { statut }),
};