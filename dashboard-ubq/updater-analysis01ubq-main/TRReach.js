const { MongoClient } = require('mongodb');
const mysql = require('mysql2/promise');
const { DateTime } = require('luxon');

// Configuración de las instancias de Reach
const instances = [
    {
        name: 'REACH',
        host: 'mongo01-ubiquo-csm-ww.im.local',
        database: 'csm_ww_reach',
        collection: 'account_transactions_gtbyday',
        mariaDb: {
            host: 'db01-ubiquo-csm-ww.im.local',
            user: 'csm',
            password: '$csm123',
            database: 'csm_ww_reach'
        }
    }
];

const EXECUTED_BY = 'christian.arias';

async function processDateRange(instance, startDate, endDate, shouldInsert = false) {
    let mongoClient, mariaDbConnection;
    try {
        // Conectar a MariaDB
        console.log(`Conectando a MariaDB (${instance.mariaDb.host})...`);
        mariaDbConnection = await mysql.createConnection(instance.mariaDb);
        const [mariaResults] = await mariaDbConnection.execute('SELECT client_id, account_name, account_reach_uid FROM account');
        
        const mariaDict = {};
        mariaResults.forEach(account => {
            mariaDict[account.account_reach_uid] = {
                client_id: account.client_id || 'SIN_CLIENT_ID_REACH',
                account_name: account.account_name
            };
        });

        console.log(`\nProcesando instancia ${instance.name}...`);
        const URI_CONNECTION = `mongodb://${instance.host}:27017/`;
        
        mongoClient = new MongoClient(URI_CONNECTION, { serverSelectionTimeoutMS: 5000 });
        await mongoClient.connect();
        
        const db = mongoClient.db(instance.database);
        const transactionsCollection = db.collection('transactions');
        const reportCollection = db.collection(instance.collection);

        // Calcular el rango UTC correcto para el día GTM-6
        const dayStartUTC = startDate.toUTC().plus({ hours: 6 }).toJSDate();
        const dayEndUTC = endDate.toUTC().plus({ hours: 6 }).toJSDate();

        console.log(`Procesando transacciones para la fecha: ${startDate.toFormat('yyyy-MM-dd')}...`);

        const dayTransactions = await transactionsCollection.aggregate([
            {
                $match: {
                    "direction": "OUT",
                    "channel_type": "SMS",
                    "datetime": { 
                        $gte: dayStartUTC, 
                        $lt: dayEndUTC 
                    }
                }
            },
            {
                $group: {
                    _id: {
                        account_uid: "$account_uid",
                        channel_identifier: "$channel_identifier"
                    },
                    sms_ok: { $sum: { $subtract: ["$sms_parts", "$error_count"] } },
                    sms_error: { $sum: "$error_count" },
                    datetime: { $first: "$datetime" }
                }
            }
        ], { allowDiskUse: true }).toArray();

        const bulkOps = dayTransactions.map(trans => {
            const accountUid = trans._id.account_uid.toString();
            const dateGTM6 = DateTime.fromJSDate(trans.datetime)
                .setZone('America/Guatemala')
                .toFormat('yyyy-MM-dd');
            const clientInfo = mariaDict[accountUid] || {};

            return {
                updateOne: {
                    filter: { _id: `${accountUid}-${dateGTM6}` },
                    update: {
                        $set: {
                            account_uid: accountUid,
                            client_id: clientInfo.client_id || 'Unknown',
                            account_name: clientInfo.account_name || 'Unknown',
                            channel_identifier: trans._id.channel_identifier,
                            date_gtm6: dateGTM6,
                            date: new Date(dateGTM6),
                            sms_ok: trans.sms_ok,
                            sms_error: trans.sms_error,
                            last_updated: new Date(),
                            updated_by: EXECUTED_BY
                        }
                    },
                    upsert: true
                }
            };
        });

        if (bulkOps.length > 0) {
            const result = await reportCollection.bulkWrite(bulkOps);
            console.log(`Datos procesados en ${instance.name}:`, {
                insertados: result.upsertedCount,
                actualizados: result.modifiedCount,
                total: result.upsertedCount + result.modifiedCount
            });
        } else {
            console.log(`No se encontraron transacciones para el período especificado en ${instance.name}`);
        }
    } catch (error) {
        console.error(`Error en instancia ${instance.name}: ${error.message}`);
    } finally {
        if (mariaDbConnection) await mariaDbConnection.end();
        if (mongoClient) await mongoClient.close();
    }
}

async function getLastProcessedDate(instance) {
    const mongoClient = new MongoClient(`mongodb://${instance.host}:27017/`);
    try {
        await mongoClient.connect();
        const db = mongoClient.db(instance.database);
        const collection = db.collection(instance.collection);
        
        // Get the most recent date from the collection
        const lastRecord = await collection.find()
            .sort({ date: -1 })
            .limit(1)
            .toArray();
            
        return lastRecord.length > 0 ? DateTime.fromJSDate(lastRecord[0].date) : null;
    } finally {
        await mongoClient.close();
    }
}

async function main() {
    try {
        // Process one day at a time, automatically
        const shouldInsert = true; // Always insert in auto mode
        const instance = instances[0]; // REACH instance
        
        console.log(`\nProcesando instancia ${instance.name}...`);
        
        // Get the last processed date
        let lastDate = await getLastProcessedDate(instance);
        
        // If no records found, start from yesterday
        if (!lastDate) {
            lastDate = DateTime.now().minus({ days: 2 }).startOf('day');
        }
        
        // Calculate the next day to process
        const startDate = lastDate.plus({ days: 1 }).startOf('day');
        const endDate = startDate.endOf('day');
        
        // Only process if the next day is not in the future
        const now = DateTime.now();
        if (startDate >= now) {
            console.log(`Skipping ${instance.name}: Already up to date`);
            return;
        }

        console.log(`Procesando fecha: ${startDate.toFormat('yyyy-MM-dd')}`);
        await processDateRange(instance, startDate, endDate, shouldInsert);
        
        console.log("\n¡Proceso completado!");
    } catch (error) {
        console.error("Error en el proceso principal:", error);
    }
}

// Ejecutar el proceso
main();
