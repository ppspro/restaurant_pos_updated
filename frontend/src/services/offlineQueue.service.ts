/**
 * Offline Queue Service
 *
 * Uses browser native IndexedDB to queue orders when the POS loses
 * internet connectivity. Background sync will automatically replay
 * the queue when connectivity is restored.
 */
import { useAuthStore } from '../store/auth.store';
import { api } from '../api/axios';

interface QueuedOrder {
  id: string; // client-generated uuid to prevent dupes
  payload: any;
  queuedAt: number;
}

const DB_NAME = 'PosOfflineDB';
const STORE_NAME = 'orderQueue';
const DB_VERSION = 1;

class OfflineQueueService {
  private db: IDBDatabase | null = null;
  private isProcessing = false;

  constructor() {
    this.initDB();
    // Listen for network restore
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.processQueue());
    }
  }

  private initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async enqueueOrder(payload: any): Promise<void> {
    if (!this.db) await this.initDB();

    const queuedOrder: QueuedOrder = {
      id: crypto.randomUUID(), // Prevent duplicate creation on replay
      payload,
      queuedAt: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.add(queuedOrder);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async processQueue(): Promise<void> {
    if (!this.db) await this.initDB();
    if (!navigator.onLine || this.isProcessing) return;

    this.isProcessing = true;

    try {
      const tx = this.db!.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      const orders: QueuedOrder[] = await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      if (orders.length === 0) return;

      for (const order of orders) {
        try {
          const res = await api.post('/billing/orders', order.payload, {
            headers: {
              'X-Idempotency-Key': order.id,
            }
          });

          if (res.status === 200 || res.status === 201) {
            // Successfully replayed -> remove from IndexedDB
            await this.removeFromQueue(order.id);
          }
        } catch (e) {
          console.warn(`Failed to replay order ${order.id}, will retry later`, e);
          break; // Stop processing if network fails again
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private removeFromQueue(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineQueue = new OfflineQueueService();
