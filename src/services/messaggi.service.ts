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
  dataInvio: string;
  dataLettura?: string;
  messaggioPadreId: number | null;
  createdAt: string;
  risposte?: Messaggio[];
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

export interface UserListDTO {
  id: number;
  username: string;
  email: string;
  displayName: string;
  enabled: boolean;
}

export const messaggiService = {
  /**
   * Get all messages for a user (by destinatarioId)
   * Maps to: GET /api/v1/messaggi/destinatario/{destinatarioId}
   */
  getMessaggi: async (destinatarioId: number): Promise<ApiResponse<Messaggio[]>> => {
    return apiRequest<Messaggio[]>(async () => {
      const response = await apiClient.get(`/api/v1/messaggi/destinatario/${destinatarioId}`);
      return response;
    });
  },

  /**
   * Get unread message count
   * Maps to: GET /api/v1/messaggi/destinatario/{destinatarioId}/conteggio-non-letti
   * Backend returns Long directly, we wrap it in an object for consistency
   */
  getUnreadCount: async (destinatarioId: number): Promise<ApiResponse<{ count: number }>> => {
    return apiRequest<{ count: number }>(async () => {
      const response = await apiClient.get(`/api/v1/messaggi/destinatario/${destinatarioId}/conteggio-non-letti`);
      // Backend returns a Long directly, wrap it
      return { data: { count: response.data } };
    });
  },

  /**
   * Create new message
   * Maps to: POST /api/v1/messaggi
   */
  sendMessaggio: async (data: CreaMessaggioRequest): Promise<ApiResponse<Messaggio>> => {
    return apiRequest<Messaggio>(async () => {
      const response = await apiClient.post('/api/v1/messaggi', data);
      return response;
    });
  },

  /**
   * Reply to a message
   * Maps to: POST /api/v1/messaggi/rispondi
   */
  sendRisposta: async (data: RispondiMessaggioRequest): Promise<ApiResponse<Messaggio>> => {
    return apiRequest<Messaggio>(async () => {
      const response = await apiClient.post('/api/v1/messaggi/rispondi', data);
      return response;
    });
  },

  /**
   * Mark message as read
   * Maps to: PUT /api/v1/messaggi/dettaglio/{messaggioId}/segna-letto
   */
  markMessaggioAsRead: async (messaggioId: number): Promise<ApiResponse<void>> => {
    return apiRequest<void>(async () => {
      const response = await apiClient.put(`/api/v1/messaggi/dettaglio/${messaggioId}/segna-letto`);
      return response;
    });
  },

  /**
   * Get message thread (message + replies)
   * Maps to: GET /api/v1/messaggi/dettaglio/{messaggioId}/thread
   * 
   * IMPORTANT: Backend returns List<MessaggioResponse>, not a single message
   * We need to reconstruct the thread structure on the frontend
   */
  getMessaggioThread: async (messaggioId: number): Promise<ApiResponse<Messaggio>> => {
    return apiRequest<Messaggio>(async () => {
      const response = await apiClient.get(`/api/v1/messaggi/dettaglio/${messaggioId}/thread`);
      
      // Backend returns an array of messages in the thread
      // First message is the parent, rest are replies
      const thread = response.data as Messaggio[];
      
      if (thread.length === 0) {
        throw new Error('Thread vuoto');
      }
      
      // Reconstruct the message with replies
      const parentMessage = thread[0];
      const replies = thread.slice(1);
      
      return {
        data: {
          ...parentMessage,
          risposte: replies
        }
      };
    });
  },

  /**
   * Delete message
   * Maps to: DELETE /api/v1/messaggi/dettaglio/{messaggioId}
   */
  eliminaMessaggio: async (messageId: number): Promise<ApiResponse<void>> => {
    return apiRequest<void>(async () => {
      const response = await apiClient.delete(`/api/v1/messaggi/dettaglio/${messageId}`);
      return response;
    });
  },

  /**
   * Get all active users (for recipient selection)
   * Maps to: GET /api/v1/users
   * Returns users sorted by username
   */
  getUtenti: async (): Promise<ApiResponse<UserListDTO[]>> => {
    return apiRequest<UserListDTO[]>(async () => {
      const response = await apiClient.get('/api/v1/users');
      return response;
    });
  },

  /**
   * Get all users including disabled ones (ADMIN only)
   * Maps to: GET /api/v1/users/all
   */
  getAllUtenti: async (): Promise<ApiResponse<UserListDTO[]>> => {
    return apiRequest<UserListDTO[]>(async () => {
      const response = await apiClient.get('/api/v1/users/all');
      return response;
    });
  },

  /**
   * Get single message by ID
   * Maps to: GET /api/v1/messaggi/dettaglio/{messaggioId}
   */
  getMessaggioById: async (messaggioId: number): Promise<ApiResponse<Messaggio>> => {
    return apiRequest<Messaggio>(async () => {
      const response = await apiClient.get(`/api/v1/messaggi/dettaglio/${messaggioId}`);
      return response;
    });
  },

  /**
   * Get messages sent by a user (as mittente)
   * Maps to: GET /api/v1/messaggi/mittente/{mittenteId}
   */
  getMessaggiInviati: async (mittenteId: number): Promise<ApiResponse<Messaggio[]>> => {
    return apiRequest<Messaggio[]>(async () => {
      const response = await apiClient.get(`/api/v1/messaggi/mittente/${mittenteId}`);
      return response;
    });
  },
};

export default messaggiService;