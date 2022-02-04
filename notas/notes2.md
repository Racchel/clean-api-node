## Coisas interessantes:

- Erro 400 é um erro do client, não do servidor


## Testes

- Ao invés de usar:
``` js
   const loginRouter = new LoginRouter()
```

- Usar: System under test ->  quem é que você está testando?
``` js
   const sut = new LoginRouter()
```