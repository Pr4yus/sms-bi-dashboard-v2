import { Module } from '@nestjs/common';
import { OrdersTypeService } from './orderstype.service';
import { OrdersTypeController } from './orderstype.controller';
import { MongoService } from '../mongo/mongo.service';

@Module({
  imports: [],
  providers: [OrdersTypeService, MongoService],
  controllers: [OrdersTypeController],
})
export class OrdersTypeModule {}
