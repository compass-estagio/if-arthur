const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

// Inicializar conexão com banco de dados
const { testConnection } = require('../config/db');
const models = require('./models'); // Carregar models e relacionamentos

const customersRouter = require('./routes/customers');
const accountsRouter = require('./routes/accounts');
const transactionsRouter = require('./routes/transactions');

const app = express();

// Testar conexão com banco (apenas em desenvolvimento/produção, não em testes)
if (process.env.NODE_ENV !== 'test') {
  testConnection();
}

app.use(bodyParser.json());

app.use('/customers', customersRouter);
app.use('/accounts', accountsRouter);
app.use('/transactions', transactionsRouter);

// Rota de status - Página inicial da API
app.get('/', (req, res) => {
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
            <span class="method post">POST</span><strong>/customers</strong>
            <p>Criar novo cliente no sistema bancário</p>
        </div>
        
        <div class="endpoint">
            <span class="method post">POST</span><strong>/accounts</strong>
            <p>Criar nova conta para um cliente existente</p>
        </div>
        
        <div class="endpoint">
            <span class="method get">GET</span><strong>/accounts/{id}/balance</strong>
            <p>Consultar saldo de uma conta específica</p>
        </div>
        
        <div class="endpoint">
            <span class="method post">POST</span><strong>/transactions</strong>
            <p>Realizar transação (crédito ou débito)</p>
        </div>
        
        <div class="endpoint">
            <span class="method get">GET</span><strong>/transactions/{accountId}</strong>
            <p>Listar todas as transações de uma conta (extrato)</p>
        </div>

        <h2>💡 Exemplo de Uso</h2>
        
        <div class="example">
            <h3>1. Criar Cliente</h3>
            <pre>POST https://if-arthur.vercel.app/customers
Content-Type: application/json

{
  "name": "Maria Silva",
  "cpf": "12345678900",
  "email": "maria.silva@email.com"
}</pre>
        </div>

        <div class="example">
            <h3>2. Consultar Saldo</h3>
            <pre>GET https://if-arthur.vercel.app/accounts/acc_001/balance</pre>
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
          create: "POST /customers",
          description: "Criar novo cliente"
        },
        accounts: {
          create: "POST /accounts",
          balance: "GET /accounts/{id}/balance",
          description: "Gerenciar contas bancárias"
        },
        transactions: {
          create: "POST /transactions",
          list: "GET /transactions/{accountId}",
          description: "Realizar e consultar transações"
        }
      },
      examples: {
        createCustomer: {
          method: "POST",
          url: "/customers",
          body: {
            name: "Maria Silva",
            cpf: "12345678900",
            email: "maria.silva@email.com"
          }
        },
        checkBalance: {
          method: "GET",
          url: "/accounts/acc_001/balance"
        }
      },
      documentation: "https://github.com/compass-estagio/if-arthur",
      author: "Arthur",
      deployed: "Vercel"
    });
  }
});

module.exports = app;
