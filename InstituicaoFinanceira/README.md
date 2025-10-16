# Instituição Financeira API - Fase 2

Uma API REST para simulação de serviços bancários básicos, desenvolvida com Node.js e Express conforme especificações da Fase 2.

## 📋 Requisitos

- Node.js 14+
- npm

## 🚀 Instalação e Execução

1. **Clone o repositório:**
```bash
git clone <url-do-repositorio>
cd InstituicaoFinanceira
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Execute a aplicação:**
```bash
# Modo desenvolvimento (com nodemon)
npm run dev

# Modo produção
npm start
```

4. **Execute os testes:**
```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch
```

A API estará disponível em `http://localhost:3000`

## 📚 Documentação da API

### Status da API

#### GET /
Retorna o status da API.

**Resposta:**
```json
{
  "status": "Instituição Financeira API rodando"
}
```

### Clientes (Customers)

#### POST /customers
Cria um novo cliente.

**Body:**
```json
{
  "name": "Maria Silva",
  "cpf": "12345678900",
  "email": "maria.silva@email.com"
}
```

**Resposta (201):**
```json
{
  "_id": "cus_001",
  "name": "Maria Silva",
  "cpf": "12345678900",
  "email": "maria.silva@email.com",
  "accounts": []
}
```

### Contas (Accounts)

#### POST /accounts
Cria uma nova conta para um cliente.

**Body:**
```json
{
  "customerId": "cus_001",
  "type": "checking",
  "branch": "0001",
  "number": "12345-6"
}
```

**Resposta (201):**
```json
{
  "_id": "acc_001",
  "type": "checking",
  "branch": "0001",
  "number": "12345-6",
  "balance": 0.0,
  "transactions": []
}
```

#### GET /accounts/:accountId/balance
Consulta o saldo de uma conta.

**Resposta (200):**
```json
{
  "accountId": "acc_001",
  "balance": 2500.75
}
```

### Transações (Transactions)

#### POST /transactions
Realiza uma transação (crédito ou débito).

**Body:**
```json
{
  "accountId": "acc_001",
  "description": "Deposit via wire transfer",
  "amount": 1000.00,
  "type": "credit",
  "category": "Income"
}
```

**Resposta (201):**
```json
{
  "_id": "txn_001",
  "date": "2025-10-16",
  "description": "Deposit via wire transfer",
  "amount": 1000.00,
  "type": "credit",
  "category": "Income"
}
```

#### GET /transactions/:accountId
Lista todas as transações de uma conta (extrato).

**Resposta (200):**
```json
[
  {
    "_id": "txn_001",
    "date": "2025-10-16",
    "description": "Deposit via wire transfer",
    "amount": 1000.00,
    "type": "credit",
    "category": "Income"
  }
]
```

## 🗃️ Modelos de Dados

### Cliente (Customer)
```json
{
  "_id": "cus_001",
  "name": "Maria Silva",
  "cpf": "12345678900",
  "email": "maria.silva@email.com",
  "accounts": []
}
```

### Conta (Account)
```json
{
  "_id": "acc_001",
  "type": "checking",
  "branch": "0001",
  "number": "12345-6",
  "balance": 2500.75,
  "transactions": []
}
```

### Transação (Transaction)
```json
{
  "_id": "txn_001",
  "date": "2025-10-16",
  "description": "Deposit via wire transfer",
  "amount": 1000.00,
  "type": "credit",
  "category": "Income"
}
```

## ✅ Funcionalidades Implementadas (Obrigatórias)

- [x] **Criar customer** - POST /customers
- [x] **Criar account para um customer** - POST /accounts
- [x] **Consultar balance de uma account** - GET /accounts/:accountId/balance
- [x] **Realizar transactions (credit e debit)** - POST /transactions
- [x] **Listar transactions (extrato) por account** - GET /transactions/:accountId

## 🧪 Testes

O projeto possui uma suíte completa de testes com **100% de cobertura** cobrindo todas as funcionalidades obrigatórias:

- **39 testes** executados com sucesso
- **5 suítes de teste** (app, customers, accounts, transactions, integration)
- **100% de cobertura** de código

## 🔧 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **body-parser** - Middleware para parsing JSON
- **Jest** - Framework de testes
- **Supertest** - Testes de API HTTP

## 📋 Observações Conforme Especificação

1. ✅ **Todas as respostas em formato JSON**
2. ✅ **Datas seguem padrão ISO 8601 (YYYY-MM-DD)**
3. ✅ **Não há autenticação implementada** (conforme especificado)
4. ✅ **Estrutura de dados exatamente como especificada**
5. ✅ **IDs gerados automaticamente** (cus_001, acc_001, txn_001)

## 🌐 Exemplo de Uso Completo

```bash
# 1. Criar cliente
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria Silva","cpf":"12345678900","email":"maria.silva@email.com"}'

# 2. Criar conta
curl -X POST http://localhost:3000/accounts \
  -H "Content-Type: application/json" \
  -d '{"customerId":"cus_001","type":"checking","branch":"0001","number":"12345-6"}'

# 3. Fazer depósito
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{"accountId":"acc_001","description":"Deposit via wire transfer","amount":1000,"type":"credit","category":"Income"}'

# 4. Consultar saldo
curl http://localhost:3000/accounts/acc_001/balance

# 5. Consultar extrato
curl http://localhost:3000/transactions/acc_001
```

---

**Status:** ✅ Projeto pronto para Fase 2 - Implementação de IF completa e testada.
