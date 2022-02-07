const MissingParamError = require('./missing-param-error')
const UnauthorizedError = require('./unauthorized-error')
const ServerError = require('./server-error')

module.exports = class HttpResponse {
  static badRequest (paramName) {
    return {
      statusCode: 400,
      body: new MissingParamError(paramName)
    }
  }

  static serverError () {
    return {
      statusCode: 500,
      body: new ServerError()
    }
  }

  static ok ({ accessToken }) {
    return {
      statusCode: 200,
      body: {
        accessToken
      }
    }
  }

  static unauthorizedError () {
    return {
      statusCode: 401,
      body: new UnauthorizedError()
    }
  }
}
