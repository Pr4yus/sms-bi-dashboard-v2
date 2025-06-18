import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { MongoService } from 'src/mongo/mongo.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, MongoService],
})
export class OrdersModule {}
