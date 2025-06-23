import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';

export interface DatabaseConnection {
  client: MongoClient;
  db: Db;
  connected: boolean;
}

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  private connections: Map<string, DatabaseConnection> = new Map();
  private readonly mongoUri: string;

  constructor() {
    this.mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  }

  async onModuleInit() {
    await this.initializeConnections();
  }

  private async initializeConnections() {
    const countries = ['guatemala', 'costarica', 'elsalvador', 'nicaragua', 'honduras', 'tigohn', 'reach'];
    
    for (const country of countries) {
      try {
        await this.connectToDatabase(country);
        this.logger.log(`✅ Connected to ${country} database`);
      } catch (error) {
        this.logger.error(`❌ Failed to connect to ${country} database: ${error.message}`);
      }
    }
  }

  private async connectToDatabase(country: string): Promise<void> {
    try {
      const client = new MongoClient(this.mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      await client.connect();
      
      const db = client.db(country);
      
      // Test connection
      await db.admin().ping();
      
      this.connections.set(country, {
        client,
        db,
        connected: true,
      });
      
    } catch (error) {
      this.logger.error(`Connection error for ${country}: ${error.message}`);
      throw error;
    }
  }

  getDatabase(country: string): Db | null {
    const connection = this.connections.get(country);
    return connection?.connected ? connection.db : null;
  }

  getAccountsCollection(country: string) {
    const db = this.getDatabase(country);
    return db?.collection('accounts');
  }

  getTransactionsCollection(country: string) {
    const db = this.getDatabase(country);
    return db?.collection('transactions');
  }

  getTransactionsPerTypeCollection(country: string) {
    const db = this.getDatabase(country);
    return db?.collection('transactionspertype');
  }

  async checkConnectionHealth(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};
    
    for (const [country, connection] of this.connections) {
      try {
        if (connection.connected) {
          await connection.db.admin().ping();
          health[country] = true;
        } else {
          health[country] = false;
        }
      } catch (error) {
        this.logger.warn(`Health check failed for ${country}: ${error.message}`);
        health[country] = false;
      }
    }
    
    return health;
  }

  async closeConnections(): Promise<void> {
    for (const [country, connection] of this.connections) {
      try {
        await connection.client.close();
        this.logger.log(`Closed connection to ${country}`);
      } catch (error) {
        this.logger.error(`Error closing connection to ${country}: ${error.message}`);
      }
    }
    this.connections.clear();
  }

  getConnectionStatus(): Record<string, any> {
    const status: Record<string, any> = {};
    
    for (const [country, connection] of this.connections) {
      status[country] = {
        connected: connection.connected,
        database: connection.db.databaseName,
        collections: {
          accounts: !!this.getAccountsCollection(country),
          transactions: !!this.getTransactionsCollection(country),
          transactionspertype: !!this.getTransactionsPerTypeCollection(country),
        }
      };
    }
    
    return status;
  }
} 