import { Injectable } from '@nestjs/common';
import { MongoService } from '../mongo/mongo.service';
import { ObjectId } from 'mongodb';

@Injectable()
export class ConversationsService {
  constructor(private readonly mongoService: MongoService) {}

  async getDailyConversationsByClient(
    uri: string,
    dbName: string,
    startDate: string,
    endDate: string,
    clientIds: string[],
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    
    // Ajustar las fechas para considerar el offset de +6 horas
    const parsedStartDate = new Date(`${startDate}T06:00:00.000Z`);
    const nextDay = new Date(endDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const parsedEndDate = new Date(`${nextDay.toISOString().split('T')[0]}T06:00:00.000Z`);
  
    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      throw new Error('Invalid startDate or endDate');
    }
  
    return db
      .collection('conversations_account_type')
      .aggregate([
        {
          $match: {
            client_id: { $in: clientIds },
            date: { $gte: parsedStartDate, $lt: parsedEndDate },
          },
        },
        {
          $group: {
            _id: {
              day: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
              client_id: '$client_id',
              channel_type: '$channel_type',
            },
            total_conversations: { $sum: '$total_conversations' },
          },
        },
        {
          $sort: { '_id.day': 1, '_id.channel_type': 1 },
        },
        {
          $group: {
            _id: '$_id.day',
            clients: {
              $push: {
                client_id: '$_id.client_id',
                channel_type: '$_id.channel_type',
                total_conversations: '$total_conversations',
              },
            },
            total_conversations: { $sum: '$total_conversations' },
          },
        },
        {
          $sort: { _id: 1 },
        },
        {
          $project: {
            day: '$_id',
            total_conversations: 1,
            clients: 1,
          },
        },
      ])
      .toArray();
  }
  
  async getDailyConversations(
    uri: string,
    dbName: string,
    startDate: string,
    endDate: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    
    // Ajustar las fechas para considerar el offset de +6 horas
    const parsedStartDate = new Date(`${startDate}T06:00:00.000Z`);
    const nextDay = new Date(endDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const parsedEndDate = new Date(`${nextDay.toISOString().split('T')[0]}T06:00:00.000Z`);
  
    console.log('Start Date:', parsedStartDate);
    console.log('End Date:', parsedEndDate);
  
    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      throw new Error('Invalid startDate or endDate');
    }
  
    return db
      .collection('conversations_account_type')
      .aggregate([
        {
          $match: {
            date: { $gte: parsedStartDate, $lt: parsedEndDate },
          },
        },
        {
          $group: {
            _id: {
              day: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
              channel_type: '$channel_type',
            },
            total_conversations: { $sum: '$total_conversations' },
          },
        },
        {
          $sort: { '_id.day': 1, '_id.channel_type': 1 },
        },
        {
          $group: {
            _id: '$_id.day',
            channels: {
              $push: {
                channel_type: '$_id.channel_type',
                total_conversations: '$total_conversations',
              },
            },
            total_conversations: { $sum: '$total_conversations' },
          },
        },
        {
          $sort: { _id: 1 },
        },
        {
          $project: {
            day: '$_id',
            total_conversations: 1,
            channels: 1,
          },
        },
      ])
      .toArray();
  }

  async getMonthlyConversationsByClient(
    uri: string,
    dbName: string,
    startMonth: string,
    endMonth: string,
    clientIds: string[],
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    
    // Ajustar las fechas para considerar el offset de +6 horas
    const parsedStartDate = new Date(`${startMonth}-01T06:00:00.000Z`);
    const nextMonth = new Date(endMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const parsedEndDate = new Date(`${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01T06:00:00.000Z`);
  
    return db
      .collection('conversations_account_type')
      .aggregate([
        {
          $match: {
            client_id: { $in: clientIds },
            date: { $gte: parsedStartDate, $lt: parsedEndDate },
          },
        },
        {
          $group: {
            _id: {
              month: { $dateToString: { format: '%Y-%m', date: '$date' } },
              client_id: '$client_id',
              channel_type: '$channel_type',
            },
            total_conversations: { $sum: '$total_conversations' },
          },
        },
        {
          $sort: { '_id.month': 1, '_id.channel_type': 1 },
        },
        {
          $group: {
            _id: '$_id.month',
            clients: {
              $push: {
                client_id: '$_id.client_id',
                channel_type: '$_id.channel_type',
                total_conversations: '$total_conversations',
              },
            },
            total_conversations: { $sum: '$total_conversations' },
          },
        },
        {
          $sort: { _id: 1 },
        },
        {
          $project: {
            month: '$_id',
            total_conversations: 1,
            clients: 1,
          },
        },
      ])
      .toArray();
  }
  
  async getMonthlyConversations(
    uri: string,
    dbName: string,
    startMonth: string,
    endMonth: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    
    // Ajustar las fechas para considerar el offset de +6 horas
    const parsedStartDate = new Date(`${startMonth}-01T06:00:00.000Z`);
    const nextMonth = new Date(endMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const parsedEndDate = new Date(`${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01T06:00:00.000Z`);
  
    console.log('Start Month:', startMonth);
    console.log('End Month:', endMonth);
  
    return db
      .collection('conversations_account_type')
      .aggregate([
        {
          $match: {
            date: { $gte: parsedStartDate, $lt: parsedEndDate },
          },
        },
        {
          $group: {
            _id: {
              month: { $dateToString: { format: '%Y-%m', date: '$date' } },
              channel_type: '$channel_type',
            },
            total_conversations: { $sum: '$total_conversations' },
          },
        },
        {
          $sort: { '_id.month': 1, '_id.channel_type': 1 },
        },
        {
          $group: {
            _id: '$_id.month',
            channels: {
              $push: {
                channel_type: '$_id.channel_type',
                total_conversations: '$total_conversations',
              },
            },
            total_conversations: { $sum: '$total_conversations' },
          },
        },
        {
          $sort: { _id: 1 },
        },
        {
          $project: {
            month: '$_id',
            total_conversations: 1,
            channels: 1,
          },
        },
      ])
      .toArray();
  }
  async getYearlyConversationsByClient(
    uri: string,
    dbName: string,
    startYear: number,
    clientIds: string[],
    endYear?: number,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    
    // Ajustar las fechas para considerar el offset de +6 horas
    const parsedStartDate = new Date(`${startYear}-01-01T06:00:00.000Z`);
    const parsedEndDate = new Date(`${(endYear || startYear) + 1}-01-01T06:00:00.000Z`);
  
    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      throw new Error('Invalid startYear or endYear');
    }
  
    return db
      .collection('conversations_account_type')
      .aggregate([
        {
          $match: {
            client_id: { $in: clientIds },
            date: { $gte: parsedStartDate, $lt: parsedEndDate },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              client_id: '$client_id',
              channel_type: '$channel_type',
            },
            total_conversations: { $sum: '$total_conversations' },
          },
        },
        {
          $sort: { '_id.year': 1, '_id.channel_type': 1 },
        },
        {
          $group: {
            _id: '$_id.year',
            clients: {
              $push: {
                client_id: '$_id.client_id',
                channel_type: '$_id.channel_type',
                total_conversations: '$total_conversations',
              },
            },
            total_conversations: { $sum: '$total_conversations' },
          },
        },
        {
          $sort: { _id: 1 },
        },
        {
          $project: {
            year: '$_id',
            total_conversations: 1,
            clients: 1,
          },
        },
      ])
      .toArray();
  }
  
  async getYearlyConversations(
    uri: string,
    dbName: string,
    startYear: number,
    endYear?: number,
    clientIds?: string[],
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
  
    // Ajustar las fechas para considerar el offset de +6 horas
    const parsedStartDate = new Date(`${startYear}-01-01T06:00:00.000Z`);
    const parsedEndDate = new Date(`${(endYear || startYear) + 1}-01-01T06:00:00.000Z`);
  
    console.log('Start Date:', parsedStartDate);
    console.log('End Date:', parsedEndDate);
  
    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      console.error('Invalid startDate or endDate:', { parsedStartDate, parsedEndDate });
      throw new Error('Invalid startYear or endYear');
    }
  
    return db
      .collection('conversations_account_type')
      .aggregate([
        {
          $match: {
            date: { $gte: parsedStartDate, $lt: parsedEndDate },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              channel_type: '$channel_type',
            },
            total_conversations: { $sum: '$total_conversations' },
          },
        },
        {
          $sort: { '_id.year': 1, '_id.channel_type': 1 },
        },
        {
          $group: {
            _id: '$_id.year',
            channels: {
              $push: {
                channel_type: '$_id.channel_type',
                total_conversations: '$total_conversations',
              },
            },
            total_conversations: { $sum: '$total_conversations' },
          },
        },
        {
          $sort: { _id: 1 },
        },
        {
          $project: {
            year: '$_id',
            total_conversations: 1,
            channels: 1,
          },
        },
      ])
      .toArray();
  }
  
  private generateMonthsArray(startMonth: string, endMonth: string): string[] {
    // Ajustar las fechas para considerar el offset de +6 horas
    const start = new Date(`${startMonth}-01T06:00:00.000Z`);
    const end = new Date(`${endMonth}-01T06:00:00.000Z`);
    const months = [];
  
    while (start <= end) {
      const year = start.getUTCFullYear();
      const month = (start.getUTCMonth() + 1).toString().padStart(2, '0');
      months.push(`${year}-${month}`);
      start.setUTCMonth(start.getUTCMonth() + 1);
    }
  
    return months;
  }
  async getBillingConversations(
    uri: string,
    dbName: string,
    accountUid: string,
    startDate: string,   // Formato esperado: YYYY-MM-DD
    endDate: string,     // Formato esperado: YYYY-MM-DD
    channelIdentifier?: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    
    // Parse and validate dates
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      throw new Error('Invalid date format. Please use YYYY-MM-DD format');
    }

    // Ajustamos las fechas para capturar días completos en UTC
    // Ejemplo: '2023-12-01' -> '2023-12-01T00:00:00Z'
    parsedStartDate.setUTCHours(0, 0, 0, 0);  // Captura desde el primer segundo del día

    // Para incluir el último día completo, movemos la fecha final al inicio del día siguiente
    // Ejemplo: '2023-12-31' -> '2024-01-01T00:00:00Z'
    const adjustedEndDate = new Date(parsedEndDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);  // Sumamos un día
    adjustedEndDate.setUTCHours(0, 0, 0, 0);  // Inicio del día siguiente

    try {
      const matchStage: any = {
        account_uid: new ObjectId(accountUid),
        created_on: { 
          $gte: parsedStartDate,     // Mayor o igual a inicio del primer día
          $lt: adjustedEndDate       // Menor que inicio del día siguiente
                                    // Esto efectivamente incluye hasta 23:59:59 del último día
        },
        channel_type: 'WABA'
      };

      // Add channel_identifier to match if provided
      if (channelIdentifier) {
        matchStage.channel_identifier = channelIdentifier;
      }

      const result = await db
        .collection('billing_conversations')
        .aggregate([
          {
            $match: matchStage
          },
          {
            $project: {
              started_with: 1,
              created_on: 1,
              total_by_user: {
                $cond: [{ $eq: ['$started_with', 'MO_MESSAGE'] }, 1, 0]
              },
              total_by_business: {
                $cond: [{ $eq: ['$started_with', 'MT_TEMPLATE'] }, 1, 0]
              },
              total_by_referral: {
                $cond: [{ $eq: ['$started_with', 'MO_REFERRAL'] }, 1, 0]
              },
              pricing: {
                $cond: [
                  { $eq: ['$started_with', 'MT_TEMPLATE'] },
                  0.0777,
                  { $cond: [{ $eq: ['$started_with', 'MO_MESSAGE'] }, 0.0444, 0] }
                ]
              }
            }
          },
          {
            $facet: {
              all: [
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                    user_count: { $sum: '$total_by_user' },
                    business_count: { $sum: '$total_by_business' },
                    referral_count: { $sum: '$total_by_referral' },
                    pricing: { $sum: '$pricing' }
                  }
                }
              ],
              paid: [
                {
                  $match: { started_with: { $ne: 'MO_REFERRAL' } }
                },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                    user_count: { $sum: '$total_by_user' },
                    business_count: { $sum: '$total_by_business' },
                    referral_count: { $sum: '$total_by_referral' },
                    pricing: { $sum: '$pricing' }
                  }
                }
              ],
              free: [
                {
                  $match: { started_with: { $eq: 'MO_MESSAGE' } }
                },
                {
                  $limit: 1000
                },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                    user_count: { $sum: '$total_by_user' },
                    business_count: { $sum: '$total_by_business' },
                    referral_count: { $sum: '$total_by_referral' },
                    pricing: { $sum: '$pricing' }
                  }
                }
              ]
            }
          }
        ])
        .toArray();
  
      // Transform the result
      const [data] = result;
      
      // Calcular el pricing final (total - free)
      const totalPricing = data.all[0]?.pricing || 0;
      const freePricing = data.free[0]?.pricing || 0;
      const finalPricing = totalPricing - freePricing;
  
      return {
        all: {
          ...data.all[0] || {
            count: 0,
            user_count: 0,
            business_count: 0,
            referral_count: 0,
            pricing: 0
          }
        },
        paid: {
          ...(data.paid[0] || {
            count: 0,
            user_count: 0,
            business_count: 0,
            referral_count: 0,
            pricing: 0
          }),
          // Agregar el pricing final
          final_pricing: finalPricing
        },
        free: data.free[0] || {
          count: 0,
          user_count: 0,
          business_count: 0,
          referral_count: 0,
          pricing: 0
        }
      };
    } catch (error) {
      console.error('Error in getBillingConversations:', error);
      throw new Error('Failed to fetch billing conversations');
    }
  }

  // Función helper para redondear a 2 decimales
  private roundToTwoDecimals(num: number): number {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  async getBillingConversations2(
    uri: string,
    dbName: string,
    accountUid: string,
    startDate: string,
    endDate: string,
    channelIdentifier?: string,
  ) {
    const db = await this.mongoService.connectToDatabase(uri, dbName);
    
    // Parse and validate dates
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      throw new Error('Invalid date format. Please use YYYY-MM-DD format');
    }

    // Ajustamos las fechas para incluir el día completo
    parsedStartDate.setUTCHours(0, 0, 0, 0);  // Inicio del día en UTC
    
    // Para la fecha final, vamos al siguiente día a las 00:00
    const adjustedEndDate = new Date(parsedEndDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
    adjustedEndDate.setUTCHours(0, 0, 0, 0);

    try {
      const matchStage: any = {
        account_uid: new ObjectId(accountUid),
        created_on: { 
          $gte: parsedStartDate, 
          $lt: adjustedEndDate  // Usamos < siguiente día en lugar de <= fecha actual
        },
        channel_type: 'WABA'
      };

      // Add channel_identifier to match if provided
      if (channelIdentifier) {
        matchStage.channel_identifier = channelIdentifier;
      }

      const result = await db
        .collection('billing_conversations')
        .aggregate([
          {
            $match: matchStage
          },
          {
            $project: {
              started_with: 1,
              created_on: 1,
              total_by_user: {
                $cond: [{ $eq: ['$started_with', 'MO_MESSAGE'] }, 1, 0]
              },
              total_by_business: {
                $cond: [{ $eq: ['$started_with', 'MT_TEMPLATE'] }, 1, 0]
              },
              total_by_referral: {
                $cond: [{ $eq: ['$started_with', 'MO_REFERRAL'] }, 1, 0]
              },
              pricing: {
                $cond: [
                  { $eq: ['$started_with', 'MT_TEMPLATE'] },
                  0.0741,
                  { $cond: [{ $eq: ['$started_with', 'MO_MESSAGE'] }, 0.0444, 0] }
                ]
              }
            }
          },
          {
            $facet: {
              all: [
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                    user_count: { $sum: '$total_by_user' },
                    business_count: { $sum: '$total_by_business' },
                    referral_count: { $sum: '$total_by_referral' },
                    pricing: { $sum: '$pricing' }
                  }
                }
              ],
              paid: [
                {
                  $match: { started_with: { $ne: 'MO_REFERRAL' } }
                },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                    user_count: { $sum: '$total_by_user' },
                    business_count: { $sum: '$total_by_business' },
                    referral_count: { $sum: '$total_by_referral' },
                    pricing: { $sum: '$pricing' }
                  }
                }
              ],
              free: [
                {
                  $match: { started_with: { $eq: 'MO_MESSAGE' } }
                },
                {
                  $limit: 1000
                },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                    user_count: { $sum: '$total_by_user' },
                    business_count: { $sum: '$total_by_business' },
                    referral_count: { $sum: '$total_by_referral' },
                    pricing: { $sum: '$pricing' }
                  }
                }
              ]
            }
          }
        ])
        .toArray();

      const [data] = result;
      
      // Hacemos el redondeo después de obtener los resultados
      const totalPricing = this.roundToTwoDecimals(data.all[0]?.pricing || 0);
      const freePricing = this.roundToTwoDecimals(data.free[0]?.pricing || 0);
      const finalPricing = this.roundToTwoDecimals(totalPricing - freePricing);

      return {
        all: {
          ...data.all[0] || {
            count: 0,
            user_count: 0,
            business_count: 0,
            referral_count: 0,
            pricing: 0.00
          },
          pricing: totalPricing  // Aseguramos que pricing esté redondeado
        },
        paid: {
          ...(data.paid[0] || {
            count: 0,
            user_count: 0,
            business_count: 0,
            referral_count: 0,
            pricing: 0.00
          }),
          pricing: this.roundToTwoDecimals(data.paid[0]?.pricing || 0),  // Redondeamos pricing
          final_pricing: finalPricing
        },
        free: {
          ...(data.free[0] || {
            count: 0,
            user_count: 0,
            business_count: 0,
            referral_count: 0,
            pricing: 0.00
          }),
          pricing: freePricing  // Aseguramos que pricing esté redondeado
        }
      };
    } catch (error) {
      console.error('Error in getBillingConversations:', error);
      throw new Error('Failed to fetch billing conversations');
    }
  }
}
