import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { TrafficService } from './traffic.service';
import { ConfigService } from '@nestjs/config';

interface ClientIdUpdate {
  oldClientId: string;
  newClientId: string;
}

@Controller('traffic')
export class TrafficController {
  constructor(
    private readonly trafficService: TrafficService,
    private readonly configService: ConfigService,
  ) {}

  

  @Get('daily-gt-client')
  getDailyTrafficByClient(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('clientIds') clientIds: string[],
  ) {
    const uri = this.configService.get<string>('MONGO_URI_GT');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_GT');
    return this.trafficService.getDailyTrafficByClient(
      uri,
      dbName,
      startDate,
      endDate,
      clientIds,
    );
  }

  @Get('monthly-gt-client')
  getMonthlyTrafficByClient(
    @Query('startMonth') startMonth: string,
    @Query('clientIds') clientIds: string[],
    @Query('endMonth') endMonth?: string, // endMonth es opcional
  ) {
    const uri = this.configService.get<string>('MONGO_URI_GT');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_GT');
    return this.trafficService.getMonthlyTrafficByClient(
      uri,
      dbName,
      startMonth,
      clientIds,
      endMonth,
    );
  }

  @Get('yearly-gt-client')
  getYearlyTrafficByClient(
    @Query('startYear') startYear: string,
    @Query('clientIds') clientIds: string[],
    @Query('endYear') endYear?: string, // Accept `endYear` as string initially
  ) {
    const startYearNumber = parseInt(startYear, 10); // Parse `startYear` as a number
    const endYearNumber = endYear ? parseInt(endYear, 10) : undefined; // Parse `endYear` only if provided

    const uri = this.configService.get<string>('MONGO_URI_GT');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_GT');

    return this.trafficService.getYearlyTrafficByClient(
      uri,
      dbName,
      startYearNumber,
      clientIds,
      endYearNumber,
    );
  }

  @Get('daily-reach-client')
  getDailyTrafficByClientReach(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('clientIds') clientIds: string[],
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    return this.trafficService.getDailyTrafficByClient(
      uri,
      dbName,
      startDate,
      endDate,
      clientIds,
    );
  }

  @Get('monthly-reach-client')
  getMonthlyTrafficByClientReach(
    @Query('startMonth') startMonth: string,
    @Query('clientIds') clientIds: string[],
    @Query('endMonth') endMonth?: string, // endMonth es opcional
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    return this.trafficService.getMonthlyTrafficByClient(
      uri,
      dbName,
      startMonth,
      clientIds,
      endMonth,
    );
  }

  @Get('yearly-reach-client')
  getYearlyTrafficByClientReach(
    @Query('startYear') startYear: string,
    @Query('clientIds') clientIds: string[],
    @Query('endYear') endYear?: string, // Accept `endYear` as string initially
  ) {
    const startYearNumber = parseInt(startYear, 10); // Parse `startYear` as a number
    const endYearNumber = endYear ? parseInt(endYear, 10) : undefined; // Parse `endYear` only if provided

    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');

    return this.trafficService.getYearlyTrafficByClient(
      uri,
      dbName,
      startYearNumber,
      clientIds,
      endYearNumber,
    );
  }

  @Get('daily-gt')
  getDailyTrafficGT(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_GT');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_GT');
    return this.trafficService.getDailyTraffic(uri, dbName, startDate, endDate);
  }

  @Get('monthly-gt')
  getMonthlyTrafficGT(
    @Query('startMonth') startMonth: string,
    @Query('endMonth') endMonth?: string, // endMonth es opcional
  ) {
    const uri = this.configService.get<string>('MONGO_URI_GT');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_GT');
    return this.trafficService.getMonthlyTraffic(
      uri,
      dbName,
      startMonth,
      endMonth,
    );
  }

  @Get('yearly-gt')
  getYearlyTrafficGT(
    @Query('startYear') startYear: string,
    @Query('endYear') endYear?: string, // Accept `endYear` as string initially
  ) {
    const startYearNumber = parseInt(startYear, 10); // Parse `startYear` as a number
    const endYearNumber = endYear ? parseInt(endYear, 10) : undefined; // Parse `endYear` only if provided

    const uri = this.configService.get<string>('MONGO_URI_GT');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_GT');

    return this.trafficService.getYearlyTraffic(
      uri,
      dbName,
      startYearNumber,
      endYearNumber,
    );
  }

  @Get('daily-reach')
  getDailyTrafficR(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    return this.trafficService.getDailyTraffic(uri, dbName, startDate, endDate);
  }

  @Get('monthly-reach')
  getMonthlyTrafficR(
    @Query('startMonth') startMonth: string,
    @Query('endMonth') endMonth?: string, // endMonth es opcional
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    return this.trafficService.getMonthlyTraffic(
      uri,
      dbName,
      startMonth,
      endMonth,
    );
  }

  @Get('yearly-reach')
  getYearlyTrafficR(
    @Query('startYear') startYear: string,
    @Query('endYear') endYear?: string, // Accept `endYear` as string initially
  ) {
    const startYearNumber = parseInt(startYear, 10); // Parse `startYear` as a number
    const endYearNumber = endYear ? parseInt(endYear, 10) : undefined; // Parse `endYear` only if provided

    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');

    return this.trafficService.getYearlyTraffic(
      uri,
      dbName,
      startYearNumber,
      endYearNumber,
    );
  }

  // Costa Rica (CR)
  @Get('daily-cr-client')
  getDailyTrafficByClientCR(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('clientIds') clientIds: string[],
  ) {
    const uri = this.configService.get<string>('MONGO_URI_CR');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_CR');
    return this.trafficService.getDailyTrafficByClient(
      uri,
      dbName,
      startDate,
      endDate,
      clientIds,
    );
  }

  @Get('monthly-cr-client')
  getMonthlyTrafficByClientCR(
    @Query('startMonth') startMonth: string,
    @Query('clientIds') clientIds: string[],
    @Query('endMonth') endMonth?: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_CR');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_CR');
    return this.trafficService.getMonthlyTrafficByClient(
      uri,
      dbName,
      startMonth,
      clientIds,
      endMonth,
    );
  }

  @Get('yearly-cr-client')
  getYearlyTrafficByClientCR(
    @Query('startYear') startYear: string,
    @Query('clientIds') clientIds: string[],
    @Query('endYear') endYear?: string,
  ) {
    const startYearNumber = parseInt(startYear, 10);
    const endYearNumber = endYear ? parseInt(endYear, 10) : undefined;
    const uri = this.configService.get<string>('MONGO_URI_CR');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_CR');
    return this.trafficService.getYearlyTrafficByClient(
      uri,
      dbName,
      startYearNumber,
      clientIds,
      endYearNumber,
    );
  }

  // El Salvador (SV)
  @Get('daily-sv-client')
  getDailyTrafficByClientSV(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('clientIds') clientIds: string[],
  ) {
    const uri = this.configService.get<string>('MONGO_URI_SV');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_SV');
    return this.trafficService.getDailyTrafficByClient(
      uri,
      dbName,
      startDate,
      endDate,
      clientIds,
    );
  }

  @Get('monthly-sv-client')
  getMonthlyTrafficByClientSV(
    @Query('startMonth') startMonth: string,
    @Query('clientIds') clientIds: string[],
    @Query('endMonth') endMonth?: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_SV');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_SV');
    return this.trafficService.getMonthlyTrafficByClient(
      uri,
      dbName,
      startMonth,
      clientIds,
      endMonth,
    );
  }

  @Get('yearly-sv-client')
  getYearlyTrafficByClientSV(
    @Query('startYear') startYear: string,
    @Query('clientIds') clientIds: string[],
    @Query('endYear') endYear?: string,
  ) {
    const startYearNumber = parseInt(startYear, 10);
    const endYearNumber = endYear ? parseInt(endYear, 10) : undefined;
    const uri = this.configService.get<string>('MONGO_URI_SV');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_SV');
    return this.trafficService.getYearlyTrafficByClient(
      uri,
      dbName,
      startYearNumber,
      clientIds,
      endYearNumber,
    );
  }

  // Nicaragua (NI)
  @Get('daily-ni-client')
  getDailyTrafficByClientNI(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('clientIds') clientIds: string[],
  ) {
    const uri = this.configService.get<string>('MONGO_URI_NI');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_NI');
    return this.trafficService.getDailyTrafficByClient(
      uri,
      dbName,
      startDate,
      endDate,
      clientIds,
    );
  }

  @Get('monthly-ni-client')
  getMonthlyTrafficByClientNI(
    @Query('startMonth') startMonth: string,
    @Query('clientIds') clientIds: string[],
    @Query('endMonth') endMonth?: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_NI');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_NI');
    return this.trafficService.getMonthlyTrafficByClient(
      uri,
      dbName,
      startMonth,
      clientIds,
      endMonth,
    );
  }

  @Get('yearly-ni-client')
  getYearlyTrafficByClientNI(
    @Query('startYear') startYear: string,
    @Query('clientIds') clientIds: string[],
    @Query('endYear') endYear?: string,
  ) {
    const startYearNumber = parseInt(startYear, 10);
    const endYearNumber = endYear ? parseInt(endYear, 10) : undefined;
    const uri = this.configService.get<string>('MONGO_URI_NI');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_NI');
    return this.trafficService.getYearlyTrafficByClient(
      uri,
      dbName,
      startYearNumber,
      clientIds,
      endYearNumber,
    );
  }

  // Honduras (HN)
  @Get('daily-hn-client')
  getDailyTrafficByClientHN(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('clientIds') clientIds: string[],
  ) {
    const uri = this.configService.get<string>('MONGO_URI_CA');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_HN');
    return this.trafficService.getDailyTrafficByClient(
      uri,
      dbName,
      startDate,
      endDate,
      clientIds,
    );
  }

  @Get('monthly-hn-client')
  getMonthlyTrafficByClientHN(
    @Query('startMonth') startMonth: string,
    @Query('clientIds') clientIds: string[],
    @Query('endMonth') endMonth?: string,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_CA');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_HN');
    return this.trafficService.getMonthlyTrafficByClient(
      uri,
      dbName,
      startMonth,
      clientIds,
      endMonth,
    );
  }

  @Get('yearly-hn-client')
  getYearlyTrafficByClientHN(
    @Query('startYear') startYear: string,
    @Query('clientIds') clientIds: string[],
    @Query('endYear') endYear?: string,
  ) {
    const startYearNumber = parseInt(startYear, 10);
    const endYearNumber = endYear ? parseInt(endYear, 10) : undefined;
    const uri = this.configService.get<string>('MONGO_URI_CA');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_HN');
    return this.trafficService.getYearlyTrafficByClient(
      uri,
      dbName,
      startYearNumber,
      clientIds,
      endYearNumber,
    );
  }

  // TIGO Honduras
@Get('daily-tigo-client')
getDailyTrafficByClientTigo(
  @Query('startDate') startDate: string,
  @Query('endDate') endDate: string,
  @Query('clientIds') clientIds: string[],
) {
  const uri = this.configService.get<string>('MONGO_URI_TIGO');
  const dbName = this.configService.get<string>('MONGO_DB_NAME_TIGO');
  return this.trafficService.getDailyTrafficByClient(
    uri,
    dbName,
    startDate,
    endDate,
    clientIds,
  );
}

@Get('monthly-tigo-client')
getMonthlyTrafficByClientTigo(
  @Query('startMonth') startMonth: string,
  @Query('clientIds') clientIds: string[],
  @Query('endMonth') endMonth?: string,
) {
  const uri = this.configService.get<string>('MONGO_URI_TIGO');
  const dbName = this.configService.get<string>('MONGO_DB_NAME_TIGO');
  return this.trafficService.getMonthlyTrafficByClient(
    uri,
    dbName,
    startMonth,
    clientIds,
    endMonth,
  );
}

@Get('yearly-tigo-client')
getYearlyTrafficByClientTigo(
  @Query('startYear') startYear: string,
  @Query('clientIds') clientIds: string[],
  @Query('endYear') endYear?: string,
) {
  const startYearNumber = parseInt(startYear, 10);
  const endYearNumber = endYear ? parseInt(endYear, 10) : undefined;
  const uri = this.configService.get<string>('MONGO_URI_TIGO');
  const dbName = this.configService.get<string>('MONGO_DB_NAME_TIGO');
  return this.trafficService.getYearlyTrafficByClient(
    uri,
    dbName,
    startYearNumber,
    clientIds,
    endYearNumber,
  );
}

// Regional
@Get('daily-regional-client')
getDailyTrafficByClientRegional(
  @Query('startDate') startDate: string,
  @Query('endDate') endDate: string,
  @Query('clientIds') clientIds: string[],
) {
  const uri = this.configService.get<string>('MONGO_URI_REGIONAL');
  const dbName = this.configService.get<string>('MONGO_DB_NAME_REGIONAL');
  return this.trafficService.getDailyTrafficByClient(
    uri,
    dbName,
    startDate,
    endDate,
    clientIds,
  );
}

@Get('monthly-regional-client')
getMonthlyTrafficByClientRegional(
  @Query('startMonth') startMonth: string,
  @Query('clientIds') clientIds: string[],
  @Query('endMonth') endMonth?: string,
) {
  const uri = this.configService.get<string>('MONGO_URI_REGIONAL');
  const dbName = this.configService.get<string>('MONGO_DB_NAME_REGIONAL');
  return this.trafficService.getMonthlyTrafficByClient(
    uri,
    dbName,
    startMonth,
    clientIds,
    endMonth,
  );
}

@Get('yearly-regional-client')
getYearlyTrafficByClientRegional(
  @Query('startYear') startYear: string,
  @Query('clientIds') clientIds: string[],
  @Query('endYear') endYear?: string,
) {
  const startYearNumber = parseInt(startYear, 10);
  const endYearNumber = endYear ? parseInt(endYear, 10) : undefined;
  const uri = this.configService.get<string>('MONGO_URI_REGIONAL');
  const dbName = this.configService.get<string>('MONGO_DB_NAME_REGIONAL');
  return this.trafficService.getYearlyTrafficByClient(
    uri,
    dbName,
    startYearNumber,
    clientIds,
    endYearNumber,
  );
}

    // Costa Rica (CR)
    @Get('daily-cr')
    getDailyTrafficCR(
      @Query('startDate') startDate: string,
      @Query('endDate') endDate: string,
    ) {
      const uri = this.configService.get<string>('MONGO_URI_CR');
      const dbName = this.configService.get<string>('MONGO_DB_NAME_CR');
      return this.trafficService.getDailyTraffic(uri, dbName, startDate, endDate);
    }
  
    @Get('monthly-cr')
    getMonthlyTrafficCR(
      @Query('startMonth') startMonth: string,
      @Query('endMonth') endMonth?: string,
    ) {
      const uri = this.configService.get<string>('MONGO_URI_CR');
      const dbName = this.configService.get<string>('MONGO_DB_NAME_CR');
      return this.trafficService.getMonthlyTraffic(uri, dbName, startMonth, endMonth);
    }
  
    @Get('yearly-cr')
    getYearlyTrafficCR(
      @Query('startYear') startYear: string,
      @Query('endYear') endYear?: string,
    ) {
      const startYearNumber = parseInt(startYear, 10);
      const endYearNumber = endYear ? parseInt(endYear, 10) : undefined;
      const uri = this.configService.get<string>('MONGO_URI_CR');
      const dbName = this.configService.get<string>('MONGO_DB_NAME_CR');
      return this.trafficService.getYearlyTraffic(uri, dbName, startYearNumber, endYearNumber);
    }
  
    // El Salvador (SV)
    @Get('daily-sv')
    getDailyTrafficSV(
      @Query('startDate') startDate: string,
      @Query('endDate') endDate: string,
    ) {
      const uri = this.configService.get<string>('MONGO_URI_SV');
      const dbName = this.configService.get<string>('MONGO_DB_NAME_SV');
      return this.trafficService.getDailyTraffic(uri, dbName, startDate, endDate);
    }
  
    @Get('monthly-sv')
    getMonthlyTrafficSV(
      @Query('startMonth') startMonth: string,
      @Query('endMonth') endMonth?: string,
    ) {
      const uri = this.configService.get<string>('MONGO_URI_SV');
      const dbName = this.configService.get<string>('MONGO_DB_NAME_SV');
      return this.trafficService.getMonthlyTraffic(uri, dbName, startMonth, endMonth);
    }
  
    @Get('yearly-sv')
    getYearlyTrafficSV(
      @Query('startYear') startYear: string,
      @Query('endYear') endYear?: string,
    ) {
      const startYearNumber = parseInt(startYear, 10);
      const endYearNumber = endYear ? parseInt(endYear, 10) : undefined;
      const uri = this.configService.get<string>('MONGO_URI_SV');
      const dbName = this.configService.get<string>('MONGO_DB_NAME_SV');
      return this.trafficService.getYearlyTraffic(uri, dbName, startYearNumber, endYearNumber);
    }
  
    // Nicaragua (NI)
    @Get('daily-ni')
    getDailyTrafficNI(
      @Query('startDate') startDate: string,
      @Query('endDate') endDate: string,
    ) {
      const uri = this.configService.get<string>('MONGO_URI_NI');
      const dbName = this.configService.get<string>('MONGO_DB_NAME_NI');
      return this.trafficService.getDailyTraffic(uri, dbName, startDate, endDate);
    }
  
    @Get('monthly-ni')
    getMonthlyTrafficNI(
      @Query('startMonth') startMonth: string,
      @Query('endMonth') endMonth?: string,
    ) {
      const uri = this.configService.get<string>('MONGO_URI_NI');
      const dbName = this.configService.get<string>('MONGO_DB_NAME_NI');
      return this.trafficService.getMonthlyTraffic(uri, dbName, startMonth, endMonth);
    }
  
    @Get('yearly-ni')
    getYearlyTrafficNI(
      @Query('startYear') startYear: string,
      @Query('endYear') endYear?: string,
    ) {
      const startYearNumber = parseInt(startYear, 10);
      const endYearNumber = endYear ? parseInt(endYear, 10) : undefined;
      const uri = this.configService.get<string>('MONGO_URI_NI');
      const dbName = this.configService.get<string>('MONGO_DB_NAME_NI');
      return this.trafficService.getYearlyTraffic(uri, dbName, startYearNumber, endYearNumber);
    }
  
    // Honduras (HN)
    @Get('daily-hn')
    getDailyTrafficHN(
      @Query('startDate') startDate: string,
      @Query('endDate') endDate: string,
    ) {
      const uri = this.configService.get<string>('MONGO_URI_CA');
      const dbName = this.configService.get<string>('MONGO_DB_NAME_HN');
      return this.trafficService.getDailyTraffic(uri, dbName, startDate, endDate);
    }
  
    @Get('monthly-hn')
    getMonthlyTrafficHN(
      @Query('startMonth') startMonth: string,
      @Query('endMonth') endMonth?: string,
    ) {
      const uri = this.configService.get<string>('MONGO_URI_CA');
      const dbName = this.configService.get<string>('MONGO_DB_NAME_HN');
      return this.trafficService.getMonthlyTraffic(uri, dbName, startMonth, endMonth);
    }
  
    @Get('yearly-hn')
    getYearlyTrafficHN(
      @Query('startYear') startYear: string,
      @Query('endYear') endYear?: string,
    ) {
      const startYearNumber = parseInt(startYear, 10);
      const endYearNumber = endYear ? parseInt(endYear, 10) : undefined;
      const uri = this.configService.get<string>('MONGO_URI_CA');
      const dbName = this.configService.get<string>('MONGO_DB_NAME_HN');
      return this.trafficService.getYearlyTraffic(uri, dbName, startYearNumber, endYearNumber);
    }
  
    // TIGO
    @Get('daily-tigo')
    getDailyTrafficTIGO(
      @Query('startDate') startDate: string,
      @Query('endDate') endDate: string,
    ) {
      const uri = this.configService.get<string>('MONGO_URI_TIGO');
      const dbName = this.configService.get<string>('MONGO_DB_NAME_TIGO');
      return this.trafficService.getDailyTraffic(uri, dbName, startDate, endDate);
    }
  
    @Get('monthly-tigo')
    getMonthlyTrafficTIGO(
      @Query('startMonth') startMonth: string,
      @Query('endMonth') endMonth?: string,
    ) {
      const uri = this.configService.get<string>('MONGO_URI_TIGO');
      const dbName = this.configService.get<string>('MONGO_DB_NAME_TIGO');
      return this.trafficService.getMonthlyTraffic(uri, dbName, startMonth, endMonth);
    }
  
    @Get('yearly-tigo')
    getYearlyTrafficTIGO(
      @Query('startYear') startYear: string,
      @Query('endYear') endYear?: string,
    ) {
      const startYearNumber = parseInt(startYear, 10);
      const endYearNumber = endYear ? parseInt(endYear, 10) : undefined;
      const uri = this.configService.get<string>('MONGO_URI_TIGO');
      const dbName = this.configService.get<string>('MONGO_DB_NAME_TIGO');
      return this.trafficService.getYearlyTraffic(uri, dbName, startYearNumber, endYearNumber);
    }
  
    // Regional
    @Get('daily-regional')
    getDailyTrafficRegional(
      @Query('startDate') startDate: string,
      @Query('endDate') endDate: string,
    ) {
      const uri = this.configService.get<string>('MONGO_URI_REGIONAL');
      const dbName = this.configService.get<string>('MONGO_DB_NAME_REGIONAL');
      return this.trafficService.getDailyTraffic(uri, dbName, startDate, endDate);
    }
  
    @Get('monthly-regional')
    getMonthlyTrafficRegional(
      @Query('startMonth') startMonth: string,
      @Query('endMonth') endMonth?: string,
    ) {
      const uri = this.configService.get<string>('MONGO_URI_REGIONAL');
      const dbName = this.configService.get<string>('MONGO_DB_NAME_REGIONAL');
      return this.trafficService.getMonthlyTraffic(uri, dbName, startMonth, endMonth);
    }
  
    @Get('yearly-regional')
    getYearlyTrafficRegional(
      @Query('startYear') startYear: string,
      @Query('endYear') endYear?: string,
    ) {
      const startYearNumber = parseInt(startYear, 10);
      const endYearNumber = endYear ? parseInt(endYear, 10) : undefined;
      const uri = this.configService.get<string>('MONGO_URI_REGIONAL');
      const dbName = this.configService.get<string>('MONGO_DB_NAME_REGIONAL');
      return this.trafficService.getYearlyTraffic(uri, dbName, startYearNumber, endYearNumber);
    }

  @Get('traffic-heatmap')
  async getTrafficHeatmap(
    @Query('accountUid') accountUid: string,
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    const uri = this.configService.get<string>('MONGO_URI_REACH');
    const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
    return this.trafficService.getTrafficHeatmap(
      uri,
      dbName,
      accountUid,
      year,
      month,
    );
  }

  // Guatemala
@Post('update-client-id-gt')
async updateClientId(@Body() updates: ClientIdUpdate[]) {
  const uri = this.configService.get<string>('MONGO_URI_GT');
  const dbName = this.configService.get<string>('MONGO_DB_NAME_GT');
  return this.trafficService.updateMultipleClientIds(uri, dbName, updates);
}

// Reach
@Post('update-client-id-reach')
async updateClientIdReach(@Body() updates: ClientIdUpdate[]) {
  const uri = this.configService.get<string>('MONGO_URI_REACH');
  const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
  return this.trafficService.updateMultipleClientIds(uri, dbName, updates);
}

// Costa Rica
@Post('update-client-id-cr')
async updateClientIdCR(@Body() updates: ClientIdUpdate[]) {
  const uri = this.configService.get<string>('MONGO_URI_CR');
  const dbName = this.configService.get<string>('MONGO_DB_NAME_CR');
  return this.trafficService.updateMultipleClientIds(uri, dbName, updates);
}

// El Salvador
@Post('update-client-id-sv')
async updateClientIdSV(@Body() updates: ClientIdUpdate[]) {
  const uri = this.configService.get<string>('MONGO_URI_SV');
  const dbName = this.configService.get<string>('MONGO_DB_NAME_SV');
  return this.trafficService.updateMultipleClientIds(uri, dbName, updates);
}

// Nicaragua
@Post('update-client-id-ni')
async updateClientIdNI(@Body() updates: ClientIdUpdate[]) {
  const uri = this.configService.get<string>('MONGO_URI_NI');
  const dbName = this.configService.get<string>('MONGO_DB_NAME_NI');
  return this.trafficService.updateMultipleClientIds(uri, dbName, updates);
}

// Honduras
@Post('update-client-id-hn')
async updateClientIdHN(@Body() updates: ClientIdUpdate[]) {
  const uri = this.configService.get<string>('MONGO_URI_CA');
  const dbName = this.configService.get<string>('MONGO_DB_NAME_HN');
  return this.trafficService.updateMultipleClientIds(uri, dbName, updates);
}

// TIGO
@Post('update-client-id-tigo')
async updateClientIdTigo(@Body() updates: ClientIdUpdate[]) {
  const uri = this.configService.get<string>('MONGO_URI_TIGO');
  const dbName = this.configService.get<string>('MONGO_DB_NAME_TIGO');
  return this.trafficService.updateMultipleClientIds(uri, dbName, updates);
}

// Regional
@Post('update-client-id-regional')
async updateClientIdRegional(@Body() updates: ClientIdUpdate[]) {
  const uri = this.configService.get<string>('MONGO_URI_REGIONAL');
  const dbName = this.configService.get<string>('MONGO_DB_NAME_REGIONAL');
  return this.trafficService.updateMultipleClientIds(uri, dbName, updates);
}

// Guatemala
@Post('auto-update-client-ids-gt')
async autoUpdateClientIdsGT() {
  const uri = this.configService.get<string>('MONGO_URI_GT');
  const dbName = this.configService.get<string>('MONGO_DB_NAME_GT');
  return this.trafficService.autoUpdateClientIds(uri, dbName);
}

// Reach
@Post('auto-update-client-ids-reach')
async autoUpdateClientIdsReach() {
  const uri = this.configService.get<string>('MONGO_URI_REACH');
  const dbName = this.configService.get<string>('MONGO_DB_NAME_REACH');
  return this.trafficService.autoUpdateClientIds(uri, dbName);
}

// Costa Rica
@Post('auto-update-client-ids-cr')
async autoUpdateClientIdsCR() {
  const uri = this.configService.get<string>('MONGO_URI_CR');
  const dbName = this.configService.get<string>('MONGO_DB_NAME_CR');
  return this.trafficService.autoUpdateClientIds(uri, dbName);
}

// El Salvador
@Post('auto-update-client-ids-sv')
async autoUpdateClientIdsSV() {
  const uri = this.configService.get<string>('MONGO_URI_SV');
  const dbName = this.configService.get<string>('MONGO_DB_NAME_SV');
  return this.trafficService.autoUpdateClientIds(uri, dbName);
}

// Nicaragua
@Post('auto-update-client-ids-ni')
async autoUpdateClientIdsNI() {
  const uri = this.configService.get<string>('MONGO_URI_NI');
  const dbName = this.configService.get<string>('MONGO_DB_NAME_NI');
  return this.trafficService.autoUpdateClientIds(uri, dbName);
}

// Honduras
@Post('auto-update-client-ids-hn')
async autoUpdateClientIdsHN() {
  const uri = this.configService.get<string>('MONGO_URI_CA');
  const dbName = this.configService.get<string>('MONGO_DB_NAME_HN');
  return this.trafficService.autoUpdateClientIds(uri, dbName);
}

// TIGO
@Post('auto-update-client-ids-tigo')
async autoUpdateClientIdsTigo() {
  const uri = this.configService.get<string>('MONGO_URI_TIGO');
  const dbName = this.configService.get<string>('MONGO_DB_NAME_TIGO');
  return this.trafficService.autoUpdateClientIds(uri, dbName);
}

// Regional
@Post('auto-update-client-ids-regional')
async autoUpdateClientIdsRegional() {
  const uri = this.configService.get<string>('MONGO_URI_REGIONAL');
  const dbName = this.configService.get<string>('MONGO_DB_NAME_REGIONAL');
  return this.trafficService.autoUpdateClientIds(uri, dbName);
}

}
