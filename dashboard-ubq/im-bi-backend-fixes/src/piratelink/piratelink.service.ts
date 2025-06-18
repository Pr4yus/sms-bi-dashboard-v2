import { Injectable } from '@nestjs/common';
import { MongoService } from '../mongo/mongo.service';
import { ObjectId } from 'mongodb';

@Injectable()
export class PirateLinkService {
  constructor(private readonly mongoService: MongoService) {}

  private validateObjectId(accountUid: string): ObjectId {
    try {
      return new ObjectId(accountUid);
    } catch (error) {
      throw new Error(`Invalid account ID format: ${accountUid}`);
    }
  }

  // Get all accounts
  async getAllAccounts(uri: string, dbName: string) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    return db.collection('piratelink').aggregate([
      {
        $group: {
          _id: {
            account_uid: '$account_uid',
            account_name: '$account_name'
          }
        }
      },
      {
        $project: {
          _id: 0,
          account_uid: '$_id.account_uid',
          account_name: '$_id.account_name'
        }
      }
    ]).toArray();
  }

  // Daily Links (General)
  async getDailyLinks(
    uri: string,
    dbName: string,
    startDate: string,
    endDate: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    return db.collection('piratelink').aggregate([
      {
        $match: {
          datetime: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $unwind: '$links'
      },
      {
        $group: {
          _id: {
            date: { $substr: ['$datetime', 0, 10] },
            account: '$account_name',
            channel: { $ifNull: ['$links.channel_type', 'unknown'] },
            domain: {
              $let: {
                vars: {
                  urls: {
                    $filter: {
                      input: { $split: ['$links.content', ' '] },
                      as: 'text',
                      cond: { 
                        $regexMatch: { 
                          input: '$$text', 
                          regex: /^https?:\/\/([\w\-\.]+)[\/\?]/ 
                        }
                      }
                    }
                  }
                },
                in: {
                  $cond: {
                    if: { $eq: [{ $size: '$$urls' }, 0] },
                    then: 'unknown',
                    else: {
                      $let: {
                        vars: {
                          url: { $arrayElemAt: ['$$urls', 0] }
                        },
                        in: {
                          $arrayElemAt: [
                            { $split: [
                              { $arrayElemAt: [{ $split: ['$$url', '://'] }, 1] },
                              '/'
                            ] },
                            0
                          ]
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          total_by_channel: { $sum: 1 },
          examples: { $first: '$links' }
        }
      },
      {
        $group: {
          _id: {
            date: '$_id.date',
            account: '$_id.account'
          },
          total_links: { $sum: '$total_by_channel' },
          channels: {
            $addToSet: '$_id.channel'
          },
          channel_totals: {
            $push: {
              channel: '$_id.channel',
              total: '$total_by_channel'
            }
          },
          domains: {
            $push: {
              domain: '$_id.domain',
              total: '$total_by_channel'
            }
          },
          example: { $first: '$examples' }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          total_links: { $sum: '$total_links' },
          accounts: {
            $push: {
              name: '$_id.account',
              total_links: '$total_links',
              channels: '$channels',
              domains: '$domains',
              example: '$example',
              channel_totals: '$channel_totals'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          total_links: 1,
          accounts: {
            $arrayToObject: {
              $map: {
                input: '$accounts',
                as: 'acc',
                in: {
                  k: '$$acc.name',
                  v: {
                    total_links: '$$acc.total_links',
                    most_used_channel: {
                      $let: {
                        vars: {
                          max_channel: {
                            $reduce: {
                              input: '$$acc.channel_totals',
                              initialValue: { channel: '', total: 0 },
                              in: {
                                $cond: [
                                  { $gt: ['$$this.total', '$$value.total'] },
                                  '$$this',
                                  '$$value'
                                ]
                              }
                            }
                          }
                        },
                        in: '$$max_channel.channel'
                      }
                    },
                    used_channels: '$$acc.channels',
                    domains_used: {
                      $setUnion: {
                        $map: {
                          input: '$$acc.domains',
                          as: 'dom',
                          in: '$$dom.domain'
                        }
                      }
                    },
                    example: '$$acc.example'
                  }
                }
              }
            }
          },
          daily_summary: {
            channels: {
              $arrayToObject: {
                $map: {
                  input: ['INSTAGRAM', 'MESSENGER', 'WABA', 'unknown'],
                  as: 'channel',
                  in: {
                    k: '$$channel',
                    v: {
                      total: {
                        $sum: {
                          $map: {
                            input: '$accounts',
                            as: 'acc',
                            in: {
                              $sum: {
                                $map: {
                                  input: {
                                    $filter: {
                                      input: '$$acc.channel_totals',
                                      as: 'ch',
                                      cond: { $eq: ['$$ch.channel', '$$channel'] }
                                    }
                                  },
                                  as: 'ch',
                                  in: '$$ch.total'
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            domains: {
              $arrayToObject: {
                $map: {
                  input: {
                    $setUnion: {
                      $reduce: {
                        input: '$accounts',
                        initialValue: [],
                        in: {
                          $concatArrays: [
                            '$$value',
                            {
                              $map: {
                                input: '$$this.domains',
                                as: 'dom',
                                in: '$$dom.domain'
                              }
                            }
                          ]
                        }
                      }
                    }
                  },
                  as: 'domain',
                  in: {
                    k: '$$domain',
                    v: {
                      total: {
                        $sum: {
                          $map: {
                            input: '$accounts',
                            as: 'acc',
                            in: {
                              $sum: {
                                $map: {
                                  input: {
                                    $filter: {
                                      input: '$$acc.domains',
                                      as: 'dom',
                                      cond: { $eq: ['$$dom.domain', '$$domain'] }
                                    }
                                  },
                                  as: 'dom',
                                  in: '$$dom.total'
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
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

  // Monthly Links
  async getMonthlyLinks(
    uri: string,
    dbName: string,
    startMonth: string,
    endMonth?: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);

    return db.collection('piratelink').aggregate([
      {
        $match: {
          datetime: {
            $gte: `${startMonth}-01`,
            $lte: endMonth ? `${endMonth}-31` : `${startMonth}-31`,
          },
        },
      },
      {
        $unwind: '$links'
      },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: '%Y-%m', date: { $toDate: '$datetime' } } },
            account: '$account_name',
            channel: '$links.channel_type',
            domain: {
              $let: {
                vars: {
                  urls: {
                    $filter: {
                      input: { $split: ['$links.content', ' '] },
                      as: 'text',
                      cond: { 
                        $regexMatch: { 
                          input: '$$text', 
                          regex: /^https?:\/\/([\w\-\.]+)[\/\?]/ 
                        }
                      }
                    }
                  }
                },
                in: {
                  $cond: {
                    if: { $eq: [{ $size: '$$urls' }, 0] },
                    then: 'unknown',
                    else: {
                      $let: {
                        vars: {
                          url: { $arrayElemAt: ['$$urls', 0] }
                        },
                        in: {
                          $arrayElemAt: [
                            { $split: [
                              { $arrayElemAt: [{ $split: ['$$url', '://'] }, 1] },
                              '/'
                            ] },
                            0
                          ]
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          total_by_channel: { $sum: 1 },
          examples: { $first: '$links' }
        }
      },
      {
        $group: {
          _id: {
            month: '$_id.month',
            account: '$_id.account'
          },
          total_links: { $sum: '$total_by_channel' },
          channels: {
            $push: {
              channel: '$_id.channel',
              total: '$total_by_channel'
            }
          },
          domains: {
            $push: {
              domain: '$_id.domain',
              total: '$total_by_channel'
            }
          },
          example: { $first: '$examples' }
        }
      },
      {
        $group: {
          _id: '$_id.month',
          total_links: { $sum: '$total_links' },
          accounts: {
            $push: {
              name: '$_id.account',
              total_links: '$total_links',
              channels: '$channels',
              domains: '$domains',
              example: '$example'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          month: '$_id',
          total_links: 1,
          accounts: {
            $arrayToObject: {
              $map: {
                input: '$accounts',
                as: 'acc',
                in: {
                  k: '$$acc.name',
                  v: {
                    total_links: '$$acc.total_links',
                    most_used_channel: {
                      $let: {
                        vars: {
                          max_channel: {
                            $reduce: {
                              input: '$$acc.channels',
                              initialValue: { channel: '', total: 0 },
                              in: {
                                $cond: [
                                  { $gt: ['$$this.total', '$$value.total'] },
                                  '$$this',
                                  '$$value'
                                ]
                              }
                            }
                          }
                        },
                        in: '$$max_channel.channel'
                      }
                    },
                    used_channels: {
                      $map: {
                        input: '$$acc.channels',
                        as: 'ch',
                        in: '$$ch.channel'
                      }
                    },
                    domains_used: {
                      $setUnion: {
                        $map: {
                          input: '$$acc.domains',
                          as: 'dom',
                          in: '$$dom.domain'
                        }
                      }
                    },
                    example: '$$acc.example'
                  }
                }
              }
            }
          },
          monthly_summary: {
            channels: {
              $arrayToObject: {
                $map: {
                  input: ['INSTAGRAM', 'MESSENGER', 'WABA'],
                  as: 'channel',
                  in: {
                    k: '$$channel',
                    v: {
                      total: {
                        $sum: {
                          $map: {
                            input: '$accounts',
                            as: 'acc',
                            in: {
                              $sum: {
                                $map: {
                                  input: {
                                    $filter: {
                                      input: '$$acc.channels',
                                      as: 'ch',
                                      cond: { $eq: ['$$ch.channel', '$$channel'] }
                                    }
                                  },
                                  as: 'ch',
                                  in: '$$ch.total'
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            domains: {
              $arrayToObject: {
                $map: {
                  input: {
                    $setUnion: {
                      $reduce: {
                        input: '$accounts',
                        initialValue: [],
                        in: {
                          $concatArrays: [
                            '$$value',
                            {
                              $map: {
                                input: '$$this.domains',
                                as: 'dom',
                                in: '$$dom.domain'
                              }
                            }
                          ]
                        }
                      }
                    }
                  },
                  as: 'domain',
                  in: {
                    k: '$$domain',
                    v: {
                      total: {
                        $sum: {
                          $map: {
                            input: '$accounts',
                            as: 'acc',
                            in: {
                              $sum: {
                                $map: {
                                  input: {
                                    $filter: {
                                      input: '$$acc.domains',
                                      as: 'dom',
                                      cond: { $eq: ['$$dom.domain', '$$domain'] }
                                    }
                                  },
                                  as: 'dom',
                                  in: '$$dom.total'
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
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

  // Yearly Links
  async getYearlyLinks(uri: string, dbName: string, startYear: string, endYear?: string) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);

    return db.collection('piratelink').aggregate([
      {
        $match: {
          datetime: {
            $gte: `${startYear}-01-01`,
            $lte: endYear ? `${endYear}-12-31` : `${startYear}-12-31`,
          },
        },
      },
      {
        $unwind: '$links'
      },
      {
        $group: {
          _id: {
            year: { $dateToString: { format: '%Y', date: { $toDate: '$datetime' } } },
            account: '$account_name',
            channel: '$links.channel_type',
            domain: {
              $let: {
                vars: {
                  urls: {
                    $filter: {
                      input: { $split: ['$links.content', ' '] },
                      as: 'text',
                      cond: { 
                        $regexMatch: { 
                          input: '$$text', 
                          regex: /^https?:\/\/([\w\-\.]+)[\/\?]/ 
                        }
                      }
                    }
                  }
                },
                in: {
                  $cond: {
                    if: { $eq: [{ $size: '$$urls' }, 0] },
                    then: 'unknown',
                    else: {
                      $let: {
                        vars: {
                          url: { $arrayElemAt: ['$$urls', 0] }
                        },
                        in: {
                          $arrayElemAt: [
                            { $split: [
                              { $arrayElemAt: [{ $split: ['$$url', '://'] }, 1] },
                              '/'
                            ] },
                            0
                          ]
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          total_by_channel: { $sum: 1 },
          examples: { $first: '$links' }
        }
      },
      {
        $group: {
          _id: {
            year: '$_id.year',
            account: '$_id.account'
          },
          total_links: { $sum: '$total_by_channel' },
          channels: {
            $push: {
              channel: '$_id.channel',
              total: '$total_by_channel'
            }
          },
          domains: {
            $push: {
              domain: '$_id.domain',
              total: '$total_by_channel'
            }
          },
          example: { $first: '$examples' }
        }
      },
      {
        $group: {
          _id: '$_id.year',
          total_links: { $sum: '$total_links' },
          accounts: {
            $push: {
              name: '$_id.account',
              total_links: '$total_links',
              channels: '$channels',
              domains: '$domains',
              example: '$example'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id',
          total_links: 1,
          accounts: {
            $arrayToObject: {
              $map: {
                input: '$accounts',
                as: 'acc',
                in: {
                  k: '$$acc.name',
                  v: {
                    total_links: '$$acc.total_links',
                    most_used_channel: {
                      $let: {
                        vars: {
                          max_channel: {
                            $reduce: {
                              input: '$$acc.channels',
                              initialValue: { channel: '', total: 0 },
                              in: {
                                $cond: [
                                  { $gt: ['$$this.total', '$$value.total'] },
                                  '$$this',
                                  '$$value'
                                ]
                              }
                            }
                          }
                        },
                        in: '$$max_channel.channel'
                      }
                    },
                    used_channels: {
                      $map: {
                        input: '$$acc.channels',
                        as: 'ch',
                        in: '$$ch.channel'
                      }
                    },
                    domains_used: {
                      $setUnion: {
                        $map: {
                          input: '$$acc.domains',
                          as: 'dom',
                          in: '$$dom.domain'
                        }
                      }
                    },
                    example: '$$acc.example'
                  }
                }
              }
            }
          },
          yearly_summary: {
            channels: {
              $arrayToObject: {
                $map: {
                  input: ['INSTAGRAM', 'MESSENGER', 'WABA'],
                  as: 'channel',
                  in: {
                    k: '$$channel',
                    v: {
                      total: {
                        $sum: {
                          $map: {
                            input: '$accounts',
                            as: 'acc',
                            in: {
                              $sum: {
                                $map: {
                                  input: {
                                    $filter: {
                                      input: '$$acc.channels',
                                      as: 'ch',
                                      cond: { $eq: ['$$ch.channel', '$$channel'] }
                                    }
                                  },
                                  as: 'ch',
                                  in: '$$ch.total'
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            domains: {
              $arrayToObject: {
                $map: {
                  input: {
                    $setUnion: {
                      $reduce: {
                        input: '$accounts',
                        initialValue: [],
                        in: {
                          $concatArrays: [
                            '$$value',
                            {
                              $map: {
                                input: '$$this.domains',
                                as: 'dom',
                                in: '$$dom.domain'
                              }
                            }
                          ]
                        }
                      }
                    }
                  },
                  as: 'domain',
                  in: {
                    k: '$$domain',
                    v: {
                      total: {
                        $sum: {
                          $map: {
                            input: '$accounts',
                            as: 'acc',
                            in: {
                              $sum: {
                                $map: {
                                  input: {
                                    $filter: {
                                      input: '$$acc.domains',
                                      as: 'dom',
                                      cond: { $eq: ['$$dom.domain', '$$domain'] }
                                    }
                                  },
                                  as: 'dom',
                                  in: '$$dom.total'
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
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
          years: { $push: '$$ROOT' },
          total_global: { $sum: '$total_links' }
        }
      },
      {
        $project: {
          _id: 0,
          total_global: 1,
          years: 1,
          year_range: {
            start: startYear,
            end: endYear || startYear
          }
        }
      }
    ]).toArray();
  }

  // Por cuenta específica
  async getDailyLinksByAccount(
    uri: string,
    dbName: string,
    startDate: string,
    accountUid: string,
    endDate: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    const objectId = this.validateObjectId(accountUid);

    return db.collection('piratelink').aggregate([
      {
        $match: {
          datetime: {
            $gte: startDate,
            $lte: endDate,
          },
          account_uid: objectId,
        },
      },
      {
        $unwind: '$links'
      },
      {
        $group: {
          _id: {
            date: { $substr: ['$datetime', 0, 10] },
            channel: '$links.channel_type',
            base_url: {
              $let: {
                vars: {
                  url: {
                    $reduce: {
                      input: { $split: ['$links.content', ' '] },
                      initialValue: '',
                      in: {
                        $cond: {
                          if: { $regexMatch: { input: '$$this', regex: /^https?:\/\// } },
                          then: '$$this',
                          else: '$$value'
                        }
                      }
                    }
                  }
                },
                in: {
                  $cond: {
                    if: { $eq: ['$$url', ''] },
                    then: 'unknown',
                    else: {
                      $arrayElemAt: [
                        { $split: [
                          { $arrayElemAt: [
                            { $split: ['$$url', '://'] },
                            1
                          ] },
                          '/'
                        ] },
                        0
                      ]
                    }
                  }
                }
              }
            }
          },
          account_name: { $first: '$account_name' },
          total_by_domain: { $sum: 1 },
          links_by_domain: {
            $push: {
              content: '$links.content',
              alias: '$links.alias',
              datetime: '$links.datetime',
              channel_type: '$links.channel_type'
            }
          }
        }
      },
      {
        $group: {
          _id: {
            date: '$_id.date',
            base_url: '$_id.base_url'
          },
          account_name: { $first: '$account_name' },
          total_links: { $sum: '$total_by_domain' },
          channels: { $addToSet: '$_id.channel' },
          channel_totals: {
            $push: {
              channel: '$_id.channel',
              total: '$total_by_domain'
            }
          },
          links: {
            $first: {
              $slice: ['$links_by_domain', 3]
            }
          }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          account_name: { $first: '$account_name' },
          total_links: { $sum: '$total_links' },
          domain_groups: {
            $push: {
              domain: '$_id.base_url',
              total: '$total_links',
              links: '$links'
            }
          },
          channels: { $first: '$channels' },
          channel_totals: { $first: '$channel_totals' }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $group: {
          _id: null,
          account_name: { $first: '$account_name' },
          days: {
            $push: {
              date: '$_id',
              total_links: '$total_links',
              channels: '$channels',
              channel_totals: '$channel_totals',
              domain_groups: '$domain_groups'
            }
          },
          total_account: { $sum: '$total_links' },
          all_channel_totals: { $push: '$channel_totals' },
          all_domain_groups: { $push: '$domain_groups' }
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
            end: endDate
          },
          channel_domain_summary: {
            $reduce: {
              input: {
                $reduce: {
                  input: '$days',
                  initialValue: [],
                  in: { $concatArrays: ['$$value', ['$$this']] }
                }
              },
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: {
                      $map: {
                        input: '$$this.channels',
                        as: 'channel',
                        in: {
                          k: '$$channel',
                          v: {
                            total: {
                              $sum: {
                                $map: {
                                  input: {
                                    $filter: {
                                      input: '$$this.domain_groups',
                                      as: 'dg',
                                      cond: {
                                        $in: ['$$channel', {
                                          $map: {
                                            input: '$$dg.links',
                                            as: 'link',
                                            in: '$$link.channel_type'
                                          }
                                        }]
                                      }
                                    }
                                  },
                                  as: 'dg',
                                  in: '$$dg.total'
                                }
                              }
                            },
                            domains: {
                              $let: {
                                vars: {
                                  channel_domains: {
                                    $reduce: {
                                      input: '$$this.domain_groups',
                                      initialValue: [],
                                      in: {
                                        $concatArrays: [
                                          '$$value',
                                          {
                                            $map: {
                                              input: {
                                                $filter: {
                                                  input: '$$this.domain_groups',
                                                  as: 'dg',
                                                  cond: {
                                                    $in: ['$$channel', {
                                                      $map: {
                                                        input: '$$dg.links',
                                                        as: 'link',
                                                        in: '$$link.channel_type'
                                                      }
                                                    }]
                                                  }
                                                }
                                              },
                                              as: 'dg',
                                              in: {
                                                domain: '$$dg.domain',
                                                total: '$$dg.total'
                                              }
                                            }
                                          }
                                        ]
                                      }
                                    }
                                  }
                                },
                                in: {
                                  $reduce: {
                                    input: '$$channel_domains',
                                    initialValue: '',
                                    in: {
                                      $concat: [
                                        '$$value',
                                        { $cond: [{ $eq: ['$$value', ''] }, '', ', '] },
                                        '$$this.domain',
                                        ' ',
                                        { $toString: '$$this.total' }
                                      ]
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      }
    ]).toArray();
  }

  async getMonthlyLinksByAccount(
    uri: string,
    dbName: string,
    startMonth: string,
    accountUid: string,
    endMonth?: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    const objectId = this.validateObjectId(accountUid);

    return db.collection('piratelink').aggregate([
      {
        $match: {
          datetime: {
            $gte: `${startMonth}-01`,
            $lte: endMonth ? `${endMonth}-31` : `${startMonth}-31`,
          },
          account_uid: objectId,
        },
      },
      {
        $unwind: '$links'
      },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: '%Y-%m', date: { $toDate: '$datetime' } } },
            channel: '$links.channel_type',
            base_url: {
              $let: {
                vars: {
                  url: {
                    $reduce: {
                      input: { $split: ['$links.content', ' '] },
                      initialValue: '',
                      in: {
                        $cond: {
                          if: { $regexMatch: { input: '$$this', regex: /^https?:\/\// } },
                          then: '$$this',
                          else: '$$value'
                        }
                      }
                    }
                  }
                },
                in: {
                  $cond: {
                    if: { $eq: ['$$url', ''] },
                    then: 'unknown',
                    else: {
                      $arrayElemAt: [
                        { $split: [
                          { $arrayElemAt: [
                            { $split: ['$$url', '://'] },
                            1
                          ] },
                          '/'
                        ] },
                        0
                      ]
                    }
                  }
                }
              }
            }
          },
          account_name: { $first: '$account_name' },
          total_by_domain: { $sum: 1 },
          links_by_domain: {
            $push: {
              content: '$links.content',
              alias: '$links.alias',
              datetime: '$links.datetime',
              channel_type: '$links.channel_type'
            }
          }
        }
      },
      {
        $group: {
          _id: {
            month: '$_id.month',
            base_url: '$_id.base_url'
          },
          account_name: { $first: '$account_name' },
          total_links: { $sum: '$total_by_domain' },
          channels: { $addToSet: '$_id.channel' },
          channel_totals: {
            $push: {
              channel: '$_id.channel',
              total: '$total_by_domain'
            }
          },
          links: {
            $first: {
              $slice: ['$links_by_domain', 3]
            }
          }
        }
      },
      {
        $group: {
          _id: '$_id.month',
          account_name: { $first: '$account_name' },
          total_links: { $sum: '$total_links' },
          domain_groups: {
            $push: {
              domain: '$_id.base_url',
              total: '$total_links',
              links: '$links'
            }
          },
          channels: { $first: '$channels' },
          channel_totals: { $first: '$channel_totals' }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $group: {
          _id: null,
          account_name: { $first: '$account_name' },
          months: {
            $push: {
              month: '$_id',
              total_links: '$total_links',
              channels: '$channels',
              channel_totals: '$channel_totals',
              domain_groups: '$domain_groups'
            }
          },
          total_account: { $sum: '$total_links' }
        }
      },
      {
        $project: {
          _id: 0,
          account_name: 1,
          total_account: 1,
          months: 1,
          month_range: {
            start: startMonth,
            end: endMonth || startMonth
          },
          channel_domain_summary: {
            $reduce: {
              input: '$months',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $reduce: {
                      input: '$$this.channels',
                      initialValue: {},
                      in: {
                        $mergeObjects: [
                          '$$value',
                          {
                            $arrayToObject: {
                              $map: {
                                input: '$$this.domain_groups',
                                as: 'dg',
                                in: {
                                  domain: '$$dg.domain',
                                  total: '$$dg.total',
                                  examples: '$$dg.links'
                                }
                              }
                            }
                          }
                        ]
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      }
    ]).toArray();
  }

  async getYearlyLinksByAccount(
    uri: string,
    dbName: string,
    startYear: number,
    accountUid: string,
    endYear?: number,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    const objectId = this.validateObjectId(accountUid);

    return db.collection('piratelink').aggregate([
      {
        $match: {
          datetime: {
            $gte: `${startYear}-01-01`,
            $lte: endYear ? `${endYear}-12-31` : `${startYear}-12-31`,
          },
          account_uid: objectId
        }
      },
      {
        $unwind: '$links'
      },
      {
        $group: {
          _id: {
            year: { $substr: ['$datetime', 0, 4] },
            channel: '$links.channel_type',
            base_url: {
              $let: {
                vars: {
                  url: {
                    $reduce: {
                      input: { $split: ['$links.content', ' '] },
                      initialValue: '',
                      in: {
                        $cond: {
                          if: { $regexMatch: { input: '$$this', regex: /^https?:\/\// } },
                          then: '$$this',
                          else: '$$value'
                        }
                      }
                    }
                  }
                },
                in: {
                  $cond: {
                    if: { $eq: ['$$url', ''] },
                    then: 'unknown',
                    else: {
                      $arrayElemAt: [
                        { $split: [
                          { $arrayElemAt: [
                            { $split: ['$$url', '://'] },
                            1
                          ] },
                          '/'
                        ] },
                        0
                      ]
                    }
                  }
                }
              }
            }
          },
          account_name: { $first: '$account_name' },
          total_by_domain: { $sum: 1 },
          links_by_domain: {
            $push: {
              content: '$links.content',
              alias: '$links.alias',
              datetime: '$links.datetime',
              channel_type: '$links.channel_type'
            }
          }
        }
      },
      {
        $group: {
          _id: {
            year: '$_id.year',
            channel: '$_id.channel'
          },
          total_links: { $sum: '$total_by_domain' },
          channels: { $addToSet: '$_id.channel' },
          domain_groups: {
            $push: {
              domain: '$_id.base_url',
              total: '$total_by_domain',
              links: '$links_by_domain'
            }
          }
        }
      },
      {
        $group: {
          _id: '$_id.year',
          total_links: { $sum: '$total_links' },
          channels: { $first: '$channels' },
          channel_totals: {
            $push: {
              channel: '$_id.channel',
              total: '$total_links'
            }
          },
          domain_groups: {
            $push: {
              domain: '$_id.base_url',
              total: '$total_links',
              links: '$links_by_domain'
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $group: {
          _id: null,
          years: {
            $push: {
              year: '$_id',
              total_links: '$total_links',
              yearly_summary: {
                $arrayToObject: {
                  $map: {
                    input: '$channel_totals',
                    as: 'ct',
                    in: [
                      '$$ct.channel',
                      { total: '$$ct.total' }
                    ]
                  }
                }
              }
            }
          },
          total_global: { $sum: '$total_links' }
        }
      },
      {
        $project: {
          _id: 0,
          total_global: 1,
          years: 1,
          year_range: {
            start: startYear,
            end: endYear || startYear
          },
          account_name: 1
        }
      }
    ]).toArray();
  }

  // Agregar una función helper para extraer el dominio base
  private getBaseUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      return 'unknown';
    }
  }

  // Continuará...
} 
