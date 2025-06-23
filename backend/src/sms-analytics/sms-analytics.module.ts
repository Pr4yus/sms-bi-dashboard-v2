import { Module } from '@nestjs/common';
import { SmsAnalyticsController } from './sms-analytics.controller';
import { SmsAnalyticsService } from './sms-analytics.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SmsAnalyticsController],
  providers: [SmsAnalyticsService],
  exports: [SmsAnalyticsService],
})
export class SmsAnalyticsModule {} 