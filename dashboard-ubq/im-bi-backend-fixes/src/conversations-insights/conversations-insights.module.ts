import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConversationsInsightsController } from './conversations-insights.controller';
import { ConversationsInsightsService } from './conversations-insights.service';
import { MongoService } from '../shared/mongo.service';

@Module({
  imports: [ConfigModule],
  controllers: [ConversationsInsightsController],
  providers: [ConversationsInsightsService, MongoService],
})
export class ConversationsInsightsModule {} 