const express = require('express');
const router = express.Router();
const { Account, Transaction } = require('../models');
const { sequelize } = require('../../config/db');
const { generateTransactionId } = require('../utils/idGenerator');
const { validateConsent } = require('../middleware/consentValidation');

// Realizar transação (crédito ou débito)
router.post('/', async (req, res) => {
  // Usar transação SQL para garantir atomicidade
  const t = await sequelize.transaction();

  try {
    const { accountId, description, amount, type, category } = req.body;

    // Validações
    if (!accountId || !description || !amount || !type || !category) {
      await t.rollback();
      return res.status(400).json({ error: 'Campos obrigatórios: accountId, description, amount, type, category.' });
    }

    // Buscar conta com lock (evita race conditions)
    const account = await Account.findByPk(accountId, { transaction: t, lock: true });
    if (!account) {
      await t.rollback();
      return res.status(404).json({ error: 'Conta não encontrada.' });
    }

    // Validar tipo de transação
    if (type !== 'credit' && type !== 'debit') {
      await t.rollback();
      return res.status(400).json({ error: 'Tipo de transação deve ser credit ou debit.' });
    }

    // Verificar saldo para débito
    if (type === 'debit' && account.balance < Number(amount)) {
      await t.rollback();
      return res.status(400).json({ error: 'Saldo insuficiente.' });
    }

    // Gerar ID sequencial
    const id = await generateTransactionId();

    // Data atual
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Criar transação
    const newTransaction = await Transaction.create({
      id,
      accountId,
      date,
      description,
      amount: Number(amount),
      type,
      category
    }, { transaction: t });

    // Atualizar saldo da conta
    if (type === 'credit') {
      account.balance = parseFloat(account.balance) + Number(amount);
    } else {
      account.balance = parseFloat(account.balance) - Number(amount);
    }
    await account.save({ transaction: t });

    // Commit da transação
    await t.commit();

    // Retornar no formato esperado pelos testes
    const response = {
      _id: newTransaction.id,
      date: newTransaction.date,
      description: newTransaction.description,
      amount: newTransaction.amount,
      type: newTransaction.type,
      category: newTransaction.category
    };

    res.status(201).json(response);
  } catch (error) {
    // Rollback em caso de erro
    await t.rollback();
    console.error('Erro ao realizar transação:', error);
    res.status(500).json({ error: 'Erro interno ao realizar transação.' });
  }
});

// Listar transações (extrato) por conta
// Middleware de validação de consentimento aplicado
router.get('/:accountId', validateConsent, async (req, res) => {
  try {
    const { accountId } = req.params;

    // Verificar se conta existe
    const account = await Account.findByPk(accountId);
    if (!account) {
      return res.status(404).json({ error: 'Conta não encontrada.' });
    }

    // Buscar todas as transações da conta
    const accountTransactions = await Transaction.findAll({
      where: { accountId },
      order: [['created_at', 'ASC']] // Ordenar por data de criação
    });

    // Retornar no formato esperado pelos testes
    const response = accountTransactions.map(t => ({
      _id: t.id,
      date: t.date,
      description: t.description,
      amount: t.amount,
      type: t.type,
      category: t.category
    }));

    res.json(response);
  } catch (error) {
    console.error('Erro ao listar transações:', error);
    res.status(500).json({ error: 'Erro interno ao listar transações.' });
  }
});

module.exports = router;
