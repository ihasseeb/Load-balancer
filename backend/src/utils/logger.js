const { createLogger, transports } = require('winston');
const LokiTransport = require('winston-loki');

const logger = createLogger({
  transports: [
    new LokiTransport({
      host: 'http://127.0.0.1:3100'
    })
  ]
});

module.exports = logger;
