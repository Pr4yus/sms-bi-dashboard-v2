import { Module } from '@nestjs/common';
import { TrafficService } from './traffic.service';
import { TrafficController } from './traffic.controller';
import { MongoService } from '../mongo/mongo.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [TrafficController],
  providers: [TrafficService, MongoService],
})
export class TrafficModule {}
