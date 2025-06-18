import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConfigService } from '@nestjs/config';

@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly configService: ConfigService,
  ) {}

  @Get('dailyreach')
  getDailyConversationsByClientIds(
    @Query('client_ids') client_ids: string | string[], // Solo client_ids
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACHREPORTS');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACHREPORTS');

    const clientIdArray = Array.isArray(client_ids)
      ? client_ids
      : client_ids.split(',');

    return this.conversationsService.getDailyConversationsByClient(
      uri,
      dbName,
      startDate,
      endDate,
      clientIdArray, // Pasar solo client_ids al servicio
    );
  }

  @Get('conversations-by-month')
  getMonthlyConversationsByClientIds(
    @Query('client_ids') client_ids: string | string[], // Solo client_ids
    @Query('start_month') startMonth: string,
    @Query('end_month') endMonth: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACHREPORTS');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACHREPORTS');

    const clientIdArray = Array.isArray(client_ids)
      ? client_ids
      : client_ids.split(',');

    return this.conversationsService.getMonthlyConversationsByClient(
      uri,
      dbName,
      startMonth,
      endMonth,
      clientIdArray, // Pasar solo client_ids al servicio
    );
  }

  @Get('conversations-by-year')
  getYearlyConversationsByClientIds(
    @Query('client_ids') client_ids: string | string[], // Solo client_ids
    @Query('start_year') startYear: string,
    @Query('end_year') endYear: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACHREPORTS');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACHREPORTS');

    const numericStartYear = parseInt(startYear, 10);
    const numericEndYear = parseInt(endYear, 10);

    const clientIdArray = Array.isArray(client_ids)
      ? client_ids
      : client_ids.split(',');

    return this.conversationsService.getYearlyConversationsByClient(
      uri,
      dbName,
      numericStartYear,
      clientIdArray, // Pasar solo client_ids al servicio
      numericEndYear,
    );
  }

  @Get('daily')
  async getDailyConversations(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACHREPORTS');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACHREPORTS');
    return this.conversationsService.getDailyConversations(
      uri,
      dbName,
      startDate,
      endDate,
    );
  }

  @Get('monthly')
  async getMonthlyConversations(
    @Query('start_month') startMonth: string,
    @Query('end_month') endMonth: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACHREPORTS');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACHREPORTS');
    return this.conversationsService.getMonthlyConversations(
      uri,
      dbName,
      startMonth,
      endMonth,
    );
  }

  @Get('yearly')
  async getYearlyConversations(
    @Query('start_year', ParseIntPipe) startYear: number,
    @Query('end_year', new ParseIntPipe({ optional: true })) endYear?: number,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACHREPORTS');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACHREPORTS');
    
    return this.conversationsService.getYearlyConversations(
        uri,
        dbName,
        startYear,
        endYear,
    );
  }

  @Get('billing-conversations')
  async getBillingConversations(
    @Query('account_uid') accountUid: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Query('channel_identifier') channelIdentifier?: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');

    return this.conversationsService.getBillingConversations(
      uri,
      dbName,
      accountUid,
      startDate,
      endDate,
      channelIdentifier,
    );
  }

  @Get('billing-conversations2')
  async getBillingConversations2(
    @Query('account_uid') accountUid: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Query('channel_identifier') channelIdentifier?: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');

    return this.conversationsService.getBillingConversations2(
      uri,
      dbName,
      accountUid,
      startDate,
      endDate,
      channelIdentifier,
    );
  }
}
