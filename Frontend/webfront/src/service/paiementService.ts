import api from '../lib/api';
import type { SoumettreDemandePayload } from '../type';

export const paiementService = {

  soumettre: (data: SoumettreDemandePayload) =>
    api.post('/dashboard/paiements/', data),
};