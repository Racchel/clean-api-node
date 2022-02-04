// router.js
const express = require('express')
const router = express.Router()

module.exports = () => {
  const route = new SignUpRouter()
  router.post('/signup', ExpressRouterAdapter.adapt(route))
}

class ExpressRouterAdapter {
  static adapt (router) {
    return async (req, res) => {
      const httpRequest = {
        body: req.body
      }

      const httpResponse = await router.route(httpRequest)
      res.status(httpResponse.statusCode).json(httpResponse.body)
    }
  }
}

// PRESENTATION LAYER -> O que a API expõe para o client
// signup-router.js
class SignUpRouter {
  async route (httpRequest) {
    const { email, password, repeatPassword } = httpRequest.body
    const user = await new SignUpUseCase().signUp(email, password, repeatPassword)
    return {
      statusCode: 200,
      body: user
    }
  }
}

// DOMAIN LAYER -> Onde ficam as regras de negócio da aplicação
// signup-usecase.js
class SignUpUseCase {
  async signUp (email, password, repeatPassword) {
    if (password === repeatPassword) {
      new AddAccountRepository().add({ email, password })
    }
  }
}

// INFRA LAYER -> Onde escolhe qual framework vai usar, qual ORM para implementar o acesso ao banco
// add-account-repository.js
const mongoose = require('mongoose')
const AccountModel = mongoose.model('Account')

class AddAccountRepository {
  async add (email, password, repeatPassword) {
    const user = await AccountModel.create({ email, password })
    return user
  }
}
