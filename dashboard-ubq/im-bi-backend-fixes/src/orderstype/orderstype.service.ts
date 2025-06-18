import { Injectable } from '@nestjs/common';
import { MongoService } from '../mongo/mongo.service';

@Injectable()
export class OrdersTypeService {
  constructor(private readonly mongoService: MongoService) {}

  async getOrders(query: {
    account_name?: string | string[];
    year?: number;
    month?: string;
    day?: string;
    type?: string;
    type_channel?: string;
    payment_provider?: string;
  }) {
    const db = await this.mongoService.connectToDatabase(
      process.env.MONGO_URI_REACHREPORTS,
      process.env.MONGO_DB_NAME_ORDERTYPE,
    );

    const matchStage: any = {};

    if (query.account_name) {
      if (Array.isArray(query.account_name)) {
        matchStage.account_name = { $in: query.account_name };
      } else {
        matchStage.account_name = query.account_name;
      }
    }

    if (query.year) {
      matchStage.$expr = { $eq: [{ $year: '$date' }, query.year] };
    }

    if (query.month) {
      matchStage.month = query.month;
    }

    if (query.day) {
      matchStage.$expr = {
        ...matchStage.$expr,
        $eq: [{ $dayOfMonth: '$date' }, parseInt(query.day, 10)],
      };
    }

    if (query.type) {
      matchStage.type = query.type;
    }

    if (query.type_channel) {
      matchStage.type_channel = query.type_channel;
    }

    if (query.payment_provider) {
      matchStage.payment_provider = query.payment_provider;
    }

    // Ensure only documents with order_number are included
    matchStage.order_number = { $exists: true };

    return db
      .collection('orders_accounts')
      .find(matchStage)
      .sort({ date: 1, type: 1, type_channel: 1, payment_provider: 1 }) // Sort by date, type, type_channel, and payment_provider in ascending order
      .toArray();
  }
}
