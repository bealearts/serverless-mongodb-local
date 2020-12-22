# serverless-mongodb-local ![Build and Test](https://github.com/bealearts/serverless-mongodb-local/workflows/Build%20and%20Test/badge.svg)

Serverless MongoDB local plugin

# Features
  - Automatically starts/stops a local MongoDB instance
  - Automatically downloads MongoDB binaries on first use
  - Can be used as a local equivalent to DocumentDB/CosmosDB

# Install
```shell
npm i -D serverless-mongodb-local
```

# Usage

## In serverless.yaml

```yaml
plugins:
  - serverless-mongodb-local

custom:
  mongodb:
    stages: # If you only want to use MongoDB Local in particular stages, declare them here
      - dev
    instance: # MongoMemoryServer() options and defaults https://github.com/nodkz/mongodb-memory-server#available-options-for-mongomemoryserver
      port: 1234
      dbName: MyDB
      dbPath: ./db
      storageEngine: wiredTiger # Set with `dbPath` to persists the database between instantiations
    seed:
      auto: true
      dataPath: ./test/data
```

## In your handlers
```js
const { MongoClient } = require('mongodb');

const client = await MongoClient.connect(
  process.env.SLS_MONGODB_URI,  // Provided as a convenience when using the plugin
  { useUnifiedTopology: true }
);
```

# Seeding data

By setting a `mongodb.seed.dataPath` any `.json` files in the folder will be imported as collections. The name of file being the name of the collection. The file should be an array of documents to load into the collection.


# Using with serverless-offline plugin

```yaml
plugins:
  - serverless-mongodb-local
  - serverless-offline
```

Make sure that serverless-mongodb-local is above serverless-offline so it will be loaded earlier.

Now your local MongoDB database will be automatically started before running serverless-offline.


# Credit

 - Inspired by [serverless-dynamodb-local](https://github.com/99x/serverless-dynamodb-local)
 - MongoDB install/control provided by [mongodb-memory-server](https://github.com/nodkz/mongodb-memory-server)

# Development

## Run
```shell
npm start
```

## Build
```shell
npm test
```

# Publish
```shell
npm version patch|minor|major
git push --follow-tags
```
