// Para testes unitários, usar .spec.js

const config = require('./jest.config')
config.testMatch = ['**/*.spec.js']
module.exports = config
