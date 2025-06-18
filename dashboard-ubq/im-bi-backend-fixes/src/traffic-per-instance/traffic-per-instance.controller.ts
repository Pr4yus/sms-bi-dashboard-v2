import { Controller, Get, Query, Param } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TrafficPerInstanceService } from './traffic-per-instance.service';
import { ParseIntPipe } from '@nestjs/common';

@Controller('trafficperinstance')
export class TrafficPerInstanceController {
  constructor(
    private readonly trafficService: TrafficPerInstanceService,
    private readonly configService: ConfigService,
  ) {}

  // Endpoints generales (totales globales)
  @Get('daily')
  async getDailyTraffic(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.trafficService.getDailyTraffic(
      process.env.MONGO_URI_REACH,
      process.env.MONGO_DB_NAME_REACH,
      startDate,
      endDate,
    );
  }

  @Get('monthly')
  async getMonthlyTraffic(
    @Query('start_month') startMonth: string,
    @Query('end_month') endMonth?: string,
  ) {
    return this.trafficService.getMonthlyTraffic(
      process.env.MONGO_URI_REACH,
      process.env.MONGO_DB_NAME_REACH,
      startMonth,
      endMonth,
    );
  }

  @Get('yearly')
  async getYearlyTraffic(
    @Query('start_year', ParseIntPipe) startYear: number,
    @Query('end_year', ParseIntPipe) endYear?: number,
  ) {
    return this.trafficService.getYearlyTraffic(
      process.env.MONGO_URI_REACH,
      process.env.MONGO_DB_NAME_REACH,
      startYear,
      endYear,
    );
  }

  // Endpoints por Account UID
  @Get('daily/account/:accountUid')
  async getDailyTrafficByAccount(
    @Param('accountUid') accountUid: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    return this.trafficService.getDailyTrafficByAccount(
      uri,
      dbName,
      accountUid,
      startDate,
      endDate,
    );
  }

  @Get('monthly/account/:accountUid')
  async getMonthlyTrafficByAccount(
    @Param('accountUid') accountUid: string,
    @Query('start_month') startMonth: string,
    @Query('end_month') endMonth?: string,
  ) {
    return this.trafficService.getMonthlyTrafficByAccount(
      process.env.MONGO_URI_REACH,
      process.env.MONGO_DB_NAME_REACH,
      accountUid,
      startMonth,
      endMonth,
    );
  }

  @Get('yearly/account/:accountUid')
  async getYearlyTrafficByAccount(
    @Param('accountUid') accountUid: string,
    @Query('start_year', ParseIntPipe) startYear: number,
    @Query('end_year', ParseIntPipe) endYear?: number,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    return this.trafficService.getYearlyTrafficByAccount(
      uri,
      dbName,
      accountUid,
      startYear,
      endYear,
    );
  }

  // Endpoints por Client ID
  @Get('daily/client/:clientId')
  async getDailyTrafficByClient(
    @Param('clientId') clientId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.trafficService.getDailyTrafficByClient(
      process.env.MONGO_URI_REACH,
      process.env.MONGO_DB_NAME_REACH,
      clientId,
      startDate,
      endDate,
    );
  }

  @Get('monthly/client/:clientId')
  async getMonthlyTrafficByClient(
    @Param('clientId') clientId: string,
    @Query('start_month') startMonth: string,
    @Query('end_month') endMonth?: string,
  ) {
    return this.trafficService.getMonthlyTrafficByClient(
      process.env.MONGO_URI_REACH,
      process.env.MONGO_DB_NAME_REACH,
      clientId,
      startMonth,
      endMonth,
    );
  }

  @Get('yearly/client/:clientId')
  async getYearlyTrafficByClient(
    @Param('clientId') clientId: string,
    @Query('start_year', ParseIntPipe) startYear: number,
    @Query('end_year', ParseIntPipe) endYear?: number,
  ) {
    return this.trafficService.getYearlyTrafficByClient(
      process.env.MONGO_URI_REACH,
      process.env.MONGO_DB_NAME_REACH,
      clientId,
      startYear,
      endYear,
    );
  }

  @Get('accounts')
  async getAllAccounts() {
    return this.trafficService.getAllAccounts(
      process.env.MONGO_URI_REACH,
      process.env.MONGO_DB_NAME_REACH,
    );
  }

  @Get('clients')
  async getAllClients() {
    return this.trafficService.getAllClients(
      process.env.MONGO_URI_REACH,
      process.env.MONGO_DB_NAME_REACH,
    );
  }

  // Endpoints GT
  @Get('gt/daily')
  async getDailyTrafficGT(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.trafficService.getDailyTraffic(
      process.env.MONGO_URI_GT,
      process.env.MONGO_DB_NAME_GT,
      startDate,
      endDate,
    );
  }

  @Get('gt/monthly')
  async getMonthlyTrafficGT(
    @Query('start_month') startMonth: string,
    @Query('end_month') endMonth?: string,
  ) {
    return this.trafficService.getMonthlyTraffic(
      process.env.MONGO_URI_GT,
      process.env.MONGO_DB_NAME_GT,
      startMonth,
      endMonth,
    );
  }

  @Get('gt/yearly')
  async getYearlyTrafficGT(
    @Query('start_year', ParseIntPipe) startYear: number,
    @Query('end_year', ParseIntPipe) endYear?: number,
  ) {
    return this.trafficService.getYearlyTraffic(
      process.env.MONGO_URI_GT,
      process.env.MONGO_DB_NAME_GT,
      startYear,
      endYear,
    );
  }

  @Get('gt/daily/account/:accountUid')
  async getDailyTrafficByAccountGT(
    @Param('accountUid') accountUid: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.trafficService.getDailyTrafficByAccount(
      process.env.MONGO_URI_GT,
      process.env.MONGO_DB_NAME_GT,
      accountUid,
      startDate,
      endDate,
    );
  }

  @Get('gt/monthly/account/:accountUid')
  async getMonthlyTrafficByAccountGT(
    @Param('accountUid') accountUid: string,
    @Query('start_month') startMonth: string,
    @Query('end_month') endMonth?: string,
  ) {
    return this.trafficService.getMonthlyTrafficByAccount(
      process.env.MONGO_URI_GT,
      process.env.MONGO_DB_NAME_GT,
      accountUid,
      startMonth,
      endMonth,
    );
  }

  @Get('gt/yearly/account/:accountUid')
  async getYearlyTrafficByAccountGT(
    @Param('accountUid') accountUid: string,
    @Query('start_year', ParseIntPipe) startYear: number,
    @Query('end_year', ParseIntPipe) endYear?: number,
  ) {
    return this.trafficService.getYearlyTrafficByAccount(
      process.env.MONGO_URI_GT,
      process.env.MONGO_DB_NAME_GT,
      accountUid,
      startYear,
      endYear,
    );
  }

  @Get('gt/daily/client/:clientId')
  async getDailyTrafficByClientGT(
    @Param('clientId') clientId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.trafficService.getDailyTrafficByClient(
      process.env.MONGO_URI_GT,
      process.env.MONGO_DB_NAME_GT,
      clientId,
      startDate,
      endDate,
    );
  }

  @Get('gt/monthly/client/:clientId')
  async getMonthlyTrafficByClientGT(
    @Param('clientId') clientId: string,
    @Query('start_month') startMonth: string,
    @Query('end_month') endMonth?: string,
  ) {
    return this.trafficService.getMonthlyTrafficByClient(
      process.env.MONGO_URI_GT,
      process.env.MONGO_DB_NAME_GT,
      clientId,
      startMonth,
      endMonth,
    );
  }

  @Get('gt/yearly/client/:clientId')
  async getYearlyTrafficByClientGT(
    @Param('clientId') clientId: string,
    @Query('start_year', ParseIntPipe) startYear: number,
    @Query('end_year', ParseIntPipe) endYear?: number,
  ) {
    return this.trafficService.getYearlyTrafficByClient(
      process.env.MONGO_URI_GT,
      process.env.MONGO_DB_NAME_GT,
      clientId,
      startYear,
      endYear,
    );
  }

  @Get('gt/accounts')
  async getAllAccountsGT() {
    return this.trafficService.getAllAccounts(
      process.env.MONGO_URI_GT,
      process.env.MONGO_DB_NAME_GT,
    );
  }

  @Get('gt/clients')
  async getAllClientsGT() {
    return this.trafficService.getAllClients(
      process.env.MONGO_URI_GT,
      process.env.MONGO_DB_NAME_GT,
    );
  }

  // Costa Rica (CR)
  @Get('cr/daily')
  async getDailyTrafficCR(@Query('start_date') startDate: string, @Query('end_date') endDate: string) {
    return this.trafficService.getDailyTraffic(process.env.MONGO_URI_CR, process.env.MONGO_DB_NAME_CR, startDate, endDate);
  }

  @Get('cr/monthly')
  async getMonthlyTrafficCR(@Query('start_month') startMonth: string, @Query('end_month') endMonth?: string) {
    return this.trafficService.getMonthlyTraffic(process.env.MONGO_URI_CR, process.env.MONGO_DB_NAME_CR, startMonth, endMonth);
  }

  @Get('cr/yearly')
  async getYearlyTrafficCR(@Query('start_year', ParseIntPipe) startYear: number, @Query('end_year', ParseIntPipe) endYear?: number) {
    return this.trafficService.getYearlyTraffic(process.env.MONGO_URI_CR, process.env.MONGO_DB_NAME_CR, startYear, endYear);
  }

  @Get('cr/daily/account/:accountUid')
  async getDailyTrafficByAccountCR(
    @Param('accountUid') accountUid: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.trafficService.getDailyTrafficByAccount(process.env.MONGO_URI_CR, process.env.MONGO_DB_NAME_CR, accountUid, startDate, endDate);
  }

  @Get('cr/monthly/account/:accountUid')
  async getMonthlyTrafficByAccountCR(
    @Param('accountUid') accountUid: string,
    @Query('start_month') startMonth: string,
    @Query('end_month') endMonth?: string,
  ) {
    return this.trafficService.getMonthlyTrafficByAccount(process.env.MONGO_URI_CR, process.env.MONGO_DB_NAME_CR, accountUid, startMonth, endMonth);
  }

  @Get('cr/yearly/account/:accountUid')
  async getYearlyTrafficByAccountCR(
    @Param('accountUid') accountUid: string,
    @Query('start_year', ParseIntPipe) startYear: number,
    @Query('end_year', ParseIntPipe) endYear?: number,
  ) {
    return this.trafficService.getYearlyTrafficByAccount(process.env.MONGO_URI_CR, process.env.MONGO_DB_NAME_CR, accountUid, startYear, endYear);
  }

  @Get('cr/daily/client/:clientId')
  async getDailyTrafficByClientCR(
    @Param('clientId') clientId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.trafficService.getDailyTrafficByClient(process.env.MONGO_URI_CR, process.env.MONGO_DB_NAME_CR, clientId, startDate, endDate);
  }

  @Get('cr/monthly/client/:clientId')
  async getMonthlyTrafficByClientCR(
    @Param('clientId') clientId: string,
    @Query('start_month') startMonth: string,
    @Query('end_month') endMonth?: string,
  ) {
    return this.trafficService.getMonthlyTrafficByClient(process.env.MONGO_URI_CR, process.env.MONGO_DB_NAME_CR, clientId, startMonth, endMonth);
  }

  @Get('cr/yearly/client/:clientId')
  async getYearlyTrafficByClientCR(
    @Param('clientId') clientId: string,
    @Query('start_year', ParseIntPipe) startYear: number,
    @Query('end_year', ParseIntPipe) endYear?: number,
  ) {
    return this.trafficService.getYearlyTrafficByClient(process.env.MONGO_URI_CR, process.env.MONGO_DB_NAME_CR, clientId, startYear, endYear);
  }

  @Get('cr/accounts')
  async getAllAccountsCR() {
    return this.trafficService.getAllAccounts(process.env.MONGO_URI_CR, process.env.MONGO_DB_NAME_CR);
  }

  @Get('cr/clients')
  async getAllClientsCR() {
    return this.trafficService.getAllClients(process.env.MONGO_URI_CR, process.env.MONGO_DB_NAME_CR);
  }

  // El Salvador (SV) - General endpoints
  @Get('sv/daily')
  async getDailyTrafficSV(@Query('start_date') startDate: string, @Query('end_date') endDate: string) {
    return this.trafficService.getDailyTraffic(process.env.MONGO_URI_SV, process.env.MONGO_DB_NAME_SV, startDate, endDate);
  }

  @Get('sv/monthly')
  async getMonthlyTrafficSV(@Query('start_month') startMonth: string, @Query('end_month') endMonth?: string) {
    return this.trafficService.getMonthlyTraffic(process.env.MONGO_URI_SV, process.env.MONGO_DB_NAME_SV, startMonth, endMonth);
  }

  @Get('sv/yearly')
  async getYearlyTrafficSV(@Query('start_year', ParseIntPipe) startYear: number, @Query('end_year', ParseIntPipe) endYear?: number) {
    return this.trafficService.getYearlyTraffic(process.env.MONGO_URI_SV, process.env.MONGO_DB_NAME_SV, startYear, endYear);
  }

  // El Salvador (SV) - Account endpoints
  @Get('sv/daily/account/:accountUid')
  async getDailyTrafficByAccountSV(
    @Param('accountUid') accountUid: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.trafficService.getDailyTrafficByAccount(process.env.MONGO_URI_SV, process.env.MONGO_DB_NAME_SV, accountUid, startDate, endDate);
  }

  @Get('sv/monthly/account/:accountUid')
  async getMonthlyTrafficByAccountSV(
    @Param('accountUid') accountUid: string,
    @Query('start_month') startMonth: string,
    @Query('end_month') endMonth?: string,
  ) {
    return this.trafficService.getMonthlyTrafficByAccount(process.env.MONGO_URI_SV, process.env.MONGO_DB_NAME_SV, accountUid, startMonth, endMonth);
  }

  @Get('sv/yearly/account/:accountUid')
  async getYearlyTrafficByAccountSV(
    @Param('accountUid') accountUid: string,
    @Query('start_year', ParseIntPipe) startYear: number,
    @Query('end_year', ParseIntPipe) endYear?: number,
  ) {
    return this.trafficService.getYearlyTrafficByAccount(process.env.MONGO_URI_SV, process.env.MONGO_DB_NAME_SV, accountUid, startYear, endYear);
  }

  // El Salvador (SV) - Client endpoints
  @Get('sv/daily/client/:clientId')
  async getDailyTrafficByClientSV(
    @Param('clientId') clientId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.trafficService.getDailyTrafficByClient(process.env.MONGO_URI_SV, process.env.MONGO_DB_NAME_SV, clientId, startDate, endDate);
  }

  @Get('sv/monthly/client/:clientId')
  async getMonthlyTrafficByClientSV(
    @Param('clientId') clientId: string,
    @Query('start_month') startMonth: string,
    @Query('end_month') endMonth?: string,
  ) {
    return this.trafficService.getMonthlyTrafficByClient(process.env.MONGO_URI_SV, process.env.MONGO_DB_NAME_SV, clientId, startMonth, endMonth);
  }

  @Get('sv/yearly/client/:clientId')
  async getYearlyTrafficByClientSV(
    @Param('clientId') clientId: string,
    @Query('start_year', ParseIntPipe) startYear: number,
    @Query('end_year', ParseIntPipe) endYear?: number,
  ) {
    return this.trafficService.getYearlyTrafficByClient(process.env.MONGO_URI_SV, process.env.MONGO_DB_NAME_SV, clientId, startYear, endYear);
  }

  // El Salvador (SV) - List endpoints
  @Get('sv/accounts')
  async getAllAccountsSV() {
    return this.trafficService.getAllAccounts(process.env.MONGO_URI_SV, process.env.MONGO_DB_NAME_SV);
  }

  @Get('sv/clients')
  async getAllClientsSV() {
    return this.trafficService.getAllClients(process.env.MONGO_URI_SV, process.env.MONGO_DB_NAME_SV);
  }

  // Nicaragua (NI) - General endpoints
  @Get('ni/daily')
  async getDailyTrafficNI(@Query('start_date') startDate: string, @Query('end_date') endDate: string) {
    return this.trafficService.getDailyTraffic(process.env.MONGO_URI_NI, process.env.MONGO_DB_NAME_NI, startDate, endDate);
  }

  @Get('ni/monthly')
  async getMonthlyTrafficNI(@Query('start_month') startMonth: string, @Query('end_month') endMonth?: string) {
    return this.trafficService.getMonthlyTraffic(process.env.MONGO_URI_NI, process.env.MONGO_DB_NAME_NI, startMonth, endMonth);
  }

  @Get('ni/yearly')
  async getYearlyTrafficNI(@Query('start_year', ParseIntPipe) startYear: number, @Query('end_year', ParseIntPipe) endYear?: number) {
    return this.trafficService.getYearlyTraffic(process.env.MONGO_URI_NI, process.env.MONGO_DB_NAME_NI, startYear, endYear);
  }

  // Nicaragua (NI) - Account endpoints
  @Get('ni/daily/account/:accountUid')
  async getDailyTrafficByAccountNI(
    @Param('accountUid') accountUid: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.trafficService.getDailyTrafficByAccount(process.env.MONGO_URI_NI, process.env.MONGO_DB_NAME_NI, accountUid, startDate, endDate);
  }

  @Get('ni/monthly/account/:accountUid')
  async getMonthlyTrafficByAccountNI(
    @Param('accountUid') accountUid: string,
    @Query('start_month') startMonth: string,
    @Query('end_month') endMonth?: string,
  ) {
    return this.trafficService.getMonthlyTrafficByAccount(process.env.MONGO_URI_NI, process.env.MONGO_DB_NAME_NI, accountUid, startMonth, endMonth);
  }

  @Get('ni/yearly/account/:accountUid')
  async getYearlyTrafficByAccountNI(
    @Param('accountUid') accountUid: string,
    @Query('start_year', ParseIntPipe) startYear: number,
    @Query('end_year', ParseIntPipe) endYear?: number,
  ) {
    return this.trafficService.getYearlyTrafficByAccount(process.env.MONGO_URI_NI, process.env.MONGO_DB_NAME_NI, accountUid, startYear, endYear);
  }

  // Nicaragua (NI) - Client endpoints
  @Get('ni/daily/client/:clientId')
  async getDailyTrafficByClientNI(
    @Param('clientId') clientId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.trafficService.getDailyTrafficByClient(process.env.MONGO_URI_NI, process.env.MONGO_DB_NAME_NI, clientId, startDate, endDate);
  }

  @Get('ni/monthly/client/:clientId')
  async getMonthlyTrafficByClientNI(
    @Param('clientId') clientId: string,
    @Query('start_month') startMonth: string,
    @Query('end_month') endMonth?: string,
  ) {
    return this.trafficService.getMonthlyTrafficByClient(process.env.MONGO_URI_NI, process.env.MONGO_DB_NAME_NI, clientId, startMonth, endMonth);
  }

  @Get('ni/yearly/client/:clientId')
  async getYearlyTrafficByClientNI(
    @Param('clientId') clientId: string,
    @Query('start_year', ParseIntPipe) startYear: number,
    @Query('end_year', ParseIntPipe) endYear?: number,
  ) {
    return this.trafficService.getYearlyTrafficByClient(process.env.MONGO_URI_NI, process.env.MONGO_DB_NAME_NI, clientId, startYear, endYear);
  }

  // Nicaragua (NI) - List endpoints
  @Get('ni/accounts')
  async getAllAccountsNI() {
    return this.trafficService.getAllAccounts(process.env.MONGO_URI_NI, process.env.MONGO_DB_NAME_NI);
  }

  @Get('ni/clients')
  async getAllClientsNI() {
    return this.trafficService.getAllClients(process.env.MONGO_URI_NI, process.env.MONGO_DB_NAME_NI);
  }

  // Honduras (HN)
  @Get('hn/daily')
  async getDailyTrafficHN(@Query('start_date') startDate: string, @Query('end_date') endDate: string) {
    return this.trafficService.getDailyTraffic(process.env.MONGO_URI_CA, process.env.MONGO_DB_NAME_HN, startDate, endDate);
  }

  @Get('hn/monthly')
  async getMonthlyTrafficHN(@Query('start_month') startMonth: string, @Query('end_month') endMonth?: string) {
    return this.trafficService.getMonthlyTraffic(process.env.MONGO_URI_CA, process.env.MONGO_DB_NAME_HN, startMonth, endMonth);
  }

  @Get('hn/yearly')
  async getYearlyTrafficHN(@Query('start_year', ParseIntPipe) startYear: number, @Query('end_year', ParseIntPipe) endYear?: number) {
    return this.trafficService.getYearlyTraffic(process.env.MONGO_URI_CA, process.env.MONGO_DB_NAME_HN, startYear, endYear);
  }

  @Get('hn/daily/account/:accountUid')
  async getDailyTrafficByAccountHN(
    @Param('accountUid') accountUid: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.trafficService.getDailyTrafficByAccount(process.env.MONGO_URI_CA, process.env.MONGO_DB_NAME_HN, accountUid, startDate, endDate);
  }

  @Get('hn/monthly/account/:accountUid')
  async getMonthlyTrafficByAccountHN(
    @Param('accountUid') accountUid: string,
    @Query('start_month') startMonth: string,
    @Query('end_month') endMonth?: string,
  ) {
    return this.trafficService.getMonthlyTrafficByAccount(process.env.MONGO_URI_CA, process.env.MONGO_DB_NAME_HN, accountUid, startMonth, endMonth);
  }

  @Get('hn/yearly/account/:accountUid')
  async getYearlyTrafficByAccountHN(
    @Param('accountUid') accountUid: string,
    @Query('start_year', ParseIntPipe) startYear: number,
    @Query('end_year', ParseIntPipe) endYear?: number,
  ) {
    return this.trafficService.getYearlyTrafficByAccount(process.env.MONGO_URI_CA, process.env.MONGO_DB_NAME_HN, accountUid, startYear, endYear);
  }

  @Get('hn/daily/client/:clientId')
  async getDailyTrafficByClientHN(
    @Param('clientId') clientId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.trafficService.getDailyTrafficByClient(process.env.MONGO_URI_CA, process.env.MONGO_DB_NAME_HN, clientId, startDate, endDate);
  }

  @Get('hn/monthly/client/:clientId')
  async getMonthlyTrafficByClientHN(
    @Param('clientId') clientId: string,
    @Query('start_month') startMonth: string,
    @Query('end_month') endMonth?: string,
  ) {
    return this.trafficService.getMonthlyTrafficByClient(process.env.MONGO_URI_CA, process.env.MONGO_DB_NAME_HN, clientId, startMonth, endMonth);
  }

  @Get('hn/yearly/client/:clientId')
  async getYearlyTrafficByClientHN(
    @Param('clientId') clientId: string,
    @Query('start_year', ParseIntPipe) startYear: number,
    @Query('end_year', ParseIntPipe) endYear?: number,
  ) {
    return this.trafficService.getYearlyTrafficByClient(process.env.MONGO_URI_CA, process.env.MONGO_DB_NAME_HN, clientId, startYear, endYear);
  }

  @Get('hn/accounts')
  async getAllAccountsHN() {
    return this.trafficService.getAllAccounts(process.env.MONGO_URI_CA, process.env.MONGO_DB_NAME_HN);
  }

  @Get('hn/clients')
  async getAllClientsHN() {
    return this.trafficService.getAllClients(process.env.MONGO_URI_CA, process.env.MONGO_DB_NAME_HN);
  }

  // Tigo Honduras (TIGO)
  @Get('tigo/daily')
  async getDailyTrafficTIGO(@Query('start_date') startDate: string, @Query('end_date') endDate: string) {
    return this.trafficService.getDailyTraffic(process.env.MONGO_URI_TIGO, process.env.MONGO_DB_NAME_TIGO, startDate, endDate);
  }

  @Get('tigo/monthly')
  async getMonthlyTrafficTIGO(@Query('start_month') startMonth: string, @Query('end_month') endMonth?: string) {
    return this.trafficService.getMonthlyTraffic(process.env.MONGO_URI_TIGO, process.env.MONGO_DB_NAME_TIGO, startMonth, endMonth);
  }

  @Get('tigo/yearly')
  async getYearlyTrafficTIGO(@Query('start_year', ParseIntPipe) startYear: number, @Query('end_year', ParseIntPipe) endYear?: number) {
    return this.trafficService.getYearlyTraffic(process.env.MONGO_URI_TIGO, process.env.MONGO_DB_NAME_TIGO, startYear, endYear);
  }

  @Get('tigo/daily/account/:accountUid')
  async getDailyTrafficByAccountTIGO(
    @Param('accountUid') accountUid: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.trafficService.getDailyTrafficByAccount(process.env.MONGO_URI_TIGO, process.env.MONGO_DB_NAME_TIGO, accountUid, startDate, endDate);
  }

  @Get('tigo/monthly/account/:accountUid')
  async getMonthlyTrafficByAccountTIGO(
    @Param('accountUid') accountUid: string,
    @Query('start_month') startMonth: string,
    @Query('end_month') endMonth?: string,
  ) {
    return this.trafficService.getMonthlyTrafficByAccount(process.env.MONGO_URI_TIGO, process.env.MONGO_DB_NAME_TIGO, accountUid, startMonth, endMonth);
  }

  @Get('tigo/yearly/account/:accountUid')
  async getYearlyTrafficByAccountTIGO(
    @Param('accountUid') accountUid: string,
    @Query('start_year', ParseIntPipe) startYear: number,
    @Query('end_year', ParseIntPipe) endYear?: number,
  ) {
    return this.trafficService.getYearlyTrafficByAccount(process.env.MONGO_URI_TIGO, process.env.MONGO_DB_NAME_TIGO, accountUid, startYear, endYear);
  }

  @Get('tigo/daily/client/:clientId')
  async getDailyTrafficByClientTIGO(
    @Param('clientId') clientId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.trafficService.getDailyTrafficByClient(process.env.MONGO_URI_TIGO, process.env.MONGO_DB_NAME_TIGO, clientId, startDate, endDate);
  }

  @Get('tigo/monthly/client/:clientId')
  async getMonthlyTrafficByClientTIGO(
    @Param('clientId') clientId: string,
    @Query('start_month') startMonth: string,
    @Query('end_month') endMonth?: string,
  ) {
    return this.trafficService.getMonthlyTrafficByClient(process.env.MONGO_URI_TIGO, process.env.MONGO_DB_NAME_TIGO, clientId, startMonth, endMonth);
  }

  @Get('tigo/yearly/client/:clientId')
  async getYearlyTrafficByClientTIGO(
    @Param('clientId') clientId: string,
    @Query('start_year', ParseIntPipe) startYear: number,
    @Query('end_year', ParseIntPipe) endYear?: number,
  ) {
    return this.trafficService.getYearlyTrafficByClient(process.env.MONGO_URI_TIGO, process.env.MONGO_DB_NAME_TIGO, clientId, startYear, endYear);
  }

  @Get('tigo/accounts')
  async getAllAccountsTIGO() {
    return this.trafficService.getAllAccounts(process.env.MONGO_URI_TIGO, process.env.MONGO_DB_NAME_TIGO);
  }

  @Get('tigo/clients')
  async getAllClientsTIGO() {
    return this.trafficService.getAllClients(process.env.MONGO_URI_TIGO, process.env.MONGO_DB_NAME_TIGO);
  }

  // Regional (REG)
  @Get('reg/daily')
  async getDailyTrafficREG(@Query('start_date') startDate: string, @Query('end_date') endDate: string) {
    return this.trafficService.getDailyTraffic(process.env.MONGO_URI_REGIONAL, process.env.MONGO_DB_NAME_REGIONAL, startDate, endDate);
  }

  @Get('reg/monthly')
  async getMonthlyTrafficREG(@Query('start_month') startMonth: string, @Query('end_month') endMonth?: string) {
    return this.trafficService.getMonthlyTraffic(process.env.MONGO_URI_REGIONAL, process.env.MONGO_DB_NAME_REGIONAL, startMonth, endMonth);
  }

  @Get('reg/yearly')
  async getYearlyTrafficREG(@Query('start_year', ParseIntPipe) startYear: number, @Query('end_year', ParseIntPipe) endYear?: number) {
    return this.trafficService.getYearlyTraffic(process.env.MONGO_URI_REGIONAL, process.env.MONGO_DB_NAME_REGIONAL, startYear, endYear);
  }

  @Get('reg/daily/account/:accountUid')
  async getDailyTrafficByAccountREG(
    @Param('accountUid') accountUid: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.trafficService.getDailyTrafficByAccount(process.env.MONGO_URI_REGIONAL, process.env.MONGO_DB_NAME_REGIONAL, accountUid, startDate, endDate);
  }

  @Get('reg/monthly/account/:accountUid')
  async getMonthlyTrafficByAccountREG(
    @Param('accountUid') accountUid: string,
    @Query('start_month') startMonth: string,
    @Query('end_month') endMonth?: string,
  ) {
    return this.trafficService.getMonthlyTrafficByAccount(process.env.MONGO_URI_REGIONAL, process.env.MONGO_DB_NAME_REGIONAL, accountUid, startMonth, endMonth);
  }

  @Get('reg/yearly/account/:accountUid')
  async getYearlyTrafficByAccountREG(
    @Param('accountUid') accountUid: string,
    @Query('start_year', ParseIntPipe) startYear: number,
    @Query('end_year', ParseIntPipe) endYear?: number,
  ) {
    return this.trafficService.getYearlyTrafficByAccount(process.env.MONGO_URI_REGIONAL, process.env.MONGO_DB_NAME_REGIONAL, accountUid, startYear, endYear);
  }

  @Get('reg/daily/client/:clientId')
  async getDailyTrafficByClientREG(
    @Param('clientId') clientId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.trafficService.getDailyTrafficByClient(process.env.MONGO_URI_REGIONAL, process.env.MONGO_DB_NAME_REGIONAL, clientId, startDate, endDate);
  }

  @Get('reg/monthly/client/:clientId')
  async getMonthlyTrafficByClientREG(
    @Param('clientId') clientId: string,
    @Query('start_month') startMonth: string,
    @Query('end_month') endMonth?: string,
  ) {
    return this.trafficService.getMonthlyTrafficByClient(process.env.MONGO_URI_REGIONAL, process.env.MONGO_DB_NAME_REGIONAL, clientId, startMonth, endMonth);
  }

  @Get('reg/yearly/client/:clientId')
  async getYearlyTrafficByClientREG(
    @Param('clientId') clientId: string,
    @Query('start_year', ParseIntPipe) startYear: number,
    @Query('end_year', ParseIntPipe) endYear?: number,
  ) {
    return this.trafficService.getYearlyTrafficByClient(process.env.MONGO_URI_REGIONAL, process.env.MONGO_DB_NAME_REGIONAL, clientId, startYear, endYear);
  }

  @Get('reg/accounts')
  async getAllAccountsREG() {
    return this.trafficService.getAllAccounts(process.env.MONGO_URI_REGIONAL, process.env.MONGO_DB_NAME_REGIONAL);
  }

  @Get('reg/clients')
  async getAllClientsREG() {
    return this.trafficService.getAllClients(process.env.MONGO_URI_REGIONAL, process.env.MONGO_DB_NAME_REGIONAL);
  }
} 