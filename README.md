# Daily Diet

Daily Diet é uma aplicação desenvolvida durante o nível 2 da especialização em NodeJS ministrada pela Rocketseat, que permite a criação, autenticação e gerenciamento de usuários, além de gerenciar o agendamento de refeições. Com esta API, os usuários podem registrar suas refeições, acompanhar seu plano alimentar e obter estatísticas sobre seus hábitos alimentares.
Esta API foi desenvolvida como um desafio pós conclusão de módulo.

Deixo à disposição na raíz do projeto o arquivo `daily-diet-routes.json`, arquivo de coleção do insomnia para importar as rotas já pré configuradas para teste da API.

# Tecnologias Utilizadas no Projeto

- **Cookies**: Gerenciamento de cookies no Fastify.
- **Fastify**: Framework web rápido e de baixo overhead.
- **JWT**: Implementação de JSON Web Tokens.
- **Knex**: Query builder SQL para Node.js.
- **Postgres**: Bando de dados de produção.
- **Sqlite**: Banco de dados utilizado em desenvolvimento.
- **Zod**: Biblioteca de validação e parsing de esquemas.
- **Typescript**: Superset de JavaScript que adiciona tipagem estática.

## Funcionalidades

- **Criação de Usuários:** Permite criar novos usuários com nome, login e senha.
- **Autenticação de Usuários:** Autentica usuários existentes e gera um token JWT para acesso seguro.
- **Gerenciamento de Refeições:** Permite criar, atualizar, excluir e visualizar agendamentos de refeições.
- **Estatísticas de Refeições:** Fornece estatísticas detalhadas sobre as refeições do usuário, incluindo total de refeições, refeições dentro do plano e melhores sequências de refeições saudáveis.

### Pré-requisitos

- Node.js
- npm ou yarn

### Passos para Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/willslaq/daily-diet-api.git
   cd daily-diet
   ```
2. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn install
   ```
3. Configure as variáveis de ambiente
   - Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
   ```bash
   DATABASE_URL="./database/app.db"
   JWT_SECRET=sua_chave_secreta
   ```
4. Execute as migrations do banco de dados:
   ```bash
   npm run knex -- migrate:latest
   # ou
   yarn knex migrate:latest
   ```

### Executando a aplicação

1. Inicie o servidor:
   ```bash
   npm run dev
   # ou
   yarn dev
   ```
2. Aplicação por default estará disponível em `http://localhost:3333` ou na porta informada no arquivo `.env`

## Rotas

### Criar Usuário

- **Rota:** `POST /users`
- **Descrição:** Cria um novo usuário.
- **Parâmetros:**
  - `name` (string): Nome do usuário.
  - `login` (string): Login do usuário.
  - `password` (string): Senha do usuário (mínimo 5 caracteres).
- **Resposta de Sucesso:**
  - Código: `200 OK`
  - Corpo: `{ message: 'User created' }`
- **Resposta de Erro:**
  - Código: `400 Bad Request`
  - Corpo: `{ message: 'User already exists' }`

### Autenticar Usuário

- **Rota:** `POST /users/auth`
- **Descrição:** Autentica um usuário existente.
- **Parâmetros:**
  - `login` (string): Login do usuário.
  - `password` (string): Senha do usuário.
- **Resposta de Sucesso:**
  - Código: `200 OK`
  - Corpo: `{ message: 'User authenticated' }`
- **Resposta de Erro:**
  - Código: `400 Bad Request`
  - Corpo: `{ message: 'User not found' }` ou `{ message: 'Invalid password' }`

### Obter Dados do Usuário Autenticado

- **Rota:** `GET /users/me`
- **Descrição:** Retorna os dados do usuário autenticado.
- **Autenticação:** Requer token de autenticação.
- **Resposta de Sucesso:**
  - Código: `200 OK`
  - Corpo: `{ name: 'Nome do Usuário', login: 'login' }`
- **Resposta de Erro:**
  - Código: `401 Unauthorized`
  - Corpo: `{ message: 'Unauthorized' }` ou `{ message: 'User not found' }`

### Logout

- **Rota:** `POST /users/logout`
- **Descrição:** Faz logout do usuário autenticado.
- **Resposta de Sucesso:**
  - Código: `200 OK`
  - Corpo: `{ message: 'User logged out' }`

### Criar Agendamento de Refeição

- **Rota:** `POST /meal-schedules`
- **Descrição:** Cria um novo agendamento de refeição para o usuário autenticado.
- **Autenticação:** Requer token de autenticação.
- **Parâmetros:**
  - `name` (string): Nome da refeição.
  - `description` (string): Descrição da refeição.
  - `eatenAt` (string): Data e hora em que a refeição foi consumida.
  - `isOnPlan` (boolean): Indica se a refeição está dentro do plano alimentar.
- **Resposta de Sucesso:**
  - Código: `201 Created`
  - Corpo: Vazio
- **Resposta de Erro:**
  - Código: `401 Unauthorized`
  - Corpo: `{ message: 'Unauthorized' }`

### Obter Agendamentos de Refeições

- **Rota:** `GET /meal-schedules`
- **Descrição:** Retorna todos os agendamentos de refeições do usuário autenticado.
- **Autenticação:** Requer token de autenticação.
- **Resposta de Sucesso:**
  - Código: `200 OK`
  - Corpo: `{ mealSchedule: [...] }`
- **Resposta de Erro:**
  - Código: `401 Unauthorized`
  - Corpo: `{ message: 'Unauthorized' }` ou `{ message: 'User not found' }`

### Obter Agendamento de Refeição por ID

- **Rota:** `GET /meal-schedules/:id`
- **Descrição:** Retorna um agendamento de refeição específico pelo ID.
- **Autenticação:** Requer token de autenticação.
- **Parâmetros:**
  - `id` (string): ID do agendamento de refeição.
- **Resposta de Sucesso:**
  - Código: `200 OK`
  - Corpo: `{ mealSchedule: {...} }`
- **Resposta de Erro:**
  - Código: `401 Unauthorized`
  - Corpo: `{ message: 'Unauthorized' }`

### Atualizar Agendamento de Refeição

- **Rota:** `PUT /meal-schedules/:id`
- **Descrição:** Atualiza um agendamento de refeição específico pelo ID.
- **Autenticação:** Requer token de autenticação.
- **Parâmetros:**
  - `id` (string): ID do agendamento de refeição.
  - `name` (string, opcional): Nome da refeição.
  - `description` (string, opcional): Descrição da refeição.
  - `eatenAt` (string, opcional): Data e hora em que a refeição foi consumida.
  - `isOnPlan` (boolean, opcional): Indica se a refeição está dentro do plano alimentar.
- **Resposta de Sucesso:**
  - Código: `200 OK`
  - Corpo: Vazio
- **Resposta de Erro:**
  - Código: `400 Bad Request`
  - Corpo: `{ message: 'No fields were provided' }` ou `{ message: 'Meal schedule not found' }` ou `{ message: 'Unauthorized' }`

### Excluir Agendamento de Refeição

- **Rota:** `DELETE /meal-schedules/:id`
- **Descrição:** Exclui um agendamento de refeição específico pelo ID.
- **Autenticação:** Requer token de autenticação.
- **Parâmetros:**
  - `id` (string): ID do agendamento de refeição.
- **Resposta de Sucesso:**
  - Código: `200 OK`
  - Corpo: Vazio
- **Resposta de Erro:**
  - Código: `401 Unauthorized`
  - Corpo: `{ message: 'Unauthorized' }` ou `{ message: 'Meal schedule not found' }`

### Obter Estatísticas de Refeições

- **Rota:** `GET /meal-schedules/stats`
- **Descrição:** Retorna estatísticas sobre os agendamentos de refeições do usuário autenticado.
- **Autenticação:** Requer token de autenticação.
- **Resposta de Sucesso:**
  - Código: `200 OK`
  - Corpo:
    ```json
    {
      "totalMeals": 10,
      "totalMealsOnPlan": 7,
      "totalMealsNotOnPlan": 3,
      "totalBestStreak": 5,
      "totalCurrentStreak": 2
    }
    ```
- **Resposta de Erro:**
  - Código: `401 Unauthorized`
  - Corpo: `{ message: 'Unauthorized' }` ou `{ message: 'User not found' }`

## Autenticação

A autenticação é feita através de tokens JWT. O token deve ser enviado como um cookie em todas as requisições que requerem autenticação.

## Referência

- [Desafio referente ao módulo: Criando APIs RESTfull com Node.js](https://efficient-sloth-d85.notion.site/Desafio-02-be7cdb37aaf74ba898bc6336427fa410)
