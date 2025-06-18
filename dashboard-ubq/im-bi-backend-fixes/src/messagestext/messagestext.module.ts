import { Module } from '@nestjs/common';
import { MessagestextService } from './messagestext.service';
import { MessagestextController } from './messagestext.controller';
import { MongoService } from 'src/mongo/mongo.service';

@Module({
  providers: [MessagestextService, MongoService],
  controllers: [MessagestextController],
})
export class MessagestextModule {}
