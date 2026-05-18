import api from '../lib/api';
import type {
  LoginResponse,
  RegisterPayload,
  Utilisateur,
  UpdateProfilPayload,
  Commune,
  Arrondissement,
} from '../type';

export const authService = {

  login: (email: string, mdp_user: string) =>
    api.post<LoginResponse>('/accounts/login/', { email, mdp_user }),

  register: (data: RegisterPayload) =>
    api.post('/accounts/register/', data),

  getProfil: () =>
    api.get<Utilisateur>('/accounts/profil/'),
  
  updateProfil: (data: UpdateProfilPayload) =>
    api.patch<{ message: string; token: string; user: { id: number; nom: string; email: string } }>(
        '/accounts/profil/', data
    ),

  motDePasseOublie: (email: string) =>
    api.post('/accounts/mot-de-passe-oublie/', { email }),

  getCommunes: () =>
    api.get<Commune[]>('/accounts/communes/'),

  getArrondissements: (idCommune: string) =>
    api.get<Arrondissement[]>(
      `/dashboard/arrondissements/public/?commune=${idCommune}`
    ),
};