[#1 API em NodeJS com Clean Architecture e TDD - Project Setup](https://www.youtube.com/watch?v=vV1wQ6GFH0A)

Standard é como um Eslint, mas usa o padrão standard do JS:
- não usa ;
- não deixa você colocar uma , sobrando no final do objeto
- usa aspas simples
- usar sempre ===
- não precisa fazer nenhuma configuração extra

Lint-staged: permite que rode scripts na nossa staged area do github
(staged-area -> arquivos que foram commitados)

- uso? validar arquivos que vão ser commitados, para ver se estão formatados corretamente usando o standard

Husky: permite que a gente adiciona hooks no git
- rodar um script antes que aconteça um commit

(
   1. toda vez que for tentar fazer um commit, o husky vai disparar antes do commit o lint-staged.

   2. o lint-staged vai verificar todos os arquivos que estão na staged area e vai rodar o standard

   3. o stantard vai verificar se o codigo está corretamente formatado de acordo com o padrão standard do js. se não tiver, ele trava o commit

   4. usar Standard: Auto Fix On Save = true no settings 

   5. usar a extensao do standard pra VSCode

)