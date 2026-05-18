// src/service/acteService.ts
import api from '../lib/api';
import type { ActeDetail, ActesResponse, SuggestionsResponse } from '../type';

export const acteService = {

  getActes: (q?: string, type?: string) => {
    const parts: string[] = [];
    if (q)    parts.push(`q=${encodeURIComponent(q)}`);
    if (type) parts.push(`type=${encodeURIComponent(type)}`);
    const qs = parts.length ? `?${parts.join('&')}` : '';
    return api.get<ActesResponse>(`/dashboard/actes/${qs}`);
  },

  getDetail: (id: number, idDemande?: number) => {
    const params = idDemande ? `?id_demande=${idDemande}` : '';
    return api.get<ActeDetail>(`/dashboard/actes/${id}/${params}`);
  },

  recherche: (q: string) =>
    api.get<ActeDetail[]>(`/dashboard/recherche/?q=${q}`),

  getSuggestions: (q: string) =>
    api.get<SuggestionsResponse>(`/dashboard/recherche/suggestions/?q=${q}`),
};