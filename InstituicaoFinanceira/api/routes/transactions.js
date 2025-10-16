const express = require('express');
const router = express.Router();
const accounts = require('../models/account');
const transactions = require('../models/transaction');

// Realizar transação (crédito ou débito)
router.post('/', (req, res) => {
  const { accountId, description, amount, type, category } = req.body;
  if (!accountId || !description || !amount || !type || !category) {
    return res.status(400).json({ error: 'Campos obrigatórios: accountId, description, amount, type, category.' });
  }
  const account = accounts.find(a => a._id === accountId);
  if (!account) {
    return res.status(404).json({ error: 'Conta não encontrada.' });
  }
  if (type !== 'credit' && type !== 'debit') {
    return res.status(400).json({ error: 'Tipo de transação deve ser credit ou debit.' });
  }
  if (type === 'debit' && account.balance < amount) {
    return res.status(400).json({ error: 'Saldo insuficiente.' });
  }
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const newTransaction = {
    _id: `txn_${(transactions.length + 1).toString().padStart(3, '0')}`,
    date,
    description,
    amount: Number(amount),
    type,
    category
  };
  transactions.push(newTransaction);
  account.transactions.push(newTransaction._id);
  if (type === 'credit') {
    account.balance += Number(amount);
  } else {
    account.balance -= Number(amount);
  }
  res.status(201).json(newTransaction);
});

// Listar transações (extrato) por conta
router.get('/:accountId', (req, res) => {
  const { accountId } = req.params;
  const account = accounts.find(a => a._id === accountId);
  if (!account) {
    return res.status(404).json({ error: 'Conta não encontrada.' });
  }
  const accountTransactions = account.transactions.map(tid =>
    transactions.find(t => t._id === tid)
  );
  res.json(accountTransactions);
});

module.exports = router;
