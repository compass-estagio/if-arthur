const express = require('express');
const bodyParser = require('body-parser');

const customersRouter = require('./routes/customers');
const accountsRouter = require('./routes/accounts');
const transactionsRouter = require('./routes/transactions');

const app = express();

app.use(bodyParser.json());

app.use('/customers', customersRouter);
app.use('/accounts', accountsRouter);
app.use('/transactions', transactionsRouter);

// Rota de status
app.get('/', (req, res) => {
  res.json({ status: 'Instituição Financeira API rodando' });
});

module.exports = app;
