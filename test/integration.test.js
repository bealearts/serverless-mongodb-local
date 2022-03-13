const fetch = require('node-fetch');
const { node } = require('execa');
const { resolve } = require('path');

let serverlessProcess;

const serverlessPath = resolve(
  __dirname,
  '../node_modules/serverless/bin/serverless'
);

const startNodeProcess = (yamlFile) => {
  return async () => {
    serverlessProcess = node(serverlessPath, ['offline', 'start', '--config', yamlFile,
      '--noPrependStageInUrl', '--httpPort', '8765', '--lambdaPort', '8432'], {
      cwd: './'
    });

    await new Promise((res) => {
      serverlessProcess.stdout.on('data', (data) => {
        if (String(data).includes('[HTTP] server ready')) {
          res();
        }
      });
    });
  };
};

const testRequest = () => {
  return async () => {
      const response = await fetch('http://localhost:8765');
      expect(response.ok).toEqual(true);

      const result = await response.json();
      expect(result.length).toEqual(3);
    };
};


describe('MongoDB Integration Tests', () => {

  describe('With plain stage match', () => {
    beforeAll(startNodeProcess('./example/serverless.yaml'), 30000);
    
    test('Starts and seeds a MongoDB instance', testRequest(), 30000);
    afterAll(async () => {
      await serverlessProcess.cancel();
    });
  });

  describe('With regex stage match', () => {
    beforeAll(startNodeProcess('./example/serverless-regex.yaml'), 30000);
    
    test('Starts and seeds a MongoDB instance', testRequest(), 30000);

    afterAll(async () => {
      await serverlessProcess.cancel();
    });
  });

  
});
