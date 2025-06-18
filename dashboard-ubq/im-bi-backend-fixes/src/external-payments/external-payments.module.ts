import { Module } from '@nestjs/common';
import { ExternalPaymentsService } from './external-payments.service';
import { ExternalPaymentsController } from './external-payments.controller';
import { MongoModule } from '../mongo/mongo.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [MongoModule, ConfigModule],
  providers: [ExternalPaymentsService],
  controllers: [ExternalPaymentsController]
})
export class ExternalPaymentsModule {} 