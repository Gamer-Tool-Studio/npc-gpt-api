const cfg = require('12factor-config')

const env = {
  allowedHeaders: {
    env: 'ALLOWED_HEADERS',
    type: 'string'
  },
  allowedOrigins: {
    env: 'ALLOWED_ORIGINS',
    type: 'string'
  },
  appName: {
    env: 'APP_NAME',
    type: 'string',
    required: true
  },
  debug: {
    env: 'DEBUG',
    type: 'string',
    required: true
  },
  desiredPort: {
    env: 'PORT',
    type: 'integer',
    required: true
  },
  enableCORS: {
    env: 'ENABLE_CORS',
    type: 'boolean'
  },
  nodeEnv: {
    env: 'NODE_ENV',
    type: 'enum',
    values: ['development', 'production'],
    default: 'development'
  },
  domain_env: {
    env: 'DOMAIN_ENV',
    type: 'string',
    required: true
  },
  acceptedLanguages: {
    env: 'ACCEPTED_LANGS',
    type: 'string',
    required: false
  },
  OPENAI_API_KEY: {
    env: 'OPENAI_API_KEY',
    type: 'string',
    required: true
  }
}

const loggerEnv = {
  loggerAMQPBroker: {
    env: 'LOGGER_AMQP_BROKER',
    type: 'string',
    required: false
  },
  loggerRemote: {
    env: 'LOGGER_REMOTE',
    type: 'boolean',
    default: false
  },
  loggerLevel: {
    env: 'LOGGER_LEVEL',
    type: 'enum',
    values: ['debug', 'info', 'warn', 'error'],
    default: 'debug'
  }
}

Object.assign(env, loggerEnv)

const config = cfg(env)

module.exports = config
