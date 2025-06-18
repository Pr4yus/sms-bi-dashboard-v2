import { Module } from '@nestjs/common';
import { PirateLinkController } from './piratelink.controller';
import { PirateLinkService } from './piratelink.service';
import { MongoService } from '../mongo/mongo.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [PirateLinkController],
  providers: [PirateLinkService, MongoService],
})
export class PirateLinkModule {} 