const express = require('express');
const router = express.Router();
const { createCustomer, findCustomerByCpf, findCustomerById } = require('../db/customers');
const { getAccountsByCustomerId } = require('../db/accounts');
const { generateCustomerId } = require('../utils/idGenerator');
const { validateConsent } = require('../middleware/consentValidation');

/**
 * GET /customers/lookup/by-cpf/:cpf
 * Busca cliente por CPF (rota pública)
 * Retorna apenas _id e cpf para integração com API Principal
 */
router.get('/lookup/by-cpf/:cpf', async (req, res) => {
  try {
    const { cpf } = req.params;

    // Validação básica de CPF
    if (!cpf || cpf.length !== 11) {
      return res.status(400).json({
        error: 'CPF inválido. O CPF deve conter 11 dígitos numéricos.'
      });
    }

    // Buscar cliente por CPF
    const customer = await findCustomerByCpf(cpf);

    if (!customer) {
      return res.status(404).json({
        error: 'Cliente não encontrado com este CPF.'
      });
    }

    // Retornar apenas _id e cpf (dados necessários para integração)
    res.json({
      _id: customer.id,
      cpf: customer.cpf
    });
  } catch (error) {
    console.error('Erro ao buscar cliente por CPF:', error);
    res.status(500).json({
      error: 'Erro interno ao buscar cliente.'
    });
  }
});

/**
 * GET /customers/:customerId/accounts
 * Lista todas as contas de um cliente específico
 * Requer consentimento válido
 * IMPORTANTE: Esta rota deve vir ANTES de /:customerId para evitar conflito
 */
router.get('/:customerId/accounts', async (req, res) => {
  try {
    const { customerId } = req.params;

    // Verificar se o cliente existe
    const customer = await findCustomerById(customerId);
    if (!customer) {
      return res.status(404).json({
        error: 'Cliente não encontrado.'
      });
    }

    // Verificar consentimento do cliente
    const { findActiveConsentByCustomerId } = require('../db/consents');
    const activeConsent = await findActiveConsentByCustomerId(customerId);

    if (!activeConsent) {
      return res.status(403).json({
        error: 'CONSENT_REQUIRED',
        message: 'Acesso negado: Cliente não possui consentimento válido para compartilhamento de dados.',
        customerId: customerId,
        details: 'É necessário criar um consentimento autorizado e não expirado para acessar estes dados.'
      });
    }

    // Buscar todas as contas do cliente
    const accounts = await getAccountsByCustomerId(customerId);

    // Formatar resposta
    const response = accounts.map(account => ({
      _id: account.id,
      type: account.type,
      branch: account.branch,
      number: account.number,
      balance: account.balance
    }));

    res.json(response);
  } catch (error) {
    console.error('Erro ao listar contas do cliente:', error);
    res.status(500).json({
      error: 'Erro interno ao listar contas.'
    });
  }
});

/**
 * GET /customers/:customerId
 * Retorna os dados de um cliente específico
 * Requer consentimento válido
 * IMPORTANTE: Esta rota deve vir DEPOIS de /:customerId/accounts
 */
router.get('/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;

    // Verificar se o cliente existe
    const customer = await findCustomerById(customerId);
    if (!customer) {
      return res.status(404).json({
        error: 'Cliente não encontrado.'
      });
    }

    // Verificar consentimento do cliente
    const { findActiveConsentByCustomerId } = require('../db/consents');
    const activeConsent = await findActiveConsentByCustomerId(customerId);

    if (!activeConsent) {
      return res.status(403).json({
        error: 'CONSENT_REQUIRED',
        message: 'Acesso negado: Cliente não possui consentimento válido para compartilhamento de dados.',
        customerId: customerId,
        details: 'É necessário criar um consentimento autorizado e não expirado para acessar estes dados.'
      });
    }

    // Retornar dados do cliente (sem contas por enquanto)
    res.json({
      _id: customer.id,
      name: customer.name,
      cpf: customer.cpf,
      email: customer.email,
      consentGiven: customer.consent_given
    });
  } catch (error) {
    console.error('Erro ao buscar dados do cliente:', error);
    res.status(500).json({
      error: 'Erro interno ao buscar cliente.'
    });
  }
});

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
