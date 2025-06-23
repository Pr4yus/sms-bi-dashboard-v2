import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { SmsAnalyticsModule } from './sms-analytics/sms-analytics.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: parseInt(process.env.CACHE_TTL || '3600'), // 1 hour default
    }),
    DatabaseModule,
    SmsAnalyticsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {} 