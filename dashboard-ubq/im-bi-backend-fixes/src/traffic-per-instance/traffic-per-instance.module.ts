import { Module } from '@nestjs/common';
import { TrafficPerInstanceController } from './traffic-per-instance.controller';
import { TrafficPerInstanceService } from './traffic-per-instance.service';
import { MongoModule } from '../mongo/mongo.module';

@Module({
  imports: [MongoModule],
  controllers: [TrafficPerInstanceController],
  providers: [TrafficPerInstanceService],
})
export class TrafficPerInstanceModule {} 