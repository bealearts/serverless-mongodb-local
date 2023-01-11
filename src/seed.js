const fs = require('fs-extra');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

let client;

module.exports = async function seed(dataPath, uri, dbName, log) {
  try {
    const files = await fs.readdir(dataPath);
    const jsonfiles = files.filter((file) => path.extname(file) === '.json');
    await Promise.all(jsonfiles.map(async (file) => {
      const collection = path.basename(file, '.json');
      try {
        let data = await fs.readJson(path.join(dataPath, file));
        data = data.map(item => {
          Object.keys(item).forEach(k => {
            if(item[k] && typeof item[k] == "object" && item[k]["$oid"]){
              item[k] = ObjectId(item[k]["$oid"]);
            }
          })
          return item;
        });
        const db = await getDb(uri, dbName);
        const result = await db.collection(collection).insertMany(data);
        log(`Seeded collection "${collection}" with ${result.insertedCount} documents`);
      } catch (error) {
        log(`WARN: Failed to seed collection "${collection}"`);
      }
    }));
  } catch (error) {
    log('WARN: Failed to seed database');
  } finally {
    if (client) client.close();
  }
};

async function getDb(uri, dbName = 'test') {
  if (!client) {
    client = await MongoClient.connect(
      uri,
      { useUnifiedTopology: true }
    );
  }

  return client.db(dbName);
}
