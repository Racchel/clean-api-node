// qnd for erro do dev, retornar excecao

class AuthUseCase {
  async auth (email) {
    if (!email) {
      throw new Error()
    }
  }
}

describe('Auth UseCase', () => {
  test('Should return null if no email is provider', async () => {
    // jest não funfa pra testar exceção com assíncrono
    const sut = new AuthUseCase()
    const promise = sut.auth()
    expect(promise).rejects.toThrow()
  })
})
