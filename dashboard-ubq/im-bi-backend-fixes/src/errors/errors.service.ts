import { Injectable } from '@nestjs/common';
import { MongoService } from '../mongo/mongo.service';
import { ObjectId } from 'mongodb';

@Injectable()
export class ErrorsService {
  constructor(private readonly mongoService: MongoService) {}

  private validateObjectId(accountUid: string): ObjectId {
    try {
      return new ObjectId(accountUid);
    } catch (error) {
      throw new Error(`Invalid account ID format: ${accountUid}. Must be a 24 character hex string.`);
    }
  }

  private isRegionalConnection(dbName: string): boolean {
    return dbName === 'csm_carg_claro';
  }

  async getDailyErrors(
    uri: string,
    dbName: string,
    startDate: string,
    endDate: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);

    return db.collection('errorsperday').aggregate([
      {
        $match: {
          datetime: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            date: '$datetime',
            error_code: '$error_code',
            error_description: '$error_description',
          },
          total_errors: { $sum: '$total_errors' },
          accounts: { $addToSet: '$account_name' },
          channels: { $addToSet: '$channel_identifier' }
        },
      },
      {
        $sort: { 
          '_id.date': 1,
          'total_errors': -1 
        },
      },
      {
        $group: {
          _id: '$_id.date',
          errors: {
            $push: {
              error_code: '$_id.error_code',
              error_description: '$_id.error_description',
              total_errors: '$total_errors',
              accounts_affected: { $size: '$accounts' },
              channels_affected: { $size: '$channels' }
            },
          },
          daily_total: { $sum: '$total_errors' }
        }
      },
      {
        $sort: { 
          _id: 1 
        }
      },
      {
        $group: {
          _id: null,
          days: {
            $push: {
              date: '$_id',
              total_errors: '$daily_total',
              errors: '$errors'
            }
          },
          total_global: { $sum: '$daily_total' }
        }
      },
      {
        $project: {
          _id: 0,
          total_global: 1,
          days: 1,
          date_range: {
            start: startDate,
            end: endDate
          }
        }
      }
    ]).toArray();
  }

  async getMonthlyErrors(
    uri: string,
    dbName: string,
    startMonth: string,
    endMonth?: string,
  ) {
    console.log('URI:', uri);
    console.log('DB:', dbName);
    const db = await this.mongoService.connectToDatabase(uri, dbName);

    const result = await db.collection('errorsperday').aggregate([
      {
        $match: {
          datetime: {
            $gte: `${startMonth}-01`,
            $lte: endMonth ? `${endMonth}-31` : `${startMonth}-31`,
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $substr: ['$datetime', 0, 7] },
            error_code: '$error_code',
            error_description: '$error_description',
          },
          total_errors: { $sum: '$total_errors' },
          accounts: { $addToSet: '$account_name' }
        },
      },
      {
        $sort: { 
          '_id.month': 1,
          'total_errors': -1 
        },
      },
      {
        $group: {
          _id: '$_id.month',
          errors: {
            $push: {
              error_code: '$_id.error_code',
              error_description: '$_id.error_description',
              total_errors: '$total_errors',
              accounts_affected: { $size: '$accounts' }
            },
          },
          monthly_total: { $sum: '$total_errors' }
        }
      },
      {
        $sort: { 
          _id: 1 
        }
      },
      {
        $group: {
          _id: null,
          months: {
            $push: {
              month: '$_id',
              total_errors: '$monthly_total',
              errors: '$errors'
            }
          },
          total_global: { $sum: '$monthly_total' }
        }
      },
      {
        $project: {
          _id: 0,
          total_global: 1,
          months: 1,
          month_range: {
            start: startMonth,
            end: endMonth || startMonth
          }
        }
      }
    ]).toArray();

    console.log('Resultados encontrados:', result.length);
    return result;
  }

  async getYearlyErrors(
    uri: string,
    dbName: string,
    startYear: number,
    endYear?: number,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);

    return db.collection('errorsperday').aggregate([
      {
        $match: {
          datetime: {
            $gte: `${startYear}-01-01`,
            $lte: endYear ? `${endYear}-12-31` : `${startYear}-12-31`,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $substr: ['$datetime', 0, 4] },
            error_code: '$error_code',
            error_description: '$error_description',
          },
          total_errors: { $sum: '$total_errors' },
          accounts: { $addToSet: '$account_name' },
          channels: { $addToSet: '$channel_identifier' }
        },
      },
      {
        $sort: { 
          '_id.year': 1,
          'total_errors': -1 
        },
      },
      {
        $group: {
          _id: '$_id.year',
          errors: {
            $push: {
              error_code: '$_id.error_code',
              error_description: '$_id.error_description',
              total_errors: '$total_errors',
              accounts_affected: { $size: '$accounts' },
              channels_affected: { $size: '$channels' }
            },
          },
          yearly_total: { $sum: '$total_errors' }
        }
      },
      {
        $sort: { 
          _id: 1 
        }
      },
      {
        $group: {
          _id: null,
          years: {
            $push: {
              year: '$_id',
              total_errors: '$yearly_total',
              errors: '$errors'
            }
          },
          total_global: { $sum: '$yearly_total' }
        }
      },
      {
        $project: {
          _id: 0,
          total_global: 1,
          years: 1,
          year_range: {
            start: startYear,
            end: endYear || startYear
          }
        }
      }
    ]).toArray();
  }

  async getDailyErrorsByAccount(
    uri: string,
    dbName: string,
    startDate: string,
    accountUid: string,
    endDate: string,
  ) {
    const isRegional = this.isRegionalConnection(dbName);
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    const objectId = this.validateObjectId(accountUid);

    return db.collection('errorsperday').aggregate([
      {
        $match: {
          datetime: {
            $gte: startDate,
            $lte: endDate,
          },
          account_uid: objectId,
        },
      },
      {
        $group: {
          _id: {
            date: '$datetime',
            error_code: '$error_code',
            error_description: '$error_description',
            channel: '$channel_identifier'
          },
          account_name: { $first: '$account_name' },
          total_errors: { $sum: '$total_errors' },
          accounts: { $addToSet: '$account_name' },
          ...(isRegional ? {} : { channels: { $addToSet: '$channel_identifier' } })
        },
      },
      {
        $sort: { 
          '_id.date': 1,
          'total_errors': -1 
        },
      },
      {
        $group: {
          _id: '$_id.date',
          account_name: { $first: '$account_name' },
          errors: {
            $push: {
              error_code: '$_id.error_code',
              error_description: '$_id.error_description',
              channel: '$_id.channel',
              total_errors: '$total_errors',
              accounts_affected: { $size: '$accounts' },
              ...(isRegional ? {} : { channels_affected: { $size: '$channels' } })
            },
          },
          daily_total: { $sum: '$total_errors' }
        }
      },
      {
        $sort: { 
          _id: 1 
        }
      },
      {
        $group: {
          _id: null,
          account_name: { $first: '$account_name' },
          days: {
            $push: {
              date: '$_id',
              total_errors: '$daily_total',
              errors: '$errors'
            }
          },
          total_account: { $sum: '$daily_total' }
        }
      },
      {
        $project: {
          _id: 0,
          account_name: 1,
          total_account: 1,
          days: 1,
          date_range: {
            start: startDate,
            end: endDate
          }
        }
      }
    ]).toArray();
  }

  async getMonthlyErrorsByAccount(
    uri: string,
    dbName: string,
    startMonth: string,
    accountUid: string,
    endMonth?: string,
  ) {
    const isRegional = this.isRegionalConnection(dbName);
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    const objectId = this.validateObjectId(accountUid);

    return db.collection('errorsperday').aggregate([
      {
        $match: {
          datetime: {
            $gte: `${startMonth}-01`,
            $lte: endMonth ? `${endMonth}-31` : `${startMonth}-31`,
          },
          account_uid: objectId,
        },
      },
      {
        $group: {
          _id: {
            month: { $substr: ['$datetime', 0, 7] },
            error_code: '$error_code',
            error_description: '$error_description',
            channel: '$channel_identifier'
          },
          account_name: { $first: '$account_name' },
          total_errors: { $sum: '$total_errors' },
          accounts: { $addToSet: '$account_name' },
          ...(isRegional ? {} : { channels: { $addToSet: '$channel_identifier' } })
        },
      },
      {
        $sort: { 
          '_id.month': 1,
          'total_errors': -1 
        },
      },
      {
        $group: {
          _id: '$_id.month',
          account_name: { $first: '$account_name' },
          errors: {
            $push: {
              error_code: '$_id.error_code',
              error_description: '$_id.error_description',
              channel: '$_id.channel',
              total_errors: '$total_errors',
              accounts_affected: { $size: '$accounts' },
              ...(isRegional ? {} : { channels_affected: { $size: '$channels' } })
            },
          },
          monthly_total: { $sum: '$total_errors' }
        }
      },
      {
        $sort: { 
          _id: 1 
        }
      },
      {
        $group: {
          _id: null,
          account_name: { $first: '$account_name' },
          months: {
            $push: {
              month: '$_id',
              total_errors: '$monthly_total',
              errors: '$errors'
            }
          },
          total_account: { $sum: '$monthly_total' }
        }
      },
      {
        $project: {
          _id: 0,
          account_name: 1,
          total_account: 1,
          months: 1,
          month_range: {
            start: startMonth,
            end: endMonth || startMonth
          }
        }
      }
    ]).toArray();
  }

  async getYearlyErrorsByAccount(
    uri: string,
    dbName: string,
    startYear: number,
    accountUid: string,
    endYear?: number,
  ) {
    const isRegional = this.isRegionalConnection(dbName);
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    const objectId = this.validateObjectId(accountUid);

    return db.collection('errorsperday').aggregate([
      {
        $match: {
          datetime: {
            $gte: `${startYear}-01-01`,
            $lte: endYear ? `${endYear}-12-31` : `${startYear}-12-31`,
          },
          account_uid: objectId,
        },
      },
      {
        $group: {
          _id: {
            year: { $substr: ['$datetime', 0, 4] },
            error_code: '$error_code',
            error_description: '$error_description',
            channel: '$channel_identifier'
          },
          account_name: { $first: '$account_name' },
          total_errors: { $sum: '$total_errors' },
          accounts: { $addToSet: '$account_name' },
          ...(isRegional ? {} : { channels: { $addToSet: '$channel_identifier' } })
        },
      },
      {
        $sort: { 
          '_id.year': 1,
          'total_errors': -1 
        },
      },
      {
        $group: {
          _id: '$_id.year',
          account_name: { $first: '$account_name' },
          errors: {
            $push: {
              error_code: '$_id.error_code',
              error_description: '$_id.error_description',
              channel: '$_id.channel',
              total_errors: '$total_errors',
              accounts_affected: { $size: '$accounts' },
              ...(isRegional ? {} : { channels_affected: { $size: '$channels' } })
            },
          },
          yearly_total: { $sum: '$total_errors' }
        }
      },
      {
        $sort: { 
          _id: 1 
        }
      },
      {
        $group: {
          _id: null,
          account_name: { $first: '$account_name' },
          years: {
            $push: {
              year: '$_id',
              total_errors: '$yearly_total',
              errors: '$errors'
            }
          },
          total_account: { $sum: '$yearly_total' }
        }
      },
      {
        $project: {
          _id: 0,
          account_name: 1,
          total_account: 1,
          years: 1,
          year_range: {
            start: startYear,
            end: endYear || startYear
          }
        }
      }
    ]).toArray();
  }
} 

