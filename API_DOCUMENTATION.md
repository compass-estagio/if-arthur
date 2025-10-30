# Arthur Financial Institution API - Documentação Técnica

## Visão Geral

A **Arthur Financial Institution API** é uma API RESTful desenvolvida para gerenciar operações bancárias básicas seguindo os padrões do **Open Finance Brasil Fase 2** e em conformidade com a **LGPD** (Lei Geral de Proteção de Dados).

Esta documentação descreve os padrões, endpoints, formatos de dados e boas práticas para consumo da API por outras aplicações.

## Informações Gerais

- **Versão**: 1.0.0
- **Protocolo**: HTTPS
- **Formato de Dados**: JSON
- **Charset**: UTF-8
- **Timezone**: UTC (timestamps em formato ISO 8601)

### Base URLs

- **Produção**: `https://if-arthur.vercel.app`
- **Desenvolvimento Local**: `http://localhost:3000`

### Repositório

- **GitHub**: https://github.com/compass-estagio/if-arthur

---

## Padrões da API

### 1. Formato de Request

Todas as requisições que enviam dados devem usar:

```
Content-Type: application/json
```

O corpo da requisição deve ser um JSON válido.

### 2. Formato de Response

Todas as respostas são retornadas em formato JSON:

```
Content-Type: application/json; charset=utf-8
```

### 3. Convenções de Nomenclatura

- **Endpoints**: lowercase com separação por `/` (ex: `/accounts/:id/balance`)
- **Campos JSON**: camelCase (ex: `customerId`, `accountId`)
- **IDs**: Formato sequencial com prefixo (ex: `cus_001`, `acc_001`, `txn_001`)

### 4. Timestamps

Todos os timestamps seguem o padrão **ISO 8601** em UTC:

```json
{
  "timestamp": "2025-10-30T15:30:00.000Z"
}
```

Para datas sem hora (ex: data de transação):

```json
{
  "date": "2025-10-30"
}
```

### 5. Campos de ID

Os IDs são retornados com o campo `_id` (com underscore) para compatibilidade:

```json
{
  "_id": "cus_001",
  "name": "Maria Silva"
}
```

---

## Autenticação e Autorização

### Open Finance - Consentimento LGPD

A API implementa o sistema de **consentimento** conforme regulamentação do Open Finance Brasil e LGPD.

#### Como Funciona

1. **Cliente deve autorizar explicitamente** o compartilhamento de dados ao ser criado
2. Endpoints que acessam dados sensíveis verificam o consentimento automaticamente
3. Sem consentimento, o acesso é negado com erro `403 Forbidden`

#### Endpoints que Requerem Consentimento

- `GET /accounts/:accountId/balance` - Consultar saldo
- `GET /transactions/:accountId` - Listar transações (extrato)

#### Validação de Consentimento

A validação é feita através do `accountId` na URL. O sistema:

1. Busca a conta pelo ID
2. Identifica o cliente dono da conta
3. Verifica se `consentGiven: true` no cadastro do cliente
4. Autoriza ou nega o acesso

**Não há necessidade de tokens JWT ou OAuth** nesta versão. O consentimento é vinculado ao cliente no momento do cadastro.

---

## Códigos de Status HTTP

A API utiliza códigos de status HTTP padronizados:

### Sucesso

| Código | Descrição | Uso |
|--------|-----------|-----|
| `200 OK` | Sucesso | Requisições GET bem-sucedidas |
| `201 Created` | Criado | Recurso criado com sucesso (POST) |

### Erros do Cliente (4xx)

| Código | Descrição | Causa |
|--------|-----------|-------|
| `400 Bad Request` | Requisição inválida | Dados faltando, formato inválido ou saldo insuficiente |
| `401 Unauthorized` | Não autorizado | Header x-customer-id não fornecido (deprecated) |
| `403 Forbidden` | Acesso negado | Cliente não deu consentimento para compartilhamento |
| `404 Not Found` | Não encontrado | Recurso (cliente, conta, etc.) não existe |
| `409 Conflict` | Conflito | Recurso duplicado (ex: CPF já cadastrado) |

### Erros do Servidor (5xx)

| Código | Descrição | Causa |
|--------|-----------|-------|
| `500 Internal Server Error` | Erro interno | Erro não tratado no servidor |

---

## Formato de Erros

Todos os erros retornam um JSON com o campo `error`:

```json
{
  "error": "Descrição do erro em português"
}
```

### Exemplos de Erros

**400 - Dados Faltando**
```json
{
  "error": "Campos obrigatórios: customerId, type, branch, number."
}
```

**400 - Saldo Insuficiente**
```json
{
  "error": "Saldo insuficiente."
}
```

**403 - Sem Consentimento**
```json
{
  "error": "Acesso negado: Cliente não forneceu consentimento para compartilhamento de dados.",
  "customerId": "cus_001",
  "accountId": "acc_001",
  "message": "O cliente precisa autorizar o compartilhamento de dados financeiros conforme LGPD."
}
```

**404 - Recurso Não Encontrado**
```json
{
  "error": "Conta não encontrada."
}
```

**409 - Conflito (CPF Duplicado)**
```json
{
  "error": "Cliente com este CPF já existe."
}
```

---

## Endpoints

### Status da API

#### `GET /` ou `GET /api`

Verifica se a API está online e retorna informações sobre endpoints disponíveis.

**Request**
```http
GET /api HTTP/1.1
Host: if-arthur.vercel.app
Accept: application/json
```

**Response - 200 OK**
```json
{
  "name": "Arthur Financial Institution API",
  "status": "✅ Online",
  "version": "1.0.0",
  "description": "Instituição Financeira para Open Finance - Fase 2",
  "timestamp": "2025-10-30T15:30:00.000Z",
  "endpoints": {
    "customers": {
      "create": "POST /customers",
      "description": "Criar novo cliente"
    },
    "accounts": {
      "create": "POST /accounts",
      "balance": "GET /accounts/{id}/balance",
      "description": "Gerenciar contas bancárias"
    },
    "transactions": {
      "create": "POST /transactions",
      "list": "GET /transactions/{accountId}",
      "description": "Realizar e consultar transações"
    }
  },
  "examples": { ... },
  "documentation": "https://github.com/compass-estagio/if-arthur",
  "author": "Arthur",
  "deployed": "Vercel"
}
```

---

### Clientes (Customers)

#### `POST /customers` - Criar Cliente

Cria um novo cliente no sistema bancário.

**Request**
```http
POST /customers HTTP/1.1
Host: if-arthur.vercel.app
Content-Type: application/json

{
  "name": "Maria Silva",
  "cpf": "12345678900",
  "email": "maria.silva@email.com",
  "consentGiven": true
}
```

**Campos Obrigatórios**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `name` | string | Nome completo do cliente |
| `cpf` | string | CPF (apenas números, 11 dígitos) |
| `email` | string | E-mail válido |
| `consentGiven` | boolean | Consentimento para compartilhamento de dados (LGPD) |

**Response - 201 Created**
```json
{
  "_id": "cus_001",
  "name": "Maria Silva",
  "cpf": "12345678900",
  "email": "maria.silva@email.com",
  "consentGiven": true,
  "accounts": []
}
```

**Erros Possíveis**

- `400 Bad Request` - Campos obrigatórios faltando
- `409 Conflict` - CPF já cadastrado

---

### Contas (Accounts)

#### `POST /accounts` - Criar Conta

Cria uma nova conta bancária para um cliente existente.

**Request**
```http
POST /accounts HTTP/1.1
Host: if-arthur.vercel.app
Content-Type: application/json

{
  "customerId": "cus_001",
  "type": "CONTA_CORRENTE",
  "branch": "0001",
  "number": "123456-7"
}
```

**Campos Obrigatórios**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `customerId` | string | ID do cliente dono da conta |
| `type` | string | Tipo da conta (ex: CONTA_CORRENTE, CONTA_POUPANCA) |
| `branch` | string | Agência |
| `number` | string | Número da conta com dígito |

**Response - 201 Created**
```json
{
  "_id": "acc_001",
  "type": "CONTA_CORRENTE",
  "branch": "0001",
  "number": "123456-7",
  "balance": 0,
  "transactions": []
}
```

**Erros Possíveis**

- `400 Bad Request` - Campos obrigatórios faltando
- `404 Not Found` - Cliente não encontrado

---

#### `GET /accounts/:accountId/balance` - Consultar Saldo

Consulta o saldo de uma conta específica. **Requer consentimento do cliente.**

**Request**
```http
GET /accounts/acc_001/balance HTTP/1.1
Host: if-arthur.vercel.app
Accept: application/json
```

**Response - 200 OK**
```json
{
  "accountId": "acc_001",
  "balance": 1500.50
}
```

**Erros Possíveis**

- `403 Forbidden` - Cliente não deu consentimento
- `404 Not Found` - Conta não encontrada

---

### Transações (Transactions)

#### `POST /transactions` - Realizar Transação

Realiza uma transação financeira (crédito ou débito) em uma conta.

**Request - Crédito (Depósito)**
```http
POST /transactions HTTP/1.1
Host: if-arthur.vercel.app
Content-Type: application/json

{
  "accountId": "acc_001",
  "description": "Depósito inicial",
  "amount": 1000.00,
  "type": "credit",
  "category": "Depósito"
}
```

**Request - Débito (Saque)**
```http
POST /transactions HTTP/1.1
Host: if-arthur.vercel.app
Content-Type: application/json

{
  "accountId": "acc_001",
  "description": "Saque no caixa eletrônico",
  "amount": 200.00,
  "type": "debit",
  "category": "Saque"
}
```

**Campos Obrigatórios**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `accountId` | string | ID da conta |
| `description` | string | Descrição da transação |
| `amount` | number | Valor (sempre positivo) |
| `type` | string | Tipo: `"credit"` (entrada) ou `"debit"` (saída) |
| `category` | string | Categoria (ex: Depósito, Saque, Pagamento, Transferência) |

**Response - 201 Created**
```json
{
  "_id": "txn_001",
  "date": "2025-10-30",
  "description": "Depósito inicial",
  "amount": 1000.00,
  "type": "credit",
  "category": "Depósito"
}
```

**Erros Possíveis**

- `400 Bad Request` - Campos obrigatórios faltando, tipo inválido ou saldo insuficiente
- `404 Not Found` - Conta não encontrada

**Nota Importante**: A transação é atômica. O saldo da conta é atualizado automaticamente na mesma transação SQL (uso de `FOR UPDATE` lock).

---

#### `GET /transactions/:accountId` - Listar Transações (Extrato)

Lista todas as transações de uma conta. **Requer consentimento do cliente.**

**Request**
```http
GET /transactions/acc_001 HTTP/1.1
Host: if-arthur.vercel.app
Accept: application/json
```

**Response - 200 OK**
```json
[
  {
    "_id": "txn_001",
    "date": "2025-10-30",
    "description": "Depósito inicial",
    "amount": 1000.00,
    "type": "credit",
    "category": "Depósito"
  },
  {
    "_id": "txn_002",
    "date": "2025-10-30",
    "description": "Saque no caixa eletrônico",
    "amount": 200.00,
    "type": "debit",
    "category": "Saque"
  }
]
```

**Erros Possíveis**

- `403 Forbidden` - Cliente não deu consentimento
- `404 Not Found` - Conta não encontrada

---

## Fluxo de Integração Típico

### 1. Criar Cliente

```http
POST /customers
{
  "name": "João Silva",
  "cpf": "11122233344",
  "email": "joao@email.com",
  "consentGiven": true
}
```

Salvar o `_id` retornado: `cus_001`

### 2. Criar Conta

```http
POST /accounts
{
  "customerId": "cus_001",
  "type": "CONTA_CORRENTE",
  "branch": "0001",
  "number": "555555-0"
}
```

Salvar o `_id` retornado: `acc_001`

### 3. Fazer Depósito Inicial

```http
POST /transactions
{
  "accountId": "acc_001",
  "description": "Depósito inicial",
  "amount": 5000.00,
  "type": "credit",
  "category": "Depósito"
}
```

### 4. Consultar Saldo

```http
GET /accounts/acc_001/balance
```

Retorna: `{ "accountId": "acc_001", "balance": 5000 }`

### 5. Realizar Transações

```http
POST /transactions
{
  "accountId": "acc_001",
  "description": "Compra no supermercado",
  "amount": 350.75,
  "type": "debit",
  "category": "Compra"
}
```

### 6. Ver Extrato

```http
GET /transactions/acc_001
```

---

## Exemplos de Integração

### JavaScript / Node.js (fetch)

```javascript
const API_BASE_URL = 'https://if-arthur.vercel.app';

// Criar cliente
async function createCustomer(customerData) {
  const response = await fetch(`${API_BASE_URL}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(customerData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return await response.json();
}

// Consultar saldo
async function getBalance(accountId) {
  const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/balance`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return await response.json();
}

// Exemplo de uso
(async () => {
  try {
    const customer = await createCustomer({
      name: 'João Silva',
      cpf: '11122233344',
      email: 'joao@email.com',
      consentGiven: true,
    });

    console.log('Cliente criado:', customer._id);
  } catch (error) {
    console.error('Erro:', error.message);
  }
})();
```

### Python (requests)

```python
import requests

API_BASE_URL = 'https://if-arthur.vercel.app'

# Criar cliente
def create_customer(customer_data):
    response = requests.post(
        f'{API_BASE_URL}/customers',
        json=customer_data
    )
    response.raise_for_status()
    return response.json()

# Consultar saldo
def get_balance(account_id):
    response = requests.get(
        f'{API_BASE_URL}/accounts/{account_id}/balance'
    )
    response.raise_for_status()
    return response.json()

# Exemplo de uso
try:
    customer = create_customer({
        'name': 'João Silva',
        'cpf': '11122233344',
        'email': 'joao@email.com',
        'consentGiven': True
    })
    print(f"Cliente criado: {customer['_id']}")
except requests.exceptions.HTTPError as e:
    print(f"Erro: {e.response.json()['error']}")
```

### cURL

```bash
# Criar cliente
curl -X POST https://if-arthur.vercel.app/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "cpf": "11122233344",
    "email": "joao@email.com",
    "consentGiven": true
  }'

# Consultar saldo
curl https://if-arthur.vercel.app/accounts/acc_001/balance

# Realizar transação
curl -X POST https://if-arthur.vercel.app/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "acc_001",
    "description": "Depósito",
    "amount": 1000.00,
    "type": "credit",
    "category": "Depósito"
  }'
```

---

## Boas Práticas

### 1. Tratamento de Erros

Sempre verifique o código de status HTTP e trate erros adequadamente:

```javascript
if (!response.ok) {
  const error = await response.json();
  console.error(`Erro ${response.status}: ${error.error}`);
  // Implementar lógica de retry se apropriado
}
```

### 2. Idempotência

A API **não é idempotente** para operações POST. Evite reenviar requisições de criação sem verificar se o recurso já existe.

### 3. Rate Limiting

Atualmente não há rate limiting implementado, mas é recomendado:
- Não fazer mais de 10 requisições por segundo
- Implementar backoff exponencial em caso de erros 500

### 4. Timeout

Configure timeouts adequados:
- Conexão: 5 segundos
- Leitura: 30 segundos

### 5. Validação de Consentimento

Antes de consultar dados sensíveis (saldo, transações):
1. Certifique-se que o cliente foi criado com `consentGiven: true`
2. Trate adequadamente erros `403 Forbidden`
3. Informe o usuário quando consentimento é necessário

### 6. Valores Monetários

- Sempre use **números decimais** (float/double)
- Precisão: 2 casas decimais
- Envie valores sempre positivos (ex: `1000.00`, nunca `-1000.00`)
- O tipo da transação (`credit` ou `debit`) determina se é entrada ou saída

### 7. CPF

- Envie CPF **apenas com números**, sem pontos ou hífens
- Formato: `"12345678900"` (string de 11 dígitos)
- A API não valida dígitos verificadores, apenas unicidade

---

## Considerações de Segurança

### LGPD e Open Finance

1. **Consentimento Explícito**: Cliente deve autorizar explicitamente (`consentGiven: true`)
2. **Finalidade Específica**: Dados devem ser usados apenas para fins autorizados
3. **Minimização de Dados**: Coleta apenas dados necessários
4. **Direito de Revogação**: Cliente pode revogar consentimento (implemente atualização do cliente)

### HTTPS Obrigatório

- Em produção, **sempre use HTTPS**
- Nunca envie dados sensíveis por HTTP não criptografado

### Dados Sensíveis

Os seguintes endpoints retornam dados sensíveis e requerem consentimento:
- Saldo da conta
- Histórico de transações

---

## Limites e Restrições

| Recurso | Limite |
|---------|--------|
| Tamanho máximo do request | 1 MB |
| Tamanho máximo do campo string | 500 caracteres |
| Quantidade de transações retornadas | Sem limite (todas) |
| Precisão decimal (valores) | 2 casas decimais |

---

## Versionamento

A API atualmente está na versão **1.0.0** e não possui versionamento na URL.

Mudanças futuras que quebrem compatibilidade usarão prefixo de versão:
- `https://if-arthur.vercel.app/v2/customers`

---

## Suporte e Recursos Adicionais

### Documentação

- **Guia do Postman**: [POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md)
- **Collection do Postman**: [Arthur_Financial_Institution_API.postman_collection.json](./Arthur_Financial_Institution_API.postman_collection.json)

### Ambientes de Teste

- **Local**: Use os environments do Postman para testar localmente
- **Produção**: Ambiente Vercel disponível 24/7

### Contato

- **Repositório**: https://github.com/compass-estagio/if-arthur
- **Issues**: https://github.com/compass-estagio/if-arthur/issues

---

## Changelog

### v1.0.0 (2025-10-30)

- ✅ Implementação inicial da API
- ✅ Endpoints de clientes, contas e transações
- ✅ Validação de consentimento (Open Finance / LGPD)
- ✅ Migração de Sequelize para PostgreSQL nativo
- ✅ Deploy no Vercel com serverless functions
- ✅ Transações atômicas com lock de linha (FOR UPDATE)
- ✅ Documentação completa e collection do Postman

---

**Desenvolvido por Arthur | Compass UOL**

**Open Finance Brasil - Fase 2 | Em conformidade com LGPD**
