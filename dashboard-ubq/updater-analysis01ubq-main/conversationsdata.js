const { MongoClient, ObjectId } = require('mongodb');
const mysql = require('mysql2/promise');
const { DateTime } = require('luxon');

// Configuración de MongoDB
const MONGODB_HOST = 'mongo01-ubiquo-csm-ww.im.local';
const MONGODB_PORT = '27017';
const MONGODB_TIMEOUT = 6000;
const URI_CONNECTION = `mongodb://${MONGODB_HOST}:${MONGODB_PORT}/`;

// Configuración de MariaDB
const mariaDbConfig = {
    host: 'db01-ubiquo-csm-ww.im.local',
    user: 'csm',
    password: '$csm123',
    database: 'csm_ww_reach'
};

const EXCLUDED_ACCOUNTS = [
 
];

const FEATURES_ENABLED = ["conversation"];

// Constantes para clasificación de tiempos
const TIME_RANGES = {
    MORNING: { start: 6, end: 11 },    // 6:00 - 11:59
    AFTERNOON: { start: 12, end: 17 }, // 12:00 - 17:59
    EVENING: { start: 18, end: 23 },   // 18:00 - 23:59
    NIGHT: { start: 0, end: 5 }        // 00:00 - 5:59
};

// Constantes para indicadores de calidad
const QUALITY_THRESHOLDS = {
    QUICK_RESPONSE: 300,    // 5 minutos en segundos
    DELAYED_RESPONSE: 3600, // 1 hora en segundos
};

async function getLastProcessedDate() {
    const client = new MongoClient(URI_CONNECTION, { serverSelectionTimeoutMS: MONGODB_TIMEOUT });
    try {
        await client.connect();
        const dbReports = client.db('csm_ww_reachReports');
        const collection = dbReports.collection('conversationsinsightsdata');
        
        const lastRecord = await collection.find()
            .sort({ date: -1 })
            .limit(1)
            .toArray();
            
        if (lastRecord.length > 0) {
            // Convertir la fecha string a DateTime y agregar un día
            const lastDate = DateTime.fromFormat(lastRecord[0].date, 'yyyy-MM-dd');
            const nextDate = lastDate.plus({ days: 1 });
            
            console.log(`Última fecha en BD: ${lastRecord[0].date}`);
            console.log(`Procesando siguiente día: ${nextDate.toFormat('yyyy-MM-dd')}`);
            
            return nextDate;
        }
        
        // Si no hay registros, comenzar desde ayer
        const yesterday = DateTime.now().minus({ days: 1 });
        console.log(`No hay registros previos, comenzando desde: ${yesterday.toFormat('yyyy-MM-dd')}`);
        return yesterday;
    } finally {
        await client.close();
    }
}

async function processDateRange(startDate, endDate) {
    const client = new MongoClient(URI_CONNECTION, { 
        serverSelectionTimeoutMS: MONGODB_TIMEOUT,
        readPreference: 'secondary'
    });

    try {
        await client.connect();
        const dbReach = client.db('csm_ww_reach');
        const dbReports = client.db('csm_ww_reachReports');
        const conversationsInsightsData = dbReports.collection('conversationsinsightsdata');

        // Solo procesar un día
        const dateToProcess = startDate;
        console.log(`\nProcesando fecha: ${dateToProcess.toFormat('yyyy-MM-dd')}`);
        
        // Ajustar el rango UTC (06:00 a 05:59:59 del día siguiente)
        const dayStartUTC = dateToProcess.set({ hour: 6, minute: 0, second: 0, millisecond: 0 });
        const dayEndUTC = dateToProcess.plus({ days: 1 }).set({ hour: 5, minute: 59, second: 59, millisecond: 999 });

        console.log(`Rango UTC:`);
        console.log(`  Desde: ${dayStartUTC.toUTC().toFormat('yyyy-MM-dd HH:mm:ss')} UTC`);
        console.log(`  Hasta: ${dayEndUTC.toUTC().toFormat('yyyy-MM-dd HH:mm:ss')} UTC`);

        // Obtener cuentas con conversaciones
        const accountsWithConversations = await dbReach.collection('conversations')
            .distinct('account_uid', {
                created_on: {
                    $gte: dayStartUTC.toJSDate(),
                    $lte: dayEndUTC.toJSDate()
                }
            });

        console.log(`Procesando ${accountsWithConversations.length} cuentas con conversaciones`);

        for (const accountId of accountsWithConversations) {
            const account = await dbReach.collection('accounts').findOne({ _id: accountId });
            if (!account) {
                console.log(`- Cuenta ${accountId} no encontrada, omitiendo...`);
                continue;
            }

            // Si hay conversaciones, obtener los datos detallados
            const conversations = await dbReach.collection('conversations').aggregate([
                {
                    $match: {
                        created_on: {
                            $gte: dayStartUTC.toJSDate(),
                            $lte: dayEndUTC.toJSDate()
                        },
                        account_uid: accountId
                    }
                },
                {
                    $group: {
                        _id: "$channel_type",
                        total: { $sum: 1 },
                        incoming_messages: { $sum: "$incoming_messages" },
                        outgoing_messages: { $sum: "$outgoing_messages" },
                        total_response_time: { $sum: "$total_response_time" },
                        total_responses: { $sum: "$total_responses" },
                        first_replies: {
                            $push: {
                                $cond: [
                                    { $ifNull: ["$first_reply.seconds", false] },
                                    "$first_reply.seconds",
                                    null
                                ]
                            }
                        },
                        new_profiles: {
                            $sum: { $cond: [{ $eq: ["$is_new_profile", true] }, 1, 0] }
                        },
                        closed_conversations: {
                            $sum: { $cond: [{ $eq: ["$state", "CLOSED"] }, 1, 0] }
                        },
                        unanswered_conversations: {
                            $sum: { $cond: [{ $eq: ["$unanswered", true] }, 1, 0] }
                        },
                        time_distribution: {
                            $push: {
                                hour: { $hour: "$created_on" },
                                count: 1
                            }
                        },
                        conversation_durations: {
                            $push: {
                                $subtract: ["$valid_thru", "$valid_since"]
                            }
                        }
                    }
                }
            ]).toArray();

            if (!conversations || conversations.length === 0) {
                console.log(`- Error: No se pudieron obtener datos para la cuenta ${accountId}`);
                continue;
            }

            // Calcular totales
            const totalConversations = conversations.reduce((sum, channel) => sum + channel.total, 0);

            // Procesar datos por hora para encontrar picos
            const hourlyData = conversations.reduce((acc, channel) => {
                channel.time_distribution.forEach(({ hour, count }) => {
                    acc[hour] = (acc[hour] || 0) + count;
                });
                return acc;
            }, {});

            const peakHour = Object.entries(hourlyData)
                .reduce((max, [hour, count]) => count > max.count ? {hour: parseInt(hour), count} : max, 
                    {hour: 0, count: 0});

            // Procesamiento de los resultados
            const record = {
                date: dateToProcess.toFormat('yyyy-MM-dd'),
                account_uid: accountId,
                account_name: account.name,
                client_id: account.client_id || 'SIN_CLIENT_ID',
                total_metrics: {
                    conversations: totalConversations,
                    profiles: {
                        new: conversations.reduce((sum, c) => sum + c.new_profiles, 0),
                        returning: conversations.reduce((sum, c) => sum + (c.total - c.new_profiles), 0),
                        conversion_rate: ((conversations.reduce((sum, c) => sum + (c.total - c.new_profiles), 0) / 
                                     conversations.reduce((sum, c) => sum + c.new_profiles, 0)) * 100).toFixed(1)
                    },
                    engagement: {
                        avg_session_duration: Math.round(
                            conversations.reduce((sum, c) => {
                                const durations = c.conversation_durations.filter(d => d != null);
                                return sum + (durations.reduce((a, b) => a + b, 0) / durations.length);
                            }, 0) / conversations.length / 1000 // convertir a segundos
                        ),
                        response_rate: (
                            (conversations.reduce((sum, c) => sum + (c.total - c.unanswered_conversations), 0) / 
                            totalConversations) * 100
                        ).toFixed(1),
                        completion_rate: (
                            (conversations.reduce((sum, c) => sum + c.closed_conversations, 0) / 
                            totalConversations) * 100
                        ).toFixed(1)
                    },
                    peak_hours: {
                        busiest_hour: peakHour.hour,
                        quietest_hour: Object.entries(hourlyData)
                            .reduce((min, [hour, count]) => count < min.count ? {hour: parseInt(hour), count} : min,
                                {hour: 0, count: Infinity}).hour,
                        weekend_percentage: "0.0" // Implementar lógica de fin de semana
                    }
                },
                channels: conversations.map(channel => ({
                    channel: channel._id,
                    metrics: {
                        conversations: {
                            total: channel.total,
                            new_profiles: channel.new_profiles,
                            returning_profiles: channel.total - channel.new_profiles
                        },
                        response_times: {
                            first_reply_seconds: channel.first_replies.filter(t => t != null).length > 0 ?
                                Math.round(
                                    channel.first_replies.filter(t => t != null)
                                    .reduce((a, b) => a + b, 0) / 
                                    channel.first_replies.filter(t => t != null).length
                                ) : null,
                            avg_response_seconds: channel.total_responses > 0 ?
                                Math.round(channel.total_response_time / channel.total_responses) : null
                        },
                        message_patterns: {
                            avg_messages_per_conversation: Math.round(
                                (channel.incoming_messages + channel.outgoing_messages) / channel.total
                            ),
                            messages_distribution: {
                                incoming: channel.incoming_messages,
                                outgoing: channel.outgoing_messages
                            }
                        },
                        quality_indicators: {
                            response_rate: (
                                ((channel.total - channel.unanswered_conversations) / channel.total) * 100
                            ).toFixed(1),
                            completion_rate: (
                                (channel.closed_conversations / channel.total) * 100
                            ).toFixed(1)
                        }
                    }
                })),
                channel_distribution: conversations.map(channel => ({
                    channel: channel._id,
                    percentage: ((channel.total / totalConversations) * 100).toFixed(1)
                })),
                last_updated: new Date(),
                updated_by: "system"
            };

            await conversationsInsightsData.insertOne(record);
            console.log(`Inserted record for account ${account.name} on ${dateToProcess.toFormat('yyyy-MM-dd')}`);
        }

    } catch (error) {
        console.error('Error general:', error);
    } finally {
        await client.close();
        console.log('Conexión cerrada');
    }
}

async function main() {
    try {
        // Obtener la última fecha procesada
        const startDate = await getLastProcessedDate();
        // Procesar hasta ayer (para asegurar datos completos)
        const endDate = DateTime.now().minus({ days: 1 });

        console.log('Iniciando proceso de actualización de datos de conversaciones');
        console.log(`Última fecha procesada: ${startDate.toFormat('yyyy-MM-dd')}`);
        console.log(`Procesando hasta: ${endDate.toFormat('yyyy-MM-dd')}`);

        await processDateRange(startDate, endDate);
        
    } catch (error) {
        console.error('Error en el proceso principal:', error);
    }
}

// Eliminar el manejo de argumentos de línea de comandos y simplemente ejecutar main
main(); 