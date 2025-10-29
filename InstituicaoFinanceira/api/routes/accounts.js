const express = require('express');
const router = express.Router();
const { Customer, Account } = require('../models');
const { generateAccountId } = require('../utils/idGenerator');
const { validateConsent } = require('../middleware/consentValidation');

router.post('/', async (req, res) => {
  try {
    const { customerId, type, branch, number } = req.body;

    // Validações
    if (!customerId || !type || !branch || !number) {
      return res.status(400).json({ error: 'Campos obrigatórios: customerId, type, branch, number.' });
    }

    // Verificar se cliente existe
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    // Gerar ID sequencial
    const id = await generateAccountId();

    // Criar nova conta
    const newAccount = await Account.create({
      id,
      customerId,
      type,
      branch,
      number,
      balance: 0.0
    });

    // Retornar no formato esperado pelos testes
    const response = {
      _id: newAccount.id,
      type: newAccount.type,
      branch: newAccount.branch,
      number: newAccount.number,
      balance: newAccount.balance,
      transactions: [] // Por enquanto vazio
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Erro ao criar conta:', error);
    res.status(500).json({ error: 'Erro interno ao criar conta.' });
  }
});

// Middleware de validação de consentimento aplicado
router.get('/:accountId/balance', validateConsent, async (req, res) => {
  try {
    const { accountId } = req.params;

    // Buscar conta no banco
    const account = await Account.findByPk(accountId);
    if (!account) {
      return res.status(404).json({ error: 'Conta não encontrada.' });
    }

    res.json({
      accountId: account.id,
      balance: account.balance
    });
  } catch (error) {
    console.error('Erro ao consultar saldo:', error);
    res.status(500).json({ error: 'Erro interno ao consultar saldo.' });
  }
});

module.exports = router;
