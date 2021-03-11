const fetch = require('node-fetch');
const { node } = require('execa');
const { resolve } = require('path');

let serverlessProcess;

const serverlessPath = resolve(
  __dirname,
  '../node_modules/serverless/bin/serverless'
);

async function setup() {
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
}

async function teardown() {
  await serverlessProcess.cancel();
}

test('Starts and seeds a MongoDB instance', async () => {
  await setup();

  const response = await fetch('http://localhost:8765');
  expect(response.ok).toEqual(true);

  const result = await response.json();
  expect(result.length).toEqual(3);

  await teardown();
}, 30000);
