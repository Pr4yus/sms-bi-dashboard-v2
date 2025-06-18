import { Injectable } from '@nestjs/common';
import { MongoService } from '../mongo/mongo.service';

@Injectable()
export class OrdersService {
  constructor(private readonly mongoService: MongoService) {}

   // Funciones por Channel Type
   async getDailyOrdersByChannelType(
    uri: string,
    dbName: string,
    startDate: string,
    endDate: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    
    const parsedStartDate = new Date(`${startDate}T06:00:00.000Z`);
    const nextDay = new Date(endDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const parsedEndDate = new Date(`${nextDay.toISOString().split('T')[0]}T06:00:00.000Z`);

    return db
      .collection('orders_bychannel')
      .aggregate([
        {
          $match: {
            date: { $gte: parsedStartDate, $lt: parsedEndDate },
          },
        },
        {
          $group: {
            _id: {
              day: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
              channel_type: '$channel_type',
            },
            total_order_amount: { $sum: '$total_order_amount' },
            total_orders: { $sum: '$total_orders' },
            total_in_usd: { $sum: { $toDouble: '$total_in_usd' } },
          },
        },
        {
          $sort: { '_id.day': 1, '_id.channel_type': 1 },
        },
        {
          $group: {
            _id: '$_id.day',
            channels: {
              $push: {
                channel_type: '$_id.channel_type',
                total_order_amount: '$total_order_amount',
                total_orders: '$total_orders',
                total_in_usd: '$total_in_usd',
              },
            },
            total_order_amount: { $sum: '$total_order_amount' },
            total_orders: { $sum: '$total_orders' },
            total_in_usd: { $sum: '$total_in_usd' },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray();
  }

  // Funciones por Payment Provider
  async getDailyOrdersByPaymentProvider(
    uri: string,
    dbName: string,
    startDate: string,
    endDate: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    
    const parsedStartDate = new Date(`${startDate}T06:00:00.000Z`);
    const nextDay = new Date(endDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const parsedEndDate = new Date(`${nextDay.toISOString().split('T')[0]}T06:00:00.000Z`);

    return db
      .collection('orders_bychannel')
      .aggregate([
        {
          $match: {
            date: { $gte: parsedStartDate, $lt: parsedEndDate },
          },
        },
        {
          $group: {
            _id: {
              day: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
              payment_provider: '$payment_provider',
            },
            total_order_amount: { $sum: '$total_order_amount' },
            total_orders: { $sum: '$total_orders' },
            total_in_usd: { $sum: { $toDouble: '$total_in_usd' } },
          },
        },
        {
          $sort: { '_id.day': 1, '_id.payment_provider': 1 },
        },
        {
          $group: {
            _id: '$_id.day',
            providers: {
              $push: {
                payment_provider: '$_id.payment_provider',
                total_order_amount: '$total_order_amount',
                total_orders: '$total_orders',
                total_in_usd: '$total_in_usd',
              },
            },
            total_order_amount: { $sum: '$total_order_amount' },
            total_orders: { $sum: '$total_orders' },
            total_in_usd: { $sum: '$total_in_usd' },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray();
  }

  async getMonthlyOrdersByChannelType(
    uri: string,
    dbName: string,
    startMonth: string,
    endMonth: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    
    const parsedStartDate = new Date(`${startMonth}-01T06:00:00.000Z`);
    
    // Modificación para incluir el último mes completo
    const [endYear, endMonthStr] = endMonth.split('-');
    const endMonthNum = parseInt(endMonthStr);
    const parsedEndDate = new Date(parseInt(endYear), endMonthNum, 0, 23, 59, 59, 999);
  
    return db
      .collection('orders_bychannel')
      .aggregate([
        {
          $match: {
            date: { $gte: parsedStartDate, $lte: parsedEndDate },
          },
        },
        {
          $group: {
            _id: {
              month: { $dateToString: { format: '%Y-%m', date: '$date' } },
              channel_type: '$channel_type',
            },
            total_order_amount: { $sum: '$total_order_amount' },
            total_orders: { $sum: '$total_orders' },
            total_in_usd: { $sum: { $toDouble: '$total_in_usd' } },
          },
        },
        {
          $sort: { '_id.month': 1, '_id.channel_type': 1 },
        },
        {
          $group: {
            _id: '$_id.month',
            channels: {
              $push: {
                channel_type: '$_id.channel_type',
                total_order_amount: '$total_order_amount',
                total_orders: '$total_orders',
                total_in_usd: '$total_in_usd',
              },
            },
            total_order_amount: { $sum: '$total_order_amount' },
            total_orders: { $sum: '$total_orders' },
            total_in_usd: { $sum: '$total_in_usd' },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray();
  }

  async getMonthlyOrdersByPaymentProvider(
    uri: string,
    dbName: string,
    startMonth: string,
    endMonth: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    
    const parsedStartDate = new Date(`${startMonth}-01T06:00:00.000Z`);
    
    // Modificación para incluir el último mes completo
    const [endYear, endMonthStr] = endMonth.split('-');
    const endMonthNum = parseInt(endMonthStr);
    const parsedEndDate = new Date(parseInt(endYear), endMonthNum, 0, 23, 59, 59, 999);
  
    return db
      .collection('orders_bychannel')
      .aggregate([
        {
          $match: {
            date: { $gte: parsedStartDate, $lte: parsedEndDate },
          },
        },
        {
          $group: {
            _id: {
              month: { $dateToString: { format: '%Y-%m', date: '$date' } },
              payment_provider: '$payment_provider',
            },
            total_order_amount: { $sum: '$total_order_amount' },
            total_orders: { $sum: '$total_orders' },
            total_in_usd: { $sum: { $toDouble: '$total_in_usd' } },
          },
        },
        {
          $sort: { '_id.month': 1, '_id.payment_provider': 1 },
        },
        {
          $group: {
            _id: '$_id.month',
            providers: {
              $push: {
                payment_provider: '$_id.payment_provider',
                total_order_amount: '$total_order_amount',
                total_orders: '$total_orders',
                total_in_usd: '$total_in_usd',
              },
            },
            total_order_amount: { $sum: '$total_order_amount' },
            total_orders: { $sum: '$total_orders' },
            total_in_usd: { $sum: '$total_in_usd' },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray();
  }
// Funciones Anuales por Channel Type
async getYearlyOrdersByChannelType(
  uri: string,
  dbName: string,
  startYear: number,
  endYear?: number,
) {
  const db = await this.mongoService.connectToDatabase(uri, dbName);
  
  const parsedStartDate = new Date(`${startYear}-01-01T06:00:00.000Z`);
  const parsedEndDate = new Date(`${(endYear || startYear) + 1}-01-01T06:00:00.000Z`);

  return db
    .collection('orders_bychannel')
    .aggregate([
      {
        $match: {
          date: { $gte: parsedStartDate, $lt: parsedEndDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            channel_type: '$channel_type',
          },
          total_order_amount: { $sum: '$total_order_amount' },
          total_orders: { $sum: '$total_orders' },
          total_in_usd: { $sum: { $toDouble: '$total_in_usd' } },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.channel_type': 1 },
      },
      {
        $group: {
          _id: '$_id.year',
          channels: {
            $push: {
              channel_type: '$_id.channel_type',
              total_order_amount: '$total_order_amount',
              total_orders: '$total_orders',
              total_in_usd: '$total_in_usd',
            },
          },
          total_order_amount: { $sum: '$total_order_amount' },
          total_orders: { $sum: '$total_orders' },
          total_in_usd: { $sum: '$total_in_usd' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])
    .toArray();
}

// Funciones Anuales por Payment Provider
async getYearlyOrdersByPaymentProvider(
  uri: string,
  dbName: string,
  startYear: number,
  endYear?: number,
) {
  const db = await this.mongoService.connectToDatabase(uri, dbName);
  
  const parsedStartDate = new Date(`${startYear}-01-01T06:00:00.000Z`);
  const parsedEndDate = new Date(`${(endYear || startYear) + 1}-01-01T06:00:00.000Z`);

  return db
    .collection('orders_bychannel')
    .aggregate([
      {
        $match: {
          date: { $gte: parsedStartDate, $lt: parsedEndDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            payment_provider: '$payment_provider',
          },
          total_order_amount: { $sum: '$total_order_amount' },
          total_orders: { $sum: '$total_orders' },
          total_in_usd: { $sum: { $toDouble: '$total_in_usd' } },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.payment_provider': 1 },
      },
      {
        $group: {
          _id: '$_id.year',
          providers: {
            $push: {
              payment_provider: '$_id.payment_provider',
              total_order_amount: '$total_order_amount',
              total_orders: '$total_orders',
              total_in_usd: '$total_in_usd',
            },
          },
          total_order_amount: { $sum: '$total_order_amount' },
          total_orders: { $sum: '$total_orders' },
          total_in_usd: { $sum: '$total_in_usd' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])
    .toArray();
}

  private generateMonthsArray(startMonth: string, endMonth: string): string[] {
    const start = new Date(`${startMonth}-01T06:00:00.000Z`);
    const end = new Date(`${endMonth}-01T06:00:00.000Z`);
    const months = [];

    while (start <= end) {
      const year = start.getUTCFullYear();
      const month = (start.getUTCMonth() + 1).toString().padStart(2, '0');
      months.push(`${year}-${month}`);
      start.setUTCMonth(start.getUTCMonth() + 1);
    }

    return months;
  }
  // Funciones Diarias por Channel Type con Cliente
async getDailyOrdersByChannelTypeAndClient(
  uri: string,
  dbName: string,
  startDate: string,
  endDate: string,
  clientIds: string[],
) {
  const db = await this.mongoService.connectToDatabase(uri, dbName);
  
  const parsedStartDate = new Date(`${startDate}T06:00:00.000Z`);
  const nextDay = new Date(endDate);
  nextDay.setDate(nextDay.getDate() + 1);
  const parsedEndDate = new Date(`${nextDay.toISOString().split('T')[0]}T06:00:00.000Z`);

  return db
    .collection('orders_bychannel')
    .aggregate([
      {
        $match: {
          client_id: { $in: clientIds },
          date: { $gte: parsedStartDate, $lt: parsedEndDate },
        },
      },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            client_id: '$client_id',
            channel_type: '$channel_type',
          },
          total_order_amount: { $sum: '$total_order_amount' },
          total_orders: { $sum: '$total_orders' },
          total_in_usd: { $sum: { $toDouble: '$total_in_usd' } },
        },
      },
      {
        $sort: { '_id.day': 1, '_id.client_id': 1, '_id.channel_type': 1 },
      },
      {
        $group: {
          _id: {
            day: '$_id.day',
            client_id: '$_id.client_id',
          },
          channels: {
            $push: {
              channel_type: '$_id.channel_type',
              total_order_amount: '$total_order_amount',
              total_orders: '$total_orders',
              total_in_usd: '$total_in_usd',
            },
          },
          total_order_amount: { $sum: '$total_order_amount' },
          total_orders: { $sum: '$total_orders' },
          total_in_usd: { $sum: '$total_in_usd' },
        },
      },
      {
        $group: {
          _id: '$_id.day',
          clients: {
            $push: {
              client_id: '$_id.client_id',
              channels: '$channels',
              total_order_amount: '$total_order_amount',
              total_orders: '$total_orders',
              total_in_usd: '$total_in_usd',
            },
          },
          total_order_amount: { $sum: '$total_order_amount' },
          total_orders: { $sum: '$total_orders' },
          total_in_usd: { $sum: '$total_in_usd' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])
    .toArray();
}

// Funciones Mensuales por Channel Type con Cliente
async getMonthlyOrdersByChannelTypeAndClient(
  uri: string,
  dbName: string,
  startMonth: string,
  endMonth: string,
  clientIds: string[],
) {
  const db = await this.mongoService.connectToDatabase(uri, dbName);
  
  const parsedStartDate = new Date(`${startMonth}-01T06:00:00.000Z`);
  
  // Modificación para incluir el último mes completo
  const [endYear, endMonthStr] = endMonth.split('-');
  const endMonthNum = parseInt(endMonthStr);
  const parsedEndDate = new Date(parseInt(endYear), endMonthNum, 0, 23, 59, 59, 999);

  return db
    .collection('orders_bychannel')
    .aggregate([
      {
        $match: {
          client_id: { $in: clientIds },
          date: { $gte: parsedStartDate, $lte: parsedEndDate },
        },
      },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: '%Y-%m', date: '$date' } },
            client_id: '$client_id',
            channel_type: '$channel_type',
          },
          total_order_amount: { $sum: '$total_order_amount' },
          total_orders: { $sum: '$total_orders' },
          total_in_usd: { $sum: { $toDouble: '$total_in_usd' } },
        },
      },
      {
        $sort: { '_id.month': 1, '_id.client_id': 1, '_id.channel_type': 1 },
      },
      {
        $group: {
          _id: {
            month: '$_id.month',
            client_id: '$_id.client_id',
          },
          channels: {
            $push: {
              channel_type: '$_id.channel_type',
              total_order_amount: '$total_order_amount',
              total_orders: '$total_orders',
              total_in_usd: '$total_in_usd',
            },
          },
          total_order_amount: { $sum: '$total_order_amount' },
          total_orders: { $sum: '$total_orders' },
          total_in_usd: { $sum: '$total_in_usd' },
        },
      },
      {
        $group: {
          _id: '$_id.month',
          clients: {
            $push: {
              client_id: '$_id.client_id',
              channels: '$channels',
              total_order_amount: '$total_order_amount',
              total_orders: '$total_orders',
              total_in_usd: '$total_in_usd',
            },
          },
          total_order_amount: { $sum: '$total_order_amount' },
          total_orders: { $sum: '$total_orders' },
          total_in_usd: { $sum: '$total_in_usd' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])
    .toArray();
}
// Funciones Anuales por Channel Type con Cliente
async getYearlyOrdersByChannelTypeAndClient(
  uri: string,
  dbName: string,
  startYear: number,
  clientIds: string[],
  endYear?: number,
) {
  const db = await this.mongoService.connectToDatabase(uri, dbName);
  
  const parsedStartDate = new Date(`${startYear}-01-01T06:00:00.000Z`);
  const parsedEndDate = new Date(`${(endYear || startYear) + 1}-01-01T06:00:00.000Z`);

  return db
    .collection('orders_bychannel')
    .aggregate([
      {
        $match: {
          client_id: { $in: clientIds },
          date: { $gte: parsedStartDate, $lt: parsedEndDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            client_id: '$client_id',
            channel_type: '$channel_type',
          },
          total_order_amount: { $sum: '$total_order_amount' },
          total_orders: { $sum: '$total_orders' },
          total_in_usd: { $sum: { $toDouble: '$total_in_usd' } },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.client_id': 1, '_id.channel_type': 1 },
      },
      {
        $group: {
          _id: {
            year: '$_id.year',
            client_id: '$_id.client_id',
          },
          channels: {
            $push: {
              channel_type: '$_id.channel_type',
              total_order_amount: '$total_order_amount',
              total_orders: '$total_orders',
              total_in_usd: '$total_in_usd',
            },
          },
          total_order_amount: { $sum: '$total_order_amount' },
          total_orders: { $sum: '$total_orders' },
          total_in_usd: { $sum: '$total_in_usd' },
        },
      },
      {
        $group: {
          _id: '$_id.year',
          clients: {
            $push: {
              client_id: '$_id.client_id',
              channels: '$channels',
              total_order_amount: '$total_order_amount',
              total_orders: '$total_orders',
              total_in_usd: '$total_in_usd',
            },
          },
          total_order_amount: { $sum: '$total_order_amount' },
          total_orders: { $sum: '$total_orders' },
          total_in_usd: { $sum: '$total_in_usd' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])
    .toArray();
}

// Funciones por Payment Provider con Cliente
async getDailyOrdersByPaymentProviderAndClient(
  uri: string,
  dbName: string,
  startDate: string,
  endDate: string,
  clientIds: string[],
) {
  const db = await this.mongoService.connectToDatabase(uri, dbName);
  
  const parsedStartDate = new Date(`${startDate}T06:00:00.000Z`);
  const nextDay = new Date(endDate);
  nextDay.setDate(nextDay.getDate() + 1);
  const parsedEndDate = new Date(`${nextDay.toISOString().split('T')[0]}T06:00:00.000Z`);

  return db
    .collection('orders_bychannel')
    .aggregate([
      {
        $match: {
          client_id: { $in: clientIds },
          date: { $gte: parsedStartDate, $lt: parsedEndDate },
        },
      },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            client_id: '$client_id',
            payment_provider: '$payment_provider',
          },
          total_order_amount: { $sum: '$total_order_amount' },
          total_orders: { $sum: '$total_orders' },
          total_in_usd: { $sum: { $toDouble: '$total_in_usd' } },
        },
      },
      {
        $sort: { '_id.day': 1, '_id.client_id': 1, '_id.payment_provider': 1 },
      },
      {
        $group: {
          _id: {
            day: '$_id.day',
            client_id: '$_id.client_id',
          },
          providers: {
            $push: {
              payment_provider: '$_id.payment_provider',
              total_order_amount: '$total_order_amount',
              total_orders: '$total_orders',
              total_in_usd: '$total_in_usd',
            },
          },
          total_order_amount: { $sum: '$total_order_amount' },
          total_orders: { $sum: '$total_orders' },
          total_in_usd: { $sum: '$total_in_usd' },
        },
      },
      {
        $group: {
          _id: '$_id.day',
          clients: {
            $push: {
              client_id: '$_id.client_id',
              providers: '$providers',
              total_order_amount: '$total_order_amount',
              total_orders: '$total_orders',
              total_in_usd: '$total_in_usd',
            },
          },
          total_order_amount: { $sum: '$total_order_amount' },
          total_orders: { $sum: '$total_orders' },
          total_in_usd: { $sum: '$total_in_usd' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])
    .toArray();
}

// Funciones Mensuales por Payment Provider con Cliente
async getMonthlyOrdersByPaymentProviderAndClient(
  uri: string,
  dbName: string,
  startMonth: string,
  endMonth: string,
  clientIds: string[],
) {
  const db = await this.mongoService.connectToDatabase(uri, dbName);
  
  const parsedStartDate = new Date(`${startMonth}-01T06:00:00.000Z`);
  
  // Modificación para incluir el último mes completo
  const [endYear, endMonthStr] = endMonth.split('-');
  const endMonthNum = parseInt(endMonthStr);
  const parsedEndDate = new Date(parseInt(endYear), endMonthNum, 0, 23, 59, 59, 999);

  return db
    .collection('orders_bychannel')
    .aggregate([
      {
        $match: {
          client_id: { $in: clientIds },
          date: { $gte: parsedStartDate, $lte: parsedEndDate }, // Cambiado a $lte
        },
      },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: '%Y-%m', date: '$date' } },
            client_id: '$client_id',
            payment_provider: '$payment_provider',
          },
          total_order_amount: { $sum: '$total_order_amount' },
          total_orders: { $sum: '$total_orders' },
          total_in_usd: { $sum: { $toDouble: '$total_in_usd' } },
        },
      },
      {
        $sort: { '_id.month': 1, '_id.client_id': 1, '_id.payment_provider': 1 },
      },
      {
        $group: {
          _id: {
            month: '$_id.month',
            client_id: '$_id.client_id',
          },
          providers: {
            $push: {
              payment_provider: '$_id.payment_provider',
              total_order_amount: '$total_order_amount',
              total_orders: '$total_orders',
              total_in_usd: '$total_in_usd',
            },
          },
          total_order_amount: { $sum: '$total_order_amount' },
          total_orders: { $sum: '$total_orders' },
          total_in_usd: { $sum: '$total_in_usd' },
        },
      },
      {
        $group: {
          _id: '$_id.month',
          clients: {
            $push: {
              client_id: '$_id.client_id',
              providers: '$providers',
              total_order_amount: '$total_order_amount',
              total_orders: '$total_orders',
              total_in_usd: '$total_in_usd',
            },
          },
          total_order_amount: { $sum: '$total_order_amount' },
          total_orders: { $sum: '$total_orders' },
          total_in_usd: { $sum: '$total_in_usd' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])
    .toArray();
}

// Funciones Anuales por Payment Provider con Cliente
async getYearlyOrdersByPaymentProviderAndClient(
  uri: string,
  dbName: string,
  startYear: number,
  clientIds: string[],
  endYear?: number,
) {
  const db = await this.mongoService.connectToDatabase(uri, dbName);
  
  const parsedStartDate = new Date(`${startYear}-01-01T06:00:00.000Z`);
  const parsedEndDate = new Date(`${(endYear || startYear) + 1}-01-01T06:00:00.000Z`);

  return db
    .collection('orders_bychannel')
    .aggregate([
      {
        $match: {
          client_id: { $in: clientIds },
          date: { $gte: parsedStartDate, $lte: parsedEndDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            client_id: '$client_id',
            payment_provider: '$payment_provider',
          },
          total_order_amount: { $sum: '$total_order_amount' },
          total_orders: { $sum: '$total_orders' },
          total_in_usd: { $sum: { $toDouble: '$total_in_usd' } },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.client_id': 1, '_id.payment_provider': 1 },
      },
      {
        $group: {
          _id: {
            year: '$_id.year',
            client_id: '$_id.client_id',
          },
          providers: {
            $push: {
              payment_provider: '$_id.payment_provider',
              total_order_amount: '$total_order_amount',
              total_orders: '$total_orders',
              total_in_usd: '$total_in_usd',
            },
          },
          total_order_amount: { $sum: '$total_order_amount' },
          total_orders: { $sum: '$total_orders' },
          total_in_usd: { $sum: '$total_in_usd' },
        },
      },
      {
        $group: {
          _id: '$_id.year',
          clients: {
            $push: {
              client_id: '$_id.client_id',
              providers: '$providers',
              total_order_amount: '$total_order_amount',
              total_orders: '$total_orders',
              total_in_usd: '$total_in_usd',
            },
          },
          total_order_amount: { $sum: '$total_order_amount' },
          total_orders: { $sum: '$total_orders' },
          total_in_usd: { $sum: '$total_in_usd' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])
    .toArray();
}
}