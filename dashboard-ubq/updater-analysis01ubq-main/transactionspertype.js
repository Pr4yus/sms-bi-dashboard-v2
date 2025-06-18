const { MongoClient, ObjectId } = require('mongodb');
const { DateTime } = require('luxon');
const { NumberInt } = require('mongodb');

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
            database: 'csm_hn_claro'
        },
        CR: {
            host: 'mongo01-claro-csm-cr.im.local',
            database: 'csm_cr_claro'
        },
        TIGO_HN: {
            host: 'mongo01-tigo-csm-hnec.im.local',
            database: 'csm_hn_tigo'
        },
        CARG: {
            host: 'mongo01-claro-csm-carg.im.local',
            database: 'csm_carg_claro'
        },
        REACH: {
            host: 'mongo01-ubiquo-csm-ww.im.local,mongo02-ubiquo-csm-ww.im.local',
            database: 'csm_ww_reach'
        }
    }
};

async function processDay(db, day) {
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
                channel_type: "SMS",
                direction: "OUT"
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
            $facet: {
                ok: [
                    {
                        $group: {
                            _id: {
                                account_uid: "$account_uid",
                                date: day.toFormat('yyyy-MM-dd')
                            },
                            account_name: { $first: { $arrayElemAt: ["$account_info.name", 0] } },
                            sms_ok: { $sum: { $subtract: ["$sms_parts", "$error_count"] } },
                            sms_error: { $sum: "$error_count" }
                        }
                    },
                    {
                        $match: {
                            sms_ok: { $gt: 0 }
                        }
                    }
                ],
                error: [
                    {
                        $match: { delivery_status: "ERROR" }
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
                                date: day.toFormat('yyyy-MM-dd'),
                                error_code: "$delivery_error_code"
                            },
                            account_name: { $first: { $arrayElemAt: ["$account_info.name", 0] } },
                            error_description: { $first: { $arrayElemAt: ["$error_info.description", 0] } },
                            total: { $sum: 1 }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                account_uid: "$_id.account_uid",
                                date: "$_id.date"
                            },
                            account_name: { $first: "$account_name" },
                            total_errors: { $sum: "$total" },
                            error_details: {
                                $push: {
                                    error_code: "$_id.error_code",
                                    error_description: "$error_description",
                                    total: "$total"
                                }
                            }
                        }
                    }
                ]
            }
        }
    ], { allowDiskUse: true }).toArray();

    const formattedResults = [];

    // Procesar OK
    results[0].ok.forEach(result => {
        formattedResults.push({
            datetime: day.toFormat('yyyy-MM-dd'),
            account_uid: new ObjectId(result._id.account_uid),
            client_id: result.account_name ? result.account_name.toUpperCase().replace(/\s+/g, '_') : "UNKNOWN",
            account_name: result.account_name || "Cuenta Desconocida",
            type: "OK",
            total: parseInt(result.sms_ok),
            error_code: null,
            error_description: null,
            last_updated: new Date(),
            updated_by: 'system'
        });
    });

    // Procesar ERROR
    results[0].error.forEach(result => {
        formattedResults.push({
            datetime: day.toFormat('yyyy-MM-dd'),
            account_uid: new ObjectId(result._id.account_uid),
            client_id: result.account_name ? result.account_name.toUpperCase().replace(/\s+/g, '_') : "UNKNOWN",
            account_name: result.account_name || "Cuenta Desconocida",
            type: "ERROR",
            total_errors: parseInt(result.total_errors),
            error_details: result.error_details.map(detail => ({
                error_code: detail.error_code ? parseInt(detail.error_code) : null,
                error_description: detail.error_description,
                total: parseInt(detail.total)
            })),
            last_updated: new Date(),
            updated_by: 'system'
        });
    });

    if (formattedResults.length > 0) {
        await db.collection('transactionspertype').insertMany(formattedResults);
        console.log(`- Insertados ${formattedResults.length} registros para el día ${day.toFormat('yyyy-MM-dd')}`);
    }

    return formattedResults.length;
}

async function getLastProcessedDate(db) {
    // Obtener la última fecha procesada sin filtros adicionales
    const lastRecord = await db.collection('transactionspertype')
        .find({})
        .sort({ datetime: -1 })
        .limit(1)
        .toArray();

    if (lastRecord && lastRecord.length > 0) {
        // Convertir la fecha string a DateTime
        const lastDate = DateTime.fromFormat(lastRecord[0].datetime, 'yyyy-MM-dd');
        const nextDate = lastDate.plus({ days: 1 });
        
        console.log(`Última fecha en BD: ${lastRecord[0].datetime}`);
        console.log(`Procesando siguiente día: ${nextDate.toFormat('yyyy-MM-dd')}`);
        
        return nextDate;
    }

    // Si no hay registros, comenzar desde ayer
    const yesterday = DateTime.now().minus({ days: 1 });
    console.log(`No hay registros previos, comenzando desde: ${yesterday.toFormat('yyyy-MM-dd')}`);
    return yesterday;
}

async function processCountry(country) {
    let mongoClient;
    
    try {
        console.log(`\nConectando a MongoDB para ${country}...`);
        mongoClient = new MongoClient(`mongodb://${config.mongodb[country].host}:27017/?replicaSet=ubiquo-rs1`, {
            readPreference: 'secondary'
        });
        await mongoClient.connect();
        
        const db = mongoClient.db(config.mongodb[country].database);
        
        // Obtener la última fecha procesada
        const dateToProcess = await getLastProcessedDate(db);
        
        console.log(`Procesando día: ${dateToProcess.toFormat('yyyy-MM-dd')}`);

        const processedCount = await processDay(db, dateToProcess);
        console.log(`Total de registros procesados para ${country}: ${processedCount}`);

    } catch (error) {
        console.error(`Error en ${country}:`, error);
    } finally {
        if (mongoClient) await mongoClient.close();
    }
}

async function main() {
    try {
        let args = process.argv.slice(2);
        const targetInstance = args[0];
        
        if (targetInstance) {
            if (!config.mongodb[targetInstance]) {
                console.error(`Instancia "${targetInstance}" no encontrada`);
                console.log('Instancias disponibles:', Object.keys(config.mongodb).join(', '));
                return;
            }
            await processCountry(targetInstance);
        } else {
            const countries = ['GT', 'CA-SV', 'CA-NI','CA-HN', 'CR', 'TIGO_HN', 'CARG', 'REACH'];
            for (const country of countries) {
                await processCountry(country);
            }
        }
        
        console.log("\n¡Proceso completado!");
    } catch (error) {
        console.error("Error en el proceso principal:", error);
    }
}

main(); 