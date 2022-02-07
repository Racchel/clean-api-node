// Para testes de integração, usar .test.js

const config = require('./jest.config')
config.testMatch = ['**/*.test.js']
module.exports = config
