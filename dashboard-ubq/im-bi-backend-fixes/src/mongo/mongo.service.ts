import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';

@Injectable()
export class MongoService implements OnModuleDestroy {
  private clients: Map<string, { client: MongoClient; lastUsed: number }> = new Map();
  private readonly IDLE_TIMEOUT = 300000; // 5 minutos de inactividad antes de cerrar
  private readonly MAX_POOL_SIZE = 10;
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Iniciar el proceso de limpieza de conexiones inactivas
    this.cleanupInterval = setInterval(() => this.cleanupIdleConnections(), 60000); // Revisar cada minuto
  }

  async onModuleDestroy() {
    // Limpiar al detener la aplicación
    clearInterval(this.cleanupInterval);
    await this.closeAllConnections();
  }

  private async closeAllConnections() {
    const closePromises = Array.from(this.clients.values()).map(({ client }) => client.close());
    await Promise.all(closePromises);
    this.clients.clear();
  }

  private getClientKey(uri: string, dbName: string): string {
    return `${uri}_${dbName}`;
  }

  private async cleanupIdleConnections() {
    const now = Date.now();
    const entriesToRemove: string[] = [];

    for (const [key, { client, lastUsed }] of this.clients.entries()) {
      if (now - lastUsed > this.IDLE_TIMEOUT) {
        await client.close();
        entriesToRemove.push(key);
      }
    }

    entriesToRemove.forEach(key => this.clients.delete(key));
  }

  async connectToDatabase(uri: string, dbName: string): Promise<Db> {
    const clientKey = this.getClientKey(uri, dbName);

    // Verificar si ya existe una conexión activa
    const existingClient = this.clients.get(clientKey);
    if (existingClient) {
      // Actualizar el timestamp de último uso
      existingClient.lastUsed = Date.now();
      return existingClient.client.db(dbName);
    }

    // Si hay demasiadas conexiones, cerrar las más antiguas
    if (this.clients.size >= this.MAX_POOL_SIZE) {
      const oldestClient = Array.from(this.clients.entries())
        .sort(([, a], [, b]) => a.lastUsed - b.lastUsed)[0];
      if (oldestClient) {
        await oldestClient[1].client.close();
        this.clients.delete(oldestClient[0]);
      }
    }

    // Crear nueva conexión
    const client = await MongoClient.connect(uri, {
      maxPoolSize: 50,
      minPoolSize: 0,
      maxIdleTimeMS: 60000,
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });

    // Guardar la nueva conexión
    this.clients.set(clientKey, {
      client,
      lastUsed: Date.now()
    });

    return client.db(dbName);
  }

  // Método para cerrar una conexión específica
  async closeConnection(uri: string, dbName: string) {
    const clientKey = this.getClientKey(uri, dbName);
    const clientInfo = this.clients.get(clientKey);
    if (clientInfo) {
      await clientInfo.client.close();
      this.clients.delete(clientKey);
    }
  }
}
