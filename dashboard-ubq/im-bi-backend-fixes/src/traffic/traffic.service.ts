import { Injectable } from '@nestjs/common';
import { MongoService } from '../mongo/mongo.service';
import { ObjectId } from 'mongodb';

@Injectable()
export class TrafficService {
  constructor(private readonly mongoService: MongoService) {}

  async getDailyTrafficByClient(
    uri: string,
    dbName: string,
    startDate: string,
    endDate: string,
    clientIds: string[],
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);

    const start = new Date(startDate);
    const end = new Date(endDate);

    return db
      .collection('account_transactions_gtbyday')
      .aggregate([
        {
          $match: {
            client_id: { $in: clientIds },
            date: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: {
              day: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
              account_uid: '$account_uid',
              channel_identifier: '$channel_identifier',
            },
            account_name: { $first: '$account_name' },
            total_sms_ok: { $sum: '$sms_ok' },
            total_sms_error: { $sum: '$sms_error' },
            total_sms: { $sum: { $add: ['$sms_ok', '$sms_error'] } },
          },
        },
        {
          $group: {
            _id: '$_id.day',
            accounts: {
              $push: {
                account_uid: '$_id.account_uid',
                account_name: '$account_name',
                channel_identifier: '$_id.channel_identifier',
                total_sms_ok: '$total_sms_ok',
                total_sms_error: '$total_sms_error',
                total_sms: '$total_sms',
              },
            },
            total_sms_ok: { $sum: '$total_sms_ok' },
            total_sms_error: { $sum: '$total_sms_error' },
            total_sms: { $sum: '$total_sms' },
          },
        },
        {
          $sort: { _id: 1 }, // Ordenamos por día
        },
        {
          $project: {
            day: '$_id',
            total_sms_ok: 1,
            total_sms_error: 1,
            total_sms: 1,
            accounts: 1,
          },
        },
      ])
      .toArray();
  }

  async getMonthlyTrafficByClient(
    uri: string,
    dbName: string,
    startMonth: string,
    clientIds: string[],
    endMonth?: string, // `endMonth` es opcional
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);

    // Calculamos las fechas de inicio y fin
    const startDate = new Date(`${startMonth}-01T00:00:00Z`);
    const endDate = endMonth
      ? new Date(
          new Date(`${endMonth}-01T00:00:00Z`).setUTCMonth(
            new Date(`${endMonth}-01T00:00:00Z`).getUTCMonth() + 1,
          ),
        )
      : new Date(new Date(startDate).setUTCMonth(startDate.getUTCMonth() + 1));

    return db
      .collection('account_transactions_gtbyday')
      .aggregate([
        {
          $match: {
            client_id: { $in: clientIds },
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              month: { $dateToString: { format: '%Y-%m', date: '$date' } },
              account_uid: '$account_uid',
              channel_identifier: '$channel_identifier',
            },
            account_name: { $first: '$account_name' },
            total_sms_ok: { $sum: '$sms_ok' },
            total_sms_error: { $sum: '$sms_error' },
            total_sms: { $sum: { $add: ['$sms_ok', '$sms_error'] } },
          },
        },
        {
          $group: {
            _id: '$_id.month',
            accounts: {
              $push: {
                account_uid: '$_id.account_uid',
                account_name: '$account_name',
                channel_identifier: '$_id.channel_identifier',
                total_sms_ok: '$total_sms_ok',
                total_sms_error: '$total_sms_error',
                total_sms: '$total_sms',
              },
            },
            total_sms_ok: { $sum: '$total_sms_ok' },
            total_sms_error: { $sum: '$total_sms_error' },
            total_sms: { $sum: '$total_sms' },
          },
        },
        {
          $sort: { _id: 1 }, // Ordenamos por mes en orden ascendente
        },
        {
          $project: {
            month: '$_id',
            total_sms_ok: 1,
            total_sms_error: 1,
            total_sms: 1,
            accounts: 1,
          },
        },
      ])
      .toArray();
  }

  async getYearlyTrafficByClient(
    uri: string,
    dbName: string,
    startYear: number,
    clientIds: string[],
    endYear?: number,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);

    const startDate = new Date(`${startYear}-01-01T00:00:00Z`);
    const endDate = endYear
      ? new Date(`${endYear + 1}-01-01T00:00:00Z`)
      : new Date(`${startYear + 1}-01-01T00:00:00Z`);

    return db
      .collection('account_transactions_gtbyday')
      .aggregate([
        {
          $match: {
            client_id: { $in: clientIds },
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              account_uid: '$account_uid',
              channel_identifier: '$channel_identifier',
            },
            account_name: { $first: '$account_name' },
            total_sms_ok: { $sum: '$sms_ok' },
            total_sms_error: { $sum: '$sms_error' },
            total_sms: { $sum: { $add: ['$sms_ok', '$sms_error'] } },
          },
        },
        {
          $group: {
            _id: '$_id.year',
            accounts: {
              $push: {
                account_uid: '$_id.account_uid',
                account_name: '$account_name',
                channel_identifier: '$_id.channel_identifier',
                total_sms_ok: '$total_sms_ok',
                total_sms_error: '$total_sms_error',
                total_sms: '$total_sms',
              },
            },
            total_sms_ok: { $sum: '$total_sms_ok' },
            total_sms_error: { $sum: '$total_sms_error' },
            total_sms: { $sum: '$total_sms' },
          },
        },
        {
          $sort: { _id: 1 }, // Sort by year in ascending order
        },
        {
          $project: {
            year: '$_id',
            total_sms_ok: 1,
            total_sms_error: 1,
            total_sms: 1,
            accounts: 1,
          },
        },
      ])
      .toArray();
  }

  async getDailyTraffic(
    uri: string,
    dbName: string,
    startDate: string,
    endDate: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);

    const start = new Date(startDate);
    const end = new Date(endDate);

    return db
      .collection('account_transactions_gtbyday')
      .aggregate([
        {
          $match: {
            date: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: {
              day: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
              account_uid: '$account_uid',
              channel_identifier: '$channel_identifier',
            },
            account_name: { $first: '$account_name' },
            total_sms_ok: { $sum: '$sms_ok' },
            total_sms_error: { $sum: '$sms_error' },
            total_sms: { $sum: { $add: ['$sms_ok', '$sms_error'] } },
          },
        },
        {
          $group: {
            _id: '$_id.day',
            accounts: {
              $push: {
                account_uid: '$_id.account_uid',
                account_name: '$account_name',
                channel_identifier: '$_id.channel_identifier',
                total_sms_ok: '$total_sms_ok',
                total_sms_error: '$total_sms_error',
                total_sms: '$total_sms',
              },
            },
            total_sms_ok: { $sum: '$total_sms_ok' },
            total_sms_error: { $sum: '$total_sms_error' },
            total_sms: { $sum: '$total_sms' },
          },
        },
        {
          $sort: { _id: 1 }, // Ordenamos por día
        },
        {
          $project: {
            day: '$_id',
            total_sms_ok: 1,
            total_sms_error: 1,
            total_sms: 1,
            accounts: 1,
          },
        },
      ])
      .toArray();
  }

  async getMonthlyTraffic(
    uri: string,
    dbName: string,
    startMonth: string,
    endMonth?: string, // `endMonth` es opcional
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);

    // Calculamos las fechas de inicio y fin
    const startDate = new Date(`${startMonth}-01T00:00:00Z`);
    const endDate = endMonth
      ? new Date(
          new Date(`${endMonth}-01T00:00:00Z`).setUTCMonth(
            new Date(`${endMonth}-01T00:00:00Z`).getUTCMonth() + 1,
          ),
        )
      : new Date(new Date(startDate).setUTCMonth(startDate.getUTCMonth() + 1));

    return db
      .collection('account_transactions_gtbyday')
      .aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              month: { $dateToString: { format: '%Y-%m', date: '$date' } },
              account_uid: '$account_uid',
              channel_identifier: '$channel_identifier',
            },
            account_name: { $first: '$account_name' },
            total_sms_ok: { $sum: '$sms_ok' },
            total_sms_error: { $sum: '$sms_error' },
            total_sms: { $sum: { $add: ['$sms_ok', '$sms_error'] } },
          },
        },
        {
          $group: {
            _id: '$_id.month',
            accounts: {
              $push: {
                account_uid: '$_id.account_uid',
                account_name: '$account_name',
                channel_identifier: '$_id.channel_identifier',
                total_sms_ok: '$total_sms_ok',
                total_sms_error: '$total_sms_error',
                total_sms: '$total_sms',
              },
            },
            total_sms_ok: { $sum: '$total_sms_ok' },
            total_sms_error: { $sum: '$total_sms_error' },
            total_sms: { $sum: '$total_sms' },
          },
        },
        {
          $sort: { _id: 1 }, // Ordenamos por mes en orden ascendente
        },
        {
          $project: {
            month: '$_id',
            total_sms_ok: 1,
            total_sms_error: 1,
            total_sms: 1,
            accounts: 1,
          },
        },
      ])
      .toArray();
  }

  async getYearlyTraffic(
    uri: string,
    dbName: string,
    startYear: number,
    endYear?: number,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);

    const startDate = new Date(`${startYear}-01-01T00:00:00Z`);
    const endDate = endYear
      ? new Date(`${endYear + 1}-01-01T00:00:00Z`)
      : new Date(`${startYear + 1}-01-01T00:00:00Z`);

    return db
      .collection('account_transactions_gtbyday')
      .aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              account_uid: '$account_uid',
              channel_identifier: '$channel_identifier',
            },
            account_name: { $first: '$account_name' },
            total_sms_ok: { $sum: '$sms_ok' },
            total_sms_error: { $sum: '$sms_error' },
            total_sms: { $sum: { $add: ['$sms_ok', '$sms_error'] } },
          },
        },
        {
          $group: {
            _id: '$_id.year',
            accounts: {
              $push: {
                account_uid: '$_id.account_uid',
                account_name: '$account_name',
                channel_identifier: '$_id.channel_identifier',
                total_sms_ok: '$total_sms_ok',
                total_sms_error: '$total_sms_error',
                total_sms: '$total_sms',
              },
            },
            total_sms_ok: { $sum: '$total_sms_ok' },
            total_sms_error: { $sum: '$total_sms_error' },
            total_sms: { $sum: '$total_sms' },
          },
        },
        {
          $sort: { _id: 1 }, // Sort by year in ascending order
        },
        {
          $project: {
            year: '$_id',
            total_sms_ok: 1,
            total_sms_error: 1,
            total_sms: 1,
            accounts: 1,
          },
        },
      ])
      .toArray();
  }

  async getTrafficHeatmap(
    uri: string,
    dbName: string,
    accountUid: string,
    year: number,
    month: number,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);

    const startDate = new Date(Date.UTC(year, month - 1, 1, 6));
    const endDate = new Date(Date.UTC(year, month, 1, 6));

    const hourlyAverages = await db
      .collection('transactions')
      .aggregate([
        {
          $match: {
            account_uid: new ObjectId(accountUid),
            direction: 'OUT',
            billable: true,
            channel_type: 'SMS',
            datetime: { $gte: startDate, $lt: endDate },
          },
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: '%Y-%m-%d', date: '$datetime' },
              },
              hour: { $hour: '$datetime' },
            },
            total_sms: {
              $sum: { $subtract: ['$total_credits', '$error_count'] },
            },
          },
        },
        {
          $group: {
            _id: null,
            avgHourlySms: { $avg: '$total_sms' },
          },
        },
        {
          $project: { _id: 0, avgHourlySms: 1 },
        },
      ])
      .toArray();

    const avgSmsPerHour = hourlyAverages[0]?.avgHourlySms || 0;

    return db
      .collection('transactions')
      .aggregate([
        {
          $match: {
            account_uid: new ObjectId(accountUid),
            direction: 'OUT',
            billable: true,
            channel_type: 'SMS',
            datetime: { $gte: startDate, $lt: endDate },
          },
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: '%Y-%m-%d', date: '$datetime' },
              },
              hour: { $hour: '$datetime' },
            },
            total_sms: {
              $sum: { $subtract: ['$total_credits', '$error_count'] },
            },
          },
        },
        {
          $sort: { total_sms: -1 },
        },
        { $limit: 8 },
        {
          $project: {
            _id: 0,
            date: '$_id.date',
            hour: '$_id.hour',
            total_sms: 1,
            percentage_diff_from_avg: {
              $cond: {
                if: { $eq: [avgSmsPerHour, 0] },
                then: 0,
                else: {
                  $multiply: [
                    {
                      $divide: [
                        { $subtract: ['$total_sms', avgSmsPerHour] },
                        avgSmsPerHour,
                      ],
                    },
                    100,
                  ],
                },
              },
            },
          },
        },
      ])
      .toArray();
  }

  async updateMultipleClientIds(
    uri: string,
    dbName: string,
    updates: { oldClientId: string; newClientId: string }[],
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    
    const results = await Promise.all(
      updates.map(update =>
        db
          .collection('account_transactions_gtbyday')
          .updateMany(
            { client_id: update.oldClientId },
            { $set: { client_id: update.newClientId } },
          )
      )
    );
  
    return results;
  }

  async autoUpdateClientIds(uri: string, dbName: string) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    
    // First, get all unique client_ids and their associated account_uids
    const clientAccounts = await db
      .collection('account_transactions_gtbyday')
      .aggregate([
        {
          $group: {
            _id: '$client_id',
            account_uids: { $addToSet: '$account_uid' },
            account_name: { $first: '$account_name' }
          }
        }
      ])
      .toArray();
  
    // Filter clients with only one account_uid
    const clientsToUpdate = clientAccounts.filter(client => 
      client.account_uids.length === 1 && 
      client._id !== client.account_name // Only update if client_id differs from account_name
    );
  
    // Perform updates
    const results = await Promise.all(
      clientsToUpdate.map(client =>
        db.collection('account_transactions_gtbyday').updateMany(
          { client_id: client._id },
          { 
            $set: { 
              client_id: client.account_name,
              last_updated: new Date(),
              updated_by: 'system_auto_update'
            } 
          }
        )
      )
    );
  
    return {
      totalProcessed: clientAccounts.length,
      updated: clientsToUpdate.length,
      results
    };
  }
}
