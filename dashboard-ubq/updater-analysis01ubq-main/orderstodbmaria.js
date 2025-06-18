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
    new ObjectId("5cf95b1cef9af83742f553f2"),
    new ObjectId("5fa2e2d4d6179c38e3b3c221"),
    new ObjectId("603ec74605c222419c367d09"),
    new ObjectId("6453f2dfb56797614c75ffe9"),
    new ObjectId("632c7f94979dbc70c8760cbd"),
    new ObjectId("64a880fd06f476794e8f9769"),
    new ObjectId("5d0023df8b52194e42c2988e"),
    new ObjectId("60271eff18b2fd66ba102eae"),
    new ObjectId("61f0a49352fe43048d4cea8b"),
    new ObjectId("622b6c697e302f344ebda7be"),
    new ObjectId("600225169a30ef363a25cc57"),
    new ObjectId("639c831fe2d4f65b0db912a6"),
    new ObjectId("62968651e85ab9787e4fbd19"),
    new ObjectId("648752b2e5944a082999ee41"),
    new ObjectId("65afe689bf3acd3390491e90"),
    new ObjectId("65afe689bf3acd3390491e90"),
];

// Tabla de tipos de cambio para las monedas de América
const exchangeRates = {
    GTQ: 8,
    Q: 8,
    HNL: 24.2,
    L: 24.2,
    MXN: 18.8,
    CRC: 620.5,
    NIO: 36.0,
    C$: 36.0,
    PAB: 1.0,
    USD: 1.0,
    COP: 4000.0,
    PEN: 3.6,
    BOB: 6.9,
    DOP: 54.0,
    VES: 30.5,
    ARS: 365.0,
    UYU: 40.0,
    BRL: 5.0,
    PYG: 7300.0,
};

// Mapeo de países a monedas
const countryCurrencyMap = {
  GT: { code: 'GTQ', symbol: 'Q', rate: 8 },
  HN: { code: 'HNL', symbol: 'L', rate: 24.2 },
  CR: { code: 'CRC', symbol: '₡', rate: 620.5 },
  NI: { code: 'NIO', symbol: 'C$', rate: 36.0 },
  PA: { code: 'PAB', symbol: 'B/.', rate: 1.0 },
  US: { code: 'USD', symbol: '$', rate: 1.0 },
  CO: { code: 'COP', symbol: '$', rate: 4000.0 },
  PE: { code: 'PEN', symbol: 'S/.', rate: 3.6 },
  BO: { code: 'BOB', symbol: 'Bs', rate: 6.9 },
  DO: { code: 'DOP', symbol: 'RD$', rate: 54.0 },
  VE: { code: 'VES', symbol: 'Bs.S', rate: 30.5 },
  AR: { code: 'ARS', symbol: '$', rate: 365.0 },
  UY: { code: 'UYU', symbol: '$U', rate: 40.0 },
  BR: { code: 'BRL', symbol: 'R$', rate: 5.0 },
  PY: { code: 'PYG', symbol: '₲', rate: 7300.0 },
};

async function getLastProcessedDate() {
    const client = new MongoClient(URI_CONNECTION, { serverSelectionTimeoutMS: MONGODB_TIMEOUT });
    try {
        await client.connect();
        const dbReports = client.db('csm_ww_reachReports');
        const collection = dbReports.collection('orders_bychannel');
        
        // Get the most recent date from the collection
        const lastRecord = await collection.find()
            .sort({ date: -1 })
            .limit(1)
            .toArray();
            
        return lastRecord.length > 0 ? DateTime.fromJSDate(lastRecord[0].date) : null;
    } finally {
        await client.close();
    }
}

async function AddOrdersByChannel() {
    const client = new MongoClient(URI_CONNECTION, { serverSelectionTimeoutMS: MONGODB_TIMEOUT });
    let mariaDbConnection;

    try {
        // Get the last processed date
        let lastDate = await getLastProcessedDate();
        
        // If no records found, start from yesterday
        if (!lastDate) {
            lastDate = DateTime.now().minus({ days: 2 }).startOf('day');
        }
        
        // Calculate the next day to process with correct UTC offset
        const startDate = lastDate.plus({ days: 1 }).startOf('day');
        const endDate = startDate.endOf('day');
        
        // Calcular el rango UTC correcto para el día GTM-6
        const dayStartUTC = startDate.toUTC().plus({ hours: 6 }).toJSDate();
        const dayEndUTC = endDate.toUTC().plus({ hours: 6 }).toJSDate();
        
        // Only process if the next day is not in the future
        const now = DateTime.now();
        if (startDate >= now) {
            console.log(`Skipping: Already up to date`);
            return;
        }

        console.log(`Procesando fecha: ${startDate.toFormat('yyyy-MM-dd')}`);

        await client.connect();
        const dbReach = client.db('csm_ww_reach');
        const dbReports = client.db('csm_ww_reachReports');

        // Conectar a MariaDB y obtener client_id
        console.log("Conectando a MariaDB...");
        mariaDbConnection = await mysql.createConnection(mariaDbConfig);
        const [mariaResults] = await mariaDbConnection.execute('SELECT client_id, account_reach_uid FROM account');
        const mariaDict = {};
        mariaResults.forEach(account => {
            mariaDict[account.account_reach_uid] = account.client_id || 'SIN_CLIENT_ID_MARIAREACH';
        });

        const ordersByChannelCollection = dbReports.collection('orders_bychannel');
        const ordersCollection = dbReach.collection('orders');
        const accountsCollection = dbReach.collection('accounts');

        const monthNames = [
            "January", "February", "March", "April", "May", "June", 
            "July", "August", "September", "October", "November", "December"
        ];
        const monthName = monthNames[startDate.month - 1];

        console.log(`Processing orders for date: ${startDate.toFormat('yyyy-MM-dd')}...`);

        const query = {
            status: "PAID",
            created_on: { 
                $gte: dayStartUTC, 
                $lte: dayEndUTC 
            },
            account_uid: { $nin: EXCLUDED_ACCOUNTS }
        };

        const orders = await ordersCollection.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: "accounts",
                    localField: "account_uid",
                    foreignField: "_id",
                    as: "account"
                }
            },
            { $unwind: "$account" },
            {
                $group: {
                    _id: {
                        account_uid: "$account_uid",
                        channel_type: "$channel_type",
                        payment_provider: "$payment_provider"
                    },
                    totalOrderAmount: { $sum: "$order_total" },
                    totalOrders: { $sum: 1 },
                    account_name: { $first: "$account.name" },
                    country: { $first: "$account.country" },
                    currency: { $first: { $ifNull: ["$currency", "$account.available_currencies"] } }
                }
            }
        ]).toArray();

        const bulkOps = [];
        for (const order of orders) {
            console.log(`Processing record for ${order.account_name}...`);
            
            const clientId = mariaDict[order._id.account_uid.toString()] || 'SIN_CLIENT_ID_MARIAREACH';
            let currencyData = {};

            if (Array.isArray(order.currency) && order.currency.length > 0) {
                currencyData = order.currency[0];
            } else if (order.currency && order.currency.code) {
                currencyData = order.currency;
            } else if (order.country && countryCurrencyMap[order.country]) {
                const countryCurrency = countryCurrencyMap[order.country];
                currencyData.code = countryCurrency.code;
                currencyData.symbol = countryCurrency.symbol;
            } else {
                currencyData = { code: 'Unknown', symbol: 'Unknown' };
            }

            const exchangeRate = exchangeRates[currencyData.code] || 1.0;
            const totalInUSD = (order.totalOrderAmount / exchangeRate).toFixed(2);

            const record = {
                date: startDate.toJSDate(),
                month: monthName,
                client_id: clientId,
                account_name: order.account_name,
                account_uid: order._id.account_uid,
                channel_type: order._id.channel_type,
                payment_provider: order._id.payment_provider,
                total_order_amount: order.totalOrderAmount,
                total_orders: order.totalOrders,
                currency_code: currencyData.code || 'Unknown',
                currency_symbol: currencyData.symbol || 'Unknown',
                exchange_rate: exchangeRate,
                total_in_usd: totalInUSD
            };

            bulkOps.push({
                updateOne: {
                    filter: {
                        date: record.date,
                        account_uid: record.account_uid,
                        channel_type: record.channel_type,
                        payment_provider: record.payment_provider
                    },
                    update: { $set: record },
                    upsert: true
                }
            });
        }

        if (bulkOps.length > 0) {
            const result = await ordersByChannelCollection.bulkWrite(bulkOps);
            console.log(`Datos procesados:`, {
                insertados: result.upsertedCount,
                actualizados: result.modifiedCount,
                total: result.upsertedCount + result.modifiedCount
            });
        } else {
            console.log('No se encontraron órdenes para procesar');
        }

    } catch (error) {
        console.error(`Error: ${error}`);
    } finally {
        if (mariaDbConnection) await mariaDbConnection.end();
        await client.close();
        console.log("Connections closed.");
    }
}

// Ejecutar la función
AddOrdersByChannel();
