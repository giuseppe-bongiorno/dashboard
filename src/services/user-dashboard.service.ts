import apiClient, { apiRequest } from './api';
import { ApiResponse } from '@/types';

// ── Types ────────────────────────────────────────────────────────

export interface UserDashboardDocuments {
  totaleDocumenti: number;
  referti: number;
  ricette: number;
  visiteMediche: number;
  certificati: number;
  esenzioni: number;
  vaccini: number;
  scontrini: number;
  invalidita: number;
}

export interface PressioneReading {
  id: number;
  sistolica: number;
  diastolica: number;
  frequenzaCardiaca?: number;
  classificazione?: string;
  dataOra?: string;
  createdAt?: string;
}

export interface GlicemiaReading {
  id: number;
  valore: number;
  classificazione?: string;
  tipoMisurazione?: string;
  dataOra?: string;
  createdAt?: string;
}

export interface Parente {
  id: number;
  nome: string;
  cognome: string;
  tipoParentela: string;
}

export interface AISuggestion {
  icon?: string;
  title: string;
  description: string;
  priority?: string;
  category?: string;
}

export interface EsenzioneItem {
  id: number;
  codiceEsenzione?: string;
  descrizione?: string;
  dataScadenza?: string;
}

export interface CertificatoItem {
  id: number;
  tipoCertificato?: string;
  descrizione?: string;
  dataScadenza?: string;
}

// ── Service ──────────────────────────────────────────────────────

export const userDashboardService = {
  /**
   * Documenti totali dell'utente corrente.
   * Maps to: GET /api/v1/users/documenti
   */
  getDocumenti: async (): Promise<ApiResponse<UserDashboardDocuments>> => {
    return apiRequest<UserDashboardDocuments>(async () => {
      const response = await apiClient.get('/api/v1/users/documenti');
      return response;
    });
  },

  /**
   * Conteggio messaggi non letti.
   * Maps to: GET /api/v1/messaggi/destinatario/{id}/conteggio-non-letti
   */
  getUnreadMessages: async (userId: number): Promise<ApiResponse<number>> => {
    return apiRequest<number>(async () => {
      const response = await apiClient.get(`/api/v1/messaggi/destinatario/${userId}/conteggio-non-letti`);
      // Backend returns Long directly
      return { data: response.data };
    });
  },

  /**
   * Familiari dell'utente.
   * Maps to: GET /api/v1/parenti/user/{userId}
   */
  getParenti: async (userId: number): Promise<ApiResponse<Parente[]>> => {
    return apiRequest<Parente[]>(async () => {
      const response = await apiClient.get(`/api/v1/parenti/user/${userId}`);
      return response;
    });
  },

  /**
   * Ultime misurazioni pressione arteriosa.
   * Maps to: GET /api/v1/pressione/ultime?limit=N
   */
  getUltimePressione: async (limit: number = 7): Promise<ApiResponse<PressioneReading[]>> => {
    return apiRequest<PressioneReading[]>(async () => {
      const response = await apiClient.get(`/api/v1/pressione/ultime?limit=${limit}`);
      return response;
    });
  },

  /**
   * Ultime misurazioni glicemia.
   * Maps to: GET /api/v1/glicemia/ultime?limit=N
   */
  getUltimeGlicemia: async (limit: number = 7): Promise<ApiResponse<GlicemiaReading[]>> => {
    return apiRequest<GlicemiaReading[]>(async () => {
      const response = await apiClient.get(`/api/v1/glicemia/ultime?limit=${limit}`);
      return response;
    });
  },

  /**
   * Suggerimenti AI personalizzati.
   * Maps to: GET /api/v1/suggestions/me
   */
  getSuggestions: async (): Promise<ApiResponse<{ suggestions: AISuggestion[]; count: number }>> => {
    return apiRequest<{ suggestions: AISuggestion[]; count: number }>(async () => {
      const response = await apiClient.get('/api/v1/suggestions/me');
      return response;
    });
  },

  /**
   * Esenzioni dell'utente (per scadenze).
   * Maps to: GET /api/v1/esenzioni/user/{userId}
   */
  getEsenzioni: async (userId: number): Promise<ApiResponse<EsenzioneItem[]>> => {
    return apiRequest<EsenzioneItem[]>(async () => {
      const response = await apiClient.get(`/api/v1/esenzioni/user/${userId}`);
      return response;
    });
  },

  /**
   * Certificati medici dell'utente (per scadenze).
   * Maps to: GET /api/v1/certificati-medici/user/{userId}
   */
  getCertificati: async (userId: number): Promise<ApiResponse<CertificatoItem[]>> => {
    return apiRequest<CertificatoItem[]>(async () => {
      const response = await apiClient.get(`/api/v1/certificati-medici/user/${userId}`);
      return response;
    });
  },
};

export default userDashboardService;