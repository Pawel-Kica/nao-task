// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: __dirname + '/../.env' });

function getSaveEnvVariable(name: string, defaultValue: string = '') {
  return process.env[name] || defaultValue;
}

const config = {
  isLocal: getSaveEnvVariable('IS_LOCAL') === 'true',
  // Api keys
  internalApiKEy: getSaveEnvVariable('INTERNAL_API_KEY'),
  openAIApiKey: getSaveEnvVariable('OPEN_AI_API_KEY'),
  // Database settings
  mongo: {
    host: getSaveEnvVariable('MONGO_HOST'),
    port: parseInt(getSaveEnvVariable('MONGO_PORT')),
    dbName: getSaveEnvVariable('MONGO_DB_NAME'),
  },
  // Products
  mockedProducts: getSaveEnvVariable('MOCKED_PRODUCTS') === 'true',
  chunkSize: parseInt(getSaveEnvVariable('CHUNK_SIZE', '1000')),
  softDeleteProducts: getSaveEnvVariable('SOFT_DELETE_PRODUCTS') === 'true',
  slackWebhookUrl: getSaveEnvVariable('SLACK_WEBHOOK_URL'),
};

export default config;
