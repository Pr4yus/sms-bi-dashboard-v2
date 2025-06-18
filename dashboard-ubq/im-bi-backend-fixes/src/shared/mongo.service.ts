import { Injectable } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';

@Injectable()
export class MongoService {
  private clients: Map<string, MongoClient> = new Map();

  async connectToDatabase(uri: string, dbName: string): Promise<Db> {
    if (!this.clients.has(uri)) {
      const client = new MongoClient(uri);
      await client.connect();
      this.clients.set(uri, client);
    }

    return this.clients.get(uri).db(dbName);
  }

  async onApplicationShutdown() {
    for (const client of this.clients.values()) {
      await client.close();
    }
  }
} 