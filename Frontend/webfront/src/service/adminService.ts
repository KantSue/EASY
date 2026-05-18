// src/service/adminService.ts
import api from '../lib/api';
import type { CreateAgentPayload } from '../type';

export const adminService = {
  getStats    : () => api.get('/dashboard/stats/'),
  getCitoyens : () => api.get('/dashboard/citoyens/'),
  getAgents   : () => api.get('/dashboard/agents/'),

  // ← URL correcte dans dashboard pas accounts
  createAgent : (data: CreateAgentPayload) =>
    api.post('/accounts/agents/', data),

  deleteAgent : (id: number) =>
    api.delete(`/dashboard/agents/${id}/`),
};