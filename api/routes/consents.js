const express = require('express');
const router = express.Router();
const {
  createConsent,
  findConsentById,
  revokeConsent
} = require('../db/consents');
const { findCustomerById } = require('../db/customers');
const { generateConsentId } = require('../utils/idGenerator');

/**
 * POST /consents
 * Cria um novo consentimento
 * Auto-autorizado com status AUTHORIZED e validade de 1 ano
 */
router.post('/', async (req, res) => {
  try {
    const { customerId, permissions } = req.body;

    // Validações
    if (!customerId || !permissions) {
      return res.status(400).json({
        error: 'Campos obrigatórios: customerId, permissions'
      });
    }

    if (!Array.isArray(permissions) || permissions.length === 0) {
      return res.status(400).json({
        error: 'O campo permissions deve ser um array não vazio'
      });
    }

    // Verificar se o cliente existe
    const customer = await findCustomerById(customerId);
    if (!customer) {
      return res.status(404).json({
        error: 'Cliente não encontrado'
      });
    }

    // Gerar ID para o consentimento
    const consentId = await generateConsentId();

    // Criar consentimento (já vem com status AUTHORIZED e data de expiração)
    const consent = await createConsent(consentId, customerId, permissions);

    // Retornar resposta
    res.status(201).json({
      _id: consent.id,
      customerId: consent.customer_id,
      permissions: consent.permissions,
      status: consent.status,
      expirationDateTime: consent.expiration_date, // Compatibilidade com testes
      expirationDate: consent.expiration_date,
      createdAt: consent.created_at
    });
  } catch (error) {
    console.error('Erro ao criar consentimento:', error);
    res.status(500).json({
      error: 'Erro interno ao criar consentimento'
    });
  }
});

/**
 * GET /consents/:id
 * Consulta um consentimento específico
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const consent = await findConsentById(id);

    if (!consent) {
      return res.status(404).json({
        error: 'Consentimento não encontrado'
      });
    }

    res.json({
      _id: consent.id,
      customerId: consent.customer_id,
      permissions: consent.permissions,
      status: consent.status,
      expirationDate: consent.expiration_date,
      createdAt: consent.created_at,
      updatedAt: consent.updated_at
    });
  } catch (error) {
    console.error('Erro ao consultar consentimento:', error);
    res.status(500).json({
      error: 'Erro interno ao consultar consentimento'
    });
  }
});

/**
 * DELETE /consents/:id
 * Revoga um consentimento (altera status para REVOKED)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const consent = await revokeConsent(id);

    if (!consent) {
      return res.status(404).json({
        error: 'Consentimento não encontrado'
      });
    }

    // Retornar 204 No Content conforme esperado pelos testes
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao revogar consentimento:', error);
    res.status(500).json({
      error: 'Erro interno ao revogar consentimento'
    });
  }
});

module.exports = router;
