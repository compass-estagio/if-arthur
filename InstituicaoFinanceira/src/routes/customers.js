const express = require('express');
const router = express.Router();
const customers = require('../models/customer');

router.post('/', (req, res) => {
  const { name, cpf, email } = req.body;
  if (!name || !cpf || !email) {
    return res.status(400).json({ error: 'Nome, CPF e email são obrigatórios.' });
  }
  if (customers.find(c => c.cpf === cpf)) {
    return res.status(409).json({ error: 'Cliente com este CPF já existe.' });
  }
  const newCustomer = {
    _id: `cus_${(customers.length + 1).toString().padStart(3, '0')}`,
    name,
    cpf,
    email,
    accounts: []
  };
  customers.push(newCustomer);
  res.status(201).json(newCustomer);
});

module.exports = router;

