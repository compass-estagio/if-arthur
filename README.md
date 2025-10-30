# 🏦 Arthur Financial Institution API

> **Instituição Financeira API para Open Finance Brasil - Fase 2**

Uma API RESTful completa para simulação de serviços bancários, desenvolvida em conformidade com os padrões do **Open Finance Brasil** e **LGPD** (Lei Geral de Proteção de Dados).

[![Deploy](https://img.shields.io/badge/deploy-vercel-black)](https://if-arthur.vercel.app)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22.x-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-ISC-blue)](LICENSE)

## 🌐 API em Produção

**Base URL**: https://if-arthur.vercel.app

- 🚀 Deploy automático via Vercel
- 🔒 HTTPS por padrão
- ⚡ Serverless functions
- 🗄️ PostgreSQL (Vercel Postgres)

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** | 📖 Documentação técnica completa da API - padrões, endpoints, exemplos de integração |
| **[POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md)** | 📦 Guia de uso da collection do Postman - como importar e testar |
| **[Arthur_Financial_Institution_API.postman_collection.json](./Arthur_Financial_Institution_API.postman_collection.json)** | 📬 Collection do Postman com 20+ requests |

## ⚡ Quick Start

### Testar API em Produção

```bash
# Verificar status
curl https://if-arthur.vercel.app/api

# Criar cliente
curl -X POST https://if-arthur.vercel.app/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Silva",
    "cpf": "12345678900",
    "email": "maria.silva@email.com",
    "consentGiven": true
  }'
```

### Instalar e Rodar Localmente

```bash
# 1. Clone o repositório
git clone https://github.com/compass-estagio/if-arthur.git
cd if-arthur

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do PostgreSQL

# 4. Execute em modo desenvolvimento
npm run dev

# 5. API disponível em http://localhost:3000
```

### Testar com Postman

1. Importe a [collection do Postman](./Arthur_Financial_Institution_API.postman_collection.json)
2. Importe os [environments](./Arthur_Financial_Institution_Production.postman_environment.json)
3. Selecione "Production" ou "Local" no dropdown
4. Execute os requests!

Veja o [guia completo do Postman](./POSTMAN_GUIDE.md)

## 🎯 Funcionalidades

### ✅ Endpoints Implementados

| Recurso | Método | Endpoint | Descrição |
|---------|--------|----------|-----------|
| **Status** | GET | `/` ou `/api` | Status da API |
| **Clientes** | POST | `/customers` | Criar cliente |
| **Contas** | POST | `/accounts` | Criar conta |
| **Contas** | GET | `/accounts/:id/balance` | Consultar saldo |
| **Transações** | POST | `/transactions` | Realizar transação |
| **Transações** | GET | `/transactions/:accountId` | Listar transações (extrato) |

### 🔒 Open Finance & LGPD

- ✅ **Consentimento Explícito**: Cliente autoriza compartilhamento de dados
- ✅ **Validação Automática**: Endpoints sensíveis verificam consentimento
- ✅ **Conformidade LGPD**: Coleta e uso de dados conforme legislação

**Endpoints que requerem consentimento:**
- `GET /accounts/:id/balance` - Consultar saldo
- `GET /transactions/:accountId` - Listar transações

## 📊 Stack Tecnológica

- **Runtime**: Node.js 22.x
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL (pg driver nativo)
- **Deploy**: Vercel (Serverless Functions)
- **Testes**: Jest + Supertest
- **Environment**: dotenv

## 🗃️ Modelos de Dados

### Cliente (Customer)

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

### Conta (Account)

```json
{
  "_id": "acc_001",
  "type": "CONTA_CORRENTE",
  "branch": "0001",
  "number": "123456-7",
  "balance": 1500.50,
  "transactions": []
}
```

### Transação (Transaction)

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

## 🔄 Fluxo de Uso Completo

```bash
# 1. Criar cliente (com consentimento)
curl -X POST https://if-arthur.vercel.app/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "cpf": "11122233344",
    "email": "joao@email.com",
    "consentGiven": true
  }'
# Retorna: { "_id": "cus_001", ... }

# 2. Criar conta
curl -X POST https://if-arthur.vercel.app/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cus_001",
    "type": "CONTA_CORRENTE",
    "branch": "0001",
    "number": "555555-0"
  }'
# Retorna: { "_id": "acc_001", "balance": 0, ... }

# 3. Fazer depósito
curl -X POST https://if-arthur.vercel.app/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "acc_001",
    "description": "Depósito inicial",
    "amount": 5000.00,
    "type": "credit",
    "category": "Depósito"
  }'
# Retorna: { "_id": "txn_001", ... }

# 4. Consultar saldo
curl https://if-arthur.vercel.app/accounts/acc_001/balance
# Retorna: { "accountId": "acc_001", "balance": 5000 }

# 5. Fazer compra
curl -X POST https://if-arthur.vercel.app/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "acc_001",
    "description": "Compra no supermercado",
    "amount": 350.75,
    "type": "debit",
    "category": "Compra"
  }'

# 6. Ver extrato completo
curl https://if-arthur.vercel.app/transactions/acc_001
# Retorna: [ { "_id": "txn_001", ... }, { "_id": "txn_002", ... } ]
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar com watch mode
npm run test:watch

# Ver cobertura
npm test -- --coverage
```

**Cobertura de Testes:**
- ✅ 39+ testes automatizados
- ✅ 100% de cobertura de código
- ✅ Testes de integração end-to-end
- ✅ Testes de validação de consentimento

## 🚀 Deploy

### Deploy Automático (Vercel)

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - Outras variáveis do Postgres
3. Deploy automático a cada push na `main`

### Deploy Manual

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 📋 Variáveis de Ambiente

```env
# PostgreSQL (Vercel Postgres)
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NO_SSL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."

# Ambiente
NODE_ENV="production"
PORT=3000
```

## 🔧 Scripts Disponíveis

```bash
npm start          # Iniciar servidor (produção)
npm run dev        # Iniciar com nodemon (desenvolvimento)
npm test           # Executar testes
npm run test:watch # Testes em modo watch
npm run build      # Instalar dependências (Vercel)
```

## 📚 Estrutura do Projeto

```
if-arthur/
├── api/                          # Código da API
│   ├── index.js                  # Entry point serverless
│   ├── app.js                    # Configuração Express
│   ├── routes/                   # Definição de rotas
│   │   ├── customers.js
│   │   ├── accounts.js
│   │   └── transactions.js
│   ├── db/                       # Camada de acesso a dados
│   │   ├── customers.js
│   │   ├── accounts.js
│   │   └── transactions.js
│   ├── middleware/               # Middlewares
│   │   └── consentValidation.js
│   └── utils/                    # Utilitários
│       └── idGenerator.js
├── config/                       # Configurações
│   └── postgres.js
├── public/                       # Arquivos estáticos
│   └── index.html
├── src/                          # Source (local dev)
│   └── server.js
├── tests/                        # Testes automatizados
├── API_DOCUMENTATION.md          # 📖 Documentação da API
├── POSTMAN_GUIDE.md              # 📦 Guia do Postman
├── *.postman_collection.json     # Collections do Postman
├── *.postman_environment.json    # Environments do Postman
├── vercel.json                   # Configuração Vercel
└── package.json
```

## 🔐 Segurança e Conformidade

### LGPD

- ✅ Consentimento explícito do cliente
- ✅ Finalidade específica dos dados
- ✅ Minimização de coleta de dados
- ✅ Transparência no uso de dados

### Open Finance Brasil

- ✅ Validação de consentimento em endpoints sensíveis
- ✅ Formato de dados padronizado
- ✅ API RESTful seguindo especificações
- ✅ Tratamento adequado de erros

### Boas Práticas

- ✅ HTTPS obrigatório em produção
- ✅ Transações atômicas (ACID)
- ✅ Validação de dados de entrada
- ✅ Tratamento de erros padronizado
- ✅ Logs de erro detalhados

## 📊 Códigos de Status HTTP

| Código | Descrição | Uso |
|--------|-----------|-----|
| `200` | OK | Requisição bem-sucedida |
| `201` | Created | Recurso criado |
| `400` | Bad Request | Dados inválidos ou saldo insuficiente |
| `403` | Forbidden | Sem consentimento |
| `404` | Not Found | Recurso não encontrado |
| `409` | Conflict | Recurso duplicado (CPF) |
| `500` | Internal Server Error | Erro no servidor |

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Changelog

### v1.0.0 (2025-10-30)

- ✅ Implementação completa da API
- ✅ Migração de Sequelize para PostgreSQL nativo
- ✅ Deploy no Vercel com serverless functions
- ✅ Validação de consentimento (Open Finance/LGPD)
- ✅ Transações atômicas com lock
- ✅ Documentação técnica completa
- ✅ Collection do Postman com 20+ requests
- ✅ Interface web para visualização

## 📞 Suporte

- **Documentação Técnica**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Guia do Postman**: [POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md)
- **Issues**: https://github.com/compass-estagio/if-arthur/issues
- **API em Produção**: https://if-arthur.vercel.app

## 📄 Licença

ISC License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Arthur**
- Compass UOL
- Open Finance Brasil - Fase 2

---

**⭐ Se este projeto foi útil, considere dar uma estrela no GitHub!**

**🚀 API Online**: https://if-arthur.vercel.app
