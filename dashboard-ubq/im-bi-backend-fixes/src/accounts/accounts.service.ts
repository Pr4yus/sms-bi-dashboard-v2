import { Injectable } from '@nestjs/common'; // Add this import
import { MongoService } from '../mongo/mongo.service'; // Adjust the path if necessary
import { AccountWithChannels } from './types/account.types';

interface WABAChannel {
  identifier: string;
  type: string;
}

@Injectable()
export class AccountsService {
  constructor(private readonly mongoService: MongoService) {}

  async getActiveAccountsStatus(uri: string, dbName: string) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    return db
      .collection('accounts')
      .aggregate([
        {
          $match: {
            status: 'ACTIVE',
          },
        },
        {
          $group: {
            _id: {
              package: '$reach.billing.package_id',
              created_on: {
                $dateToString: {
                  format: '%Y-%m',
                  date: { $subtract: ['$created_on', 6 * 60 * 60 * 1000] },
                },
              },
            },
            total: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            package: '$_id.package',
            created_on: '$_id.created_on',
            total: 1,
          },
        },
        {
          $lookup: {
            from: 'package',
            localField: 'package',
            foreignField: '_id',
            as: 'package',
          },
        },
        {
          $unwind: '$package',
        },
        {
          $project: {
            _id: 1,
            total: 1,
            package: '$package.name',
            created_on: 1,
          },
        },
        { $sort: { created_on: -1 } },
      ])
      .toArray();
  }

  async getAllAccountNames(uri: string, dbName: string) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    return db
      .collection('accounts')
      .find(
        { status: 'ACTIVE' }, // Assuming you only want active accounts
        { projection: { name: 1 } }, // Fetch only `name` and `_id`
      )
      .toArray();
  }

  // Cuentas con SMS habilitado y filtradas por país, incluyendo account_uid o _id
  async getSmsEnabledAccounts(uri: string, dbName: string, country: string) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    return db
      .collection('accounts')
      .find(
        {
          'csms.features_enabled': 'sms', // Cuentas con SMS habilitado
          available_countries: country, // Filtrar por país
        },
        { projection: { name: 1, account_uid: 1, _id: 1 } }, // Incluir name, account_uid o _id
      )
      .toArray();
  }

  // Cuentas con conversaciones habilitadas y filtradas por país, incluyendo account_uid o _id
  async getConversationsEnabledAccounts(
    uri: string,
    dbName: string,
    country: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    return db
      .collection('accounts')
      .find(
        {
          'csms.features_enabled': 'conversation', // Cuentas con conversaciones habilitadas
          available_countries: country, // Filtrar por país
        },
        { projection: { name: 1, account_uid: 1, _id: 1 } }, // Incluir name, account_uid o _id
      )
      .toArray();
  }

  async getAllConversationsEnabledAccounts(
    uri: string,
    dbName: string,
  ): Promise<AccountWithChannels[]> {
    const db = await this.mongoService.connectToDatabase(uri, dbName);

    const accounts = await db
      .collection('accounts')
      .find(
        { 'csms.features_enabled': 'conversation' },
        {
          projection: {
            _id: 1,
            name: 1,
            instance: 1,
            'reach.channels': 1,
          },
        },
      )
      .toArray();

    return accounts.map(account => ({
      _id: account._id.toString(),
      name: account.name,
      instance: account.instance,
      waba_channels: account.reach?.channels
        ?.filter(channel => channel.type === 'WABA')
        ?.map(channel => ({
          identifier: channel.identifier,
          type: channel.type,
        })) || [],
    }));
  }
  
  async getAllClientIds(uri: string, dbName: string) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    return db.collection('account_transactions_gtbyday').distinct('client_id');
  }
  async getAllClientIdsReach(uri: string, dbName: string) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    return db.collection('conversations_account_type').distinct('client_id');
  }

  async getAllClientIdsReachV2(uri: string, dbName: string) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    return db.collection('orders_bychannel').distinct('client_id');
  }

  async getWABAChannels(
    uri: string,
    dbName: string,
  ): Promise<AccountWithChannels[]> {
    const db = await this.mongoService.connectToDatabase(uri, dbName);

    const accounts = await db
      .collection('accounts')
      .find(
        { 
          'csms.features_enabled': 'conversation',
          'reach.channels': {
            $elemMatch: {
              type: 'WABA'
            }
          }
        },
        {
          projection: {
            _id: 1,
            name: 1,
            instance: 1,
            'reach.channels': 1,
          },
        },
      )
      .toArray();

    return accounts.map(account => ({
      _id: account._id.toString(),
      name: account.name,
      instance: account.instance,
      waba_channels: account.reach?.channels
        ?.filter(channel => channel.type === 'WABA')
        ?.map(channel => ({
          identifier: channel.identifier,
          type: channel.type,
        })) || [],
    }));
  }
}
