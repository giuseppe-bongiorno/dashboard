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

// Helper per ricostruire l'albero dalla lista piatta
const buildMessageTree = (flatList: Messaggio[]): Messaggio[] => {
  if (!flatList || flatList.length === 0) return [];

  const messageMap = new Map<number, Messaggio>();
  const rootMessages: Messaggio[] = [];

  flatList.forEach(msg => {
    messageMap.set(msg.id, { ...msg, risposte: [] });
  });

  flatList.forEach(msg => {
    const currentMsg = messageMap.get(msg.id)!;
    if (msg.messaggioPadreId && messageMap.has(msg.messaggioPadreId)) {
      const parent = messageMap.get(msg.messaggioPadreId)!;
      parent.risposte!.push(currentMsg);
    } else {
      rootMessages.push(currentMsg);
    }
  });

  // Funzione ricorsiva per ordinare per data
  const sortByDate = (a: Messaggio, b: Messaggio) => 
    new Date(a.dataInvio).getTime() - new Date(b.dataInvio).getTime();

  rootMessages.sort(sortByDate);
  rootMessages.forEach(root => {
    if (root.risposte) root.risposte.sort(sortByDate);
  });

  return rootMessages;
};

// Helper per appiattire l'albero in lista cronologica (per la chat view)
export const flattenThread = (message: Messaggio): Messaggio[] => {
  let flat: Messaggio[] = [message];
  if (message.risposte && message.risposte.length > 0) {
    message.risposte.forEach(reply => {
      flat = flat.concat(flattenThread(reply));
    });
  }
  return flat.sort((a, b) => new Date(a.dataInvio).getTime() - new Date(b.dataInvio).getTime());
};

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
      return { data: { count: response.data } };
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
   * Ricostruisce l'albero dalla lista piatta ricevuta dal backend
   */
   getMessaggioThread: async (messaggioId: number): Promise<ApiResponse<Messaggio[]>> => {
  return apiRequest<Messaggio[]>(async () => {

    const response = await apiClient.get<Messaggio[]>(
      `/api/v1/messaggi/dettaglio/${messaggioId}/thread`
    );

    const messages = response.data.sort(
      (a, b) =>
        new Date(a.dataInvio).getTime() -
        new Date(b.dataInvio).getTime()
    );

    return { data: messages };
    });
  },

  /**
   * Delete message
   */
  eliminaMessaggio: async (messageId: number): Promise<ApiResponse<void>> => {
    return apiRequest<void>(async () => {
      const response = await apiClient.delete(`/api/v1/messaggi/dettaglio/${messageId}`);
      return response;
    });
  },

  /**
   * Get all active users
   */
  getUtenti: async (): Promise<ApiResponse<UserListDTO[]>> => {
    return apiRequest<UserListDTO[]>(async () => {
      const response = await apiClient.get('/api/v1/users');
      return response;
    });
  },

  /**
   * Get all users including disabled ones (ADMIN only)
   */
  getAllUtenti: async (): Promise<ApiResponse<UserListDTO[]>> => {
    return apiRequest<UserListDTO[]>(async () => {
      const response = await apiClient.get('/api/v1/users/all');
      return response;
    });
  },

  /**
   * Get single message by ID
   */
  getMessaggioById: async (messaggioId: number): Promise<ApiResponse<Messaggio>> => {
    return apiRequest<Messaggio>(async () => {
      const response = await apiClient.get(`/api/v1/messaggi/dettaglio/${messaggioId}`);
      return response;
    });
  },

  /**
   * Get messages sent by a user
   */
  getMessaggiInviati: async (mittenteId: number): Promise<ApiResponse<Messaggio[]>> => {
    return apiRequest<Messaggio[]>(async () => {
      const response = await apiClient.get(`/api/v1/messaggi/mittente/${mittenteId}`);
      return response;
    });
  },
};

export default messaggiService;