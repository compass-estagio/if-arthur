const { query } = require('../../config/postgres');
const { findActiveConsentByCustomerId } = require('../db/consents');

/**
 * Middleware para validar o consentimento do cliente antes de listar dados sensíveis
 * Conforme LGPD e Open Finance Brasil
 *
 * Verifica se existe um consentimento AUTHORIZED e não-expirado
 */
const validateConsent = async (req, res, next) => {
  try {
    const { accountId } = req.params;

    // Buscar conta com o cliente associado usando JOIN
    const text = `
      SELECT
        accounts.*,
        customers.id as customer_id
      FROM accounts
      LEFT JOIN customers ON accounts.customer_id = customers.id
      WHERE accounts.id = $1
    `;
    const result = await query(text, [accountId]);

    // Verificar se a conta existe
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conta não encontrada.' });
    }

    const account = result.rows[0];

    // Verificar se o cliente associado existe
    if (!account.customer_id) {
      return res.status(404).json({ error: 'Cliente associado à conta não encontrado.' });
    }

    // Buscar consentimento ativo do cliente
    const activeConsent = await findActiveConsentByCustomerId(account.customer_id);

    // Verificar se existe consentimento válido
    if (!activeConsent) {
      return res.status(403).json({
        error: 'CONSENT_REQUIRED',
        message: 'Acesso negado: Cliente não possui consentimento válido para compartilhamento de dados.',
        customerId: account.customer_id,
        accountId: accountId,
        details: 'É necessário criar um consentimento autorizado e não expirado para acessar estes dados.'
      });
    }

    // Cliente possui consentimento válido, permitir acesso
    next();
  } catch (error) {
    console.error('Erro no middleware de consentimento:', error);
    res.status(500).json({ error: 'Erro interno ao validar consentimento.' });
  }
};

module.exports = { validateConsent };
