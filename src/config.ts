const cfg = require('12factor-config');

// eslint-disable-next-line no-shadow
enum EnvEnum {
  ALLOWED_HEADERS = 'allowedHeaders',
  ALLOWED_ORIGINS = 'allowedOrigins',
  APP_NAME = 'appName',
  DEBUG = 'debug',
  DESIRED_PORT = 'PORT',
  ENABLE_CORS = 'enableCORS',
  NODE_ENV = 'nodeEnv',
  DOMAIN_ENV = 'domain_env',
  ACCEPTED_LANGS = 'acceptedLanguages',
  
  OPENAI_API_KEY = 'OPENAI_API_KEY',
  OPENAI_GPT_MODEL = 'OPENAI_GPT_MODEL',
  REDIS_URL = 'REDIS_URL',
  USE_REDIS = 'USE_REDIS',
  GOOGLE_CLIENT_ID = 'GOOGLE_CLIENT_ID',
  GOOGLE_CLIENT_SECRET = 'GOOGLE_CLIENT_SECRET',
  GOOGLE_CALLBACK = 'GOOGLE_CALLBACK',
  TOKEN_SECRET = 'TOKEN_SECRET',
  FRONTEND_URL = 'FRONTEND_URL',
  ALLOW_REGISTER = 'ALLOW_REGISTER',
  TESTING = 'TESTING',

  DB_HOST = 'DB_HOST',
  DB_USER = 'DB_USER',
  DB_PASS = 'DB_PASS',
  DB_NAME = 'DB_NAME',
  COMPLEMENT = 'COMPLEMENT',

  STRIPE_SECRET_KEY = 'STRIPE_SECRET_KEY',
  STRIPE_WEBHOOK_SECRET = 'STRIPE_WEBHOOK_SECRET',
  STRIPE_SKU_PLATFORM = 'STRIPE_SKU_PLATFORM',
}

const env = {
  allowedHeaders: {
    env: 'ALLOWED_HEADERS',
    type: 'string',
  },
  allowedOrigins: {
    env: 'ALLOWED_ORIGINS',
    type: 'string',
  },
  appName: {
    env: 'APP_NAME',
    type: 'string',
    required: false,
  },
  debug: {
    env: 'DEBUG',
    type: 'string',
    // required: true,
  },
  PORT: {
    env: 'PORT',
    type: 'integer',
    required: true,
  },
  enableCORS: {
    env: 'ENABLE_CORS',
    type: 'boolean',
  },
  nodeEnv: {
    env: 'NODE_ENV',
    type: 'enum',
    values: ['development', 'production'],
    default: 'development',
  },
  domain_env: {
    env: 'DOMAIN_ENV',
    type: 'string',
    required: true,
  },
  acceptedLanguages: {
    env: 'ACCEPTED_LANGS',
    type: 'string',
    required: false,
  },
  OPENAI_API_KEY: {
    env: 'OPENAI_API_KEY',
    type: 'string',
    required: true,
  },
  OPENAI_GPT_MODEL: {
    env: 'OPENAI_GPT_MODEL',
    type: 'string',
    required: true,
  },
  REDIS_URL: {
    env: 'REDIS_URL',
    type: 'string',
    required: true,
  },
  USE_REDIS: {
    env: 'USE_REDIS',
    type: 'boolean',
    required: true,
  },
  GOOGLE_CLIENT_ID: {
    env: 'GOOGLE_CLIENT_ID',
    type: 'string',
    required: true,
  },
  GOOGLE_CLIENT_SECRET: {
    env: 'GOOGLE_CLIENT_SECRET',
    type: 'string',
    required: true,
  },
  GOOGLE_CALLBACK: {
    env: 'GOOGLE_CALLBACK',
    type: 'string',
    required: true,
  },
  TOKEN_SECRET: {
    env: 'TOKEN_SECRET',
    type: 'string',
    required: true,
  },
  FRONTEND_URL: {
    env: 'FRONTEND_URL',
    type: 'string',
    required: true,
  },
  ALLOW_REGISTER: {
    env: 'ALLOW_REGISTER',
    type: 'boolean',
    default: false,
  },
  TESTING: {
    env: 'TESTING',
    type: 'boolean',
    default: false,
  },
  DB_HOST: {
    env: 'DB_HOST',
    type: 'string',
    required: true,
  },
  DB_USER: {
    env: 'DB_USER',
    type: 'string',
    required: true,
  },
  DB_PASS: {
    env: 'DB_PASS',
    type: 'string',
    required: true,
  },
  DB_NAME: {
    env: 'DB_NAME',
    type: 'string',
    required: true,
  },
  COMPLEMENT: {
    env: 'COMPLEMENT',
    type: 'string',
    required: true,
  },
  STRIPE_SECRET_KEY: {
    env: 'STRIPE_SECRET_KEY',
    type: 'string',
    required: true,
  },
  STRIPE_WEBHOOK_SECRET: {
    env: 'STRIPE_WEBHOOK_SECRET',
    type: 'string',
    required: true,
  },
  STRIPE_SKU_PLATFORM: {
    env: 'STRIPE_SKU_PLATFORM',
    type: 'string',
    required: true,
  },

} as const;

type TypeMapping = {
  'string': string;
  'number': number;
  'boolean': boolean;
  'integer': number;
  'enum': string;
};

type Config = {
  [key in EnvEnum]: typeof env[key]['type'] extends keyof TypeMapping ? TypeMapping[typeof env[key]['type']] : never;
};

const config: Config = cfg(env);

export default config;
