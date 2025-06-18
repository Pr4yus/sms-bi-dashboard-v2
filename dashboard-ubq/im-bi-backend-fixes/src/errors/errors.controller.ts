import { Controller, Get, Query } from '@nestjs/common';
import { ErrorsService } from './errors.service';
import { ConfigService } from '@nestjs/config';

@Controller('errors')
export class ErrorsController {
  constructor(
    private readonly errorsService: ErrorsService,
    private readonly configService: ConfigService,
  ) {}

  // Guatemala
  @Get('daily-gt')
  getDailyErrorsGT(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_GT');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_GT');
    return this.errorsService.getDailyErrors(uri, dbName, startDate, endDate);
  }

  @Get('monthly-gt')
  getMonthlyErrorsGT(
    @Query('startMonth') startMonth: string,
    @Query('endMonth') endMonth?: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_GT');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_GT');
    return this.errorsService.getMonthlyErrors(uri, dbName, startMonth, endMonth);
  }

  @Get('yearly-gt')
  getYearlyErrorsGT(
    @Query('startYear') startYear: string,
    @Query('endYear') endYear?: string,
  ) {
    const startYearNumber = parseInt(startYear, 10);
    const endYearNumber = endYear ? parseInt(endYear, 10) : undefined;
    const uri = this.configService.get<string>('MONGO_URI_GT');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_GT');
    return this.errorsService.getYearlyErrors(uri, dbName, startYearNumber, endYearNumber);
  }

  // Endpoint para errores por cuenta específica
  @Get('daily-account-gt')
  async getDailyErrorsByAccount(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('accountUid') accountUid: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_GT');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_GT');
    
    return this.errorsService.getDailyErrorsByAccount(
      uri,
      dbName,
      startDate,
      accountUid,
      endDate,
    );
  }

  @Get('monthly-account-gt')
  getMonthlyErrorsByAccountGT(
    @Query('startMonth') startMonth: string,
    @Query('accountUid') accountUid: string,
    @Query('endMonth') endMonth?: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_GT');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_GT');
    return this.errorsService.getMonthlyErrorsByAccount(
      uri,
      dbName,
      startMonth,
      accountUid,
      endMonth,
    );
  }

  @Get('yearly-account-gt')
  getYearlyErrorsByAccountGT(
    @Query('startYear') startYear: string,
    @Query('accountUid') accountUid: string,
    @Query('endYear') endYear?: string,
  ) {
    const startYearNumber = parseInt(startYear, 10);
    const endYearNumber = endYear ? parseInt(endYear, 10) : undefined;
    const uri = this.configService.get<string>('MONGO_URI_GT');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_GT');
    return this.errorsService.getYearlyErrorsByAccount(
      uri,
      dbName,
      startYearNumber,
      accountUid,
      endYearNumber,
    );
  }

  // Reach
  @Get('daily-reach')
  getDailyErrorsReach(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    return this.errorsService.getDailyErrors(uri, dbName, startDate, endDate);
  }

  @Get('monthly-reach')
  getMonthlyErrorsReach(
    @Query('startMonth') startMonth: string,
    @Query('endMonth') endMonth?: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    return this.errorsService.getMonthlyErrors(uri, dbName, startMonth, endMonth);
  }

  @Get('yearly-reach')
  getYearlyErrorsReach(
    @Query('startYear') startYear: string,
    @Query('endYear') endYear?: string,
  ) {
    const startYearNumber = parseInt(startYear, 10);
    const endYearNumber = endYear ? parseInt(endYear, 10) : undefined;
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    return this.errorsService.getYearlyErrors(uri, dbName, startYearNumber, endYearNumber);
  }

  @Get('daily-account-reach')
  getDailyErrorsByAccountReach(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('accountUid') accountUid: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    return this.errorsService.getDailyErrorsByAccount(uri, dbName, startDate, accountUid, endDate);
  }

  @Get('monthly-account-reach')
  getMonthlyErrorsByAccountReach(
    @Query('startMonth') startMonth: string,
    @Query('accountUid') accountUid: string,
    @Query('endMonth') endMonth?: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    return this.errorsService.getMonthlyErrorsByAccount(uri, dbName, startMonth, accountUid, endMonth);
  }
  
  @Get('yearly-account-reach')
  getYearlyErrorsByAccountReach(
    @Query('startYear') startYear: string,
    @Query('accountUid') accountUid: string,
    @Query('endYear') endYear?: string,
  ) { 
    const startYearNumber = parseInt(startYear, 10);
    const endYearNumber = endYear ? parseInt(endYear, 10) : undefined;
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    return this.errorsService.getYearlyErrorsByAccount(uri, dbName, startYearNumber, accountUid, endYearNumber);
  }
  
  // Costa Rica
  @Get('daily-cr')
  getDailyErrorsCR(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_CR');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_CR');
    return this.errorsService.getDailyErrors(uri, dbName, startDate, endDate);
  }

  @Get('monthly-cr')
  getMonthlyErrorsCR(
    @Query('startMonth') startMonth: string,
    @Query('endMonth') endMonth?: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_CR');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_CR');
    return this.errorsService.getMonthlyErrors(uri, dbName, startMonth, endMonth);
  }

  @Get('yearly-cr')
  getYearlyErrorsCR(
    @Query('startYear') startYear: string,
    @Query('endYear') endYear?: string,
  ) {
    const startYearNumber = parseInt(startYear, 10);
    const endYearNumber = endYear ? parseInt(endYear, 10) : undefined;
    const uri = this.configService.get<string>('MONGO_URI_CR');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_CR');
    return this.errorsService.getYearlyErrors(uri, dbName, startYearNumber, endYearNumber);
  }

  @Get('daily-account-cr')
  getDailyErrorsByAccountCR(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('accountUid') accountUid: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_CR');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_CR');
    return this.errorsService.getDailyErrorsByAccount(uri, dbName, startDate, accountUid, endDate);
  }

  @Get('monthly-account-cr')
  getMonthlyErrorsByAccountCR(
    @Query('startMonth') startMonth: string,
    @Query('accountUid') accountUid: string,
    @Query('endMonth') endMonth?: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_CR');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_CR');
    return this.errorsService.getMonthlyErrorsByAccount(uri, dbName, startMonth, accountUid, endMonth);
  }

  @Get('yearly-account-cr')
  getYearlyErrorsByAccountCR(
    @Query('startYear') startYear: string,
    @Query('accountUid') accountUid: string,
    @Query('endYear') endYear?: string,
  ) {
    const startYearNumber = parseInt(startYear, 10);
    const endYearNumber = endYear ? parseInt(endYear, 10) : undefined;
    const uri = this.configService.get<string>('MONGO_URI_CR');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_CR');
    return this.errorsService.getYearlyErrorsByAccount(uri, dbName, startYearNumber, accountUid, endYearNumber);
  }
  // El Salvador (SV)
  @Get('daily-sv')
  getDailyErrorsSV(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_SV');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_SV');
    return this.errorsService.getDailyErrors(uri, dbName, startDate, endDate);
  }

  @Get('monthly-sv')
  getMonthlyErrorsSV(
    @Query('startMonth') startMonth: string,
    @Query('endMonth') endMonth?: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_SV');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_SV');
    return this.errorsService.getMonthlyErrors(uri, dbName, startMonth, endMonth);
  }

  @Get('yearly-sv')
  getYearlyErrorsSV(
    @Query('startYear') startYear: string,
    @Query('endYear') endYear?: string,
  ) {
    const startYearNumber = parseInt(startYear, 10);
    const endYearNumber = endYear ? parseInt(endYear, 10) : undefined;
    const uri = this.configService.get<string>('MONGO_URI_SV');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_SV');
    return this.errorsService.getYearlyErrors(uri, dbName, startYearNumber, endYearNumber);
  }

  @Get('daily-account-sv')
  getDailyErrorsByAccountSV(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('accountUid') accountUid: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_SV');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_SV');
    return this.errorsService.getDailyErrorsByAccount(uri, dbName, startDate, accountUid, endDate);
  }

  @Get('monthly-account-sv')
  getMonthlyErrorsByAccountSV(
    @Query('startMonth') startMonth: string,
    @Query('accountUid') accountUid: string,
    @Query('endMonth') endMonth?: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_SV');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_SV');
    return this.errorsService.getMonthlyErrorsByAccount(uri, dbName, startMonth, accountUid, endMonth);
  }

  @Get('yearly-account-sv')
  getYearlyErrorsByAccountSV(
    @Query('startYear') startYear: string,
    @Query('accountUid') accountUid: string,
    @Query('endYear') endYear?: string,
  ) {
    const startYearNumber = parseInt(startYear, 10);
    const endYearNumber = endYear ? parseInt(endYear, 10) : undefined;
    const uri = this.configService.get<string>('MONGO_URI_SV');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_SV');
    return this.errorsService.getYearlyErrorsByAccount(uri, dbName, startYearNumber, accountUid, endYearNumber);
  }

  // Nicaragua (NI)
  @Get('daily-ni')
  getDailyErrorsNI(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_NI');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_NI');
    return this.errorsService.getDailyErrors(uri, dbName, startDate, endDate);
  }

  @Get('monthly-ni')
  getMonthlyErrorsNI(
    @Query('startMonth') startMonth: string,
    @Query('endMonth') endMonth?: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_NI');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_NI');
    return this.errorsService.getMonthlyErrors(uri, dbName, startMonth, endMonth);
  }

  @Get('yearly-ni')
  getYearlyErrorsNI(
    @Query('startYear') startYear: string,
    @Query('endYear') endYear?: string,
  ) {
    const startYearNumber = parseInt(startYear, 10);
    const endYearNumber = endYear ? parseInt(endYear, 10) : undefined;
    const uri = this.configService.get<string>('MONGO_URI_NI');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_NI');
    return this.errorsService.getYearlyErrors(uri, dbName, startYearNumber, endYearNumber);
  }

  @Get('daily-account-ni')
  getDailyErrorsByAccountNI(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('accountUid') accountUid: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_NI');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_NI');
    return this.errorsService.getDailyErrorsByAccount(uri, dbName, startDate, accountUid, endDate);
  }

  @Get('monthly-account-ni')
  getMonthlyErrorsByAccountNI(
    @Query('startMonth') startMonth: string,
    @Query('accountUid') accountUid: string,
    @Query('endMonth') endMonth?: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_NI');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_NI');
    return this.errorsService.getMonthlyErrorsByAccount(uri, dbName, startMonth, accountUid, endMonth);
  }

  @Get('yearly-account-ni')
  getYearlyErrorsByAccountNI(
    @Query('startYear') startYear: string,
    @Query('accountUid') accountUid: string,
    @Query('endYear') endYear?: string,
  ) {
    const startYearNumber = parseInt(startYear, 10);
    const endYearNumber = endYear ? parseInt(endYear, 10) : undefined;
    const uri = this.configService.get<string>('MONGO_URI_NI');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_NI');
    return this.errorsService.getYearlyErrorsByAccount(uri, dbName, startYearNumber, accountUid, endYearNumber);
  }

  // Honduras (HN)
  @Get('daily-hn')
  getDailyErrorsHN(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_CA');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_HN');
    return this.errorsService.getDailyErrors(uri, dbName, startDate, endDate);
  }

  @Get('monthly-hn')
  getMonthlyErrorsHN(
    @Query('startMonth') startMonth: string,
    @Query('endMonth') endMonth?: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_CA');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_HN');
    return this.errorsService.getMonthlyErrors(uri, dbName, startMonth, endMonth);
  }

  @Get('yearly-hn')
  getYearlyErrorsHN(
    @Query('startYear') startYear: string,
    @Query('endYear') endYear?: string,
  ) {
    const startYearNumber = parseInt(startYear, 10);
    const endYearNumber = endYear ? parseInt(endYear, 10) : undefined;
    const uri = this.configService.get<string>('MONGO_URI_CA');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_HN');
    return this.errorsService.getYearlyErrors(uri, dbName, startYearNumber, endYearNumber);
  }

  @Get('daily-account-hn')
  getDailyErrorsByAccountHN(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('accountUid') accountUid: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_CA');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_HN');
    return this.errorsService.getDailyErrorsByAccount(uri, dbName, startDate, accountUid, endDate);
  }

  @Get('monthly-account-hn')
  getMonthlyErrorsByAccountHN(
    @Query('startMonth') startMonth: string,
    @Query('accountUid') accountUid: string,
    @Query('endMonth') endMonth?: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_CA');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_HN');
    return this.errorsService.getMonthlyErrorsByAccount(uri, dbName, startMonth, accountUid, endMonth);
  }

  @Get('yearly-account-hn')
  getYearlyErrorsByAccountHN(
    @Query('startYear') startYear: string,
    @Query('accountUid') accountUid: string,
    @Query('endYear') endYear?: string,
  ) {
    const startYearNumber = parseInt(startYear, 10);
    const endYearNumber = endYear ? parseInt(endYear, 10) : undefined;
    const uri = this.configService.get<string>('MONGO_URI_CA');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_HN');
    return this.errorsService.getYearlyErrorsByAccount(uri, dbName, startYearNumber, accountUid, endYearNumber);
  }

  // TIGO Honduras
  @Get('daily-tigo')
  getDailyErrorsTIGO(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_TIGO');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_TIGO');
    return this.errorsService.getDailyErrors(uri, dbName, startDate, endDate);
  }

  @Get('monthly-tigo')
  getMonthlyErrorsTIGO(
    @Query('startMonth') startMonth: string,
    @Query('endMonth') endMonth?: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_TIGO');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_TIGO');
    return this.errorsService.getMonthlyErrors(uri, dbName, startMonth, endMonth);
  }

  @Get('yearly-tigo')
  getYearlyErrorsTIGO(
    @Query('startYear') startYear: string,
    @Query('endYear') endYear?: string,
  ) {
    const startYearNumber = parseInt(startYear, 10);
    const endYearNumber = endYear ? parseInt(endYear, 10) : undefined;
    const uri = this.configService.get<string>('MONGO_URI_TIGO');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_TIGO');
    return this.errorsService.getYearlyErrors(uri, dbName, startYearNumber, endYearNumber);
  }

  @Get('daily-account-tigo')
  getDailyErrorsByAccountTIGO(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('accountUid') accountUid: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_TIGO');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_TIGO');
    return this.errorsService.getDailyErrorsByAccount(uri, dbName, startDate, accountUid, endDate);
  }

  @Get('monthly-account-tigo')
  getMonthlyErrorsByAccountTIGO(
    @Query('startMonth') startMonth: string,
    @Query('accountUid') accountUid: string,
    @Query('endMonth') endMonth?: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_TIGO');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_TIGO');
    return this.errorsService.getMonthlyErrorsByAccount(uri, dbName, startMonth, accountUid, endMonth);
  }

  @Get('yearly-account-tigo')
  getYearlyErrorsByAccountTIGO(
    @Query('startYear') startYear: string,
    @Query('accountUid') accountUid: string,
    @Query('endYear') endYear?: string,
  ) {
    const startYearNumber = parseInt(startYear, 10);
    const endYearNumber = endYear ? parseInt(endYear, 10) : undefined;
    const uri = this.configService.get<string>('MONGO_URI_TIGO');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_TIGO');
    return this.errorsService.getYearlyErrorsByAccount(uri, dbName, startYearNumber, accountUid, endYearNumber);
  }

  // Regional
  @Get('daily-regional')
  getDailyErrorsRegional(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REGIONAL');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REGIONAL');
    return this.errorsService.getDailyErrors(uri, dbName, startDate, endDate);
  }

  @Get('monthly-regional')
  getMonthlyErrorsRegional(
    @Query('startMonth') startMonth: string,
    @Query('endMonth') endMonth?: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REGIONAL');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REGIONAL');
    return this.errorsService.getMonthlyErrors(uri, dbName, startMonth, endMonth);
  }

  @Get('yearly-regional')
  getYearlyErrorsRegional(
    @Query('startYear') startYear: string,
    @Query('endYear') endYear?: string,
  ) {
    const startYearNumber = parseInt(startYear, 10);
    const endYearNumber = endYear ? parseInt(endYear, 10) : undefined;
    const uri = this.configService.get<string>('MONGO_URI_REGIONAL');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REGIONAL');
    return this.errorsService.getYearlyErrors(uri, dbName, startYearNumber, endYearNumber);
  }

  @Get('daily-account-regional')
  getDailyErrorsByAccountRegional(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('accountUid') accountUid: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REGIONAL');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REGIONAL');
    return this.errorsService.getDailyErrorsByAccount(uri, dbName, startDate, accountUid, endDate);
  }

  @Get('monthly-account-regional')
  getMonthlyErrorsByAccountRegional(
    @Query('startMonth') startMonth: string,
    @Query('accountUid') accountUid: string,
    @Query('endMonth') endMonth?: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REGIONAL');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REGIONAL');
    return this.errorsService.getMonthlyErrorsByAccount(uri, dbName, startMonth, accountUid, endMonth);
  }

  @Get('yearly-account-regional')
  getYearlyErrorsByAccountRegional(
    @Query('startYear') startYear: string,
    @Query('accountUid') accountUid: string,
    @Query('endYear') endYear?: string,
  ) {
    const startYearNumber = parseInt(startYear, 10);
    const endYearNumber = endYear ? parseInt(endYear, 10) : undefined;
    const uri = this.configService.get<string>('MONGO_URI_REGIONAL');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REGIONAL');
    return this.errorsService.getYearlyErrorsByAccount(uri, dbName, startYearNumber, accountUid, endYearNumber);
  }
} 