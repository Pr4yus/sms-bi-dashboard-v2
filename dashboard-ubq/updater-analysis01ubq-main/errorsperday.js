const { MongoClient } = require('mongodb');
const { DateTime } = require('luxon');

const config = {
    mongodb: {
        GT: {
            host: 'mongo01-claro-csm-gt.im.local',
            database: 'csm_gt_claro'
        },
        'CA-SV': {
            host: 'mongo01-claro-csm-sv.im.local',
            database: 'csm_sv_claro'
        },
        'CA-NI': {
            host: 'mongo01-claro-csm-ni.im.local',
            database: 'csm_ni_claro'
        },
        'CA-HN': {
            host: 'mongo01-claro-csm-ca.im.local',
        database: 'csm_hn_claro',
        },
        CR: {
            host: 'mongo01-claro-csm-cr.im.local',
            database: 'csm_cr_claro'
        },
        TIGO_HN: {
            host: 'mongo01-tigo-csm-hnec.im.local',
            database: 'csm_hn_tigo',
        },

        CARG: {
            host: 'mongo01-claro-csm-carg.im.local',
            database: 'csm_carg_claro',
        },
        REACH: {
            host: 'mongo01-ubiquo-csm-ww.im.local,mongo02-ubiquo-csm-ww.im.local',
            database: 'csm_ww_reach'
        }
    }
};

async function processDay(db, day) {
    // Ajustamos el día para que vaya de 06:00 a 05:59 UTC
    const dayStart = day.set({ hour: 6, minute: 0, second: 0, millisecond: 0 });
    const dayEnd = day.plus({ days: 1 }).set({ hour: 5, minute: 59, second: 59, millisecond: 999 });

    console.log(`Procesando día: ${day.toFormat('yyyy-MM-dd')} (${dayStart.toISO()} - ${dayEnd.toISO()})`);

    const results = await db.collection('transactions').aggregate([
        {
            $match: {
                datetime: {
                    $gte: dayStart.toJSDate(),
                    $lt: dayEnd.toJSDate()
                },
                delivery_status: "ERROR",
                channel_type: "SMS"
            }
        },
        {
            $lookup: {
                from: "accounts",
                localField: "account_uid",
                foreignField: "_id",
                as: "account_info"
            }
        },
        {
            $lookup: {
                from: "dlr_status_code",
                localField: "delivery_error_code",
                foreignField: "dlr_status_code_id",
                as: "error_info"
            }
        },
        {
            $group: {
                _id: {
                    account_uid: "$account_uid",
                    error_code: "$delivery_error_code",
                    date: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$datetime"
                        }
                    }
                },
                account_name: { $first: { $arrayElemAt: ["$account_info.name", 0] } },
                error_description: { $first: { $arrayElemAt: ["$error_info.description", 0] } },
                total_errors: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                datetime: "$_id.date",
                account_uid: "$_id.account_uid",
                account_name: { $ifNull: ["$account_name", "Cuenta Desconocida"] },
                error_code: "$_id.error_code",
                error_description: { $ifNull: ["$error_description", "Sin descripción"] },
                total_errors: 1
            }
        }
    ]).toArray();

    if (results.length > 0) {
        await db.collection('errorsperday').insertMany(results);
        console.log(`- Insertados ${results.length} registros para el día ${day.toFormat('yyyy-MM-dd')}`);
    }

    return results.length;
}

async function processErrors(country, startDate, endDate) {
    let mongoClient;
    
    try {
        console.log(`\nConectando a MongoDB para ${country}...`);
        mongoClient = new MongoClient(`mongodb://${config.mongodb[country].host}:27017/?replicaSet=ubiquo-rs1`, {
            readPreference: 'secondary'
        });
        await mongoClient.connect();
        
        const db = mongoClient.db(config.mongodb[country].database);
        
        console.log(`Procesando errores del ${startDate.toFormat('yyyy-MM-dd')} al ${endDate.toFormat('yyyy-MM-dd')}...`);

        let currentDate = startDate;
        let totalProcessed = 0;

        while (currentDate < endDate) {
            const processedCount = await processDay(db, currentDate);
            totalProcessed += processedCount;
            currentDate = currentDate.plus({ days: 1 });
        }

        console.log(`Total de registros procesados para ${country}: ${totalProcessed}`);

    } catch (error) {
        console.error(`Error en ${country}:`, error);
    } finally {
        if (mongoClient) {
            await mongoClient.close();
        }
    }
}

async function main() {
    try {
        const startDate = DateTime.fromISO('2025-02-14T06:00:00Z');
        const endDate = DateTime.fromISO('2025-03-02T05:59:59Z');
        
        console.log('Procesando errores para todos los países...');

        //const countries = ['CARG'];
        const countries = ['GT', 'CA-SV', 'CA-NI', 'CR', 'TIGO_HN', 'CARG'];
        
        for (const country of countries) {
            await processErrors(country, startDate, endDate);
        }

        console.log('\nProceso completado');

    } catch (error) {
        console.error("Error general:", error);
    }
}

main();