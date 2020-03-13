const { MongoMemoryServer } = require('mongodb-memory-server-core');

class ServerlessMongoDBLocal {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.log = (msg) => serverless.cli.log.call(serverless.cli, msg, 'mongodb-local');
    this.options = options;
    this.config = (serverless.service.custom && serverless.service.custom.mongodb) || {};

    this.commands = {
      mongodb: {
        start: {
          lifecycleEvents: ['startHandler'],
          usage: 'Start local MongoDB'
        },
        stop: {
          lifecycleEvents: ['stopHandler'],
          usage: 'Stop local MongoDB'
        }
      }
    };

    this.hooks = {
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
      return this.config.stages.includes(this.stage);
    }
    return true;
  }

  async startHandler() {
    if (this.shouldExecute()) {
      if (!this.options.noStart) {
        this.log('Starting local database');
        const { noStart, stages, ...mmsOptions } = this.config;
        this.mongod = new MongoMemoryServer(mmsOptions);
        await this.mongod.getUri();
        const info = this.mongod.getInstanceInfo();
        if (!info) {
          this.log('MongoDB failed to start');
        } else {
          this.log(`MongoDB started with; url: ${info.uri}, dbPath: ${info.dbPath}, storageEngine: ${info.storageEngine}`);
        }
      }
    } else {
      this.log(`Skipping start: MongoDB Local is not available for stage: ${this.stage}`);
    }
  }

  async stopHandler() {
    if (this.shouldExecute() && !this.options.noStart) {
      this.log('Stopping local database');
      await this.mongod.stop();
    } else {
      this.log(`Skipping end: MongoDB Local is not available for stage: ${this.stage}`);
    }
  }
}

module.exports = ServerlessMongoDBLocal;
