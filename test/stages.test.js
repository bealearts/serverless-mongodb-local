const fetch = require('node-fetch');
const { node } = require('execa');
const { resolve } = require('path');

let serverlessProcess;

const serverlessPath = resolve(
  __dirname,
  '../node_modules/serverless/bin/serverless'
);

beforeAll(async () => {
  serverlessProcess = node(serverlessPath, ['offline', 'start', '--config', './example/serverless.yaml',
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
}, 30000);

afterAll(async () => {
  await serverlessProcess.cancel();
});

test('Starts and seeds a MongoDB instance', async () => {
  const response = await fetch('http://localhost:8765');
  expect(response.ok).toEqual(false);
}, 30000);
