import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { DatabaseService } from '../database/database.service';
import { 
  SMSAnalyticsData, 
  RegionalMetrics, 
  RegionalSummary,
  AccountData,
  HierarchicalAccount,
  ClientData,
  ConnectionStatus,
  CacheStats
} from './interfaces/analytics.interface';

@Injectable()
export class SmsAnalyticsService {
  private readonly logger = new Logger(SmsAnalyticsService.name);
  private cacheStats = { hits: 0, misses: 0, keys: 0, memory_usage: 0 };

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly databaseService: DatabaseService
  ) {}

  async getCountryAnalysis(
    country: string, 
    year: number, 
    month: number
  ): Promise<SMSAnalyticsData> {
    const cacheKey = `country_analysis:${country}:${year}:${month}`;
    
    try {
      // Try to get from cache first
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        this.cacheStats.hits++;
        return cached as SMSAnalyticsData;
      }
      
      this.cacheStats.misses++;
      
      const collection = this.databaseService.getTransactionsPerTypeCollection(country);
      if (!collection) {
        throw new Error(`No database connection available for ${country}`);
      }

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const pipeline = [
        {
          $match: {
            datetime: {
              $gte: startDate.toISOString().slice(0, 7) + '-01',
              $lte: endDate.toISOString().slice(0, 7) + '-31'
            }
          }
        },
        {
          $group: {
            _id: '$account_uid',
            account_name: { $first: '$account_name' },
            total_sms: { $sum: 1 },
            successful_sms: {
              $sum: {
                $cond: [{ $eq: ['$status', 'success'] }, 1, 0]
              }
            },
            error_sms: {
              $sum: {
                $cond: [{ $ne: ['$status', 'success'] }, 1, 0]
              }
            }
          }
        },
        {
          $addFields: {
            success_rate: {
              $multiply: [
                { $divide: ['$successful_sms', '$total_sms'] },
                100
              ]
            }
          }
        },
        {
          $sort: { total_sms: -1 }
        }
      ];

      const accounts = await collection.aggregate(pipeline).toArray();

      // Calculate totals
      const totals = accounts.reduce(
        (acc, account) => ({
          total_sms: acc.total_sms + account.total_sms,
          successful_sms: acc.successful_sms + account.successful_sms,
          error_sms: acc.error_sms + account.error_sms,
        }),
        { total_sms: 0, successful_sms: 0, error_sms: 0 }
      );

      const success_rate = totals.total_sms > 0 
        ? (totals.successful_sms / totals.total_sms) * 100 
        : 0;

      const result: SMSAnalyticsData = {
        country,
        year,
        month,
        total_sms: totals.total_sms,
        successful_sms: totals.successful_sms,
        error_sms: totals.error_sms,
        success_rate,
        accounts: accounts.map(acc => ({
          account_uid: acc._id,
          account_name: acc.account_name,
          total_sms: acc.total_sms,
          successful_sms: acc.successful_sms,
          error_sms: acc.error_sms,
          success_rate: acc.success_rate
        })),
        generated_at: new Date().toISOString()
      };

      // Cache the result
      await this.cacheManager.set(cacheKey, result, 3600); // 1 hour
      this.cacheStats.keys++;

      return result;

    } catch (error) {
      this.logger.error(`Error getting country analysis for ${country}: ${error.message}`);
      throw error;
    }
  }

  async getRegionalDashboardMetrics(year: number, month: number): Promise<RegionalMetrics> {
    const cacheKey = `regional_metrics:${year}:${month}`;
    
    try {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        this.cacheStats.hits++;
        return cached as RegionalMetrics;
      }
      
      this.cacheStats.misses++;

      const countries = ['guatemala', 'costarica', 'elsalvador', 'nicaragua', 'honduras'];
      const keyAccounts = {};
      let totalSms = 0;
      let totalSuccessful = 0;
      let totalErrors = 0;

      for (const country of countries) {
        try {
          const analysis = await this.getCountryAnalysis(country, year, month);
          
          totalSms += analysis.total_sms;
          totalSuccessful += analysis.successful_sms;
          totalErrors += analysis.error_sms;

          // Add top account from each country
          if (analysis.accounts.length > 0) {
            const topAccount = analysis.accounts[0];
            keyAccounts[`${country}-top`] = {
              account_name: topAccount.account_name,
              total_sms: topAccount.total_sms,
              successful_sms: topAccount.successful_sms,
              error_sms: topAccount.error_sms,
              success_rate: topAccount.success_rate,
              data_source: country
            };
          }
        } catch (error) {
          this.logger.warn(`Failed to get data for ${country}: ${error.message}`);
        }
      }

      const overall_success_rate = totalSms > 0 
        ? (totalSuccessful / totalSms) * 100 
        : 0;

      const result: RegionalMetrics = {
        year,
        month,
        total_sms: totalSms,
        total_successful: totalSuccessful,
        total_errors: totalErrors,
        overall_success_rate,
        key_accounts: keyAccounts,
        generated_at: new Date().toISOString()
      };

      await this.cacheManager.set(cacheKey, result, 1800); // 30 minutes
      this.cacheStats.keys++;

      return result;

    } catch (error) {
      this.logger.error(`Error getting regional metrics: ${error.message}`);
      throw error;
    }
  }

  async getRegionalSummaryFromTransactionsPerType(
    year?: number,
    month?: number
  ): Promise<RegionalSummary> {
    const cacheKey = `regional_summary:${year || 'all'}:${month || 'all'}`;
    
    try {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        this.cacheStats.hits++;
        return cached as RegionalSummary;
      }
      
      this.cacheStats.misses++;

      const countries = ['guatemala', 'costarica', 'elsalvador', 'nicaragua', 'honduras', 'tigohn', 'reach'];
      const countriesData = {};
      let grandTotal = { total_messages: 0, successful_messages: 0, error_messages: 0 };

      for (const country of countries) {
        try {
          const collection = this.databaseService.getTransactionsPerTypeCollection(country);
          if (!collection) continue;

          let matchStage = {};
          if (year && month) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            matchStage = {
              datetime: {
                $gte: startDate.toISOString().slice(0, 7) + '-01',
                $lte: endDate.toISOString().slice(0, 7) + '-31'
              }
            };
          } else if (year) {
            matchStage = {
              datetime: {
                $regex: `^${year}-`
              }
            };
          }

          const pipeline = [
            { $match: matchStage },
            {
              $group: {
                _id: null,
                total_messages: { $sum: 1 },
                successful_messages: {
                  $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
                },
                error_messages: {
                  $sum: { $cond: [{ $ne: ['$status', 'success'] }, 1, 0] }
                }
              }
            }
          ];

          const result = await collection.aggregate(pipeline).toArray();
          
          if (result.length > 0) {
            const data = result[0];
            const success_rate = data.total_messages > 0 
              ? (data.successful_messages / data.total_messages) * 100 
              : 0;

            countriesData[country] = {
              country,
              total_messages: data.total_messages,
              successful_messages: data.successful_messages,
              error_messages: data.error_messages,
              success_rate,
              top_clients: []
            };

            grandTotal.total_messages += data.total_messages;
            grandTotal.successful_messages += data.successful_messages;
            grandTotal.error_messages += data.error_messages;
          }
        } catch (error) {
          this.logger.warn(`Failed to get summary for ${country}: ${error.message}`);
        }
      }

      const grand_success_rate = grandTotal.total_messages > 0 
        ? (grandTotal.successful_messages / grandTotal.total_messages) * 100 
        : 0;

      const result: RegionalSummary = {
        period: year && month ? `${year}-${month.toString().padStart(2, '0')}` : 'all',
        grand_totals: {
          ...grandTotal,
          success_rate: grand_success_rate
        },
        countries: countriesData,
        generated_at: new Date().toISOString()
      };

      await this.cacheManager.set(cacheKey, result, 1800); // 30 minutes
      this.cacheStats.keys++;

      return result;

    } catch (error) {
      this.logger.error(`Error getting regional summary: ${error.message}`);
      throw error;
    }
  }

  async getAccountsHierarchicalView(
    country: string,
    year: number,
    month: number,
    usageFilter?: string,
    limit?: number
  ): Promise<any> {
    const cacheKey = `hierarchical_view:${country}:${year}:${month}:${usageFilter || 'all'}:${limit || 'all'}`;
    
    try {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        this.cacheStats.hits++;
        return cached;
      }
      
      this.cacheStats.misses++;

      const collection = this.databaseService.getAccountsCollection(country);
      if (!collection) {
        throw new Error(`No database connection available for ${country}`);
      }

      // Get parent accounts (accounts with children)
      const parentAccounts = await collection.find({
        parent_account_uid: { $exists: false }
      }).toArray();

      const hierarchicalStructure = [];

      for (const parent of parentAccounts) {
        const children = await collection.find({
          parent_account_uid: parent.account_uid
        }).toArray();

        if (children.length > 0) {
          hierarchicalStructure.push({
            ...parent,
            children,
            is_parent: true
          });
        }
      }

      const result = {
        country,
        year,
        month,
        hierarchical_structure: hierarchicalStructure.slice(0, limit || hierarchicalStructure.length),
        total_parent_accounts: hierarchicalStructure.length,
        total_child_accounts: hierarchicalStructure.reduce((acc, parent) => acc + parent.children.length, 0),
        generated_at: new Date().toISOString()
      };

      await this.cacheManager.set(cacheKey, result, 3600);
      this.cacheStats.keys++;

      return result;

    } catch (error) {
      this.logger.error(`Error getting hierarchical view for ${country}: ${error.message}`);
      throw error;
    }
  }

  async getAccountsCommercialView(
    country: string,
    year: number,
    month: number,
    usageFilter?: string,
    limit?: number
  ): Promise<any> {
    const cacheKey = `commercial_view:${country}:${year}:${month}:${usageFilter || 'all'}:${limit || 'all'}`;
    
    try {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        this.cacheStats.hits++;
        return cached;
      }
      
      this.cacheStats.misses++;

      const collection = this.databaseService.getTransactionsPerTypeCollection(country);
      if (!collection) {
        throw new Error(`No database connection available for ${country}`);
      }

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const pipeline = [
        {
          $match: {
            datetime: {
              $gte: startDate.toISOString().slice(0, 7) + '-01',
              $lte: endDate.toISOString().slice(0, 7) + '-31'
            }
          }
        },
        {
          $group: {
            _id: '$client_id',
            client_name: { $first: '$client_name' },
            total_accounts: { $addToSet: '$account_uid' },
            total_sms: { $sum: 1 },
            successful_sms: {
              $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
            },
            error_sms: {
              $sum: { $cond: [{ $ne: ['$status', 'success'] }, 1, 0] }
            }
          }
        },
        {
          $addFields: {
            success_rate: {
              $multiply: [
                { $divide: ['$successful_sms', '$total_sms'] },
                100
              ]
            },
            account_count: { $size: '$total_accounts' }
          }
        },
        {
          $sort: { total_sms: -1 }
        }
      ];

      const clients = await collection.aggregate(pipeline).toArray();

      const result = {
        country,
        year,
        month,
        clients: clients.slice(0, limit || clients.length),
        total_clients: clients.length,
        total_accounts: clients.reduce((acc, client) => acc + client.account_count, 0),
        generated_at: new Date().toISOString()
      };

      await this.cacheManager.set(cacheKey, result, 3600);
      this.cacheStats.keys++;

      return result;

    } catch (error) {
      this.logger.error(`Error getting commercial view for ${country}: ${error.message}`);
      throw error;
    }
  }

  async getCountryAccountsWithUsage(
    country: string,
    year: number,
    month: number,
    usageFilter?: string,
    limit?: number
  ): Promise<any> {
    const cacheKey = `accounts_usage:${country}:${year}:${month}:${usageFilter || 'all'}:${limit || 'all'}`;
    
    try {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        this.cacheStats.hits++;
        return cached;
      }
      
      this.cacheStats.misses++;

      const collection = this.databaseService.getTransactionsPerTypeCollection(country);
      if (!collection) {
        throw new Error(`No database connection available for ${country}`);
      }

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const pipeline = [
        {
          $match: {
            datetime: {
              $gte: startDate.toISOString().slice(0, 7) + '-01',
              $lte: endDate.toISOString().slice(0, 7) + '-31'
            }
          }
        },
        {
          $group: {
            _id: '$account_uid',
            account_name: { $first: '$account_name' },
            total_sms: { $sum: 1 },
            successful_sms: {
              $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
            },
            error_sms: {
              $sum: { $cond: [{ $ne: ['$status', 'success'] }, 1, 0] }
            },
            package_size: { $first: '$package_size' }
          }
        },
        {
          $addFields: {
            success_rate: {
              $multiply: [
                { $divide: ['$successful_sms', '$total_sms'] },
                100
              ]
            },
            usage_percentage: {
              $multiply: [
                { $divide: ['$total_sms', { $ifNull: ['$package_size', 1] }] },
                100
              ]
            }
          }
        },
        {
          $addFields: {
            usage_status: {
              $switch: {
                branches: [
                  { case: { $gte: ['$usage_percentage', 90] }, then: 'critico' },
                  { case: { $gte: ['$usage_percentage', 70] }, then: 'alto' },
                  { case: { $gte: ['$usage_percentage', 30] }, then: 'adecuado' }
                ],
                default: 'bajo'
              }
            }
          }
        },
        {
          $sort: { total_sms: -1 }
        }
      ];

      let accounts = await collection.aggregate(pipeline).toArray();

      // Apply usage filter if specified
      if (usageFilter) {
        accounts = accounts.filter(acc => acc.usage_status === usageFilter);
      }

      const result = {
        country,
        year,
        month,
        accounts: accounts.slice(0, limit || accounts.length),
        total_accounts: accounts.length,
        usage_distribution: {
          critico: accounts.filter(acc => acc.usage_status === 'critico').length,
          alto: accounts.filter(acc => acc.usage_status === 'alto').length,
          adecuado: accounts.filter(acc => acc.usage_status === 'adecuado').length,
          bajo: accounts.filter(acc => acc.usage_status === 'bajo').length
        },
        generated_at: new Date().toISOString()
      };

      await this.cacheManager.set(cacheKey, result, 3600);
      this.cacheStats.keys++;

      return result;

    } catch (error) {
      this.logger.error(`Error getting accounts with usage for ${country}: ${error.message}`);
      throw error;
    }
  }

  async getConnectionStatus(): Promise<ConnectionStatus> {
    return this.databaseService.getConnectionStatus();
  }

  getCacheStats(): CacheStats {
    return {
      ...this.cacheStats,
      memory_usage: 0 // Would need Redis for actual memory usage
    };
  }

  async clearCache(): Promise<void> {
    await this.cacheManager.reset();
    this.cacheStats = { hits: 0, misses: 0, keys: 0, memory_usage: 0 };
    this.logger.log('Cache cleared successfully');
  }
} 