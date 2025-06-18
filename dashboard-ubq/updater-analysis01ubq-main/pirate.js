const { MongoClient } = require("mongodb");
const { DateTime } = require("luxon");

const MONGO_URI = "mongodb://mongo01-ubiquo-csm-ww.im.local,mongo02-ubiquo-csm-ww.im.local/?replicaSet=ubiquo-rs1";
const DATABASE_NAME = "csm_ww_reach";

const PAYMENT_KEYWORDS = [
    // QPay - EXTERNAL (solo links de pago)
    {
        pattern: 'https?://(payments|sandbox)\\.qpaypro\\.com\\/checkout\\/',
        type: 'EXTERNAL',
        processor: 'QPay Pro',
        domain: 'qpaypro.com'
    },
    {
        pattern: 'https?://checkout\\.qpaypro\\.com\\/',
        type: 'EXTERNAL',
        processor: 'QPay Pro',
        domain: 'qpaypro.com'
    },

    // QPay - Informativo (no son links de pago)
    {
        pattern: 'https?://(www\\.)?qpaypro\\.com\\/(payments|planes|info)',
        type: 'INFORMATIVE',
        processor: 'QPay Pro Info',
        domain: 'qpaypro.com'
    },

    // === BANCOS ===
    // BAC Credomatic (unificado)
    {
        pattern: 'checkout\\.baccredomatic\\.com\\/',
        type: 'EXTERNAL',
        processor: 'BAC Credomatic',
        domain: 'baccredomatic.com'
    },
    {
        pattern: 'https?://[^\\s]*baccredomatic\\.[a-zA-Z.]+\\/[^\\s]*',
        type: 'EXTERNAL',
        processor: 'BAC Credomatic',
        domain: 'baccredomatic.com'
    },
    {
        pattern: 'https?://[^\\s]*credomatic\\.[a-zA-Z.]+\\/[^\\s]*',
        type: 'EXTERNAL',
        processor: 'BAC Credomatic',
        domain: 'baccredomatic.com'
    },

    // Banco Industrial

    {
        pattern: 'https?://[^\\s]*bienlinea\\.[a-zA-Z.]+\\/[^\\s]*',
        type: 'EXTERNAL',
        processor: 'Banco Industrial',
        domain: 'bienlinea.com'
    },

    // === PROCESADORES DE PAGO ===
    // Neolink con más variantes
    {
        pattern: 'pay\\.neolink\\.[a-zA-Z.]+\\/',
        type: 'EXTERNAL',
        processor: 'Neolink',
        domain: 'neolink.com'
    },
    {
        pattern: 'https?://[^\\s]*(neolink|neo-link)\\.[a-zA-Z.]+\\/[^\\s]*',
        type: 'EXTERNAL',
        processor: 'Neolink',
        domain: 'neolink.com'
    },

    // Visanet consolidado
    {
        pattern: 'https?://[^\\s]*(visanet|visanetgt)\\.[a-zA-Z.]+\\/[^\\s]*',
        type: 'EXTERNAL',
        processor: 'Visanet',
        domain: 'visanet.com.gt'
    },

    // === BILLETERAS DIGITALES ===
    // Tigo Money con más variantes
    {
        pattern: 'https?://[^\\s]*(tigomoney|tigo\\.money|tigo-money)\\.[a-zA-Z.]+\\/[^\\s]*',
        type: 'EXTERNAL',
        processor: 'Tigo Money',
        domain: 'tigomoney.com.gt'
    },

    // Reach domains - INTERNAL
    {
        pattern: 'https?://(pay|checkout)\\.reach\\.tools\\/[^\\s]*',
        type: 'INTERNAL',
        processor: 'Reach',
        domain: 'reach.tools'
    },

    // === EXTERNAL ===
    {
        pattern: '^(?!.*reach\\.).*\\.(com|net|gt)\\/payment',
        type: 'EXTERNAL',
        processor: 'Other',
        domain: 'various'
    },

    // === EXTERNAL ===
    {
        pattern: 'https?://[^\\s]*linkdepagos\\.redserfinsa\\.com\\/[^\\s]*',
        type: 'EXTERNAL',
        processor: 'Serfinsa',
        domain: 'redserfinsa.com'
    },

    // === EXTERNAL ===
    {
        pattern: 'https?://[^\\s]*pago\\.com\\/[^\\s]*',
        type: 'EXTERNAL',
        processor: 'Pago.com',
        domain: 'pago.com'
    },

    // === EXTERNAL ===
    {
        pattern: 'https?://[^\\s]*ficohsa\\.[a-zA-Z.]+\\/[^\\s]*',
        type: 'EXTERNAL',
        processor: 'Ficohsa',
        domain: 'ficohsa.com'
    },
    {
        pattern: 'https?://[^\\s]*ficohsapagos\\.[a-zA-Z.]+\\/[^\\s]*',
        type: 'EXTERNAL',
        processor: 'Ficohsa',
        domain: 'ficohsapagos.com'
    },

    // **Banco G&T - EXTERNAL**
    {
        pattern: 'https?://(pagos|payments)\\.gyt\\.com\\.gt\\/[^\\s]*',
        type: 'EXTERNAL',
        processor: 'Banco G&T',
        domain: 'gyt.com.gt'
    },
    {
        pattern: 'https?://gyt\\.com\\.gt\\/(pagos|payments)\\/[^\\s]*',
        type: 'EXTERNAL',
        processor: 'Banco G&T',
        domain: 'gyt.com.gt'
    },
    {
        pattern: 'https?://[^\\s]*gytcontinental\\.(com|com\\.gt)\\/checkout\\/[^\\s]*',
        type: 'EXTERNAL',
        processor: 'Banco G&T',
        domain: 'gytcontinental.com'
    },

    // === EXTERNAL ===
    {
        pattern: 'https?://[^\\s]*banrural\\.[a-zA-Z.]+\\/[^\\s]*',
        type: 'EXTERNAL',
        processor: 'Banrural',
        domain: 'banrural.com.gt'
    },

    // === EXTERNAL ===
    {
        pattern: 'https?://[^\\s]*promerica\\.[a-zA-Z.]+\\/[^\\s]*',
        type: 'EXTERNAL',
        processor: 'Promerica',
        domain: 'promerica.com'
    },
    {
        pattern: 'https?://[^\\s]*promericagt\\.[a-zA-Z.]+\\/[^\\s]*',
        type: 'EXTERNAL',
        processor: 'Promerica',
        domain: 'promericagt.com'
    },

    // === EXTERNAL ===
    {
        pattern: 'https?://[^\\s]*bancoazteca\\.[a-zA-Z.]+\\/[^\\s]*',
        type: 'EXTERNAL',
        processor: 'Banco Azteca',
        domain: 'bancoazteca.com.gt'
    },

    // === EXTERNAL ===
    {
        pattern: 'https?://[^\\s]*bantrab\\.[a-zA-Z.]+\\/[^\\s]*',
        type: 'EXTERNAL',
        processor: 'Bantrab',
        domain: 'bantrab.com.gt'
    },

    // === EXTERNAL ===
    {
        pattern: 'https?://[^\\s]*pagosmoviles\\.[a-zA-Z.]+\\/[^\\s]*',
        type: 'EXTERNAL',
        processor: 'Pagos Móviles',
        domain: 'pagosmoviles.com'
    },

    // === EXTERNAL ===
    {
        pattern: 'https?://[^\\s]*ebilling\\.[a-zA-Z.]+\\/[^\\s]*',
        type: 'EXTERNAL',
        processor: 'E-Billing',
        domain: 'ebilling.com'
    },

    // === AGREGAR NUEVOS PATRONES PARA URLS ESPECÍFICAS ===
    {
        pattern: '^(?!.*baccredomatic)(?!.*credomatic)(?!.*qpaypro)(?!.*reach).*checkout\\.[a-zA-Z.]+\\/[^\\s]*',
        type: 'EXTERNAL',
        processor: 'Generic Checkout',
        domain: 'various'
    },
    {
        pattern: '^(?!.*baccredomatic)(?!.*credomatic)(?!.*qpaypro)(?!.*reach).*payment(s)?\\.[a-zA-Z.]+\\/[^\\s]*',
        type: 'EXTERNAL',
        processor: 'Generic Payment',
        domain: 'various'
    }
].map(item => ({
    regex: new RegExp(item.pattern, 'i'),
    type: item.type,
    processor: item.processor,
    domain: item.domain
}));

async function processDay(db, day) {
    // Ajustamos el día para que vaya de 06:00 a 05:59 UTC
    const dayStart = day.set({ hour: 6, minute: 0, second: 0, millisecond: 0 });
    const dayEnd = day.plus({ days: 1 }).set({ hour: 5, minute: 59, second: 59, millisecond: 999 });

    console.log(`\nProcesando fecha: ${day.toFormat('yyyy-MM-dd')}`);
    console.log(`Rango UTC:`);
    console.log(`  Desde: ${dayStart.toUTC().toFormat('yyyy-MM-dd HH:mm:ss')} UTC`);
    console.log(`  Hasta: ${dayEnd.toUTC().toFormat('yyyy-MM-dd HH:mm:ss')} UTC`);

    const results = await db.collection('transactions').aggregate([
        {
            $match: {
                datetime: {
                    $gte: dayStart.toJSDate(),
                    $lt: dayEnd.toJSDate()
                },
                conversation_uid: { $exists: true },
                $or: PAYMENT_KEYWORDS.map(item => ({
                    content: { $regex: item.regex.source, $options: 'i' }
                }))
            }
        },
        {
            $lookup: {
                from: "conversations",
                localField: "conversation_uid",
                foreignField: "_id",
                as: "conversation_info"
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
            $addFields: {
                payment_info: {
                    $reduce: {
                        input: PAYMENT_KEYWORDS,
                        initialValue: { type: "UNKNOWN", processor: "Unknown", domain: "unknown" },
                        in: {
                            $cond: [
                                { $regexMatch: { input: "$content", regex: "$$this.regex" } },
                                { 
                                    type: "$$this.type",
                                    processor: "$$this.processor",
                                    domain: "$$this.domain"
                                },
                                "$$value"
                            ]
                        }
                    }
                }
            }
        },
        {
            $group: {
                _id: {
                    account_uid: "$account_uid",
                    date: day.toFormat('yyyy-MM-dd')  // Usar la fecha del día que estamos procesando
                },
                account_name: { $first: { $arrayElemAt: ["$account_info.name", 0] } },
                total_links: { $sum: 1 },
                processors_detail: {
                    $push: {
                        type: "$payment_info.type",
                        processor: "$payment_info.processor",
                        domain: "$payment_info.domain"
                    }
                },
                processor_counts: {
                    $addToSet: {
                        k: "$payment_info.processor",
                        v: {
                            count: 1,
                            type: "$payment_info.type",
                            domain: "$payment_info.domain"
                        }
                    }
                },
                internal_count: {
                    $sum: {
                        $cond: [{ $eq: ["$payment_info.type", "INTERNAL"] }, 1, 0]
                    }
                },
                external_count: {
                    $sum: {
                        $cond: [{ $eq: ["$payment_info.type", "EXTERNAL"] }, 1, 0]
                    }
                },
                links: {
                    $push: {
                        conversation_uid: "$conversation_uid",
                        alias: { $arrayElemAt: ["$conversation_info.alias", 0] },
                        channel_type: { $arrayElemAt: ["$conversation_info.channel_type", 0] },
                        content: "$content",
                        direction: "$direction",
                        datetime: "$datetime",
                        payment_info: {
                            type: "$payment_info.type",
                            processor: "$payment_info.processor",
                            domain: "$payment_info.domain"
                        }
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                datetime: "$_id.date",
                account_uid: "$_id.account_uid",
                account_name: { $ifNull: ["$account_name", "Cuenta Desconocida"] },
                summary: {
                    total_links: "$total_links",
                    processors: {
                        $arrayToObject: {
                            $map: {
                                input: {
                                    $setUnion: "$processor_counts"
                                },
                                as: "proc",
                                in: {
                                    k: "$$proc.k",
                                    v: {
                                        $reduce: {
                                            input: "$processors_detail",
                                            initialValue: 0,
                                            in: {
                                                $cond: [
                                                    { $eq: ["$$this.processor", "$$proc.k"] },
                                                    { $add: ["$$value", 1] },
                                                    "$$value"
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    types: {
                        INTERNAL: "$internal_count",
                        EXTERNAL: "$external_count"
                    }
                },
                processors_detail: 1,
                links: 1
            }
        },
        {
            $sort: {
                datetime: 1,
                account_name: 1
            }
        }
    ]).toArray();

    if (results.length > 0) {
        await db.collection('external_payments').insertMany(results);
        console.log(`- Insertados ${results.length} registros para el día ${day.toFormat('yyyy-MM-dd')}`);
    }

    return results.length;
}

async function getLastProcessedDate(db) {
    const lastRecord = await db.collection('external_payments')
        .find({}, { datetime: 1 })
        .sort({ datetime: -1 })
        .limit(1)
        .toArray();

    if (lastRecord && lastRecord.length > 0) {
        // Convertir la fecha string a DateTime y agregar un día
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

async function processPirateLinks() {
    let client;
    
    try {
        console.log('Conectando a MongoDB...');
        client = new MongoClient(MONGO_URI, {
            readPreference: 'secondary'
        });
        await client.connect();
        
        const db = client.db(DATABASE_NAME);
        
        // Obtener la última fecha procesada
        const dateToProcess = await getLastProcessedDate(db);
        
        console.log(`Procesando día: ${dateToProcess.toFormat('yyyy-MM-dd')}`);
        const processedCount = await processDay(db, dateToProcess);
        console.log(`Total de registros procesados: ${processedCount}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

async function main() {
    try {
        console.log('Iniciando procesamiento de links de pago...');
        await processPirateLinks();
        console.log('\nProceso completado');
    } catch (error) {
        console.error("Error general:", error);
    }
}

main(); 