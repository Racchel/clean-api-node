# Estudo de caso de arquitetura limpa

## Código original

**O que esse código faz?:** 

1. Exporta uma função que:
2. Expõe um endpoint/rota POST de criação uma conta;
3. Recebe o email, a senha e a senha repetida no corpo da requisição;
4. Verifica se a senha e a senha repetida são iguais;
5. Se forem, ele passa os dados do usuário para uma funcao de criacao de modelo do mongoose, que retorna um usuário;
6. Esse usuário é passado como um json na resposta da requisição, com um status 200;
7. Caso a senha seja diferente, a função de callback retorna um objeto contendo um erro, além do status 400;

``` js
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const AccountModel = mongoose.model('Account')

module.exports = () => {
  router.post('/signup', async (req, res) => {
    const { email, password, repeatPassword } = req.body
      if (password === repeatPassword) {
         const user = await AccountModel.create({ email, password, repeatPassword })
         return res.status(200).json(user)
      }

      return res.status(400).json({ error: 'Password must be equal to repeatPassword' })
  })
}
```

## 1º passo?

**Separar a função de callback da rota**: melhora, mas não resolve nenhum problema de arquitetura ainda.

**Quais os problemas de arquitetura nós temos aqui?:** A classe SignUpRouter tem muitas responsabilidades:
- A rota tá fazendo validação do request e do response;
- Está fazendo regra de negócio *(if (password === repeatPassword))*;
- E está fazendo acesso ao banco de dados *(await AccountModel.create())*;

**O que uma rota deve fazer?**
- APENAS validação do request e do response

``` js 
module.exports = () => {
  router.post('/signup', new SignUpRouter().route)    // <- nova instância da class SignUpRouter, com ponteiro para route()
}

class SignUpRouter {
   async route (req, res) {                        // recebe automaticamente o req e res
      const { email, password, repeatPassword } = req.body
      if (password === repeatPassword) {
         const user = await AccountModel.create({ email, password, repeatPassword })
         res.status(200).json(user)
      }

      res.status(400).json({ error: 'Password must be equal to repeatPassword' })
  }
}
```

## 2º passo?

**Criar um use case para verificar se a senha é igual a senha repetida**: 
- Cria uma classe de use case e coloca todo o código de validação da senha nele;
- Chama a classe e o método que faz essa validação, passando os parâmetros, dentro do router;

**Que responsabilidades o use case tem agora?**
- Está fazendo regra de negócio *(if (password === repeatPassword))*;
- E está fazendo acesso ao banco de dados *(await AccountModel.create())*;

**O que um use case deve fazer?**
- APENAS tratar as regras de negócio;
- Deve ser desacoplado de acesso de banco de dados;

``` js 
// router.js
module.exports = () => {
   router.post('/signup', new SignUpRouter().route)    // <- nova instância da class SignUpRouter, com ponteiro para route()
}

// signup-router.js
const express = require('express')
const router = express.Router()

class SignUpRouter {
   async route (req, res) {                        // recebe automaticamente o req e res
      const { email, password, repeatPassword } = req.body
      new SignUpUseCase().signUp (email, password, repeatPassword)
      res.status(400).json({ error: 'Password must be equal to repeatPassword' })
  }
}

// signup-usecase.js
const mongoose = require('mongoose')
const AccountModel = mongoose.model('Account')

class SignUpUseCase {
   async signUp (email, password, repeatPassword) {
      if (password === repeatPassword) {
         const user = await AccountModel.create({ email, password, repeatPassword })
         return user
      }
   }
}
```

## 3º passo?

**Criar um repository para acessar o banco e criar uma nova conta**: 
- Tirar todo o codigo de acesso ao banco do use case e colocar em outra classe;
- Desacopla/tira a responsabilidade do acesso ao banco do use case;

**Que responsabilidades o use case tem agora?**
- Está fazendo acesso ao banco de dados *(await AccountModel.create())*

**O que  um repository deve fazer?**
- Repository deve conhecer os detalhes de infra da aplicacao, como qual o banco será usado;
- Nesse caso, ele recebe os dados, acessa o banco e retorna a conta já criada;

**Porque essa desacoplação é importante?**
- Caso você precise refatorar e trocar o banco, você mexe apenas no repository;
- Esse conceito  serve tmb para substituir qualquer dependencia externa;

``` js 
// router.js
module.exports = () => {
   router.post('/signup', new SignUpRouter().route)    // <- nova instância da class SignUpRouter, com ponteiro para route()
}

// signup-router.js
const express = require('express')
const router = express.Router()

class SignUpRouter {
   async route (req, res) {                        // recebe automaticamente o req e res
      const { email, password, repeatPassword } = req.body
      new SignUpUseCase().signUp (email, password, repeatPassword)
      res.status(400).json({ error: 'Password must be equal to repeatPassword' })
  }
}

// signup-usecase.js
class SignUpUseCase {
   async signUp (email, password, repeatPassword) {
      if (password === repeatPassword) {
         new AddAccountRepository().add({ email, password })
      }
   }
}

// add-account-repository.js
const mongoose = require('mongoose')
const AccountModel = mongoose.model('Account')

class AddAccountRepository {
   async add (email, password, repeatPassword) {
      const user = await AccountModel.create({ email, password })
      return user
   }
}
```

-----
**[⚠️]**
<p> A partir daqui, já temos um ótimo nível de desacoplamento; </p>
<p> Agora, pra ficar perfeito, vamos desacoplar ainda mais de libs ou frameworks externas; </p>
<p> Exemplo: desacoplar o router do express; </p>

**Porque precisa desacoplar do express?:** 
- Caso algum dia apareça outro framework melhor que o express, ficaria mais fácil substituir e refatorar, não precisar mexer em todoooo o código;
-----

## 4º passo?

**Alterar parâmetro recebido pelo SignUpRouter para algo genérico e criar um adapter do Express**: 
- Recebe um json httpRequest customizado com o body da requisição;
- Retorna um json httpResponse customizado com o json de resposta;

**Que responsabilidades o use case tem agora?**
- Apenas validar uma entrada, independente do framework usado;

**Consequência:**
- O (router.post('/signup', new SignUpRouter().route)) vai parar de funcionar;
- Para de funcionar pq agora não estamos recebendo mais o req e res em SignUpRouter, mas sim um httpRequest customizado;
- Para resolver isso, precisamos de uma classe intermediária, um adaptador;

**Benefício:** Se precisar mudar o framework, muda na rota principal e cria outro adapter

``` js 
// router.js
const express = require('express')
const router = express.Router()

module.exports = () => {
   const router = new SignUpRouter()
   router.post('/signup', ExpressRouterAdapter.adapt(router))
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
   async route (httpRequest) {                        // recebe um objeto httpRequest
      const { email, password, repeatPassword } = httpRequest.body
      const user = await new SignUpUseCase().signUp (email, password, repeatPassword)
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
```

-----
**[⚠️]**
<p> Arquitetura bem definida, mas com muitas linhas de código; </p>
<p> Mas, cada classe é bem pequena e faz apenas um comportamento - Single Responsalbility Principle; </p>
-----

## 5º passo?

**Como melhorar esse código ainda mais?**

- Camada de injeção de dependência
- Main layer, que compõe os objetos
- Tornar tudo como se fosse um quebra-cabeça
- Componentizar tudo
- Instanciar automaticamente tudooo com Main layer
- Composer Pattern