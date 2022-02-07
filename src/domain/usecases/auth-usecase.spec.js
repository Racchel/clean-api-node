// qnd for erro do dev, retornar excecao
const { MissingParamError } = require('../../utils/generic-errors')
class AuthUseCase {
  async auth (email, password) {
    if (!email) {
      throw new MissingParamError('email')
    }
    if (!password) {
      throw new MissingParamError('password')
    }
  }
}

describe('Auth UseCase', () => {
  test('Should return null if no email is provider', async () => {
    // jest não funfa pra testar exceção com assíncrono
    const sut = new AuthUseCase()
    const promise = sut.auth()
    expect(promise).rejects.toThrow(new MissingParamError('email'))
  })
})

describe('Auth UseCase', () => {
  test('Should return null if no password is provider', async () => {
    // jest não funfa pra testar exceção com assíncrono
    const sut = new AuthUseCase()
    const promise = sut.auth('any_email@email.com')
    expect(promise).rejects.toThrow(new MissingParamError('password'))
  })
})
