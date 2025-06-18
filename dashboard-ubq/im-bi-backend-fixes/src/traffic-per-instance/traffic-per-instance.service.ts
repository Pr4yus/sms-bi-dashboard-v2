import { Injectable } from '@nestjs/common';
import { MongoService } from '../mongo/mongo.service';
import { ObjectId } from 'mongodb';

@Injectable()
export class TrafficPerInstanceService {
  constructor(private readonly mongoService: MongoService) {}

  async getDailyTrafficByAccount(
    uri: string,
    dbName: string,
    accountUid: string,
    startDate: string,
    endDate: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    const objectId = new ObjectId(accountUid);

    return db.collection('transactionspertype').aggregate([
      {
        $match: {
          account_uid: objectId,
          $expr: {
            $and: [
              { $gte: [{ $substr: ['$datetime', 0, 10] }, startDate] },
              { $lte: [{ $substr: ['$datetime', 0, 10] }, endDate] }
            ]
          }
        }
      },
      {
        $facet: {
          ok_docs: [
            {
              $match: { type: 'OK' }
            },
            {
              $group: {
                _id: { $substr: ['$datetime', 0, 10] },
                account_name: { $first: '$account_name' },
                total_ok: { $sum: { $toInt: '$total' } }
              }
            }
          ],
          error_docs: [
            {
              $match: { type: 'ERROR' }
            },
            {
              $unwind: '$error_details'
            },
            {
              $group: {
                _id: {
                  date: { $substr: ['$datetime', 0, 10] },
                  error_code: '$error_details.error_code',
                  error_description: '$error_details.error_description'
                },
                total: { $sum: { $toInt: '$error_details.total' } }
              }
            },
            {
              $group: {
                _id: '$_id.date',
                account_name: { $first: '$account_name' },
                total_errors: { $sum: '$total' },
                error_distribution: {
                  $push: {
                    error_code: '$_id.error_code',
                    error_description: '$_id.error_description',
                    total: '$total'
                  }
                }
              }
            }
          ]
        }
      },
      {
        $project: {
          dates: {
            $setUnion: [
              { $map: { input: '$ok_docs', as: 'ok', in: '$$ok._id' } },
              { $map: { input: '$error_docs', as: 'err', in: '$$err._id' } }
            ]
          },
          ok_docs: 1,
          error_docs: 1
        }
      },
      {
        $unwind: '$dates'
      },
      {
        $project: {
          date: '$dates',
          account_name: {
            $let: {
              vars: {
                ok_doc: {
                  $arrayElemAt: [
                    { $filter: { input: '$ok_docs', cond: { $eq: ['$$this._id', '$$ROOT.dates'] } } },
                    0
                  ]
                }
              },
              in: '$$ok_doc.account_name'
            }
          },
          total_ok: {
            $let: {
              vars: {
                ok_doc: {
                  $arrayElemAt: [
                    { $filter: { input: '$ok_docs', cond: { $eq: ['$$this._id', '$$ROOT.dates'] } } },
                    0
                  ]
                }
              },
              in: { $ifNull: ['$$ok_doc.total_ok', 0] }
            }
          },
          error_data: {
            $let: {
              vars: {
                error_doc: {
                  $arrayElemAt: [
                    { $filter: { input: '$error_docs', cond: { $eq: ['$$this._id', '$$ROOT.dates'] } } },
                    0
                  ]
                }
              },
              in: {
                total_errors: { $ifNull: ['$$error_doc.total_errors', 0] },
                error_distribution: { $ifNull: ['$$error_doc.error_distribution', []] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          total_errors: { $toInt: '$error_data.total_errors' },
          total: { $add: [{ $toInt: '$total_ok' }, { $toInt: '$error_data.total_errors' }] },
          error_distribution: {
            $map: {
              input: '$error_data.error_distribution',
              as: 'error',
              in: {
                error_code: '$$error.error_code',
                error_description: '$$error.error_description',
                total: { $toInt: '$$error.total' },
                percentage: {
                  $round: [{
                    $multiply: [
                      {
                        $cond: [
                          { $eq: [{ $toInt: '$error_data.total_errors' }, 0] },
                          0,
                          {
                            $divide: [
                              { $convert: { input: '$$error.total', to: 'double', onError: 0 } },
                              { $convert: { input: '$error_data.total_errors', to: 'double', onError: 1 } }
                            ]
                          }
                        ]
                      },
                      100
                    ]
                  }, 1]
                }
              }
            }
          }
        }
      },
      {
        $project: {
          date: 1,
          account_name: 1,
          total_ok: 1,
          total_errors: 1,
          total: 1,
          error_distribution: 1
        }
      },
      {
        $sort: { date: 1 }
      }
    ]).toArray();
  }

  async getMonthlyTrafficByAccount(
    uri: string,
    dbName: string,
    accountUid: string,
    startMonth: string,
    endMonth?: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    const objectId = new ObjectId(accountUid);
    const endMonthDate = endMonth || startMonth;

    return db.collection('transactionspertype').aggregate([
      {
        $match: {
          account_uid: objectId,
          $expr: {
            $and: [
              {
                $gte: [
                  { $substr: ['$datetime', 0, 7] },
                  startMonth
                ]
              },
              {
                $lte: [
                  { $substr: ['$datetime', 0, 7] },
                  endMonthDate
                ]
              }
            ]
          }
        }
      },
      {
        $facet: {
          ok_docs: [
            {
              $match: { type: 'OK' }
            },
            {
              $group: {
                _id: {
                  month: { $substr: ['$datetime', 0, 7] },
                  client_id: '$client_id',
                  account_uid: '$account_uid',
                  account_name: '$account_name'
                },
                total_ok: { $sum: '$total' }
              }
            }
          ],
          error_docs: [
            {
              $match: { type: 'ERROR' }
            },
            {
              $unwind: '$error_details'
            },
            {
              $group: {
                _id: {
                  month: { $substr: ['$datetime', 0, 7] },
                  client_id: '$client_id',
                  error_code: '$error_details.error_code',
                  error_description: '$error_details.error_description'
                },
                total: { $sum: '$error_details.total' }
              }
            },
            {
              $group: {
                _id: {
                  month: '$_id.month',
                  client_id: '$_id.client_id'
                },
                total_errors: { $sum: '$total' },
                error_distribution: {
                  $push: {
                    error_code: '$_id.error_code',
                    error_description: '$_id.error_description',
                    total: '$total'
                  }
                }
              }
            }
          ]
        }
      },
      {
        $project: {
          combined: {
            $setUnion: [
              { $map: { input: '$ok_docs', as: 'ok', in: { month: '$$ok._id.month', client_id: '$$ok._id.client_id' } } },
              { $map: { input: '$error_docs', as: 'err', in: { month: '$$err._id.month', client_id: '$$err._id.client_id' } } }
            ]
          },
          ok_docs: 1,
          error_docs: 1
        }
      },
      {
        $unwind: '$combined'
      },
      {
        $project: {
          month: '$combined.month',
          client_id: '$combined.client_id',
          accounts: {
            $map: {
              input: {
                $filter: {
                  input: '$ok_docs',
                  as: 'ok',
                  cond: {
                    $and: [
                      { $eq: ['$$ok._id.month', '$combined.month'] },
                      { $eq: ['$$ok._id.client_id', '$combined.client_id'] }
                    ]
                  }
                }
              },
              as: 'account',
              in: {
                account_name: '$$account._id.account_name',
                account_uid: '$$account._id.account_uid',
                total_ok: '$$account.total_ok',
                total_errors: {
                  $let: {
                    vars: {
                      error_doc: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: '$error_docs',
                              as: 'err',
                              cond: {
                                $and: [
                                  { $eq: ['$$err._id.month', '$combined.month'] },
                                  { $eq: ['$$err._id.client_id', '$combined.client_id'] }
                                ]
                              }
                            }
                          },
                          0
                        ]
                      }
                    },
                    in: { $ifNull: ['$$error_doc.total_errors', 0] }
                  }
                }
              }
            }
          },
          total_ok: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$ok_docs',
                    as: 'ok',
                    cond: {
                      $and: [
                        { $eq: ['$$ok._id.month', '$combined.month'] },
                        { $eq: ['$$ok._id.client_id', '$combined.client_id'] }
                      ]
                    }
                  }
                },
                as: 'account',
                in: '$$account.total_ok'
              }
            }
          },
          error_data: {
            $let: {
              vars: {
                error_doc: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$error_docs',
                        as: 'err',
                        cond: {
                          $and: [
                            { $eq: ['$$err._id.month', '$combined.month'] },
                            { $eq: ['$$err._id.client_id', '$combined.client_id'] }
                          ]
                        }
                      }
                    },
                    0
                  ]
                }
              },
              in: {
                total_errors: { $ifNull: ['$$error_doc.total_errors', 0] },
                error_distribution: { $ifNull: ['$$error_doc.error_distribution', []] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          total_errors: { $toInt: '$error_data.total_errors' },
          total: { $add: [{ $toInt: '$total_ok' }, { $toInt: '$error_data.total_errors' }] },
          error_distribution: {
            $map: {
              input: '$error_data.error_distribution',
              as: 'error',
              in: {
                error_code: '$$error.error_code',
                error_description: '$$error.error_description',
                total: { $toInt: '$$error.total' },
                percentage: {
                  $round: [{
                    $multiply: [
                      {
                        $cond: [
                          { $eq: [{ $toInt: '$error_data.total_errors' }, 0] },
                          0,
                          {
                            $divide: [
                              { $convert: { input: '$$error.total', to: 'double', onError: 0 } },
                              { $convert: { input: '$error_data.total_errors', to: 'double', onError: 1 } }
                            ]
                          }
                        ]
                      },
                      100
                    ]
                  }, 1]
                }
              }
            }
          }
        }
      },
      {
        $project: {
          month: 1,
          client_id: 1,
          total_ok: 1,
          total_errors: 1,
          total: 1,
          accounts: 1,
          error_distribution: 1
        }
      },
      {
        $sort: { month: 1, client_id: 1 }
      }
    ]).toArray();
  }

  async getYearlyTrafficByAccount(
    uri: string,
    dbName: string,
    accountUid: string,
    startYear: number,
    endYear?: number,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    const objectId = new ObjectId(accountUid);
    const endYearValue = endYear || startYear;

    return db.collection('transactionspertype').aggregate([
      {
        $match: {
          account_uid: objectId,
          $expr: {
            $and: [
              {
                $gte: [
                  { $toInt: { $substr: ['$datetime', 0, 4] } },
                  startYear
                ]
              },
              {
                $lte: [
                  { $toInt: { $substr: ['$datetime', 0, 4] } },
                  endYearValue
                ]
              }
            ]
          }
        }
      },
      {
        $facet: {
          ok_docs: [
            {
              $match: { type: 'OK' }
            },
            {
              $group: {
                _id: { $toInt: { $substr: ['$datetime', 0, 4] } },
                account_name: { $first: '$account_name' },
                total_ok: { $sum: { $toInt: '$total' } }
              }
            }
          ],
          error_docs: [
            {
              $match: { type: 'ERROR' }
            },
            {
              $unwind: '$error_details'
            },
            {
              $group: {
                _id: {
                  year: { $toInt: { $substr: ['$datetime', 0, 4] } },
                  error_code: '$error_details.error_code',
                  error_description: '$error_details.error_description'
                },
                total: { $sum: { $toInt: '$error_details.total' } }
              }
            },
            {
              $group: {
                _id: '$_id.year',
                total_errors: { $sum: '$total' },
                error_distribution: {
                  $push: {
                    error_code: '$_id.error_code',
                    error_description: '$_id.error_description',
                    total: { $toInt: '$total' }
                  }
                }
              }
            }
          ]
        }
      },
      {
        $project: {
          years: {
            $setUnion: [
              { $map: { input: '$ok_docs', as: 'ok', in: '$$ok._id' } },
              { $map: { input: '$error_docs', as: 'err', in: '$$err._id' } }
            ]
          },
          ok_docs: 1,
          error_docs: 1
        }
      },
      {
        $unwind: '$years'
      },
      {
        $project: {
          year: '$years',
          account_name: {
            $let: {
              vars: {
                ok_doc: {
                  $arrayElemAt: [
                    { $filter: { input: '$ok_docs', cond: { $eq: ['$$this._id', '$$ROOT.years'] } } },
                    0
                  ]
                }
              },
              in: '$$ok_doc.account_name'
            }
          },
          total_ok: {
            $let: {
              vars: {
                ok_doc: {
                  $arrayElemAt: [
                    { $filter: { input: '$ok_docs', cond: { $eq: ['$$this._id', '$$ROOT.years'] } } },
                    0
                  ]
                }
              },
              in: { $ifNull: ['$$ok_doc.total_ok', 0] }
            }
          },
          error_data: {
            $let: {
              vars: {
                error_doc: {
                  $arrayElemAt: [
                    { $filter: { input: '$error_docs', cond: { $eq: ['$$this._id', '$$ROOT.years'] } } },
                    0
                  ]
                }
              },
              in: {
                total_errors: { $ifNull: ['$$error_doc.total_errors', 0] },
                error_distribution: { $ifNull: ['$$error_doc.error_distribution', []] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          total_errors: { $toInt: '$error_data.total_errors' },
          total: { $add: [{ $toInt: '$total_ok' }, { $toInt: '$error_data.total_errors' }] },
          error_distribution: {
            $map: {
              input: '$error_data.error_distribution',
              as: 'error',
              in: {
                error_code: '$$error.error_code',
                error_description: '$$error.error_description',
                total: { $toInt: '$$error.total' },
                percentage: {
                  $round: [{
                    $multiply: [
                      {
                        $cond: [
                          { $eq: [{ $toInt: '$error_data.total_errors' }, 0] },
                          0,
                          {
                            $divide: [
                              { $convert: { input: '$$error.total', to: 'double', onError: 0 } },
                              { $convert: { input: '$error_data.total_errors', to: 'double', onError: 1 } }
                            ]
                          }
                        ]
                      },
                      100
                    ]
                  }, 1]
                }
              }
            }
          }
        }
      },
      {
        $project: {
          year: 1,
          account_name: 1,
          total_ok: 1,
          total_errors: 1,
          total: 1,
          error_distribution: 1
        }
      },
      {
        $sort: { year: 1 }
      }
    ]).toArray();
  }

  async getMonthlyTraffic(
    uri: string,
    dbName: string,
    startMonth: string,
    endMonth?: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    const endMonthDate = endMonth || startMonth;

    return db.collection('transactionspertype').aggregate([
      {
        $match: {
          $expr: {
            $and: [
              {
                $gte: [
                  { $substr: ['$datetime', 0, 7] },
                  startMonth
                ]
              },
              {
                $lte: [
                  { $substr: ['$datetime', 0, 7] },
                  endMonthDate
                ]
              }
            ]
          }
        }
      },
      {
        $facet: {
          ok_docs: [
            {
              $match: { type: 'OK' }
            },
            {
              $group: {
                _id: { $substr: ['$datetime', 0, 7] },
                total_ok: { $sum: '$total' }
              }
            }
          ],
          error_docs: [
            {
              $match: { type: 'ERROR' }
            },
            {
              $unwind: '$error_details'
            },
            {
              $group: {
                _id: {
                  month: { $substr: ['$datetime', 0, 7] },
                  error_code: '$error_details.error_code',
                  error_description: '$error_details.error_description'
                },
                total: { $sum: '$error_details.total' }
              }
            },
            {
              $group: {
                _id: '$_id.month',
                total_errors: { $sum: '$total' },
                error_distribution: {
                  $push: {
                    error_code: '$_id.error_code',
                    error_description: '$_id.error_description',
                    total: '$total'
                  }
                }
              }
            }
          ]
        }
      },
      {
        $project: {
          months: {
            $setUnion: [
              { $map: { input: '$ok_docs', as: 'ok', in: '$$ok._id' } },
              { $map: { input: '$error_docs', as: 'err', in: '$$err._id' } }
            ]
          },
          ok_docs: 1,
          error_docs: 1
        }
      },
      {
        $unwind: '$months'
      },
      {
        $project: {
          month: '$months',
          total_ok: {
            $let: {
              vars: {
                ok_doc: {
                  $arrayElemAt: [
                    { $filter: { input: '$ok_docs', cond: { $eq: ['$$this._id', '$$ROOT.months'] } } },
                    0
                  ]
                }
              },
              in: { $ifNull: ['$$ok_doc.total_ok', 0] }
            }
          },
          error_data: {
            $let: {
              vars: {
                error_doc: {
                  $arrayElemAt: [
                    { $filter: { input: '$error_docs', cond: { $eq: ['$$this._id', '$$ROOT.months'] } } },
                    0
                  ]
                }
              },
              in: {
                total_errors: { $ifNull: ['$$error_doc.total_errors', 0] },
                error_distribution: { $ifNull: ['$$error_doc.error_distribution', []] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          total_errors: { $toInt: '$error_data.total_errors' },
          total: { $add: [{ $toInt: '$total_ok' }, { $toInt: '$error_data.total_errors' }] },
          error_distribution: {
            $map: {
              input: '$error_data.error_distribution',
              as: 'error',
              in: {
                error_code: '$$error.error_code',
                error_description: '$$error.error_description',
                total: { $toInt: '$$error.total' },
                percentage: {
                  $round: [{
                    $multiply: [
                      {
                        $cond: [
                          { $eq: [{ $toInt: '$error_data.total_errors' }, 0] },
                          0,
                          {
                            $divide: [
                              { $convert: { input: '$$error.total', to: 'double', onError: 0 } },
                              { $convert: { input: '$error_data.total_errors', to: 'double', onError: 1 } }
                            ]
                          }
                        ]
                      },
                      100
                    ]
                  }, 1]
                }
              }
            }
          }
        }
      },
      {
        $project: {
          month: 1,
          total_ok: 1,
          total_errors: 1,
          total: 1,
          error_distribution: 1
        }
      },
      {
        $sort: { month: 1 }
      }
    ]).toArray();
  }

  async getDailyTraffic(
    uri: string,
    dbName: string,
    startDate: string,
    endDate: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);

    return db.collection('transactionspertype').aggregate([
      {
        $match: {
          $expr: {
            $and: [
              {
                $gte: [
                  { $substr: ['$datetime', 0, 10] },
                  startDate
                ]
              },
              {
                $lte: [
                  { $substr: ['$datetime', 0, 10] },
                  endDate
                ]
              }
            ]
          }
        }
      },
      {
        $facet: {
          ok_docs: [
            {
              $match: { type: 'OK' }
            },
            {
              $group: {
                _id: { $substr: ['$datetime', 0, 10] },
                total_ok: { $sum: { $toInt: '$total' } }
              }
            }
          ],
          error_docs: [
            {
              $match: { type: 'ERROR' }
            },
            {
              $unwind: '$error_details'
            },
            {
              $group: {
                _id: {
                  date: { $substr: ['$datetime', 0, 10] },
                  error_code: '$error_details.error_code',
                  error_description: '$error_details.error_description'
                },
                total: { $sum: { $toInt: '$error_details.total' } }
              }
            },
            {
              $group: {
                _id: '$_id.date',
                total_errors: { $sum: '$total' },
                error_distribution: {
                  $push: {
                    error_code: '$_id.error_code',
                    error_description: '$_id.error_description',
                    total: '$total'
                  }
                }
              }
            }
          ]
        }
      },
      {
        $project: {
          dates: {
            $setUnion: [
              { $map: { input: '$ok_docs', as: 'ok', in: '$$ok._id' } },
              { $map: { input: '$error_docs', as: 'err', in: '$$err._id' } }
            ]
          },
          ok_docs: 1,
          error_docs: 1
        }
      },
      {
        $unwind: '$dates'
      },
      {
        $project: {
          date: '$dates',
          total_ok: {
            $let: {
              vars: {
                ok_doc: {
                  $arrayElemAt: [
                    { $filter: { input: '$ok_docs', cond: { $eq: ['$$this._id', '$$ROOT.dates'] } } },
                    0
                  ]
                }
              },
              in: { $ifNull: ['$$ok_doc.total_ok', 0] }
            }
          },
          error_data: {
            $let: {
              vars: {
                error_doc: {
                  $arrayElemAt: [
                    { $filter: { input: '$error_docs', cond: { $eq: ['$$this._id', '$$ROOT.dates'] } } },
                    0
                  ]
                }
              },
              in: {
                total_errors: { $ifNull: ['$$error_doc.total_errors', 0] },
                error_distribution: { $ifNull: ['$$error_doc.error_distribution', []] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          total_errors: { $toInt: '$error_data.total_errors' },
          total: { $add: [{ $toInt: '$total_ok' }, { $toInt: '$error_data.total_errors' }] },
          error_distribution: {
            $map: {
              input: '$error_data.error_distribution',
              as: 'error',
              in: {
                error_code: '$$error.error_code',
                error_description: '$$error.error_description',
                total: { $toInt: '$$error.total' },
                percentage: {
                  $round: [{
                    $multiply: [
                      {
                        $cond: [
                          { $eq: [{ $toInt: '$error_data.total_errors' }, 0] },
                          0,
                          {
                            $divide: [
                              { $convert: { input: '$$error.total', to: 'double', onError: 0 } },
                              { $convert: { input: '$error_data.total_errors', to: 'double', onError: 1 } }
                            ]
                          }
                        ]
                      },
                      100
                    ]
                  }, 1]
                }
              }
            }
          }
        }
      },
      {
        $project: {
          date: 1,
          total_ok: 1,
          total_errors: 1,
          total: 1,
          error_distribution: 1
        }
      },
      {
        $sort: { date: 1 }
      }
    ]).toArray();
  }

  async getYearlyTraffic(
    uri: string,
    dbName: string,
    startYear: number,
    endYear?: number,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    const endYearValue = endYear || startYear;

    return db.collection('transactionspertype').aggregate([
      {
        $match: {
          $expr: {
            $and: [
              {
                $gte: [
                  { $toInt: { $substr: ['$datetime', 0, 4] } },
                  startYear
                ]
              },
              {
                $lte: [
                  { $toInt: { $substr: ['$datetime', 0, 4] } },
                  endYearValue
                ]
              }
            ]
          }
        }
      },
      {
        $facet: {
          ok_docs: [
            {
              $match: { type: 'OK' }
            },
            {
              $group: {
                _id: { $toInt: { $substr: ['$datetime', 0, 4] } },
                total_ok: { $sum: { $toInt: '$total' } }
              }
            }
          ],
          error_docs: [
            {
              $match: { type: 'ERROR' }
            },
            {
              $unwind: '$error_details'
            },
            {
              $group: {
                _id: {
                  year: { $toInt: { $substr: ['$datetime', 0, 4] } },
                  error_code: '$error_details.error_code',
                  error_description: '$error_details.error_description'
                },
                total: { $sum: { $toInt: '$error_details.total' } }
              }
            },
            {
              $group: {
                _id: '$_id.year',
                total_errors: { $sum: '$total' },
                error_distribution: {
                  $push: {
                    error_code: '$_id.error_code',
                    error_description: '$_id.error_description',
                    total: { $toInt: '$total' }
                  }
                }
              }
            }
          ]
        }
      },
      {
        $project: {
          years: {
            $setUnion: [
              { $map: { input: '$ok_docs', as: 'ok', in: '$$ok._id' } },
              { $map: { input: '$error_docs', as: 'err', in: '$$err._id' } }
            ]
          },
          ok_docs: 1,
          error_docs: 1
        }
      },
      {
        $unwind: '$years'
      },
      {
        $project: {
          year: '$years',
          total_ok: {
            $let: {
              vars: {
                ok_doc: {
                  $arrayElemAt: [
                    { $filter: { input: '$ok_docs', cond: { $eq: ['$$this._id', '$$ROOT.years'] } } },
                    0
                  ]
                }
              },
              in: { $ifNull: ['$$ok_doc.total_ok', 0] }
            }
          },
          error_data: {
            $let: {
              vars: {
                error_doc: {
                  $arrayElemAt: [
                    { $filter: { input: '$error_docs', cond: { $eq: ['$$this._id', '$$ROOT.years'] } } },
                    0
                  ]
                }
              },
              in: {
                total_errors: { $ifNull: ['$$error_doc.total_errors', 0] },
                error_distribution: { $ifNull: ['$$error_doc.error_distribution', []] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          total_errors: { $toInt: '$error_data.total_errors' },
          total: { $add: [{ $toInt: '$total_ok' }, { $toInt: '$error_data.total_errors' }] },
          error_distribution: {
            $map: {
              input: '$error_data.error_distribution',
              as: 'error',
              in: {
                error_code: '$$error.error_code',
                error_description: '$$error.error_description',
                total: { $toInt: '$$error.total' },
                percentage: {
                  $round: [{
                    $multiply: [
                      {
                        $cond: [
                          { $eq: [{ $toInt: '$error_data.total_errors' }, 0] },
                          0,
                          {
                            $divide: [
                              { $convert: { input: '$$error.total', to: 'double', onError: 0 } },
                              { $convert: { input: '$error_data.total_errors', to: 'double', onError: 1 } }
                            ]
                          }
                        ]
                      },
                      100
                    ]
                  }, 1]
                }
              }
            }
          }
        }
      },
      {
        $project: {
          year: 1,
          total_ok: 1,
          total_errors: 1,
          total: 1,
          error_distribution: 1
        }
      },
      {
        $sort: { year: 1 }
      }
    ]).toArray();
  }

  async getDailyTrafficByClient(
    uri: string,
    dbName: string,
    clientId: string,
    startDate: string,
    endDate: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    return db.collection('transactionspertype').aggregate([
      {
        $match: {
          client_id: clientId,
          $expr: {
            $and: [
              { $gte: [{ $substr: ['$datetime', 0, 10] }, startDate] },
              { $lte: [{ $substr: ['$datetime', 0, 10] }, endDate] }
            ]
          }
        }
      },
      {
        $facet: {
          ok_docs: [
            { $match: { type: 'OK' } },
            {
              $group: {
                _id: {
                  date: { $substr: ['$datetime', 0, 10] },
                  account_uid: '$account_uid',
                  account_name: '$account_name'
                },
                total_ok: { $sum: { $toInt: '$total' } }
              }
            }
          ],
          error_docs: [
            { $match: { type: 'ERROR' } },
            { $unwind: '$error_details' },
            {
              $group: {
                _id: {
                  date: { $substr: ['$datetime', 0, 10] },
                  error_code: '$error_details.error_code',
                  error_description: '$error_details.error_description'
                },
                total: { $sum: { $toInt: '$error_details.total' } }
              }
            },
            {
              $group: {
                _id: '$_id.date',
                total_errors: { $sum: '$total' },
                error_distribution: {
                  $push: {
                    error_code: '$_id.error_code',
                    error_description: '$_id.error_description',
                    total: '$total'
                  }
                }
              }
            }
          ],
          account_errors: [
            { $match: { type: 'ERROR' } },
            {
              $group: {
                _id: {
                  date: { $substr: ['$datetime', 0, 10] },
                  account_uid: '$account_uid',
                  account_name: '$account_name'
                },
                total_errors: { $sum: { $toInt: '$total_errors' } }
              }
            }
          ]
        }
      },
      {
        $project: {
          dates: {
            $setUnion: [
              { $map: { input: '$ok_docs', as: 'ok', in: '$$ok._id.date' } },
              { $map: { input: '$error_docs', as: 'err', in: '$$err._id' } }
            ]
          },
          ok_docs: 1,
          error_docs: 1,
          account_errors: 1
        }
      },
      { $unwind: '$dates' },
      {
        $project: {
          date: '$dates',
          accounts: {
            $map: {
              input: {
                $setUnion: [
                  { $map: { input: '$ok_docs', as: 'ok', in: '$$ok._id.account_uid' } },
                  { $map: { input: '$account_errors', as: 'err', in: '$$err._id.account_uid' } }
                ]
              },
              as: 'account_uid',
              in: {
                account_uid: '$$account_uid',
                account_name: {
                  $let: {
                    vars: {
                      doc: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: { $concatArrays: ['$ok_docs', '$account_errors'] },
                              cond: { $eq: ['$$this._id.account_uid', '$$account_uid'] }
                            }
                          },
                          0
                        ]
                      }
                    },
                    in: '$$doc._id.account_name'
                  }
                },
                total_ok: {
                  $let: {
                    vars: {
                      ok_doc: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: '$ok_docs',
                              cond: {
                                $and: [
                                  { $eq: ['$$this._id.account_uid', '$$account_uid'] },
                                  { $eq: ['$$this._id.date', '$$ROOT.dates'] }
                                ]
                              }
                            }
                          },
                          0
                        ]
                      }
                    },
                    in: { $ifNull: ['$$ok_doc.total_ok', 0] }
                  }
                },
                total_errors: {
                  $let: {
                    vars: {
                      error_doc: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: '$account_errors',
                              cond: {
                                $and: [
                                  { $eq: ['$$this._id.account_uid', '$$account_uid'] },
                                  { $eq: ['$$this._id.date', '$$ROOT.dates'] }
                                ]
                              }
                            }
                          },
                          0
                        ]
                      }
                    },
                    in: { $ifNull: ['$$error_doc.total_errors', 0] }
                  }
                }
              }
            }
          },
          error_data: {
            $let: {
              vars: {
                error_doc: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$error_docs',
                        cond: { $eq: ['$$this._id', '$$ROOT.dates'] }
                      }
                    },
                    0
                  ]
                }
              },
              in: {
                total_errors: { $ifNull: ['$$error_doc.total_errors', 0] },
                error_distribution: { $ifNull: ['$$error_doc.error_distribution', []] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          client_totals: {
            total_ok: { $sum: '$accounts.total_ok' },
            total_errors: '$error_data.total_errors',
            total: { $add: [{ $sum: '$accounts.total_ok' }, '$error_data.total_errors'] }
          },
          accounts: {
            $filter: {
              input: {
                $map: {
                  input: '$accounts',
                  as: 'account',
                  in: {
                    account_uid: '$$account.account_uid',
                    account_name: '$$account.account_name',
                    total_ok: '$$account.total_ok',
                    total_errors: '$$account.total_errors',
                    total: { $add: ['$$account.total_ok', '$$account.total_errors'] }
                  }
                }
              },
              as: 'account',
              cond: { $gt: ['$$account.total', 0] }
            }
          },
          error_distribution: {
            $map: {
              input: '$error_data.error_distribution',
              as: 'error',
              in: {
                error_code: '$$error.error_code',
                error_description: '$$error.error_description',
                total: { $toInt: '$$error.total' },
                percentage: {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: [
                            { $toDouble: '$$error.total' },
                            { $max: [{ $toDouble: '$error_data.total_errors' }, 1] }
                          ]
                        },
                        100
                      ]
                    },
                    1
                  ]
                }
              }
            }
          }
        }
      },
      {
        $project: {
          date: 1,
          client_totals: 1,
          accounts: 1,
          error_distribution: 1
        }
      },
      { $sort: { date: 1 } }
    ]).toArray();
  }

  async getMonthlyTrafficByClient(
    uri: string,
    dbName: string,
    clientId: string,
    startMonth: string,
    endMonth?: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    const endMonthDate = endMonth || startMonth;
    return db.collection('transactionspertype').aggregate([
      {
        $match: {
          client_id: clientId,
          $expr: {
            $and: [
              { $gte: [{ $substr: ['$datetime', 0, 7] }, startMonth] },
              { $lte: [{ $substr: ['$datetime', 0, 7] }, endMonthDate] }
            ]
          }
        }
      },
      {
        $facet: {
          ok_docs: [
            { $match: { type: 'OK' } },
            {
              $group: {
                _id: {
                  date: { $substr: ['$datetime', 0, 7] },
                  account_uid: '$account_uid',
                  account_name: '$account_name'
                },
                total_ok: { $sum: { $toInt: '$total' } }
              }
            }
          ],
          error_docs: [
            { $match: { type: 'ERROR' } },
            { $unwind: '$error_details' },
            {
              $group: {
                _id: {
                  date: { $substr: ['$datetime', 0, 7] },
                  error_code: '$error_details.error_code',
                  error_description: '$error_details.error_description'
                },
                total: { $sum: { $toInt: '$error_details.total' } }
              }
            },
            {
              $group: {
                _id: '$_id.date',
                total_errors: { $sum: '$total' },
                error_distribution: {
                  $push: {
                    error_code: '$_id.error_code',
                    error_description: '$_id.error_description',
                    total: '$total'
                  }
                }
              }
            }
          ],
          account_errors: [
            { $match: { type: 'ERROR' } },
            { $unwind: '$error_details' },
            {
              $group: {
                _id: {
                  date: { $substr: ['$datetime', 0, 7] },
                  account_uid: '$account_uid',
                  account_name: '$account_name'
                },
                total_errors: { $sum: { $toInt: '$error_details.total' } }
              }
            }
          ]
        }
      },
      {
        $project: {
          dates: {
            $setUnion: [
              { $map: { input: '$ok_docs', as: 'ok', in: '$$ok._id.date' } },
              { $map: { input: '$error_docs', as: 'err', in: '$$err._id' } }
            ]
          },
          ok_docs: 1,
          error_docs: 1,
          account_errors: 1
        }
      },
      { $unwind: '$dates' },
      {
        $project: {
          date: '$dates',
          accounts: {
            $map: {
              input: {
                $setUnion: [
                  { $map: { input: '$ok_docs', as: 'ok', in: '$$ok._id.account_uid' } },
                  { $map: { input: '$account_errors', as: 'err', in: '$$err._id.account_uid' } }
                ]
              },
              as: 'account_uid',
              in: {
                account_uid: '$$account_uid',
                account_name: {
                  $let: {
                    vars: {
                      doc: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: { $concatArrays: ['$ok_docs', '$account_errors'] },
                              cond: { $eq: ['$$this._id.account_uid', '$$account_uid'] }
                            }
                          },
                          0
                        ]
                      }
                    },
                    in: '$$doc._id.account_name'
                  }
                },
                total_ok: {
                  $let: {
                    vars: {
                      ok_doc: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: '$ok_docs',
                              cond: {
                                $and: [
                                  { $eq: ['$$this._id.account_uid', '$$account_uid'] },
                                  { $eq: ['$$this._id.date', '$$ROOT.dates'] }
                                ]
                              }
                            }
                          },
                          0
                        ]
                      }
                    },
                    in: { $ifNull: ['$$ok_doc.total_ok', 0] }
                  }
                },
                total_errors: {
                  $let: {
                    vars: {
                      error_doc: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: '$account_errors',
                              cond: {
                                $and: [
                                  { $eq: ['$$this._id.account_uid', '$$account_uid'] },
                                  { $eq: ['$$this._id.date', '$$ROOT.dates'] }
                                ]
                              }
                            }
                          },
                          0
                        ]
                      }
                    },
                    in: { $ifNull: ['$$error_doc.total_errors', 0] }
                  }
                }
              }
            }
          },
          error_data: {
            $let: {
              vars: {
                error_doc: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$error_docs',
                        cond: { $eq: ['$$this._id', '$$ROOT.dates'] }
                      }
                    },
                    0
                  ]
                }
              },
              in: {
                total_errors: { $ifNull: ['$$error_doc.total_errors', 0] },
                error_distribution: { $ifNull: ['$$error_doc.error_distribution', []] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          client_totals: {
            total_ok: { $sum: '$accounts.total_ok' },
            total_errors: '$error_data.total_errors',
            total: { $add: [{ $sum: '$accounts.total_ok' }, '$error_data.total_errors'] }
          },
          accounts: {
            $filter: {
              input: {
                $map: {
                  input: '$accounts',
                  as: 'account',
                  in: {
                    account_uid: '$$account.account_uid',
                    account_name: '$$account.account_name',
                    total_ok: '$$account.total_ok',
                    total_errors: '$$account.total_errors',
                    total: { $add: ['$$account.total_ok', '$$account.total_errors'] }
                  }
                }
              },
              as: 'account',
              cond: { $gt: ['$$account.total', 0] }
            }
          },
          error_distribution: {
            $cond: {
              if: { $eq: ['$error_data.error_distribution', []] },
              then: [],
              else: {
                $map: {
                  input: '$error_data.error_distribution',
                  as: 'error',
                  in: {
                    error_code: '$$error.error_code',
                    error_description: '$$error.error_description',
                    total: { $toInt: '$$error.total' },
                    percentage: {
                      $round: [
                        {
                          $multiply: [
                            {
                              $divide: [
                                { $toDouble: '$$error.total' },
                                { $max: [{ $toDouble: '$error_data.total_errors' }, 1] }
                              ]
                            },
                            100
                          ]
                        },
                        1
                      ]
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        $project: {
          date: 1,
          client_totals: 1,
          accounts: 1,
          error_distribution: 1
        }
      },
      { $sort: { date: 1 } }
    ]).toArray();
  }

  async getYearlyTrafficByClient(
    uri: string,
    dbName: string,
    clientId: string,
    startYear: number,
    endYear?: number,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    const endYearValue = endYear || startYear;
    return db.collection('transactionspertype').aggregate([
      {
        $match: {
          client_id: clientId,
          $expr: {
            $and: [
              { $gte: [{ $toInt: { $substr: ['$datetime', 0, 4] } }, startYear] },
              { $lte: [{ $toInt: { $substr: ['$datetime', 0, 4] } }, endYearValue] }
            ]
          }
        }
      },
      {
        $facet: {
          ok_docs: [
            { $match: { type: 'OK' } },
            {
              $group: {
                _id: {
                  date: { $toInt: { $substr: ['$datetime', 0, 4] } },
                  account_uid: '$account_uid',
                  account_name: '$account_name'
                },
                total_ok: { $sum: { $toInt: '$total' } }
              }
            }
          ],
          error_docs: [
            { $match: { type: 'ERROR' } },
            { $unwind: '$error_details' },
            {
              $group: {
                _id: {
                  date: { $toInt: { $substr: ['$datetime', 0, 4] } },
                  error_code: '$error_details.error_code',
                  error_description: '$error_details.error_description'
                },
                total: { $sum: { $toInt: '$error_details.total' } }
              }
            },
            {
              $group: {
                _id: '$_id.date',
                total_errors: { $sum: '$total' },
                error_distribution: {
                  $push: {
                    error_code: '$_id.error_code',
                    error_description: '$_id.error_description',
                    total: '$total'
                  }
                }
              }
            }
          ],
          account_errors: [
            { $match: { type: 'ERROR' } },
            {
              $group: {
                _id: {
                  date: { $toInt: { $substr: ['$datetime', 0, 4] } },
                  account_uid: '$account_uid',
                  account_name: '$account_name'
                },
                total_errors: { $sum: { $toInt: '$total_errors' } }
              }
            }
          ]
        }
      },
      {
        $project: {
          dates: {
            $setUnion: [
              { $map: { input: '$ok_docs', as: 'ok', in: '$$ok._id.date' } },
              { $map: { input: '$error_docs', as: 'err', in: '$$err._id' } }
            ]
          },
          ok_docs: 1,
          error_docs: 1,
          account_errors: 1
        }
      },
      { $unwind: '$dates' },
      {
        $project: {
          date: '$dates',
          accounts: {
            $map: {
              input: {
                $setUnion: [
                  { $map: { input: '$ok_docs', as: 'ok', in: '$$ok._id.account_uid' } },
                  { $map: { input: '$account_errors', as: 'err', in: '$$err._id.account_uid' } }
                ]
              },
              as: 'account_uid',
              in: {
                account_uid: '$$account_uid',
                account_name: {
                  $let: {
                    vars: {
                      doc: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: { $concatArrays: ['$ok_docs', '$account_errors'] },
                              cond: { $eq: ['$$this._id.account_uid', '$$account_uid'] }
                            }
                          },
                          0
                        ]
                      }
                    },
                    in: '$$doc._id.account_name'
                  }
                },
                total_ok: {
                  $let: {
                    vars: {
                      ok_doc: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: '$ok_docs',
                              cond: {
                                $and: [
                                  { $eq: ['$$this._id.account_uid', '$$account_uid'] },
                                  { $eq: ['$$this._id.date', '$$ROOT.dates'] }
                                ]
                              }
                            }
                          },
                          0
                        ]
                      }
                    },
                    in: { $ifNull: ['$$ok_doc.total_ok', 0] }
                  }
                },
                total_errors: {
                  $let: {
                    vars: {
                      error_doc: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: '$account_errors',
                              cond: {
                                $and: [
                                  { $eq: ['$$this._id.account_uid', '$$account_uid'] },
                                  { $eq: ['$$this._id.date', '$$ROOT.dates'] }
                                ]
                              }
                            }
                          },
                          0
                        ]
                      }
                    },
                    in: { $ifNull: ['$$error_doc.total_errors', 0] }
                  }
                }
              }
            }
          },
          error_data: {
            $let: {
              vars: {
                error_doc: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$error_docs',
                        cond: { $eq: ['$$this._id', '$$ROOT.dates'] }
                      }
                    },
                    0
                  ]
                }
              },
              in: {
                total_errors: { $ifNull: ['$$error_doc.total_errors', 0] },
                error_distribution: { $ifNull: ['$$error_doc.error_distribution', []] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          client_totals: {
            total_ok: { $sum: '$accounts.total_ok' },
            total_errors: { $sum: '$accounts.total_errors' },
            total: { $add: [{ $sum: '$accounts.total_ok' }, { $sum: '$accounts.total_errors' }] }
          },
          accounts: {
            $filter: {
              input: {
                $map: {
                  input: '$accounts',
                  as: 'account',
                  in: {
                    account_uid: '$$account.account_uid',
                    account_name: '$$account.account_name',
                    total_ok: '$$account.total_ok',
                    total_errors: '$$account.total_errors',
                    total: { $add: ['$$account.total_ok', '$$account.total_errors'] }
                  }
                }
              },
              as: 'account',
              cond: { $gt: ['$$account.total', 0] }
            }
          },
          error_distribution: {
            $cond: {
              if: { $eq: ['$error_data.error_distribution', []] },
              then: [],
              else: {
                $map: {
                  input: '$error_data.error_distribution',
                  as: 'error',
                  in: {
                    error_code: '$$error.error_code',
                    error_description: '$$error.error_description',
                    total: { $toInt: '$$error.total' },
                    percentage: {
                      $round: [
                        {
                          $multiply: [
                            {
                              $divide: [
                                { $toDouble: '$$error.total' },
                                { $max: [{ $toDouble: '$error_data.total_errors' }, 1] }
                              ]
                            },
                            100
                          ]
                        },
                        1
                      ]
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        $project: {
          date: 1,
          client_totals: 1,
          accounts: 1,
          error_distribution: 1
        }
      },
      { $sort: { date: 1 } }
    ]).toArray();
  }

  async getAllAccounts(
    uri: string,
    dbName: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);

    return db.collection('transactionspertype').aggregate([
      {
        $group: {
          _id: '$account_uid',
          account_name: { $first: '$account_name' }
        }
      },
      {
        $project: {
          _id: 0,
          account_uid: { $toString: '$_id' },
          account_name: 1
        }
      },
      {
        $sort: { account_name: 1 }
      }
    ]).toArray();
  }

  async getAllClients(
    uri: string,
    dbName: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);

    return db.collection('transactionspertype').aggregate([
      {
        $group: {
          _id: '$client_id',
          total_accounts: { $addToSet: '$account_uid' }
        }
      },
      {
        $project: {
          _id: 0,
          client_id: '$_id',
          total_accounts: { $size: '$total_accounts' }
        }
      },
      {
        $sort: { client_id: 1 }
      }
    ]).toArray();
  }

  private buildTrafficAggregation(dateField: string, dateFormat: string) {
    return [
      {
        $facet: {
          ok_docs: [
            { $match: { type: 'OK' } },
            {
              $group: {
                _id: {
                  date: { $substr: ['$datetime', 0, dateFormat] },
                  account_uid: '$account_uid',
                  account_name: '$account_name'
                },
                total_ok: { $sum: { $toInt: '$total' } }
              }
            }
          ],
          error_docs: [
            { $match: { type: 'ERROR' } },
            { $unwind: '$error_details' },
            {
              $group: {
                _id: {
                  date: { $substr: ['$datetime', 0, dateFormat] },
                  account_uid: '$account_uid',
                  account_name: '$account_name',
                  error_code: '$error_details.error_code',
                  error_description: '$error_details.error_description'
                },
                total: { $sum: { $toInt: '$error_details.total' } }
              }
            },
            {
              $group: {
                _id: {
                  date: '$_id.date',
                  account_uid: '$_id.account_uid',
                  account_name: '$_id.account_name'
                },
                total_errors: { $sum: '$total' },
                error_distribution: {
                  $push: {
                    error_code: '$_id.error_code',
                    error_description: '$_id.error_description',
                    total: '$total'
                  }
                }
              }
            }
          ]
        }
      },
      {
        $project: {
          dates: {
            $setUnion: [
              { $map: { input: '$ok_docs', as: 'ok', in: '$$ok._id.date' } },
              { $map: { input: '$error_docs', as: 'err', in: '$$err._id' } }
            ]
          },
          ok_docs: 1,
          error_docs: 1
        }
      },
      { $unwind: '$dates' },
      {
        $project: {
          [dateField]: '$dates',
          accounts: {
            $map: {
              input: {
                $setUnion: [
                  { $map: { input: '$ok_docs', as: 'ok', in: '$$ok._id.account_uid' } },
                  { $map: { input: '$error_docs', as: 'err', in: '$$err._id.account_uid' } }
                ]
              },
              as: 'account_uid',
              in: {
                account_uid: '$$account_uid',
                account_name: {
                  $let: {
                    vars: {
                      doc: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: { $concatArrays: ['$ok_docs', '$error_docs'] },
                              cond: { $eq: ['$$this._id.account_uid', '$$account_uid'] }
                            }
                          },
                          0
                        ]
                      }
                    },
                    in: '$$doc._id.account_name'
                  }
                },
                total_ok: {
                  $let: {
                    vars: {
                      ok_doc: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: '$ok_docs',
                              cond: {
                                $and: [
                                  { $eq: ['$$this._id.account_uid', '$$account_uid'] },
                                  { $eq: ['$$this._id.date', '$$ROOT.dates'] }
                                ]
                              }
                            }
                          },
                          0
                        ]
                      }
                    },
                    in: { $ifNull: ['$$ok_doc.total_ok', 0] }
                  }
                },
                total_errors: {
                  $let: {
                    vars: {
                      error_doc: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: '$error_docs',
                              cond: {
                                $and: [
                                  { $eq: ['$$this._id.account_uid', '$$account_uid'] },
                                  { $eq: ['$$this._id.date', '$$ROOT.dates'] }
                                ]
                              }
                            }
                          },
                          0
                        ]
                      }
                    },
                    in: { $ifNull: ['$$error_doc.total_errors', 0] }
                  }
                }
              }
            }
          },
          error_data: {
            $let: {
              vars: {
                error_doc: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$error_docs',
                        cond: { $eq: ['$$this._id', '$$ROOT.dates'] }
                      }
                    },
                    0
                  ]
                }
              },
              in: {
                total_errors: { $ifNull: ['$$error_doc.total_errors', 0] },
                error_distribution: { $ifNull: ['$$error_doc.error_distribution', []] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          client_totals: {
            total_ok: { $sum: '$accounts.total_ok' },
            total_errors: { $sum: '$accounts.total_errors' },
            total: { $add: [{ $sum: '$accounts.total_ok' }, { $sum: '$accounts.total_errors' }] }
          },
          accounts: {
            $filter: {
              input: {
                $map: {
                  input: '$accounts',
                  as: 'account',
                  in: {
                    account_uid: '$$account.account_uid',
                    account_name: '$$account.account_name',
                    total_ok: '$$account.total_ok',
                    total_errors: '$$account.total_errors',
                    total: { $add: ['$$account.total_ok', '$$account.total_errors'] }
                  }
                }
              },
              as: 'account',
              cond: { $gt: ['$$account.total', 0] }
            }
          },
          error_distribution: {
            $map: {
              input: {
                $reduce: {
                  input: '$error_data.error_distribution',
                  initialValue: [],
                  in: {
                    $concatArrays: [
                      '$$value',
                      [{
                        error_code: '$$this.error_code',
                        error_description: '$$this.error_description',
                        total: '$$this.total'
                      }]
                    ]
                  }
                }
              },
              as: 'error',
              in: {
                error_code: '$$error.error_code',
                error_description: '$$error.error_description',
                total: { $toInt: '$$error.total' },
                percentage: {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: [
                            { $toDouble: '$$error.total' },
                            { $max: [{ $toDouble: '$error_data.total_errors' }, 1] }
                          ]
                        },
                        100
                      ]
                    },
                    1
                  ]
                }
              }
            }
          }
        }
      },
      {
        $project: {
          [dateField]: 1,
          client_totals: 1,
          accounts: 1,
          error_distribution: 1
        }
      },
      { $sort: { [dateField]: 1 } }
    ];
  }
} 