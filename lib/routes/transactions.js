const express = require('express');
const router = express.Router();
const { findAccountById, updateAccountBalance } = require('../db/accounts');
const { createTransaction, getTransactionsByAccountId } = require('../db/transactions');
const { getClient, beginTransaction, commitTransaction, rollbackTransaction } = require('../../config/postgres');
const { generateTransactionId } = require('../utils/idGenerator');
const { validateConsent } = require('../middleware/consentValidation');

// Realizar transação (crédito ou débito)
router.post('/', async (req, res) => {
  const client = await getClient();

  try {
    // Iniciar transação SQL
    await beginTransaction(client);

    const { accountId, description, amount, type, category } = req.body;

    // Validações
    if (!accountId || !description || !amount || !type || !category) {
      await rollbackTransaction(client);
      client.release();
      return res.status(400).json({ error: 'Campos obrigatórios: accountId, description, amount, type, category.' });
    }

    // Buscar conta com lock (evita race conditions)
    const accountResult = await client.query('SELECT * FROM accounts WHERE id = $1 FOR UPDATE', [accountId]);
    if (accountResult.rows.length === 0) {
      await rollbackTransaction(client);
      client.release();
      return res.status(404).json({ error: 'Conta não encontrada.' });
    }
    const account = accountResult.rows[0];

    // Validar tipo de transação
    if (type !== 'credit' && type !== 'debit') {
      await rollbackTransaction(client);
      client.release();
      return res.status(400).json({ error: 'Tipo de transação deve ser credit ou debit.' });
    }

    // Verificar saldo para débito
    if (type === 'debit' && parseFloat(account.balance) < Number(amount)) {
      await rollbackTransaction(client);
      client.release();
      return res.status(400).json({ error: 'Saldo insuficiente.' });
    }

    // Gerar ID sequencial
    const id = await generateTransactionId();

    // Data atual
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Criar transação
    const transactionResult = await client.query(
      `INSERT INTO transactions (id, account_id, date, description, amount, type, category, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [id, accountId, date, description, Number(amount), type, category]
    );
    const newTransaction = transactionResult.rows[0];

    // Atualizar saldo da conta
    let newBalance;
    if (type === 'credit') {
      newBalance = parseFloat(account.balance) + Number(amount);
    } else {
      newBalance = parseFloat(account.balance) - Number(amount);
    }

    await client.query(
      'UPDATE accounts SET balance = $1, updated_at = NOW() WHERE id = $2',
      [newBalance, accountId]
    );

    // Commit da transação
    await commitTransaction(client);
    client.release();

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
    await rollbackTransaction(client);
    client.release();
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
    const account = await findAccountById(accountId);
    if (!account) {
      return res.status(404).json({ error: 'Conta não encontrada.' });
    }

    // Buscar todas as transações da conta
    const accountTransactions = await getTransactionsByAccountId(accountId);

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
