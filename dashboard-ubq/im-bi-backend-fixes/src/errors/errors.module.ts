import { Module } from '@nestjs/common';
import { ErrorsController } from './errors.controller';
import { ErrorsService } from './errors.service';
import { MongoService } from '../mongo/mongo.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [ErrorsController],
  providers: [ErrorsService, MongoService],
})
export class ErrorsModule {} 