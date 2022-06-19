const { MongoMemoryServer } = require('mongodb-memory-server-core');
const seed = require('./seed');

class ServerlessMongoDBLocal {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.log = (msg) => serverless.cli.log.call(serverless.cli, msg, 'mongodb-local');
    this.options = options;
    this.config = (serverless.service.custom && serverless.service.custom.mongodb) || {};

    this.commands = {
      mongodb: {
        commands: {
          start: {
            lifecycleEvents: ['startHandler'],
            usage: 'Start local MongoDB'
          },
          stop: {
            lifecycleEvents: ['stopHandler'],
            usage: 'Stop local MongoDB'
          },
          seed: {
            lifecycleEvents: ['seedHandler'],
            usage: 'Seed local MongoDB database with data'
          }
        }
      }
    };

    this.hooks = {
      'mongodb:start:startHandler': this.startHandler.bind(this),
      'mongodb:stop:stopHandler': this.stopHandler.bind(this),
      'mongodb:seed:seedHandler': this.seedHandler.bind(this),
      'before:offline:start:init': this.startHandler.bind(this),
      'before:offline:start:end': this.stopHandler.bind(this)
    };
  }

  get stage() {
    return (this.options && this.options.stage)
      || (this.serverless.service.provider && this.serverless.service.provider.stage);
  }

  shouldExecute() {
    if (this.config.stages) {
      return this.config.stages.some((stage) => {
        const matches = this.stage.match(new RegExp(stage)) || [];
        return matches.length > 0;
      });
    }
    return true;
  }

  async startHandler() {
    if (this.shouldExecute()) {
      this.log('Starting local database');
      const { stages, ...mmsOptions } = this.config;
      this.mongod = new MongoMemoryServer(mmsOptions);
      await this.mongod.start();
      const mongoUri = this.mongod.getUri();
      if (!mongoUri) {
        this.log('MongoDB failed to start');
      } else {
        this.log(`MongoDB started with; url: ${mongoUri}`);
        process.env.SLS_MONGODB_URI = mongoUri;

        if (this.config.seed && this.config.seed.auto !== false) {
          await this.seedHandler();
        }
      }
    } else {
      this.log(`Skipping start: MongoDB Local is not available for stage: ${this.stage}`);
    }
  }

  async stopHandler() {
    if (this.shouldExecute()) {
      // Do not stop it in case JEST is running tests
      // (or serverless was spawned in child process by NodeJS)
      // It will be automatically killed with the parent process.
      if (process.env.NODE_ENV === 'test') { return; }
      this.log('Stopping local database');
      try {
        await this.mongod.stop();
      } catch (error) {
        if (this.mongod.getUri()) this.log('WARN: MongoDB may not have stopped');
      }
    } else {
      this.log(`Skipping end: MongoDB Local is not available for stage: ${this.stage}`);
    }
  }

  async seedHandler() {
    if (this.shouldExecute()) {
      this.log('Starting local database seed');
      const dataPath = this.config.seed && this.config.seed.dataPath;
      if (!dataPath) {
        this.log('Skipping seeding: "seed.dataPath" not specified');
      } else {
        const uri = this.mongod.getUri();
        await seed(dataPath, uri, this.log);
      }
    } else {
      this.log(`Skipping seeding: MongoDB Local is not available for stage: ${this.stage}`);
    }
  }
}

module.exports = ServerlessMongoDBLocal;
