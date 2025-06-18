import { LRUCache } from 'lru-cache';

// Cache configuration
const CACHE_CONFIG = {
  max: 500, // Maximum number of items
  ttl: 5 * 60 * 1000, // 5 minutes TTL
  allowStale: false,
  updateAgeOnGet: true,
  updateAgeOnHas: true,
};

// Different cache instances for different data types
const businessMetricsCache = new LRUCache<string, any>(CACHE_CONFIG);
const kpiCache = new LRUCache<string, any>({ ...CACHE_CONFIG, ttl: 2 * 60 * 1000 }); // 2 minutes for KPIs
const executiveDataCache = new LRUCache<string, any>({ ...CACHE_CONFIG, ttl: 10 * 60 * 1000 }); // 10 minutes for executive data
const countryDataCache = new LRUCache<string, any>(CACHE_CONFIG);

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

export interface CacheStats {
  businessMetrics: {
    size: number;
    hits: number;
    misses: number;
  };
  kpi: {
    size: number;
    hits: number;
    misses: number;
  };
  executiveData: {
    size: number;
    hits: number;
    misses: number;
  };
  countryData: {
    size: number;
    hits: number;
    misses: number;
  };
}

class CacheManager {
  private version = '1.0.0';
  private stats = {
    businessMetrics: { hits: 0, misses: 0 },
    kpi: { hits: 0, misses: 0 },
    executiveData: { hits: 0, misses: 0 },
    countryData: { hits: 0, misses: 0 }
  };

  // Business Metrics Cache
  getBusinessMetrics(key: string): any | null {
    const cached = businessMetricsCache.get(key);
    if (cached) {
      this.stats.businessMetrics.hits++;
      return cached;
    }
    this.stats.businessMetrics.misses++;
    return null;
  }

  setBusinessMetrics(key: string, data: any): void {
    const entry: CacheEntry<any> = {
      data,
      timestamp: Date.now(),
      version: this.version
    };
    businessMetricsCache.set(key, entry);
  }

  // KPI Cache
  getKPI(key: string): any | null {
    const cached = kpiCache.get(key);
    if (cached) {
      this.stats.kpi.hits++;
      return cached;
    }
    this.stats.kpi.misses++;
    return null;
  }

  setKPI(key: string, data: any): void {
    const entry: CacheEntry<any> = {
      data,
      timestamp: Date.now(),
      version: this.version
    };
    kpiCache.set(key, entry);
  }

  // Executive Data Cache
  getExecutiveData(key: string): any | null {
    const cached = executiveDataCache.get(key);
    if (cached) {
      this.stats.executiveData.hits++;
      return cached;
    }
    this.stats.executiveData.misses++;
    return null;
  }

  setExecutiveData(key: string, data: any): void {
    const entry: CacheEntry<any> = {
      data,
      timestamp: Date.now(),
      version: this.version
    };
    executiveDataCache.set(key, entry);
  }

  // Country Data Cache
  getCountryData(key: string): any | null {
    const cached = countryDataCache.get(key);
    if (cached) {
      this.stats.countryData.hits++;
      return cached;
    }
    this.stats.countryData.misses++;
    return null;
  }

  setCountryData(key: string, data: any): void {
    const entry: CacheEntry<any> = {
      data,
      timestamp: Date.now(),
      version: this.version
    };
    countryDataCache.set(key, data);
  }

  // Cache Management
  invalidateBusinessMetrics(pattern?: string): void {
    if (pattern) {
      for (const key of Array.from(businessMetricsCache.keys())) {
        if (key.includes(pattern)) {
          businessMetricsCache.delete(key);
        }
      }
    } else {
      businessMetricsCache.clear();
    }
  }

  invalidateKPI(pattern?: string): void {
    if (pattern) {
      for (const key of Array.from(kpiCache.keys())) {
        if (key.includes(pattern)) {
          kpiCache.delete(key);
        }
      }
    } else {
      kpiCache.clear();
    }
  }

  invalidateExecutiveData(): void {
    executiveDataCache.clear();
  }

  invalidateCountryData(country?: string): void {
    if (country) {
      for (const key of Array.from(countryDataCache.keys())) {
        if (key.includes(country)) {
          countryDataCache.delete(key);
        }
      }
    } else {
      countryDataCache.clear();
    }
  }

  invalidateAll(): void {
    businessMetricsCache.clear();
    kpiCache.clear();
    executiveDataCache.clear();
    countryDataCache.clear();
    this.resetStats();
  }

  // Cache Statistics
  getStats(): CacheStats {
    return {
      businessMetrics: {
        size: businessMetricsCache.size,
        hits: this.stats.businessMetrics.hits,
        misses: this.stats.businessMetrics.misses
      },
      kpi: {
        size: kpiCache.size,
        hits: this.stats.kpi.hits,
        misses: this.stats.kpi.misses
      },
      executiveData: {
        size: executiveDataCache.size,
        hits: this.stats.executiveData.hits,
        misses: this.stats.executiveData.misses
      },
      countryData: {
        size: countryDataCache.size,
        hits: this.stats.countryData.hits,
        misses: this.stats.countryData.misses
      }
    };
  }

  getCacheHitRatio(): number {
    const stats = this.getStats();
    const totalHits = stats.businessMetrics.hits + stats.kpi.hits + 
                     stats.executiveData.hits + stats.countryData.hits;
    const totalMisses = stats.businessMetrics.misses + stats.kpi.misses + 
                       stats.executiveData.misses + stats.countryData.misses;
    const total = totalHits + totalMisses;
    
    return total === 0 ? 0 : (totalHits / total) * 100;
  }

  private resetStats(): void {
    this.stats = {
      businessMetrics: { hits: 0, misses: 0 },
      kpi: { hits: 0, misses: 0 },
      executiveData: { hits: 0, misses: 0 },
      countryData: { hits: 0, misses: 0 }
    };
  }

  // Smart cache warming
  async warmUpCache(): Promise<void> {
    console.log('🔥 Warming up cache...');
    
    // Pre-load frequently accessed data
    const countries = ['guatemala', 'costa-rica', 'el-salvador', 'nicaragua', 'honduras', 'honduras-tigo'];
    
    // Warm up country data
    for (const country of countries) {
      // This would typically call the actual API
      this.setCountryData(`${country}-accounts`, { warmed: true });
      this.setCountryData(`${country}-metrics`, { warmed: true });
    }

    // Warm up business metrics
    this.setBusinessMetrics('guatemala-business', { warmed: true });
    this.setExecutiveData('regional-summary', { warmed: true });
    
    console.log('✅ Cache warming completed');
  }

  // Background cache refresh
  scheduleBackgroundRefresh(): void {
    // Refresh cache every 3 minutes
    setInterval(() => {
      this.backgroundRefresh();
    }, 3 * 60 * 1000);
  }

  private async backgroundRefresh(): Promise<void> {
    console.log('🔄 Background cache refresh...');
    
    // Refresh critical data in background
    const criticalKeys = [
      'guatemala-business',
      'regional-summary',
      'kpi-performance',
      'executive-metrics'
    ];

    for (const key of criticalKeys) {
      // In a real implementation, this would fetch fresh data
      // For now, we just update the timestamp
      const cached = this.getExecutiveData(key);
      if (cached) {
        this.setExecutiveData(key, { ...cached, refreshed: Date.now() });
      }
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Initialize cache warming on startup
if (typeof window !== 'undefined') {
  // Only run in browser
  setTimeout(() => {
    cacheManager.warmUpCache();
    cacheManager.scheduleBackgroundRefresh();
  }, 1000);
}

// Cache decorator for API calls
export function cached(cacheName: 'businessMetrics' | 'kpi' | 'executiveData' | 'countryData', ttl?: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${propertyKey}-${JSON.stringify(args)}`;
      
      // Try to get from cache first
      let cached;
      switch (cacheName) {
        case 'businessMetrics':
          cached = cacheManager.getBusinessMetrics(cacheKey);
          break;
        case 'kpi':
          cached = cacheManager.getKPI(cacheKey);
          break;
        case 'executiveData':
          cached = cacheManager.getExecutiveData(cacheKey);
          break;
        case 'countryData':
          cached = cacheManager.getCountryData(cacheKey);
          break;
      }

      if (cached) {
        return cached.data;
      }

      // If not in cache, call original method
      const result = await originalMethod.apply(this, args);

      // Store in cache
      switch (cacheName) {
        case 'businessMetrics':
          cacheManager.setBusinessMetrics(cacheKey, result);
          break;
        case 'kpi':
          cacheManager.setKPI(cacheKey, result);
          break;
        case 'executiveData':
          cacheManager.setExecutiveData(cacheKey, result);
          break;
        case 'countryData':
          cacheManager.setCountryData(cacheKey, result);
          break;
      }

      return result;
    };

    return descriptor;
  };
} 