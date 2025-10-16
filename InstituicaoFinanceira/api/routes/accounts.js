const express = require('express');
const router = express.Router();
const customers = require('../models/customer');
const accounts = require('../models/account');

router.post('/', (req, res) => {
  const { customerId, type, branch, number } = req.body;
  if (!customerId || !type || !branch || !number) {
    return res.status(400).json({ error: 'Campos obrigatórios: customerId, type, branch, number.' });
  }
  const customer = customers.find(c => c._id === customerId);
  if (!customer) {
    return res.status(404).json({ error: 'Cliente não encontrado.' });
  }
  const newAccount = {
    _id: `acc_${(accounts.length + 1).toString().padStart(3, '0')}`,
    type,
    branch,
    number,
    balance: 0.0,
    transactions: []
  };
  accounts.push(newAccount);
  customer.accounts.push(newAccount._id);
  res.status(201).json(newAccount);
});

router.get('/:accountId/balance', (req, res) => {
  const { accountId } = req.params;
  const account = accounts.find(a => a._id === accountId);
  if (!account) {
    return res.status(404).json({ error: 'Conta não encontrada.' });
  }
  res.json({ accountId: account._id, balance: account.balance });
});

module.exports = router;
