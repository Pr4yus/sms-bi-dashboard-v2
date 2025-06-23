import { Controller, Get, Param, Query, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SmsAnalyticsService } from './sms-analytics.service';
import { AnalysisDto, CountryAnalysisDto, RegionalAnalysisDto } from './dto/analytics.dto';
import { Logger } from '@nestjs/common';
import { SMSAnalyticsData } from './interfaces/analytics.interface';
import { DatabaseService } from '../database/database.service';

@ApiTags('sms-analytics')
@Controller('sms-analytics')
export class SmsAnalyticsController {
  private readonly logger = new Logger(SmsAnalyticsController.name);

  constructor(
    private readonly smsAnalyticsService: SmsAnalyticsService,
    private readonly databaseService: DatabaseService
  ) {}

  @Get('countries')
  @ApiOperation({ summary: 'Obtener lista de países disponibles' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de países configurados',
    type: [Object]
  })
  async getCountries() {
    return {
      countries: [
        { code: 'guatemala', name: 'Notificame GT', flag: '🇬🇹', enabled: true },
        { code: 'costarica', name: 'Notificame CR', flag: '🇨🇷', enabled: false },
        { code: 'elsalvador', name: 'Notificame SV', flag: '🇸🇻', enabled: false },
        { code: 'nicaragua', name: 'Notificame NI', flag: '🇳🇮', enabled: false },
        { code: 'honduras', name: 'Notificame HN', flag: '🇭🇳', enabled: false }
      ],
      total: 5,
      note: 'Actualmente solo Guatemala está habilitado'
    };
  }

  @Get('analysis/country/:country/:year/:month')
  @ApiOperation({ summary: 'Análisis de país' })
  @ApiParam({ name: 'country', description: 'País a consultar', example: 'guatemala' })
  @ApiParam({ name: 'year', description: 'Año', example: 2024 })
  @ApiParam({ name: 'month', description: 'Mes', example: 6 })
  async getCountryAnalysis(
    @Param('country') country: string,
    @Param('year') year: number,
    @Param('month') month: number
  ): Promise<SMSAnalyticsData> {
    this.logger.log(`📊 Analizando país ${country} para ${month}/${year}`);
    return this.smsAnalyticsService.getCountryAnalysis(
      country.toLowerCase(),
      year,
      month
    );
  }

  @Get('metrics/regional/:year/:month')
  @ApiOperation({ summary: 'Get regional dashboard metrics' })
  @ApiParam({ name: 'year', description: 'Year', example: 2024 })
  @ApiParam({ name: 'month', description: 'Month', example: 1 })
  @ApiResponse({ status: 200, description: 'Regional dashboard metrics retrieved successfully' })
  async getRegionalDashboardMetrics(
    @Param('year') year: string,
    @Param('month') month: string
  ) {
    this.logger.log(`🌎 Obteniendo métricas del dashboard regional para ${year}-${month}`);
    try {
      const startTime = Date.now();
      const metrics = await this.smsAnalyticsService.getRegionalDashboardMetrics(
        parseInt(year, 10),
        parseInt(month, 10)
      );
      const duration = Date.now() - startTime;
      this.logger.log(`✅ Métricas del dashboard regional obtenidas en ${duration}ms`);
      
      return metrics;
    } catch (error) {
      this.logger.error(`❌ Error obteniendo métricas del dashboard regional: ${error.message}`);
      
      // Respuesta de fallback con estructura válida
      const fallbackResponse = {
        total_sms: 0,
        total_successful: 0,
        total_errors: 0,
        overall_success_rate: 0,
        key_accounts: {
          'bac-gt': {
            account_name: 'BAC GT SMS',
            total_sms: 0,
            successful_sms: 0,
            error_sms: 0,
            success_rate: 0,
            data_source: 'error_fallback'
          },
          'nexa-bank': {
            account_name: 'NEXA BANK',
            total_sms: 0,
            successful_sms: 0,
            error_sms: 0,
            success_rate: 0,
            data_source: 'error_fallback'
          }
        },
        period: `${year}-${month.toString().padStart(2, '0')}`,
        generated_at: new Date().toISOString(),
        data_source: 'error_fallback',
        optimization_used: false,
        error_message: error.message
      };
      
      return fallbackResponse;
    }
  }

  @Get('summary/regional')
  @ApiOperation({ summary: 'Obtener resumen regional desde transactionspertype' })
  @ApiQuery({ 
    name: 'year', 
    required: false, 
    type: Number, 
    description: 'Año específico (opcional)', 
    example: 2025 
  })
  @ApiQuery({ 
    name: 'month', 
    required: false, 
    type: Number, 
    description: 'Mes específico (1-12, opcional)', 
    example: 6 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Resumen regional obtenido exitosamente'
  })
  async getRegionalSummary(
    @Query('year') year?: number,
    @Query('month') month?: number
  ) {
    try {
      this.logger.log(`🌍 Obteniendo resumen regional - Año: ${year || 'todos'}, Mes: ${month || 'todos'}`);
      
      const result = await this.smsAnalyticsService.getRegionalSummaryFromTransactionsPerType(
        year ? +year : undefined,
        month ? +month : undefined
      );
      
      this.logger.log(`✅ Resumen regional obtenido: ${result.grand_totals.total_messages} mensajes total`);
      return result;
      
    } catch (error) {
      this.logger.error(`❌ Error obteniendo resumen regional: ${error.message}`);
      throw new HttpException(
        `Error obteniendo resumen regional: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('accounts/:country/:year/:month/hierarchical-view')
  @ApiOperation({ summary: 'Vista jerárquica de cuentas basada en parent_account_uid' })
  @ApiParam({ name: 'country', description: 'País a consultar', example: 'guatemala' })
  @ApiParam({ name: 'year', description: 'Año', example: 2024 })
  @ApiParam({ name: 'month', description: 'Mes', example: 6 })
  @ApiQuery({ name: 'usage_filter', description: 'Filtro por estado de uso', required: false })
  @ApiQuery({ name: 'limit', description: 'Límite de resultados', required: false, type: Number })
  async getAccountsHierarchicalView(
    @Param('country') country: string,
    @Param('year') year: number,
    @Param('month') month: number,
    @Query('usage_filter') usageFilter?: string,
    @Query('limit') limit?: number
  ) {
    try {
      this.logger.log(`🌳 Solicitud de vista jerárquica para ${country} - ${year}/${month}`);
      return await this.smsAnalyticsService.getAccountsHierarchicalView(
        country, year, month, usageFilter, limit
      );
    } catch (error) {
      this.logger.error(`❌ Error en vista jerárquica ${country}: ${error.message}`);
      throw error;
    }
  }

  @Get('accounts/:country/:year/:month/commercial-view')
  @ApiOperation({ summary: 'Vista comercial basada en client_id de transactionspertype' })
  @ApiParam({ name: 'country', description: 'País a consultar', example: 'guatemala' })
  @ApiParam({ name: 'year', description: 'Año', example: 2024 })
  @ApiParam({ name: 'month', description: 'Mes', example: 6 })
  @ApiQuery({ name: 'usage_filter', description: 'Filtro por estado de uso', required: false })
  @ApiQuery({ name: 'limit', description: 'Límite de resultados', required: false, type: Number })
  async getAccountsCommercialView(
    @Param('country') country: string,
    @Param('year') year: number,
    @Param('month') month: number,
    @Query('usage_filter') usageFilter?: string,
    @Query('limit') limit?: number
  ) {
    try {
      this.logger.log(`🏢 Solicitud de vista comercial para ${country} - ${year}/${month}`);
      return await this.smsAnalyticsService.getAccountsCommercialView(
        country, year, month, usageFilter, limit
      );
    } catch (error) {
      this.logger.error(`❌ Error en vista comercial ${country}: ${error.message}`);
      throw error;
    }
  }

  @Get('accounts/:country/:year/:month')
  @ApiOperation({ summary: 'Obtener cuentas con análisis de uso por país' })
  @ApiParam({ name: 'country', description: 'País a consultar', example: 'guatemala' })
  @ApiParam({ name: 'year', description: 'Año', example: 2025 })
  @ApiParam({ name: 'month', description: 'Mes', example: 5 })
  @ApiQuery({ name: 'usage_filter', description: 'Filtro por estado de uso', required: false })
  @ApiQuery({ name: 'limit', description: 'Límite de resultados', required: false, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'Cuentas con análisis de cumplimiento de uso'
  })
  async getCountryAccountsWithUsage(
    @Param('country') country: string,
    @Param('year') year: number,
    @Param('month') month: number,
    @Query('usage_filter') usageFilter?: string,
    @Query('limit') limit?: number
  ) {
    this.logger.log(`📊 Obteniendo cuentas con análisis de uso para ${country} - ${year}/${month}`);
    
    try {
      return await this.smsAnalyticsService.getCountryAccountsWithUsage(
        country.toLowerCase(), 
        +year, 
        +month, 
        usageFilter, 
        +limit
      );
    } catch (error) {
      this.logger.error(`❌ Error obteniendo cuentas con análisis de uso: ${error.message}`);
      throw new HttpException(
        `Error obteniendo análisis de cuentas: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('health')
  @ApiOperation({ summary: 'Verificar estado de salud del servicio SMS Analytics' })
  @ApiResponse({ status: 200, description: 'Estado de salud obtenido exitosamente' })
  async getHealth() {
    const connections = await this.smsAnalyticsService.getConnectionStatus();
    const cacheStats = this.smsAnalyticsService.getCacheStats();
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      connections,
      cache: cacheStats,
      features: {
        pagination: true,
        cache: true,
        real_time_data: true,
        multi_country: true
      }
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Estado de conexiones a bases de datos' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado de las conexiones'
  })
  async getConnectionStatus() {
    return this.smsAnalyticsService.getConnectionStatus();
  }

  @Get('cache/clear')
  @ApiOperation({ summary: 'Clear analytics cache' })
  async clearCache() {
    await this.smsAnalyticsService.clearCache();
    return { message: 'Cache cleared successfully' };
  }

  @Get('cache/stats')
  @ApiOperation({ summary: 'Get cache statistics' })
  async getCacheStats() {
    return this.smsAnalyticsService.getCacheStats();
  }
} 