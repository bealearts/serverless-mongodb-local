const fs = require('fs-extra');
const path = require('path');
const { MongoClient } = require('mongodb');

let client;

module.exports = async function seed(dataPath, uri, log) {
  try {
    const files = await fs.readdir(dataPath);
    const jsonfiles = files.filter((file) => path.extname(file) === '.json');
    await Promise.all(jsonfiles.map(async (file) => {
      const collection = path.basename(file, '.json');
      try {
        const data = await fs.readJson(path.join(dataPath, file));
        const db = await getDb(uri);
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

async function getDb(uri) {
  if (!client) {
    client = await MongoClient.connect(
      uri,
      { useUnifiedTopology: true }
    );
  }

  return client.db();
}
