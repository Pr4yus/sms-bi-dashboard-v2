import { Controller, Get, Query, Param } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConversationsInsightsService } from './conversations-insights.service';
import { ParseIntPipe } from '@nestjs/common';

@Controller('conversationsinsights')
export class ConversationsInsightsController {
  constructor(
    private readonly conversationsInsightsService: ConversationsInsightsService,
    private readonly configService: ConfigService,
  ) {}

  @Get('daily')
  async getDailyInsights(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACHREPORTS');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACHREPORTS');
    return this.conversationsInsightsService.getDailyInsights(
      uri,
      dbName,
      startDate,
      endDate,
    );
  }

  @Get('monthly')
  async getMonthlyInsights(
    @Query('start_month') startMonth: string,
    @Query('end_month') endMonth: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACHREPORTS');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACHREPORTS');
    return this.conversationsInsightsService.getMonthlyInsights(
      uri,
      dbName,
      startMonth,
      endMonth,
    );
  }

  @Get('yearly')
  async getYearlyInsights(
    @Query('start_year', ParseIntPipe) startYear: number,
    @Query('end_year', new ParseIntPipe({ optional: true })) endYear?: number,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACHREPORTS');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACHREPORTS');
    return this.conversationsInsightsService.getYearlyInsights(
      uri,
      dbName,
      startYear,
      endYear,
    );
  }

  // Nuevos endpoints por account
  @Get('daily/account/:accountUid')
  async getDailyInsightsByAccount(
    @Param('accountUid') accountUid: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACHREPORTS');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACHREPORTS');
    return this.conversationsInsightsService.getDailyInsightsByAccount(
      uri,
      dbName,
      startDate,
      accountUid,
      endDate,
    );
  }

  @Get('monthly/account/:accountUid')
  async getMonthlyInsightsByAccount(
    @Param('accountUid') accountUid: string,
    @Query('start_month') startMonth: string,
    @Query('end_month') endMonth: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACHREPORTS');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACHREPORTS');
    return this.conversationsInsightsService.getMonthlyInsightsByAccount(
      uri,
      dbName,
      startMonth,
      accountUid,
      endMonth,
    );
  }

  @Get('yearly/account/:accountUid')
  async getYearlyInsightsByAccount(
    @Param('accountUid') accountUid: string,
    @Query('start_year', ParseIntPipe) startYear: number,
    @Query('end_year', new ParseIntPipe({ optional: true })) endYear?: number,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACHREPORTS');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACHREPORTS');
    return this.conversationsInsightsService.getYearlyInsightsByAccount(
      uri,
      dbName,
      startYear,
      accountUid,
      endYear,
    );
  }

  @Get('accounts')
  async getAccounts() {
    const uri = this.configService.get<string>('MONGO_URI_REACHREPORTS');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACHREPORTS');
    return this.conversationsInsightsService.getAccounts(uri, dbName);
  }
} 