import { Controller, Get, Query, Param } from '@nestjs/common';
import { ExternalPaymentsService } from './external-payments.service';
import { ConfigService } from '@nestjs/config';

@Controller('external-payments')
export class ExternalPaymentsController {
  constructor(
    private readonly externalPaymentsService: ExternalPaymentsService,
    private readonly configService: ConfigService,
  ) {}

  private getConnectionConfig() {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');

    if (!uri || !dbName) {
      throw new Error('MongoDB connection configuration is missing. Please check MONGO_URI and MONGO_DB_NAME environment variables.');
    }

    return { uri, dbName };
  }

  @Get('daily')
  getDailyPayments(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const { uri, dbName } = this.getConnectionConfig();
    return this.externalPaymentsService.getDailyPayments(uri, dbName, startDate, endDate);
  }

  @Get('monthly')
  getMonthlyPayments(
    @Query('startMonth') startMonth: string,
    @Query('endMonth') endMonth?: string,
  ) {
    const { uri, dbName } = this.getConnectionConfig();
    return this.externalPaymentsService.getMonthlyPayments(uri, dbName, startMonth, endMonth);
  }

  @Get('yearly')
  getYearlyPayments(
    @Query('startYear') startYear: string,
    @Query('endYear') endYear?: string,
  ) {
    const { uri, dbName } = this.getConnectionConfig();
    return this.externalPaymentsService.getYearlyPayments(uri, dbName, startYear, endYear);
  }

  @Get('daily/account/:accountUid')
  getDailyPaymentsByAccount(
    @Param('accountUid') accountUid: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const { uri, dbName } = this.getConnectionConfig();
    return this.externalPaymentsService.getDailyPaymentsByAccount(
      uri,
      dbName,
      startDate,
      accountUid,
      endDate,
    );
  }

  @Get('monthly/account/:accountUid')
  getMonthlyPaymentsByAccount(
    @Param('accountUid') accountUid: string,
    @Query('startMonth') startMonth: string,
    @Query('endMonth') endMonth?: string,
  ) {
    const { uri, dbName } = this.getConnectionConfig();
    return this.externalPaymentsService.getMonthlyPaymentsByAccount(
      uri,
      dbName,
      accountUid,
      startMonth,
      endMonth
    );
  }

  @Get('yearly/account/:accountUid')
  getYearlyPaymentsByAccount(
    @Param('accountUid') accountUid: string,
    @Query('startYear') startYear: string,
    @Query('endYear') endYear?: string,
  ) {
    const { uri, dbName } = this.getConnectionConfig();
    return this.externalPaymentsService.getYearlyPaymentsByAccount(
      uri,
      dbName,
      accountUid,
      startYear,
      endYear,
    );
  }

  @Get('accounts')
  getAccounts() {
    const { uri, dbName } = this.getConnectionConfig();
    return this.externalPaymentsService.getAccounts(uri, dbName);
  }
} 