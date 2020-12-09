const { MongoClient } = require('mongodb');

let dbConnection;

exports.list = async function list() {
  const db = await getDb();
  return db.collection('items').find({}).toArray();
};

async function getDb() {
  if (dbConnection) return dbConnection;

  const client = await MongoClient.connect(
    process.env.MONGODB_URI,
    { useUnifiedTopology: true }
  );
  dbConnection = client.db();

  return dbConnection;
}
