// qnd for erro do dev, retornar excecao
const { MissingParamError, InvalidParamError } = require('../../utils/generic-errors')
const AuthUseCase = require('./auth-usecase')

const makeSut = () => {
  class LoadUserByEmailRepositorySpy {
    async load (email) {
      this.email = email
      return this.user
    }
  }
  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy()
  loadUserByEmailRepositorySpy.user = {}
  const sut = new AuthUseCase(loadUserByEmailRepositorySpy)
  return {
    sut,
    loadUserByEmailRepositorySpy
  }
}

describe('Auth UseCase', () => {
  test('Should return null if no email is provider', async () => {
    // jest não funfa pra testar exceção com assíncrono
    const { sut } = makeSut()
    const promise = sut.auth()
    expect(promise).rejects.toThrow(new MissingParamError('email'))
  })

  test('Should return null if no password is provider', async () => {
    // jest não funfa pra testar exceção com assíncrono
    const { sut } = makeSut()
    const promise = sut.auth('any_email@email.com')
    expect(promise).rejects.toThrow(new MissingParamError('password'))
  })

  test('Should call LoadUserByEmailRepository with correct email', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut()
    await sut.auth('any_email@email.com', 'any_email@email.com')
    expect(loadUserByEmailRepositorySpy.email).toBe('any_email@email.com')
  })

  test('Should throw if no LoadUserByEmailRepository is provided', async () => {
    const sut = new AuthUseCase()
    const promise = sut.auth('any_email@email.com', 'any_email@email.com')
    expect(promise).rejects.toThrow(new MissingParamError('loadUserByEmailRepository'))
  })

  test('Should throw if LoadUserByEmailRepositorySpy has no load method', async () => {
    class LoadUserByEmailRepositorySpy {}
    const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy()
    const sut = new AuthUseCase(loadUserByEmailRepositorySpy)

    const promise = sut.auth('any_email@email.com', 'any_email@email.com')
    expect(promise).rejects.toThrow(new InvalidParamError('loadUserByEmailRepository'))
  })

  test('Should throw if an invalid email is provided', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut()
    loadUserByEmailRepositorySpy.user = null

    const accessToken = await sut.auth('valid_email@email.com', 'invalid_email@email.com')
    expect(accessToken).toBeNull()
  })

  test('Should throw if an invalid password is provided', async () => {
    const { sut } = makeSut()
    const accessToken = await sut.auth('valid_email@email.com', 'invalid_email@email.com')
    expect(accessToken).toBeNull()
  })
})
