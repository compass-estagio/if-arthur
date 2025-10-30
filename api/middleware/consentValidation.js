const { query } = require('../../config/postgres');

/**
 * Middleware para validar o consentimento do cliente antes de listar dados sensíveis
 * Conforme LGPD e Open Finance Brasil
 */
const validateConsent = async (req, res, next) => {
  try {
    const { accountId } = req.params;

    // Buscar conta com o cliente associado usando JOIN
    const text = `
      SELECT
        accounts.*,
        customers.id as customer_id,
        customers.consent_given
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

    // Verificar se o cliente deu consentimento
    if (!account.consent_given) {
      return res.status(403).json({
        error: 'Acesso negado: Cliente não forneceu consentimento para compartilhamento de dados.',
        customerId: account.customer_id,
        accountId: accountId,
        message: 'O cliente precisa autorizar o compartilhamento de dados financeiros conforme LGPD.'
      });
    }

    // Cliente consentiu, permitir acesso
    next();
  } catch (error) {
    console.error('Erro no middleware de consentimento:', error);
    res.status(500).json({ error: 'Erro interno ao validar consentimento.' });
  }
};

module.exports = { validateConsent };
