const express = require('express');
const router = express.Router();
const { createCustomer, findCustomerByCpf } = require('../db/customers');
const { generateCustomerId } = require('../utils/idGenerator');

router.post('/', async (req, res) => {
  try {
    const { name, cpf, email, consentGiven } = req.body;

    // Validações
    if (!name || !cpf || !email) {
      return res.status(400).json({ error: 'Nome, CPF e email são obrigatórios.' });
    }

    if (consentGiven === undefined) {
      return res.status(400).json({ error: 'O campo consentGiven é obrigatório (true/false).' });
    }

    // Verificar se CPF já existe
    const existingCustomer = await findCustomerByCpf(cpf);
    if (existingCustomer) {
      return res.status(409).json({ error: 'Cliente com este CPF já existe.' });
    }

    // Gerar ID sequencial
    const id = await generateCustomerId();

    // Criar novo cliente
    const newCustomer = await createCustomer(
      id,
      name,
      cpf,
      email,
      Boolean(consentGiven)
    );

    // Retornar no formato esperado pelos testes (_id ao invés de id)
    const response = {
      _id: newCustomer.id,
      name: newCustomer.name,
      cpf: newCustomer.cpf,
      email: newCustomer.email,
      consentGiven: newCustomer.consent_given,
      accounts: [] // Por enquanto vazio, será populado quando buscar com include
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro interno ao criar cliente.' });
  }
});

module.exports = router;
