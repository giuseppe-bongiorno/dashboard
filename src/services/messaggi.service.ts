import apiClient, { apiRequest } from './api';
import { ApiResponse } from '@/types';

// Types
export interface Messaggio {
  id: number;
  mittenteId: number;
  destinatarioId: number;
  mittenteNome: string;
  oggetto: string;
  contenuto: string;
  priorita: boolean;
  letto: boolean;
  dataInvio: string;  // data_invio from DB
  dataLettura?: string;  // data_lettura from DB
  messaggioPadreId: number | null;  // messaggio_padre_id from DB
  createdAt: string;  // created_at from DB
  risposte?: Messaggio[];  // Populated by backend for thread endpoint
}

export interface CreaMessaggioRequest {
  mittenteId: number;
  destinatarioId: number;
  mittenteNome: string;
  oggetto: string;
  contenuto: string;
  priorita: boolean;
  messaggioPadreId?: number | null;
}

export interface RispondiMessaggioRequest {
  messaggioPadreId: number;
  mittenteId: number;
  contenuto: string;
}

export interface MessaggiStats {
  totaleNonLetti: number;
  totaleInviati: number;
  totaleRicevuti: number;
}

export const messaggiService = {
  /**
   * Get all messages for a user (by destinatarioId)
   */
  getMessaggi: async (destinatarioId: number): Promise<ApiResponse<Messaggio[]>> => {
    return apiRequest<Messaggio[]>(async () => {
      const response = await apiClient.get(`/api/v1/messaggi/destinatario/${destinatarioId}`);
      return response;
    });
  },

  /**
   * Get unread message count
   */
  getUnreadCount: async (destinatarioId: number): Promise<ApiResponse<{ count: number }>> => {
    return apiRequest<{ count: number }>(async () => {
      const response = await apiClient.get(`/api/v1/messaggi/destinatario/${destinatarioId}/conteggio-non-letti`);
      return response;
    });
  },

  /**
   * Create new message
   */
  sendMessaggio: async (data: CreaMessaggioRequest): Promise<ApiResponse<Messaggio>> => {
    return apiRequest<Messaggio>(async () => {
      const response = await apiClient.post('/api/v1/messaggi', data);
      return response;
    });
  },

  /**
   * Reply to a message
   */
  sendRisposta: async (data: RispondiMessaggioRequest): Promise<ApiResponse<Messaggio>> => {
    return apiRequest<Messaggio>(async () => {
      const response = await apiClient.post('/api/v1/messaggi/rispondi', data);
      return response;
    });
  },

  /**
   * Mark message as read
   */
  markMessaggioAsRead: async (messaggioId: number): Promise<ApiResponse<void>> => {
    return apiRequest<void>(async () => {
      const response = await apiClient.put(`/api/v1/messaggi/dettaglio/${messaggioId}/segna-letto`);
      return response;
    });
  },

  /**
   * Get message thread (message + replies)
   */
  getMessaggioThread: async (messaggioId: number): Promise<ApiResponse<Messaggio>> => {
    return apiRequest<Messaggio>(async () => {
      const response = await apiClient.get(`/api/v1/messaggi/dettaglio/${messaggioId}/thread`);
      return response;
    });
  },

  /**
   * Delete message (if backend supports it)
   */
  eliminaMessaggio: async (messageId: number): Promise<ApiResponse<void>> => {
    return apiRequest<void>(async () => {
      const response = await apiClient.delete(`/api/v1/messaggi/${messageId}`);
      return response;
    });
  },

  /**
   * Get all users (for recipient selection)
   */
  getUtenti: async (): Promise<ApiResponse<Array<{ id: number; nome: string; email: string }>>> => {
    return apiRequest<Array<{ id: number; nome: string; email: string }>>(async () => {
      const response = await apiClient.get('/api/v1/users');
      return response;
    });
  },
};

export default messaggiService;