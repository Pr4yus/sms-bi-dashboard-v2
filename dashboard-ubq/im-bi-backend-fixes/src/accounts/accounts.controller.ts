// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Controller, Get, Query } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { ConfigService } from '@nestjs/config'; // Import ConfigService
import { AccountWithChannels } from './types/account.types';

@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly configService: ConfigService, // Inject ConfigService
  ) {}

  // Endpoint for Guatemala
  @Get('statusgt')
  getActiveAccountsStatusGT() {
    const uri = this.configService.get<string>('MONGO_URI_GT');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_GT');
    return this.accountsService.getActiveAccountsStatus(uri, dbName);
  }

  @Get('namesgt')
  getAllAccountNamesGT() {
    const uri = this.configService.get<string>('MONGO_URI_GT');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_GT');
    return this.accountsService.getAllAccountNames(uri, dbName);
  }

  @Get('namesregional')
  getAllAccountNamesRegional() {
    const uri = this.configService.get<string>('MONGO_URI_REGIONAL');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REGIONAL');
    return this.accountsService.getAllAccountNames(uri, dbName);
  }

  // Endpoint for Costa Rica
  @Get('statuscr')
  getActiveAccountsStatusCR() {
    const uri = this.configService.get<string>('MONGO_URI_CR');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_CR');
    return this.accountsService.getActiveAccountsStatus(uri, dbName);
  }

  @Get('namescr')
  getAllAccountNamesCR() {
    const uri = this.configService.get<string>('MONGO_URI_CR');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_CR');
    return this.accountsService.getAllAccountNames(uri, dbName);
  }

  // Endpoint for El Salvador
  @Get('statussv')
  getActiveAccountsStatusSV() {
    const uri = this.configService.get<string>('MONGO_URI_SV');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_SV');
    return this.accountsService.getActiveAccountsStatus(uri, dbName);
  }

  @Get('namessv')
  getAllAccountNamesSV() {
    const uri = this.configService.get<string>('MONGO_URI_SV');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_SV');
    return this.accountsService.getAllAccountNames(uri, dbName);
  }

  // Endpoint for Nicaragua
  @Get('statusni')
  getActiveAccountsStatusNI() {
    const uri = this.configService.get<string>('MONGO_URI_NI');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_NI');
    return this.accountsService.getActiveAccountsStatus(uri, dbName);
  }

  @Get('namesni')
  getAllAccountNamesNI() {
    const uri = this.configService.get<string>('MONGO_URI_NI');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_NI');
    return this.accountsService.getAllAccountNames(uri, dbName);
  }

  // Endpoint for Honduras
  @Get('statushn')
  getActiveAccountsStatusHN() {
    const uri = this.configService.get<string>('MONGO_URI_CA');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_HN');
    return this.accountsService.getActiveAccountsStatus(uri, dbName);
  }

  @Get('nameshn')
  getAllAccountNamesHN() {
    const uri = this.configService.get<string>('MONGO_URI_CA');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_HN');
    return this.accountsService.getAllAccountNames(uri, dbName);
  }

  // Endpoint for Honduras
  @Get('statustigohn')
  getActiveAccountsStatusTigoHN() {
    const uri = this.configService.get<string>('MONGO_URI_TIGO');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_TIGO');
    return this.accountsService.getActiveAccountsStatus(uri, dbName);
  }

  @Get('namestigohn')
  getAllAccountNamesTigoHN() {
    const uri = this.configService.get<string>('MONGO_URI_TIGO');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_TIGO');
    return this.accountsService.getAllAccountNames(uri, dbName);
  }

  // Endpoint for Reach
  @Get('statusreach')
  getActiveAccountsStatusReach() {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    return this.accountsService.getActiveAccountsStatus(uri, dbName);
  }

  @Get('namesreach')
  getAllAccountNamesReach() {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    return this.accountsService.getAllAccountNames(uri, dbName);
  }
  // Obtener cuentas con SMS habilitado para Reach y filtrar por país desde el .env
  @Get('smsreach-gt')
  getSmsEnabledAccountsReach() {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    const country = this.configService.get<string>('COUNTRY_GT'); // País directamente desde el .env

    return this.accountsService.getSmsEnabledAccounts(uri, dbName, country);
  }

  // Obtener cuentas con SMS habilitado para Reach y filtrar por país desde el .env
  @Get('smsreach-sv')
  getSmsEnabledAccountsReachSV() {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    const country = this.configService.get<string>('COUNTRY_SV'); // País directamente desde el .env

    return this.accountsService.getSmsEnabledAccounts(uri, dbName, country);
  }

  // Obtener cuentas con SMS habilitado para Reach y filtrar por país desde el .env
  @Get('smsreach-hn')
  getSmsEnabledAccountsReachHN() {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    const country = this.configService.get<string>('COUNTRY_HN'); // País directamente desde el .env

    return this.accountsService.getSmsEnabledAccounts(uri, dbName, country);
  }

  // Obtener cuentas con conversaciones habilitadas para Reach y filtrar por país desde el .env
  @Get('conversationsreach-gt')
  getConversationsEnabledAccountsReach() {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    const country = this.configService.get<string>('COUNTRY_GT'); // País directamente desde el .env

    return this.accountsService.getConversationsEnabledAccounts(
      uri,
      dbName,
      country,
    );
  }
  @Get('conversations-enabled')
  getConversationsEnabledAccounts(): Promise<AccountWithChannels[]> {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    return this.accountsService.getAllConversationsEnabledAccounts(uri, dbName);
  }

  // Obtener cuentas con conversaciones habilitadas para Reach y filtrar por país desde el .env
  @Get('conversationsreach-sv')
  getConversationsEnabledAccountsReachSV() {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    const country = this.configService.get<string>('COUNTRY_SV'); // País directamente desde el .env

    return this.accountsService.getConversationsEnabledAccounts(
      uri,
      dbName,
      country,
    );
  }
  // Obtener cuentas con conversaciones habilitadas para Reach y filtrar por país desde el .env
  @Get('conversationsreach-hn')
  getConversationsEnabledAccountsReachHN() {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    const country = this.configService.get<string>('COUNTRY_HN'); // País directamente desde el .env

    return this.accountsService.getConversationsEnabledAccounts(
      uri,
      dbName,
      country,
    );
  }
  @Get('client-ids-gt')
  async getAllClientIds() {
    const uri = this.configService.get<string>('MONGO_URI_GT');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_GT');
    return this.accountsService.getAllClientIds(uri, dbName);
  }

  @Get('client-ids-reachc')
  async getAllClientIdsReachC() {
    const uri = this.configService.get<string>('MONGO_URI_REACHREPORTS');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACHREPORTS'); // Separate config for database name
    return this.accountsService.getAllClientIdsReach(uri, dbName);
  }

  @Get('client-ids-reacho')
  async getAllClientIdsReachO() {
    const uri = this.configService.get<string>('MONGO_URI_REACHREPORTS');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACHREPORTS'); // Separate config for database name
    return this.accountsService.getAllClientIdsReachV2(uri, dbName);
  }
  @Get('client-ids-quickly')
  async getAllClientIdsReach2() {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    return this.accountsService.getAllClientIds(uri, dbName);
  }

  // Costa Rica
  @Get('client-ids-cr')
  async getAllClientIdsCR() {
    const uri = this.configService.get<string>('MONGO_URI_CR');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_CR');
    return this.accountsService.getAllClientIds(uri, dbName);
  }

  // El Salvador
  @Get('client-ids-sv')
  async getAllClientIdsSV() {
    const uri = this.configService.get<string>('MONGO_URI_SV');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_SV');
    return this.accountsService.getAllClientIds(uri, dbName);
  }

  // Nicaragua
  @Get('client-ids-ni')
  async getAllClientIdsNI() {
    const uri = this.configService.get<string>('MONGO_URI_NI');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_NI');
    return this.accountsService.getAllClientIds(uri, dbName);
  }

  // Honduras Claro
  @Get('client-ids-hn')
  async getAllClientIdsHN() {
    const uri = this.configService.get<string>('MONGO_URI_CA');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_HN');
    return this.accountsService.getAllClientIds(uri, dbName);
  }

  // TIGO Honduras
  @Get('client-ids-tigo')
  async getAllClientIdsTigo() {
    const uri = this.configService.get<string>('MONGO_URI_TIGO');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_TIGO');
    return this.accountsService.getAllClientIds(uri, dbName);
  }

  // Regional
  @Get('client-ids-regional')
  async getAllClientIdsRegional() {
    const uri = this.configService.get<string>('MONGO_URI_REGIONAL');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REGIONAL');
    return this.accountsService.getAllClientIds(uri, dbName);
  }

  @Get('waba-channels')
  getWABAChannels(): Promise<AccountWithChannels[]> {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    return this.accountsService.getWABAChannels(uri, dbName);
  }
}
