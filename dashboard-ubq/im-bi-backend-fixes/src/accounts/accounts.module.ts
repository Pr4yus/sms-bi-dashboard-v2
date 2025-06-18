import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { MongoService } from '../mongo/mongo.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [AccountsController],
  providers: [AccountsService, MongoService],
})
export class AccountsModule {}
