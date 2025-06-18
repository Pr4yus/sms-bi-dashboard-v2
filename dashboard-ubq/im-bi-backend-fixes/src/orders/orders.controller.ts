/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Get, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ConfigService } from '@nestjs/config';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly configService: ConfigService,
  ) {}

  // Endpoints por Channel Type
  @Get('daily/channel-type')
  async getDailyOrdersByChannelType(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACHREPORTS');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACHREPORTS');

    return this.ordersService.getDailyOrdersByChannelType(
      uri,
      dbName,
      startDate,
      endDate,
    );
  }

  @Get('monthly/channel-type')
  async getMonthlyOrdersByChannelType(
    @Query('start_month') startMonth: string,
    @Query('end_month') endMonth: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACHREPORTS');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACHREPORTS');

    return this.ordersService.getMonthlyOrdersByChannelType(
      uri,
      dbName,
      startMonth,
      endMonth,
    );
  }

  @Get('yearly/channel-type')
  async getYearlyOrdersByChannelType(
    @Query('start_year') startYear: string,
    @Query('end_year') endYear: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACHREPORTS');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACHREPORTS');

    return this.ordersService.getYearlyOrdersByChannelType(
      uri,
      dbName,
      parseInt(startYear, 10),
      parseInt(endYear, 10),
    );
  }

  // Endpoints por Payment Provider
  @Get('daily/payment-provider')
  async getDailyOrdersByPaymentProvider(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACHREPORTS');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACHREPORTS');

    return this.ordersService.getDailyOrdersByPaymentProvider(
      uri,
      dbName,
      startDate,
      endDate,
    );
  }
    // Continuación de endpoints por Payment Provider
    @Get('monthly/payment-provider')
    async getMonthlyOrdersByPaymentProvider(
      @Query('start_month') startMonth: string,
      @Query('end_month') endMonth: string,
    ) {
      const uri = this.configService.get<string>('MONGO_URI_REACHREPORTS');
      const dbName = this.configService.get<string>('MONGO_DB_NAME_REACHREPORTS');
  
      return this.ordersService.getMonthlyOrdersByPaymentProvider(
        uri,
        dbName,
        startMonth,
        endMonth,
      );
    }
  
    @Get('yearly/payment-provider')
    async getYearlyOrdersByPaymentProvider(
      @Query('start_year') startYear: string,
      @Query('end_year') endYear: string,
    ) {
      const uri = this.configService.get<string>('MONGO_URI_REACHREPORTS');
      const dbName = this.configService.get<string>('MONGO_DB_NAME_REACHREPORTS');
  
      return this.ordersService.getYearlyOrdersByPaymentProvider(
        uri,
        dbName,
        parseInt(startYear, 10),
        parseInt(endYear, 10),
      );
    }
  
    // Endpoints por Channel Type con Cliente
    @Get('daily/channel-type/client')
    async getDailyOrdersByChannelTypeAndClient(
      @Query('client_ids') client_ids: string | string[],
      @Query('start_date') startDate: string,
      @Query('end_date') endDate: string,
    ) {
      const uri = this.configService.get<string>('MONGO_URI_REACHREPORTS');
      const dbName = this.configService.get<string>('MONGO_DB_NAME_REACHREPORTS');
  
      const clientIdArray = Array.isArray(client_ids)
        ? client_ids
        : client_ids.split(',');
  
      return this.ordersService.getDailyOrdersByChannelTypeAndClient(
        uri,
        dbName,
        startDate,
        endDate,
        clientIdArray,
      );
    }
  
    @Get('monthly/channel-type/client')
    async getMonthlyOrdersByChannelTypeAndClient(
      @Query('client_ids') client_ids: string | string[],
      @Query('start_month') startMonth: string,
      @Query('end_month') endMonth: string,
    ) {
      const uri = this.configService.get<string>('MONGO_URI_REACHREPORTS');
      const dbName = this.configService.get<string>('MONGO_DB_NAME_REACHREPORTS');
  
      const clientIdArray = Array.isArray(client_ids)
        ? client_ids
        : client_ids.split(',');
  
      return this.ordersService.getMonthlyOrdersByChannelTypeAndClient(
        uri,
        dbName,
        startMonth,
        endMonth,
        clientIdArray,
      );
    }
  
    @Get('yearly/channel-type/client')
    async getYearlyOrdersByChannelTypeAndClient(
      @Query('client_ids') client_ids: string | string[],
      @Query('start_year') startYear: string,
      @Query('end_year') endYear: string,
    ) {
      const uri = this.configService.get<string>('MONGO_URI_REACHREPORTS');
      const dbName = this.configService.get<string>('MONGO_DB_NAME_REACHREPORTS');
  
      const clientIdArray = Array.isArray(client_ids)
        ? client_ids
        : client_ids.split(',');
  
      return this.ordersService.getYearlyOrdersByChannelTypeAndClient(
        uri,
        dbName,
        parseInt(startYear, 10),
        clientIdArray,
        parseInt(endYear, 10),
      );
    }
      // Endpoints por Payment Provider con Cliente
  @Get('daily/payment-provider/client')
  async getDailyOrdersByPaymentProviderAndClient(
    @Query('client_ids') client_ids: string | string[],
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACHREPORTS');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACHREPORTS');

    const clientIdArray = Array.isArray(client_ids)
      ? client_ids
      : client_ids.split(',');

    return this.ordersService.getDailyOrdersByPaymentProviderAndClient(
      uri,
      dbName,
      startDate,
      endDate,
      clientIdArray,
    );
  }

  @Get('monthly/payment-provider/client')
  async getMonthlyOrdersByPaymentProviderAndClient(
    @Query('client_ids') client_ids: string | string[],
    @Query('start_month') startMonth: string,
    @Query('end_month') endMonth: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACHREPORTS');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACHREPORTS');

    const clientIdArray = Array.isArray(client_ids)
      ? client_ids
      : client_ids.split(',');

    return this.ordersService.getMonthlyOrdersByPaymentProviderAndClient(
      uri,
      dbName,
      startMonth,
      endMonth,
      clientIdArray,
    );
  }

  @Get('yearly/payment-provider/client')
  async getYearlyOrdersByPaymentProviderAndClient(
    @Query('client_ids') client_ids: string | string[],
    @Query('start_year') startYear: string,
    @Query('end_year') endYear: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACHREPORTS');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACHREPORTS');

    const clientIdArray = Array.isArray(client_ids)
      ? client_ids
      : client_ids.split(',');

    return this.ordersService.getYearlyOrdersByPaymentProviderAndClient(
      uri,
      dbName,
      parseInt(startYear, 10),
      clientIdArray,
      parseInt(endYear, 10),
    );
  }
}