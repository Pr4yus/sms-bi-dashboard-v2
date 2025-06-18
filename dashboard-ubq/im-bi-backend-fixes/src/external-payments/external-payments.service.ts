import { Injectable, BadRequestException } from '@nestjs/common';
import { MongoService } from '../mongo/mongo.service';
import { ObjectId, MongoError } from 'mongodb';

@Injectable()
export class ExternalPaymentsService {
  constructor(private readonly mongoService: MongoService) {}

  private validateObjectId(accountUid: string): ObjectId {
    try {
      return new ObjectId(accountUid);
    } catch (error) {
      throw new Error(`Invalid account ID format: ${accountUid}`);
    }
  }

  // Vista General Diaria
  async getDailyPayments(
    uri: string,
    dbName: string,
    startDate: string,
    endDate: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    return db.collection('external_payments').aggregate([
      {
        $match: {
          datetime: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: '$datetime',
          total_links: { $sum: '$summary.total_links' },
          processors_detail: { $addToSet: { $arrayElemAt: ['$processors_detail', 0] } },
          all_links: { $push: '$links' },
          internal_count: { $sum: '$summary.types.INTERNAL' },
          external_count: { $sum: '$summary.types.EXTERNAL' }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          total_links: 1,
          processors_detail: 1,
          processors: {
            $arrayToObject: {
              $map: {
                input: '$processors_detail',
                as: 'proc',
                in: {
                  k: '$$proc.processor',
                  v: {
                    $size: {
                      $filter: {
                        input: {
                          $reduce: {
                            input: '$all_links',
                            initialValue: [],
                            in: { $concatArrays: ['$$value', '$$this'] }
                          }
                        },
                        as: 'link',
                        cond: { $eq: ['$$link.payment_info.processor', '$$proc.processor'] }
                      }
                    }
                  }
                }
              }
            }
          },
          types: {
            INTERNAL: '$internal_count',
            EXTERNAL: '$external_count'
          },
          links: {
            $reduce: {
              input: '$processors_detail',
              initialValue: [],
              in: {
                $concatArrays: [
                  '$$value',
                  {
                    $let: {
                      vars: {
                        processor_links: {
                          $filter: {
                            input: {
                              $reduce: {
                                input: '$all_links',
                                initialValue: [],
                                in: { $concatArrays: ['$$value', '$$this'] }
                              }
                            },
                            as: 'link',
                            cond: { $eq: ['$$link.payment_info.processor', '$$this.processor'] }
                          }
                        }
                      },
                      in: { $slice: ['$$processor_links', 2] }
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $sort: { date: 1 }
      },
      {
        $group: {
          _id: null,
          days: { $push: '$$ROOT' },
          total_global: { $sum: '$total_links' }
        }
      },
      {
        $project: {
          _id: 0,
          total_global: 1,
          days: 1,
          date_range: {
            start: startDate,
            end: endDate
          }
        }
      }
    ]).toArray();
  }

  // Vista General Mensual sin desglose por cuenta
  async getMonthlyPayments(
    uri: string,
    dbName: string,
    startMonth: string,
    endMonth?: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    return db.collection('external_payments').aggregate([
      {
        $match: {
          datetime: {
            $gte: `${startMonth}-01`,
            $lte: endMonth ? `${endMonth}-31` : `${startMonth}-31`,
          },
        },
      },
      {
        $group: {
          _id: { $substr: ['$datetime', 0, 7] },
          total_links: { $sum: '$summary.total_links' },
          processors_detail: { $addToSet: { $arrayElemAt: ['$processors_detail', 0] } },
          all_links: { $push: '$links' },
          internal_count: { $sum: '$summary.types.INTERNAL' },
          external_count: { $sum: '$summary.types.EXTERNAL' }
        }
      },
      {
        $project: {
          _id: 0,
          month: '$_id',
          total_links: 1,
          processors_detail: 1,
          processors: {
            $arrayToObject: {
              $map: {
                input: '$processors_detail',
                as: 'proc',
                in: {
                  k: '$$proc.processor',
                  v: {
                    $size: {
                      $filter: {
                        input: {
                          $reduce: {
                            input: '$all_links',
                            initialValue: [],
                            in: { $concatArrays: ['$$value', '$$this'] }
                          }
                        },
                        as: 'link',
                        cond: { $eq: ['$$link.payment_info.processor', '$$proc.processor'] }
                      }
                    }
                  }
                }
              }
            }
          },
          types: {
            INTERNAL: '$internal_count',
            EXTERNAL: '$external_count'
          },
          links: {
            $reduce: {
              input: '$processors_detail',
              initialValue: [],
              in: {
                $concatArrays: [
                  '$$value',
                  {
                    $let: {
                      vars: {
                        processor_links: {
                          $filter: {
                            input: {
                              $reduce: {
                                input: '$all_links',
                                initialValue: [],
                                in: { $concatArrays: ['$$value', '$$this'] }
                              }
                            },
                            as: 'link',
                            cond: { $eq: ['$$link.payment_info.processor', '$$this.processor'] }
                          }
                        }
                      },
                      in: { $slice: ['$$processor_links', 2] }
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $sort: { month: 1 }
      },
      {
        $group: {
          _id: null,
          months: { $push: '$$ROOT' },
          total_global: { $sum: '$total_links' }
        }
      },
      {
        $project: {
          _id: 0,
          total_global: 1,
          months: 1,
          month_range: {
            start: startMonth,
            end: endMonth || startMonth
          }
        }
      }
    ]).toArray();
  }

  // Vista por Cliente Diaria
  async getDailyPaymentsByAccount(
    uri: string,
    dbName: string,
    startDate: string,
    accountUid: string,
    endDate?: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    const objectId = this.validateObjectId(accountUid);

    return db.collection('external_payments').aggregate([
      {
        $match: {
          datetime: {
            $gte: startDate,
            $lte: endDate || startDate,
          },
          account_uid: objectId
        }
      },
      {
        $unwind: '$processors_detail'
      },
      {
        $group: {
          _id: { 
            date: '$datetime',
            account_name: '$account_name'
          },
          total_links: { $sum: '$summary.total_links' },
          processors_detail: { $addToSet: '$processors_detail' },
          all_links: { $push: '$links' },
          internal_count: { $sum: '$summary.types.INTERNAL' },
          external_count: { $sum: '$summary.types.EXTERNAL' }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id.date',
          account_name: '$_id.account_name',
          total_links: 1,
          processors_detail: 1,
          processors: {
            $arrayToObject: {
              $map: {
                input: '$processors_detail',
                as: 'proc',
                in: {
                  k: '$$proc.processor',
                  v: {
                    $size: {
                      $filter: {
                        input: {
                          $reduce: {
                            input: '$all_links',
                            initialValue: [],
                            in: { $concatArrays: ['$$value', '$$this'] }
                          }
                        },
                        as: 'link',
                        cond: { $eq: ['$$link.payment_info.processor', '$$proc.processor'] }
                      }
                    }
                  }
                }
              }
            }
          },
          types: {
            INTERNAL: '$internal_count',
            EXTERNAL: '$external_count'
          },
          links: {
            $reduce: {
              input: '$processors_detail',
              initialValue: [],
              in: {
                $concatArrays: [
                  '$$value',
                  {
                    $let: {
                      vars: {
                        processor_links: {
                          $filter: {
                            input: {
                              $reduce: {
                                input: '$all_links',
                                initialValue: [],
                                in: { $concatArrays: ['$$value', '$$this'] }
                              }
                            },
                            as: 'link',
                            cond: { $eq: ['$$link.payment_info.processor', '$$this.processor'] }
                          }
                        }
                      },
                      in: { $slice: ['$$processor_links', 2] }
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $sort: { date: 1 }
      },
      {
        $group: {
          _id: null,
          account_name: { $first: '$account_name' },
          days: { $push: '$$ROOT' },
          total_account: { $sum: '$total_links' }
        }
      },
      {
        $project: {
          _id: 0,
          account_name: 1,
          total_account: 1,
          days: 1,
          date_range: {
            start: startDate,
            end: endDate || startDate
          }
        }
      }
    ], {
      allowDiskUse: true
    }).toArray();
  }

  // Vista General Anual sin desglose por cuenta
  async getYearlyPayments(
    uri: string,
    dbName: string,
    startYear: string,
    endYear?: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    const startDate = `${startYear}-01-01`;
    const endDate = endYear ? `${endYear}-12-31` : `${startYear}-12-31`;

    const result = await db.collection('external_payments').aggregate([
      {
        $match: {
          datetime: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: { $substr: ['$datetime', 0, 4] },
          total_links: { $sum: '$summary.total_links' },
          processors_detail: { $addToSet: { $arrayElemAt: ['$processors_detail', 0] } },
          internal_count: { $sum: '$summary.types.INTERNAL' },
          external_count: { $sum: '$summary.types.EXTERNAL' },
          // Sumamos directamente los processors del summary
          processor_counts: {
            $push: {
              $objectToArray: '$summary.processors'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id',
          total_links: 1,
          processors_detail: 1,
          // Sumamos los conteos por processor
          processors: {
            $arrayToObject: {
              $reduce: {
                input: {
                  $reduce: {
                    input: '$processor_counts',
                    initialValue: [],
                    in: { $concatArrays: ['$$value', '$$this'] }
                  }
                },
                initialValue: [],
                in: {
                  $cond: {
                    if: {
                      $in: ['$$this.k', {
                        $map: {
                          input: '$$value',
                          as: 'v',
                          in: '$$v.k'
                        }
                      }]
                    },
                    then: {
                      $map: {
                        input: '$$value',
                        as: 'v',
                        in: {
                          k: '$$v.k',
                          v: {
                            $cond: {
                              if: { $eq: ['$$v.k', '$$this.k'] },
                              then: { $add: ['$$v.v', '$$this.v'] },
                              else: '$$v.v'
                            }
                          }
                        }
                      }
                    },
                    else: { $concatArrays: ['$$value', ['$$this']] }
                  }
                }
              }
            }
          },
          types: {
            INTERNAL: '$internal_count',
            EXTERNAL: '$external_count'
          }
        }
      },
      {
        $sort: { year: 1 }
      }
    ], {
      allowDiskUse: true
    }).toArray();

    // Obtenemos los ejemplos de links en una consulta separada y más ligera
    const sampleLinks = await db.collection('external_payments').aggregate([
      {
        $match: {
          datetime: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      { $sample: { size: 100 } }, // Tomamos una muestra aleatoria
      { $unwind: '$links' },
      {
        $group: {
          _id: {
            year: { $substr: ['$datetime', 0, 4] },
            processor: '$links.payment_info.processor'
          },
          links: { $push: '$links' }
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          processor: '$_id.processor',
          links: { $slice: ['$links', 2] }
        }
      }
    ]).toArray();

    // Combinamos los resultados
    const yearlyStats = {
      years: result.map(year => ({
        ...year,
        links: sampleLinks
          .filter(sample => sample.year === year.year)
          .flatMap(sample => sample.links || [])
      })),
      total_global: result.reduce((sum, year) => sum + year.total_links, 0),
      year_range: {
        start: result.length > 0 ? result[0].year : null,
        end: result.length > 0 ? result[result.length - 1].year : null
      }
    };

    return yearlyStats;
  }

  // Vista Mensual por Cliente
  async getMonthlyPaymentsByAccount(
    uri: string,
    dbName: string,
    accountUid: string,
    startMonth: string,
    endMonth?: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    const objectId = this.validateObjectId(accountUid);
    const startDate = `${startMonth}-01`;
    const endDate = endMonth 
        ? `${endMonth}-31` 
        : `${startMonth}-31`;

    const result = await db.collection('external_payments').aggregate([
      {
        $match: {
          account_uid: objectId,
          datetime: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $unwind: '$processors_detail'
      },
      {
        $group: {
          _id: { 
            month: { $substr: ['$datetime', 0, 7] },
            account_name: '$account_name'
          },
          total_links: { $sum: '$summary.total_links' },
          processors_detail: { $addToSet: '$processors_detail' },
          all_links: { $push: '$links' },
          internal_count: { $sum: '$summary.types.INTERNAL' },
          external_count: { $sum: '$summary.types.EXTERNAL' }
        }
      },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          account_name: '$_id.account_name',
          total_links: 1,
          processors_detail: 1,
          processors: {
            $arrayToObject: {
              $map: {
                input: '$processors_detail',
                as: 'proc',
                in: {
                  k: '$$proc.processor',
                  v: {
                    $size: {
                      $filter: {
                        input: {
                          $reduce: {
                            input: '$all_links',
                            initialValue: [],
                            in: { $concatArrays: ['$$value', '$$this'] }
                          }
                        },
                        as: 'link',
                        cond: { $eq: ['$$link.payment_info.processor', '$$proc.processor'] }
                      }
                    }
                  }
                }
              }
            }
          },
          types: {
            INTERNAL: '$internal_count',
            EXTERNAL: '$external_count'
          },
          links: {
            $reduce: {
              input: '$processors_detail',
              initialValue: [],
              in: {
                $concatArrays: [
                  '$$value',
                  {
                    $let: {
                      vars: {
                        processor_links: {
                          $filter: {
                            input: {
                              $reduce: {
                                input: '$all_links',
                                initialValue: [],
                                in: { $concatArrays: ['$$value', '$$this'] }
                              }
                            },
                            as: 'link',
                            cond: { $eq: ['$$link.payment_info.processor', '$$this.processor'] }
                          }
                        }
                      },
                      in: { $slice: ['$$processor_links', 2] }
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $sort: { month: 1 }
      },
      {
        $group: {
          _id: null,
          account_name: { $first: '$account_name' },
          months: { $push: '$$ROOT' },
          total_global: { $sum: '$total_links' }
        }
      },
      {
        $project: {
          _id: 0,
          account_name: 1,
          months: 1,
          total_global: 1,
          month_range: {
            start: startMonth,
            end: endMonth || startMonth
          }
        }
      }
    ], {
      allowDiskUse: true
    }).toArray();

    return result;
  }

  // Vista Anual por Cliente
  async getYearlyPaymentsByAccount(
    uri: string,
    dbName: string,
    accountUid: string,
    startYear: string,
    endYear?: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    const objectId = this.validateObjectId(accountUid);
    
    const startDate = `${startYear}-01-01`;
    const endDate = endYear 
        ? `${endYear}-12-31` 
        : `${startYear}-12-31`;

    const result = await db.collection('external_payments').aggregate([
      {
        $match: {
          account_uid: objectId,
          datetime: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $unwind: '$processors_detail'
      },
      {
        $group: {
          _id: { 
            year: { $substr: ['$datetime', 0, 4] },
            account_name: '$account_name'
          },
          total_links: { $sum: '$summary.total_links' },
          processors_detail: { $addToSet: '$processors_detail' },
          all_links: { $push: '$links' },
          internal_count: { $sum: '$summary.types.INTERNAL' },
          external_count: { $sum: '$summary.types.EXTERNAL' }
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          account_name: '$_id.account_name',
          total_links: 1,
          processors_detail: 1,
          processors: {
            $arrayToObject: {
              $map: {
                input: '$processors_detail',
                as: 'proc',
                in: {
                  k: '$$proc.processor',
                  v: {
                    $size: {
                      $filter: {
                        input: {
                          $reduce: {
                            input: '$all_links',
                            initialValue: [],
                            in: { $concatArrays: ['$$value', '$$this'] }
                          }
                        },
                        as: 'link',
                        cond: { $eq: ['$$link.payment_info.processor', '$$proc.processor'] }
                      }
                    }
                  }
                }
              }
            }
          },
          types: {
            INTERNAL: '$internal_count',
            EXTERNAL: '$external_count'
          },
          links: {
            $reduce: {
              input: '$processors_detail',
              initialValue: [],
              in: {
                $concatArrays: [
                  '$$value',
                  {
                    $let: {
                      vars: {
                        processor_links: {
                          $filter: {
                            input: {
                              $reduce: {
                                input: '$all_links',
                                initialValue: [],
                                in: { $concatArrays: ['$$value', '$$this'] }
                              }
                            },
                            as: 'link',
                            cond: { $eq: ['$$link.payment_info.processor', '$$this.processor'] }
                          }
                        }
                      },
                      in: { $slice: ['$$processor_links', 2] }
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $sort: { year: 1 }
      },
      {
        $group: {
          _id: null,
          account_name: { $first: '$account_name' },
          years: { $push: '$$ROOT' },
          total_global: { $sum: '$total_links' }
        }
      },
      {
        $project: {
          _id: 0,
          account_name: 1,
          years: 1,
          total_global: 1,
          year_range: {
            start: { $min: '$years.year' },
            end: { $max: '$years.year' }
          }
        }
      }
    ], {
      allowDiskUse: true
    }).toArray();

    return result[0] || {
      account_name: '',
      years: [],
      total_global: 0,
      year_range: { start: null, end: null }
    };
  }

  // Función helper que podemos reutilizar
  private getProcessorLinks(links: any[], processor: string, limit: number = 2) {
    return {
      $slice: [{
        $filter: {
          input: {
            $reduce: {
              input: '$all_links',
              initialValue: [],
              in: { $concatArrays: ['$$value', '$$this'] }
            }
          },
          as: 'link',
          cond: { $eq: ['$$link.payment_info.processor', processor] }
        }
      }, limit]
    };
  }

  // Agregar este nuevo método
  async getAccounts(uri: string, dbName: string) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    
    // Primero obtenemos los account_uid únicos (esto es muy rápido con índice)
    const uniqueAccounts = await db.collection('external_payments')
        .distinct('account_uid');

    // Luego obtenemos los nombres con una agregación simple
    const result = await db.collection('external_payments').aggregate([
      {
        $match: {
          account_uid: { $in: uniqueAccounts }
        }
      },
      {
        $group: {
          _id: '$account_uid',
          account_name: { $first: '$account_name' }
        }
      },
      {
        $project: {
          _id: 0,
          account_uid: '$_id',
          account_name: 1
        }
      },
      {
        $sort: { account_name: 1 }
      }
    ]).toArray();

    return {
      total: result.length,
      accounts: result
    };
  }
} 