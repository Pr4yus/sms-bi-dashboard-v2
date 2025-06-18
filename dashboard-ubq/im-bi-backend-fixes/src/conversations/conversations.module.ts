import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { MongoService } from '../mongo/mongo.service';

@Module({
  imports: [],
  controllers: [ConversationsController],
  providers: [ConversationsService, MongoService],
})
export class ConversationsModule {}
