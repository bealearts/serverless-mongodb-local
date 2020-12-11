const { MongoClient } = require('mongodb');

let dbConnection;

exports.list = async function list() {
  const db = await getDb();
  return db.collection('items').find({}).toArray();
};

async function getDb() {
  if (!dbConnection) {
    const client = await MongoClient.connect(
      process.env.SLS_MONGODB_URI,
      { useUnifiedTopology: true }
    );
    dbConnection = client.db();
  }

  return dbConnection;
}
