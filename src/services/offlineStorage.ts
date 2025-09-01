import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { User, MatchItem, Conversation, SuggestedItem, RequestItem } from '@/store/useAppStore';

export interface OfflineData {
  user: User | null;
  matches: MatchItem[];
  conversations: Conversation[];
  suggested: SuggestedItem[];
  requests: RequestItem[];
  lastSync: number;
}

export interface PendingAction {
  id: string;
  type: 'create_match' | 'send_message' | 'create_intention' | 'accept_suggestion';
  data: any;
  timestamp: number;
  retries: number;
}

class OfflineStorageService {
  private readonly STORAGE_KEYS = {
    OFFLINE_DATA: '@binomepay_offline_data',
    PENDING_ACTIONS: '@binomepay_pending_actions',
    LAST_SYNC: '@binomepay_last_sync',
  };

  private isOnline = true;
  private syncInProgress = false;

  constructor() {
    // Écouter les changements de connexion
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      // Si on revient en ligne, synchroniser
      if (wasOffline && this.isOnline) {
        this.syncPendingActions();
      }
    });
  }

  // Vérifier l'état de la connexion
  async checkConnectivity(): Promise<boolean> {
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected ?? false;
    return this.isOnline;
  }

  // Sauvegarder les données hors-ligne
  async saveOfflineData(data: Partial<OfflineData>): Promise<void> {
    try {
      const existingData = await this.getOfflineData();
      const updatedData: OfflineData = {
        ...existingData,
        ...data,
        lastSync: Date.now(),
      };

      await AsyncStorage.setItem(
        this.STORAGE_KEYS.OFFLINE_DATA,
        JSON.stringify(updatedData)
      );
    } catch (error) {
      console.error('Erreur lors de la sauvegarde hors-ligne:', error);
    }
  }

  // Récupérer les données hors-ligne
  async getOfflineData(): Promise<OfflineData> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.OFFLINE_DATA);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données hors-ligne:', error);
    }

    // Données par défaut
    return {
      user: null,
      matches: [],
      conversations: [],
      suggested: [],
      requests: [],
      lastSync: 0,
    };
  }

  // Ajouter une action en attente
  async addPendingAction(action: Omit<PendingAction, 'id' | 'timestamp' | 'retries'>): Promise<void> {
    try {
      const pendingActions = await this.getPendingActions();
      const newAction: PendingAction = {
        ...action,
        id: Date.now().toString() + Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        retries: 0,
      };

      pendingActions.push(newAction);
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.PENDING_ACTIONS,
        JSON.stringify(pendingActions)
      );
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'une action en attente:', error);
    }
  }

  // Récupérer les actions en attente
  async getPendingActions(): Promise<PendingAction[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.PENDING_ACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des actions en attente:', error);
      return [];
    }
  }

  // Supprimer une action en attente
  async removePendingAction(actionId: string): Promise<void> {
    try {
      const pendingActions = await this.getPendingActions();
      const filteredActions = pendingActions.filter(action => action.id !== actionId);
      
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.PENDING_ACTIONS,
        JSON.stringify(filteredActions)
      );
    } catch (error) {
      console.error('Erreur lors de la suppression d\'une action en attente:', error);
    }
  }

  // Synchroniser les actions en attente
  async syncPendingActions(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    
    try {
      const pendingActions = await this.getPendingActions();
      
      for (const action of pendingActions) {
        try {
          await this.executePendingAction(action);
          await this.removePendingAction(action.id);
        } catch (error) {
          console.error(`Erreur lors de l'exécution de l'action ${action.id}:`, error);
          
          // Augmenter le compteur de tentatives
          action.retries += 1;
          
          // Supprimer l'action après 3 tentatives échouées
          if (action.retries >= 3) {
            console.warn(`Action ${action.id} supprimée après 3 tentatives`);
            await this.removePendingAction(action.id);
          }
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  // Exécuter une action en attente
  private async executePendingAction(action: PendingAction): Promise<void> {
    // Ici vous intégreriez avec votre API backend
    switch (action.type) {
      case 'send_message':
        // await apiService.sendMessage(action.data);
        console.log('Envoi du message en attente:', action.data);
        break;
        
      case 'create_intention':
        // await apiService.createIntention(action.data);
        console.log('Création de l\'intention en attente:', action.data);
        break;
        
      case 'accept_suggestion':
        // await apiService.acceptSuggestion(action.data);
        console.log('Acceptation de suggestion en attente:', action.data);
        break;
        
      case 'create_match':
        // await apiService.createMatch(action.data);
        console.log('Création de match en attente:', action.data);
        break;
    }
  }

  // Vérifier si des données sont disponibles hors-ligne
  async hasOfflineData(): Promise<boolean> {
    const data = await this.getOfflineData();
    return data.lastSync > 0;
  }

  // Obtenir l'âge des données hors-ligne
  async getOfflineDataAge(): Promise<number> {
    const data = await this.getOfflineData();
    return Date.now() - data.lastSync;
  }

  // Nettoyer les anciennes données hors-ligne
  async cleanOldData(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    const age = await this.getOfflineDataAge();
    
    if (age > maxAge) {
      await AsyncStorage.removeItem(this.STORAGE_KEYS.OFFLINE_DATA);
      await AsyncStorage.removeItem(this.STORAGE_KEYS.PENDING_ACTIONS);
      console.log('Données hors-ligne anciennes supprimées');
    }
  }

  // État de la connexion
  getConnectivityStatus(): boolean {
    return this.isOnline;
  }

  // Actions spécifiques pour l'application
  async saveConversationOffline(conversation: Conversation): Promise<void> {
    const data = await this.getOfflineData();
    const existingIndex = data.conversations.findIndex(c => c.id === conversation.id);
    
    if (existingIndex >= 0) {
      data.conversations[existingIndex] = conversation;
    } else {
      data.conversations.push(conversation);
    }
    
    await this.saveOfflineData({ conversations: data.conversations });
  }

  async saveMatchOffline(match: MatchItem): Promise<void> {
    const data = await this.getOfflineData();
    const existingIndex = data.matches.findIndex(m => m.id === match.id);
    
    if (existingIndex >= 0) {
      data.matches[existingIndex] = match;
    } else {
      data.matches.push(match);
    }
    
    await this.saveOfflineData({ matches: data.matches });
  }

  async sendMessageOffline(conversationId: string, message: string): Promise<void> {
    // Ajouter à la liste des actions en attente
    await this.addPendingAction({
      type: 'send_message',
      data: { conversationId, message, timestamp: Date.now() }
    });
  }

  async createIntentionOffline(intention: Omit<RequestItem, 'id' | 'status'>): Promise<void> {
    // Ajouter à la liste des actions en attente
    await this.addPendingAction({
      type: 'create_intention',
      data: intention
    });
  }
}

export default new OfflineStorageService();