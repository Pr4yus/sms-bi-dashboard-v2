const fs = require('fs');
const { MongoClient } = require('mongodb');
const mysql = require('mysql2/promise');
const { DateTime } = require('luxon');
const csvWriter = require('csv-writer').createObjectCsvWriter;

// Configuración de las instancias
const instances = [
    {
        name: 'GT',
        host: 'mongo01-claro-csm-gt.im.local',
        database: 'csm_gt_claro',
        collection: 'account_transactions_gtbyday',
        filePrefix: 'GTReport'
    },
    {
        name: 'CA-SV',
        host: 'mongo01-claro-csm-ca.im.local',
        database: 'csm_sv_claro',
        collection: 'account_transactions_gtbyday',
        filePrefix: 'CA-SV'
    },
    {
        name: 'CA-HN',
        host: 'mongo01-claro-csm-ca.im.local',
        database: 'csm_hn_claro',
        collection: 'account_transactions_gtbyday',
        filePrefix: 'CA-HN'
    },
    {
        name: 'CA-NI',
        host: 'mongo01-claro-csm-ca.im.local',
        database: 'csm_ni_claro',
        collection: 'account_transactions_gtbyday',
        filePrefix: 'CA-NI'
    },
    {
        name: 'CR',
        host: 'mongo01-claro-csm-cr.im.local',
        database: 'csm_cr_claro',
        collection: 'account_transactions_gtbyday',
        filePrefix: 'CR'
    },
    {
        name: 'TIGO_HN',
        host: 'mongo01-tigo-csm-hnec.im.local',
        database: 'csm_hn_tigo',
        collection: 'account_transactions_gtbyday',
        filePrefix: 'TIGO_HN'
    },
    {
        name: 'CARG',
        host: 'mongo01-claro-csm-carg.im.local',
        database: 'csm_carg_claro',
        collection: 'account_transactions_gtbyday',
        filePrefix: 'CARG'
    }
];

const EXECUTED_BY = 'christian.arias';

// Configuración base de MariaDB
const mariaDbConfigs = {
    claro: {
        host: 'db01-claro-csm-ca.im.local',
        user: 'csm',
        password: '$csm123'
    },
    tigo: {
        host: 'db01-tigo-csm-hnec.im.local',
        user: 'csm',
        password: '$csm123'
    }
};

function generateFileName(instance, startDate, endDate) {
    const start = DateTime.fromJSDate(startDate);
    const month = start.toFormat('MMM').toUpperCase();
    const year = start.toFormat('yy');
    return `${instance.filePrefix}_${month}${year}.csv`;
}

async function processDateRange(instance, startDate, endDate, shouldInsert = false) {
    let mongoClient, mariaDbConnection;
    try {
        // Determinar la configuración de MariaDB según la instancia
        const mariaConfig = {
            ...mariaDbConfigs[instance.name === 'TIGO_HN' ? 'tigo' : 'claro'],
            database: instance.database
        };

        // Conectar a MariaDB
        console.log(`Conectando a MariaDB (${mariaConfig.host})...`);
        mariaDbConnection = await mysql.createConnection(mariaConfig);
        const [mariaResults] = await mariaDbConnection.execute('SELECT client_id, account_name, account_reach_uid FROM account');
        
        const mariaDict = {};
        mariaResults.forEach(account => {
            mariaDict[account.account_reach_uid] = {
                client_id: account.client_id || 'SIN_CLIENT_ID_MARIA',
                account_name: account.account_name
            };
        });

        // MongoDB connection
        console.log(`\nProcesando instancia ${instance.name}...`);
        const URI_CONNECTION = `mongodb://${instance.host}:27017/`;
        
        mongoClient = new MongoClient(URI_CONNECTION, { serverSelectionTimeoutMS: 5000 });
        await mongoClient.connect();
        
        const db = mongoClient.db(instance.database);
        const transactionsCollection = db.collection('transactions');
        const reportCollection = db.collection(instance.collection);

        const dayTransactions = await transactionsCollection.aggregate([
            {
                $match: {
                    "direction": "OUT",
                    "channel_type": "SMS",
                    "datetime": { 
                        $gte: startDate, 
                        $lt: endDate 
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
            const recordId = `${accountUid}-${dateGTM6}`;

            return {
                updateOne: {
                    filter: { _id: recordId },
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
        const shouldInsert = true;
        
        for (const instance of instances) {
            console.log(`\nProcesando instancia ${instance.name}...`);
            
            // Obtener la última fecha procesada
            let lastDate = await getLastProcessedDate(instance);
            
            // Si no hay registros, empezar desde hace dos días
            if (!lastDate) {
                lastDate = DateTime.now().minus({ days: 2 }).startOf('day');
            }
            
            // Calcular el siguiente día a procesar
            const startDate = lastDate.plus({ days: 1 }).startOf('day');
            const endDate = startDate.endOf('day');
            
            // Calcular el rango UTC correcto para el día GTM-6
            const dayStartUTC = startDate.toUTC().plus({ hours: 6 }).toJSDate();
            const dayEndUTC = endDate.toUTC().plus({ hours: 6 }).toJSDate();
            
            // Solo procesar si el siguiente día no está en el futuro
            const now = DateTime.now();
            if (startDate >= now) {
                console.log(`Saltando ${instance.name}: Ya está actualizado`);
                continue;
            }

            console.log(`Procesando fecha: ${startDate.toFormat('yyyy-MM-dd')}`);
            await processDateRange(instance, dayStartUTC, dayEndUTC, shouldInsert);
        }
        
        console.log("\n¡Proceso completado!");
    } catch (error) {
        console.error("Error en el proceso principal:", error);
    }
}

// Ejecutar el proceso
main();