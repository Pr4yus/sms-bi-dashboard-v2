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
  // ... (otros ObjectId excluidos)
];
const FEATURES_ENABLED = ["conversation"];

async function getLastProcessedDate() {
    const client = new MongoClient(URI_CONNECTION, { serverSelectionTimeoutMS: MONGODB_TIMEOUT });
    try {
        await client.connect();
        const dbReports = client.db('csm_ww_reachReports');
        const collection = dbReports.collection('conversations_account_type');
        
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

async function AddConversationPerAccountDays() {
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

        // Connect to MariaDB
        console.log("Conectando a MariaDB...");
        mariaDbConnection = await mysql.createConnection(mariaDbConfig);
        const [mariaResults] = await mariaDbConnection.execute('SELECT client_id, account_reach_uid FROM account');
        const mariaDict = {};
        mariaResults.forEach(account => {
            mariaDict[account.account_reach_uid] = account.client_id || 'SIN_CLIENT_ID';
        });

        const conversationsCollection = dbReach.collection('conversations');
        const accountsCollection = dbReach.collection('accounts');
        const conversationsAccountType = dbReports.collection('conversations_account_type');

        const eligibleAccounts = await accountsCollection.find({
            "reach.partner": { $exists: false },
            _id: { $nin: EXCLUDED_ACCOUNTS },
            "csms.features_enabled": { $in: FEATURES_ENABLED }
        }).toArray();
        
        const eligibleAccountIds = eligibleAccounts.map(account => account._id);
        
        console.log("Processing conversations for the day...");

        const query = {
            created_on: { $gte: dayStartUTC, $lte: dayEndUTC },
            account_uid: { $in: eligibleAccountIds }
        };

        const conversations = await conversationsCollection.aggregate([
            { $match: query },
            {
                $group: {
                    _id: { account_uid: "$account_uid", channel_type: "$channel_type" },
                    totalConversations: { $sum: 1 }
                }
            }
        ]).toArray();

        const monthName = startDate.toFormat('MMMM');

        const bulkOps = [];
        for (const convo of conversations) {
            const account = await accountsCollection.findOne({ _id: convo._id.account_uid });
            const accountName = account ? account.name : "Unknown";
            const clientId = mariaDict[convo._id.account_uid.toString()] || 'SIN_CLIENT_ID';

            const record = {
                date: startDate.toJSDate(),
                month: monthName,
                client_id: clientId,
                account_uid: convo._id.account_uid,
                account_name: accountName,
                channel_type: convo._id.channel_type,
                total_conversations: convo.totalConversations,
                last_updated: new Date(),
                updated_by: 'christian.arias'
            };

            bulkOps.push({
                updateOne: {
                    filter: {
                        date: record.date,
                        account_uid: record.account_uid,
                        channel_type: record.channel_type
                    },
                    update: { $set: record },
                    upsert: true
                }
            });
        }

        if (bulkOps.length > 0) {
            const result = await conversationsAccountType.bulkWrite(bulkOps);
            console.log(`Datos procesados:`, {
                insertados: result.upsertedCount,
                actualizados: result.modifiedCount,
                total: result.upsertedCount + result.modifiedCount
            });
        } else {
            console.log('No se encontraron conversaciones para procesar');
        }

    } catch (error) {
        console.error(`Error: ${error}`);
    } finally {
        if (mariaDbConnection) await mariaDbConnection.end();
        await client.close();
        console.log("Connections closed.");
    }
}

// Execute the function
AddConversationPerAccountDays();
