const express = require('express');
const bodyParser = require('body-parser');

// Carregar dotenv apenas em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const customersRouter = require('./routes/customers');
const accountsRouter = require('./routes/accounts');
const transactionsRouter = require('./routes/transactions');
const consentsRouter = require('./routes/consents');

const app = express();

// Testar conexão com banco (apenas em desenvolvimento/produção, não em testes)
if (process.env.NODE_ENV !== 'test') {
  const { testConnection } = require('../config/postgres');
  testConnection().catch(err => console.error('Erro ao testar conexão:', err));
}

app.use(bodyParser.json());

// Rotas com prefixo /openfinance
app.use('/openfinance/customers', customersRouter);
app.use('/openfinance/accounts', accountsRouter);
app.use('/openfinance/transactions', transactionsRouter);
app.use('/openfinance/consents', consentsRouter);

// Função helper para resposta da página inicial
const sendApiStatus = (req, res) => {
  // Se a requisição aceita HTML (navegador), retorna página HTML
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Arthur Financial Institution API</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #667eea;
            padding-bottom: 20px;
        }
        .status {
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 5px solid #28a745;
        }
        .endpoint {
            background: #f8f9fa;
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            border-left: 4px solid #007bff;
        }
        .method {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            margin-right: 10px;
        }
        .post { background: #28a745; color: white; }
        .get { background: #007bff; color: white; }
        .delete { background: #dc3545; color: white; }
        .example {
            background: #fff3cd;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
            border-left: 4px solid #ffc107;
        }
        pre {
            background: #f1f1f1;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏦 Arthur Financial Institution API</h1>
            <p>Instituição Financeira para Open Finance - Fase 2</p>
        </div>

        <div class="status">
            <strong>✅ Status:</strong> API Online e Funcionando<br>
            <strong>🕒 Timestamp:</strong> ${new Date().toLocaleString('pt-BR')}<br>
            <strong>🚀 Deploy:</strong> Vercel<br>
            <strong>📝 Versão:</strong> 1.0.0
        </div>

        <h2>📋 Endpoints Disponíveis</h2>

        <div class="endpoint">
            <span class="method get">GET</span><strong>/openfinance/customers/lookup/by-cpf/{cpf}</strong>
            <p>Buscar cliente por CPF (rota pública para integração)</p>
        </div>

        <div class="endpoint">
            <span class="method post">POST</span><strong>/openfinance/customers</strong>
            <p>Criar novo cliente no sistema bancário</p>
        </div>

        <div class="endpoint">
            <span class="method post">POST</span><strong>/openfinance/accounts</strong>
            <p>Criar nova conta para um cliente existente</p>
        </div>

        <div class="endpoint">
            <span class="method get">GET</span><strong>/openfinance/accounts/{id}/balance</strong>
            <p>Consultar saldo de uma conta específica (requer consentimento)</p>
        </div>

        <div class="endpoint">
            <span class="method post">POST</span><strong>/openfinance/transactions</strong>
            <p>Realizar transação (crédito ou débito)</p>
        </div>

        <div class="endpoint">
            <span class="method get">GET</span><strong>/openfinance/transactions/{accountId}</strong>
            <p>Listar todas as transações de uma conta (requer consentimento)</p>
        </div>

        <div class="endpoint">
            <span class="method post">POST</span><strong>/openfinance/consents</strong>
            <p>Criar consentimento autorizado (válido por 1 ano)</p>
        </div>

        <div class="endpoint">
            <span class="method get">GET</span><strong>/openfinance/consents/{id}</strong>
            <p>Consultar consentimento específico</p>
        </div>

        <div class="endpoint">
            <span class="method delete">DELETE</span><strong>/openfinance/consents/{id}</strong>
            <p>Revogar consentimento existente</p>
        </div>

        <h2>💡 Exemplo de Uso</h2>

        <div class="example">
            <h3>1. Criar Cliente</h3>
            <pre>POST https://if-arthur.vercel.app/openfinance/customers
Content-Type: application/json

{
  "name": "Maria Silva",
  "cpf": "12345678900",
  "email": "maria.silva@email.com",
  "consentGiven": true
}</pre>
        </div>

        <div class="example">
            <h3>2. Buscar Cliente por CPF</h3>
            <pre>GET https://if-arthur.vercel.app/openfinance/customers/lookup/by-cpf/12345678900</pre>
        </div>

        <div class="example">
            <h3>3. Criar Consentimento</h3>
            <pre>POST https://if-arthur.vercel.app/openfinance/consents
Content-Type: application/json

{
  "customerId": "cus_001",
  "permissions": ["READ_ACCOUNTS", "READ_BALANCES", "READ_TRANSACTIONS"]
}</pre>
        </div>

        <div class="example">
            <h3>4. Consultar Saldo (Requer Consentimento)</h3>
            <pre>GET https://if-arthur.vercel.app/openfinance/accounts/acc_001/balance</pre>
        </div>

        <div class="footer">
            <p>📚 <a href="https://github.com/compass-estagio/if-arthur" target="_blank">Documentação Completa</a></p>
            <p>Desenvolvido por Arthur | Compass UOL</p>
        </div>
    </div>
</body>
</html>
    `);
  } else {
    // Se for uma requisição de API (JSON), retorna dados estruturados
    res.json({
      name: "Arthur Financial Institution API",
      status: "✅ Online",
      version: "1.0.0",
      description: "Instituição Financeira para Open Finance - Fase 2",
      timestamp: new Date().toISOString(),
      endpoints: {
        customers: {
          lookup: "GET /openfinance/customers/lookup/by-cpf/{cpf}",
          create: "POST /openfinance/customers",
          description: "Gerenciar clientes e buscar por CPF"
        },
        accounts: {
          create: "POST /openfinance/accounts",
          balance: "GET /openfinance/accounts/{id}/balance",
          description: "Gerenciar contas bancárias (saldo requer consentimento)"
        },
        transactions: {
          create: "POST /openfinance/transactions",
          list: "GET /openfinance/transactions/{accountId}",
          description: "Realizar e consultar transações (listagem requer consentimento)"
        },
        consents: {
          create: "POST /openfinance/consents",
          get: "GET /openfinance/consents/{id}",
          revoke: "DELETE /openfinance/consents/{id}",
          description: "Gerenciar consentimentos Open Finance"
        }
      },
      examples: {
        lookupCustomer: {
          method: "GET",
          url: "/openfinance/customers/lookup/by-cpf/12345678900",
          description: "Buscar cliente por CPF"
        },
        createCustomer: {
          method: "POST",
          url: "/openfinance/customers",
          body: {
            name: "Maria Silva",
            cpf: "12345678900",
            email: "maria.silva@email.com",
            consentGiven: true
          }
        },
        createConsent: {
          method: "POST",
          url: "/openfinance/consents",
          body: {
            customerId: "cus_001",
            permissions: ["READ_ACCOUNTS", "READ_BALANCES", "READ_TRANSACTIONS"]
          }
        },
        checkBalance: {
          method: "GET",
          url: "/openfinance/accounts/acc_001/balance",
          description: "Requer consentimento ativo"
        }
      },
      documentation: "https://github.com/compass-estagio/if-arthur",
      author: "Arthur",
      deployed: "Vercel"
    });
  }
};

// Rota de status - Página inicial da API (funciona tanto em / quanto em /api)
app.get('/', sendApiStatus);
app.get('/api', sendApiStatus);

module.exports = app;
