import { Injectable } from '@nestjs/common';
import { MongoService } from '../shared/mongo.service';
import { ObjectId } from 'mongodb';

@Injectable()
export class ConversationsInsightsService {
  constructor(private readonly mongoService: MongoService) {}

  // Función helper para la estructura común de métricas
  private getBaseAggregationPipeline(dateField: string | { $substr: [string, number, number] }, matchStage: any) {
    return [
      { $match: matchStage },
      {
        $unwind: '$channels'
      },
      {
        $group: {
          _id: {
            date: dateField,
            channel: '$channels.channel'
          },
          channel_conversations: { $sum: { $ifNull: ['$channels.metrics.conversations.total', 0] } },
          channel_new_profiles: { $sum: { $ifNull: ['$channels.metrics.conversations.new_profiles', 0] } },
          channel_returning_profiles: { $sum: { $ifNull: ['$channels.metrics.conversations.returning_profiles', 0] } },
          channel_response_rate: { $avg: { $toDouble: '$channels.metrics.quality_indicators.response_rate' } },
          channel_completion_rate: { $avg: { $toDouble: '$channels.metrics.quality_indicators.completion_rate' } },
          total_day_conversations: { $sum: { $ifNull: ['$total_metrics.conversations', 0] } },
          new_profiles: { $sum: { $ifNull: ['$total_metrics.profiles.new', 0] } },
          returning_profiles: { $sum: { $ifNull: ['$total_metrics.profiles.returning', 0] } },
          avg_conversion_rate: { 
            $avg: { 
              $cond: {
                if: { $eq: [{ $toDouble: '$total_metrics.profiles.conversion_rate' }, null] },
                then: 0,
                else: { $toDouble: '$total_metrics.profiles.conversion_rate' }
              }
            } 
          },
          avg_session_duration: { $avg: '$total_metrics.engagement.avg_session_duration' },
          avg_response_rate: { $avg: { $toDouble: '$total_metrics.engagement.response_rate' } },
          avg_completion_rate: { $avg: { $toDouble: '$total_metrics.engagement.completion_rate' } },
          total_incoming_messages: { $sum: '$channels.metrics.message_patterns.messages_distribution.incoming' },
          total_outgoing_messages: { $sum: '$channels.metrics.message_patterns.messages_distribution.outgoing' },
          avg_messages_per_conversation: { $avg: '$channels.metrics.message_patterns.avg_messages_per_conversation' },
          busiest_hours: {
            $addToSet: {
              $cond: {
                if: { $ne: ['$total_metrics.peak_hours.busiest_hour', null] },
                then: '$total_metrics.peak_hours.busiest_hour',
                else: '$$REMOVE'
              }
            }
          },
          quietest_hours: {
            $addToSet: {
              $cond: {
                if: { $ne: ['$total_metrics.peak_hours.quietest_hour', null] },
                then: '$total_metrics.peak_hours.quietest_hour',
                else: '$$REMOVE'
              }
            }
          },
          weekend_percentage: { $avg: { $toDouble: '$total_metrics.peak_hours.weekend_percentage' } }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          total_conversations: { $sum: { $ifNull: ['$total_day_conversations', 0] } },
          new_profiles: { $sum: { $ifNull: ['$new_profiles', 0] } },
          returning_profiles: { $sum: { $ifNull: ['$returning_profiles', 0] } },
          avg_conversion_rate: { 
            $avg: { 
              $cond: {
                if: { $eq: ['$avg_conversion_rate', null] },
                then: 0,
                else: '$avg_conversion_rate'
              }
            } 
          },
          avg_session_duration: { $avg: '$avg_session_duration' },
          avg_response_rate: { $avg: { $toDouble: '$avg_response_rate' } },
          avg_completion_rate: { $avg: { $toDouble: '$avg_completion_rate' } },
          channels: {
            $push: {
              channel: '$_id.channel',
              total: '$channel_conversations',
              metrics: {
                conversations: {
                  total: '$channel_conversations',
                  new_profiles: '$channel_new_profiles',
                  returning_profiles: '$channel_returning_profiles'
                },
                quality: {
                  response_rate: { $round: ['$channel_response_rate', 1] },
                  completion_rate: { $round: ['$channel_completion_rate', 1] }
                },
                messages: {
                  incoming: '$total_incoming_messages',
                  outgoing: '$total_outgoing_messages',
                  avg_per_conversation: { $round: ['$avg_messages_per_conversation', 1] }
                }
              }
            }
          },
          messages_incoming: { $sum: '$total_incoming_messages' },
          messages_outgoing: { $sum: '$total_outgoing_messages' },
          busiest_hours: { 
            $addToSet: {
              $cond: {
                if: { $ne: ['$busiest_hours', []] },
                then: { $first: '$busiest_hours' },
                else: '$$REMOVE'
              }
            }
          },
          quietest_hours: { 
            $addToSet: {
              $cond: {
                if: { $ne: ['$quietest_hours', []] },
                then: { $first: '$quietest_hours' },
                else: '$$REMOVE'
              }
            }
          },
          weekend_percentage: { $first: '$weekend_percentage' }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          total_conversations: 1,
          profiles: {
            new: { $ifNull: ['$new_profiles', 0] },
            returning: { $ifNull: ['$returning_profiles', 0] },
            conversion_rate: { 
              $cond: {
                if: { $eq: ['$avg_conversion_rate', null] },
                then: 0,
                else: { $round: ['$avg_conversion_rate', 1] }
              }
            }
          },
          engagement: {
            avg_session_duration: { 
              $round: [{ $divide: ['$avg_session_duration', 60000] }, 1]
            },
            response_rate: { $round: ['$avg_response_rate', 1] },
            completion_rate: { $round: ['$avg_completion_rate', 1] }
          },
          messages: {
            total: { $add: ['$messages_incoming', '$messages_outgoing'] },
            incoming: '$messages_incoming',
            outgoing: '$messages_outgoing',
            avg_per_conversation: { 
              $round: [{ 
                $divide: [
                  { $add: ['$messages_incoming', '$messages_outgoing'] },
                  '$total_conversations'
                ]
              }, 1]
            }
          },
          peak_analysis: {
            busiest_hours: {
              $slice: [{
                $filter: {
                  input: '$busiest_hours',
                  as: 'hour',
                  cond: { $ne: ['$$hour', null] }
                }
              }, 5]
            },
            quietest_hours: {
              $slice: [{
                $filter: {
                  input: '$quietest_hours',
                  as: 'hour',
                  cond: { $ne: ['$$hour', null] }
                }
              }, 5]
            },
            weekend_percentage: { $round: ['$weekend_percentage', 1] }
          },
          channels: {
            $arrayToObject: {
              $map: {
                input: '$channels',
                as: 'ch',
                in: {
                  k: '$$ch.channel',
                  v: '$$ch.total'
                }
              }
            }
          },
          channel_metrics: '$channels',
          channel_distribution: {
            $map: {
              input: '$channels',
              as: 'ch',
              in: {
                channel: '$$ch.channel',
                percentage: {
                  $round: [{
                    $multiply: [
                      { $divide: ['$$ch.total', '$total_conversations'] },
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
        $sort: { date: 1 }
      }
    ];
  }

  async getDailyInsights(
    uri: string,
    dbName: string,
    startDate: string,
    endDate: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    
    const matchStage = {
      date: {
        $gte: startDate,
        $lte: endDate,
      }
    };

    const pipeline = this.getBaseAggregationPipeline('$date', matchStage);
    const result = await db.collection('conversationsinsightsdata').aggregate(pipeline).toArray();

    return {
      days: result,
      total_conversations: result.reduce((sum, day) => sum + day.total_conversations, 0),
      date_range: {
        start: result.length > 0 ? result[0].date : null,
        end: result.length > 0 ? result[result.length - 1].date : null,
      }
    };
  }

  async getDailyInsightsByAccount(
    uri: string,
    dbName: string,
    startDate: string,
    accountUid: string,
    endDate: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    const objectId = new ObjectId(accountUid);

    const result = await db.collection('conversationsinsightsdata').aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
          account_uid: objectId,
        },
      },
      {
        $sort: { date: 1 },
      },
    ]).toArray();

    return {
      account_name: result.length > 0 ? result[0].account_name : null,
      days: result,
      total_conversations: result.reduce((sum, day) => sum + day.total_metrics.conversations, 0),
      date_range: {
        start: result.length > 0 ? result[0].date : null,
        end: result.length > 0 ? result[result.length - 1].date : null,
      },
    };
  }

  async getMonthlyInsights(
    uri: string,
    dbName: string,
    startMonth: string,
    endMonth?: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    
    const matchStage = {
      $expr: {
        $and: [
          {
            $gte: [
              { $substr: ['$date', 0, 7] },
              startMonth
            ]
          },
          {
            $lte: [
              { $substr: ['$date', 0, 7] },
              endMonth || startMonth
            ]
          }
        ]
      }
    };

    const pipeline = this.getBaseAggregationPipeline({ $substr: ['$date', 0, 7] }, matchStage);
    const result = await db.collection('conversationsinsightsdata').aggregate(pipeline).toArray();

    return {
      months: result,
      total_conversations: result.reduce((sum, month) => sum + month.total_conversations, 0),
      month_range: {
        start: result.length > 0 ? result[0].date : null,
        end: result.length > 0 ? result[result.length - 1].date : null,
      }
    };
  }

  async getMonthlyInsightsByAccount(
    uri: string,
    dbName: string,
    startMonth: string,
    accountUid: string,
    endMonth?: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    const objectId = new ObjectId(accountUid);
    const endMonthDate = endMonth || startMonth;

    const result = await db.collection('conversationsinsightsdata').aggregate([
      {
        $match: {
          account_uid: objectId,
          $expr: {
            $and: [
              { $gte: [{ $substr: ['$date', 0, 7] }, startMonth] },
              { $lte: [{ $substr: ['$date', 0, 7] }, endMonthDate] }
            ]
          }
        }
      },
      {
        $unwind: '$channels'
      },
      {
        $group: {
          _id: { 
            month: { $substr: ['$date', 0, 7] },
            account_name: '$account_name',
            channel: '$channels.channel'
          },
          channel_conversations: { $sum: '$channels.metrics.conversations.total' },
          total_month_conversations: { $sum: '$total_metrics.conversations' },
          new_profiles: { $sum: '$total_metrics.profiles.new' },
          returning_profiles: { $sum: '$total_metrics.profiles.returning' },
          avg_conversion_rate: { $avg: { $toDouble: '$total_metrics.profiles.conversion_rate' } },
          avg_session_duration: { $avg: '$total_metrics.engagement.avg_session_duration' },
          avg_response_rate: { $avg: { $toDouble: '$total_metrics.engagement.response_rate' } },
          avg_completion_rate: { $avg: { $toDouble: '$total_metrics.engagement.completion_rate' } },
          first_reply_seconds: { $avg: '$response_times.first_reply_seconds' },
          avg_response_seconds: { $avg: '$response_times.avg_response_seconds' }
        }
      },
      {
        $group: {
          _id: {
            month: '$_id.month',
            account_name: '$_id.account_name'
          },
          total_conversations: { $first: '$total_month_conversations' },
          new_profiles: { $first: '$new_profiles' },
          returning_profiles: { $first: '$returning_profiles' },
          avg_conversion_rate: { $first: '$avg_conversion_rate' },
          avg_session_duration: { $first: '$avg_session_duration' },
          avg_response_rate: { $first: '$avg_response_rate' },
          avg_completion_rate: { $first: '$avg_completion_rate' },
          first_reply_seconds: { $first: '$first_reply_seconds' },
          avg_response_seconds: { $first: '$avg_response_seconds' },
          channels_data: {
            $push: {
              channel: '$_id.channel',
              conversations: '$channel_conversations'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          account_name: '$_id.account_name',
          total_conversations: 1,
          profiles: {
            new: '$new_profiles',
            returning: '$returning_profiles',
            conversion_rate: { $round: ['$avg_conversion_rate', 1] }
          },
          engagement: {
            avg_session_duration: { 
              $round: [{ $divide: ['$avg_session_duration', 60000] }, 1]
            },
            response_rate: { $round: ['$avg_response_rate', 1] },
            completion_rate: { $round: ['$avg_completion_rate', 1] }
          },
          response_times: {
            first_reply_minutes: {
              $round: [{ $divide: ['$first_reply_seconds', 60] }, 1]
            },
            avg_response_minutes: {
              $round: [{ $divide: ['$avg_response_seconds', 60] }, 1]
            }
          },
          channels: {
            $arrayToObject: {
              $map: {
                input: '$channels_data',
                as: 'ch',
                in: {
                  k: '$$ch.channel',
                  v: '$$ch.conversations'
                }
              }
            }
          },
          channel_distribution: {
            $map: {
              input: '$channels_data',
              as: 'ch',
              in: {
                channel: '$$ch.channel',
                percentage: {
                  $round: [{
                    $multiply: [
                      { $divide: ['$$ch.conversations', '$total_conversations'] },
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
        $sort: { month: 1 }
      },
      {
        $group: {
          _id: null,
          account_name: { $first: '$account_name' },
          months: { $push: '$$ROOT' },
          total_conversations: { $sum: '$total_conversations' }
        }
      },
      {
        $project: {
          _id: 0,
          account_name: 1,
          months: 1,
          total_conversations: 1,
          month_range: {
            start: startMonth,
            end: endMonth || startMonth
          }
        }
      }
    ]).toArray();

    return result[0] || {
      account_name: null,
      months: [],
      total_conversations: 0,
      month_range: {
        start: startMonth,
        end: endMonth || startMonth
      }
    };
  }

  async getYearlyInsights(
    uri: string,
    dbName: string,
    startYear: number,
    endYear?: number,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    
    const matchStage = {
      $expr: {
        $and: [
          {
            $gte: [
              { $substr: ['$date', 0, 4] },
              startYear.toString()
            ]
          },
          {
            $lte: [
              { $substr: ['$date', 0, 4] },
              (endYear || startYear).toString()
            ]
          }
        ]
      }
    };

    const pipeline = this.getBaseAggregationPipeline({ $substr: ['$date', 0, 4] }, matchStage);
    const result = await db.collection('conversationsinsightsdata').aggregate(pipeline).toArray();

    return {
      years: result,
      total_conversations: result.reduce((sum, year) => sum + year.total_conversations, 0),
      year_range: {
        start: startYear,
        end: endYear || startYear
      }
    };
  }

  async getYearlyInsightsByAccount(
    uri: string,
    dbName: string,
    startYear: number,
    accountUid: string,
    endYear?: number,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    const objectId = new ObjectId(accountUid);
    
    const result = await db.collection('conversationsinsightsdata').aggregate([
      {
        $match: {
          account_uid: objectId,
          $expr: {
            $and: [
              {
                $gte: [
                  { $toInt: { $substr: ['$date', 0, 4] } },
                  startYear
                ]
              },
              {
                $lte: [
                  { $toInt: { $substr: ['$date', 0, 4] } },
                  endYear || startYear
                ]
              }
            ]
          }
        }
      },
      {
        $unwind: '$channels'
      },
      {
        $group: {
          _id: { 
            year: { $substr: ['$date', 0, 4] },
            account_name: '$account_name',
            channel: '$channels.channel'
          },
          channel_conversations: { $sum: '$channels.metrics.conversations.total' },
          channel_new_profiles: { $sum: '$channels.metrics.conversations.new_profiles' },
          channel_returning_profiles: { $sum: '$channels.metrics.conversations.returning_profiles' },
          channel_response_rate: { $avg: { $toDouble: '$channels.metrics.quality_indicators.response_rate' } },
          channel_completion_rate: { $avg: { $toDouble: '$channels.metrics.quality_indicators.completion_rate' } },
          total_year_conversations: { $sum: '$total_metrics.conversations' },
          new_profiles: { $sum: '$total_metrics.profiles.new' },
          returning_profiles: { $sum: '$total_metrics.profiles.returning' },
          avg_conversion_rate: { $avg: { $toDouble: '$total_metrics.profiles.conversion_rate' } },
          avg_session_duration: { $avg: '$total_metrics.engagement.avg_session_duration' },
          avg_response_rate: { $avg: { $toDouble: '$total_metrics.engagement.response_rate' } },
          avg_completion_rate: { $avg: { $toDouble: '$total_metrics.engagement.completion_rate' } },
          first_reply_seconds: { $avg: '$response_times.first_reply_seconds' },
          avg_response_seconds: { $avg: '$response_times.avg_response_seconds' },
          messages_incoming: { $sum: '$channels.metrics.message_patterns.messages_distribution.incoming' },
          messages_outgoing: { $sum: '$channels.metrics.message_patterns.messages_distribution.outgoing' },
          avg_messages_per_conversation: { $avg: '$channels.metrics.message_patterns.avg_messages_per_conversation' }
        }
      },
      {
        $group: {
          _id: {
            year: '$_id.year',
            account_name: '$_id.account_name'
          },
          total_conversations: { $first: '$total_year_conversations' },
          new_profiles: { $first: '$new_profiles' },
          returning_profiles: { $first: '$returning_profiles' },
          avg_conversion_rate: { $first: '$avg_conversion_rate' },
          avg_session_duration: { $first: '$avg_session_duration' },
          avg_response_rate: { $first: '$avg_response_rate' },
          avg_completion_rate: { $first: '$avg_completion_rate' },
          first_reply_seconds: { $first: '$first_reply_seconds' },
          avg_response_seconds: { $first: '$avg_response_seconds' },
          channels_data: {
            $push: {
              channel: '$_id.channel',
              total: '$channel_conversations',
              metrics: {
                conversations: {
                  total: '$channel_conversations',
                  new_profiles: '$channel_new_profiles',
                  returning_profiles: '$channel_returning_profiles'
                },
                quality_indicators: {
                  response_rate: { $round: ['$channel_response_rate', 1] },
                  completion_rate: { $round: ['$channel_completion_rate', 1] }
                },
                message_patterns: {
                  avg_messages_per_conversation: { $round: ['$avg_messages_per_conversation', 0] },
                  messages_distribution: {
                    incoming: '$messages_incoming',
                    outgoing: '$messages_outgoing'
                  }
                }
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          account_name: '$_id.account_name',
          total_conversations: 1,
          profiles: {
            new: '$new_profiles',
            returning: '$returning_profiles',
            conversion_rate: { $round: ['$avg_conversion_rate', 1] }
          },
          engagement: {
            avg_session_duration: { 
              $round: [{ $divide: ['$avg_session_duration', 60000] }, 1]
            },
            response_rate: { $round: ['$avg_response_rate', 1] },
            completion_rate: { $round: ['$avg_completion_rate', 1] }
          },
          response_times: {
            first_reply_minutes: {
              $round: [{ $divide: ['$first_reply_seconds', 60] }, 1]
            },
            avg_response_minutes: {
              $round: [{ $divide: ['$avg_response_seconds', 60] }, 1]
            }
          },
          channels: {
            $arrayToObject: {
              $map: {
                input: '$channels_data',
                as: 'ch',
                in: {
                  k: '$$ch.channel',
                  v: '$$ch.total'
                }
              }
            }
          },
          channel_distribution: {
            $map: {
              input: '$channels_data',
              as: 'ch',
              in: {
                channel: '$$ch.channel',
                percentage: {
                  $round: [{
                    $multiply: [
                      { $divide: ['$$ch.total', '$total_conversations'] },
                      100
                    ]
                  }, 1]
                }
              }
            }
          },
          channel_metrics: '$channels_data'
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
          total_conversations: { $sum: '$total_conversations' }
        }
      },
      {
        $project: {
          _id: 0,
          account_name: 1,
          years: 1,
          total_conversations: 1,
          year_range: {
            start: startYear,
            end: endYear || startYear
          }
        }
      }
    ]).toArray();

    return result[0] || {
      account_name: null,
      years: [],
      total_conversations: 0,
      year_range: {
        start: startYear,
        end: endYear || startYear
      }
    };
  }

  async getAccounts(uri: string, dbName: string) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    
    const result = await db.collection('conversationsinsightsdata').aggregate([
      {
        $group: {
          _id: '$account_uid',
          account_name: { $first: '$account_name' },
        },
      },
      {
        $project: {
          _id: 0,
          account_uid: '$_id',
          account_name: 1,
        },
      },
      {
        $sort: { account_name: 1 },
      },
    ]).toArray();

    return result;
  }
} 