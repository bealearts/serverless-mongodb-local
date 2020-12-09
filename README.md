# serverless-mongodb-local

Serverless MongoDB local plugin

# Features
  - Automatically starts/stops a local MongoDB instance
  - Automatically downloads MongoDB binaries on first use
  - Can be used as a local equivalent to DocumentDB

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
    stages: # If you only want to use MongoDB Local in some stages, declare them here
      - dev
    instance: # MongoMemoryServer() options and defaults https://github.com/nodkz/mongodb-memory-server#available-options-for-mongomemoryserver
      port: 1234
      dbName: MyDB
      dbPath: ./db
      storageEngine: ephemeralForTest
    noStart: true # if you already have a MongoDB running locally
```

## Using with serverless-offline plugin

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
