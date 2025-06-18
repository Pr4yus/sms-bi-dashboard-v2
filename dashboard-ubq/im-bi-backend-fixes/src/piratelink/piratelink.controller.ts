import { Controller, Get, Query } from '@nestjs/common';
import { PirateLinkService } from './piratelink.service';
import { ConfigService } from '@nestjs/config';

@Controller('piratelink')
export class PirateLinkController {
  constructor(
    private readonly pirateLinkService: PirateLinkService,
    private readonly configService: ConfigService,
  ) {}

  @Get('accounts')
  getAllAccounts() {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    return this.pirateLinkService.getAllAccounts(uri, dbName);
  }

  @Get('daily')
  getDailyLinks(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    return this.pirateLinkService.getDailyLinks(uri, dbName, startDate, endDate);
  }

  @Get('monthly')
  getMonthlyLinks(
    @Query('startMonth') startMonth: string,
    @Query('endMonth') endMonth?: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    return this.pirateLinkService.getMonthlyLinks(uri, dbName, startMonth, endMonth);
  }

  @Get('yearly')
  async getYearlyLinks(
    @Query('startYear') startYearNumber: number,
    @Query('endYear') endYearNumber?: number,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');

    const startYear = startYearNumber.toString();
    const endYear = endYearNumber?.toString();

    return this.pirateLinkService.getYearlyLinks(uri, dbName, startYear, endYear);
  }

  @Get('daily-account')
  getDailyLinksByAccount(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('accountUid') accountUid: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    return this.pirateLinkService.getDailyLinksByAccount(
      uri,
      dbName,
      startDate,
      accountUid,
      endDate,
    );
  }

  @Get('monthly-account')
  getMonthlyLinksByAccount(
    @Query('startMonth') startMonth: string,
    @Query('accountUid') accountUid: string,
    @Query('endMonth') endMonth?: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    return this.pirateLinkService.getMonthlyLinksByAccount(
      uri,
      dbName,
      startMonth,
      accountUid,
      endMonth,
    );
  }

  @Get('yearly-account')
  getYearlyLinksByAccount(
    @Query('startYear') startYear: string,
    @Query('accountUid') accountUid: string,
    @Query('endYear') endYear?: string,
  ) {
    const startYearNumber = parseInt(startYear, 10);
    const endYearNumber = endYear ? parseInt(endYear, 10) : undefined;
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    return this.pirateLinkService.getYearlyLinksByAccount(
      uri,
      dbName,
      startYearNumber,
      accountUid,
      endYearNumber,
    );
  }
} 