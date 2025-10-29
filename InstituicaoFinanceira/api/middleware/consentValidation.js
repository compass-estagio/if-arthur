const { Customer, Account } = require('../models');

/**
 * Middleware para validar o consentimento do cliente antes de listar dados sensíveis
 * Conforme LGPD e Open Finance Brasil
 */
const validateConsent = async (req, res, next) => {
  try {
    const { accountId } = req.params;

    // Buscar conta com o cliente associado
    const account = await Account.findByPk(accountId, {
      include: [{
        model: Customer,
        as: 'customer'
      }]
    });

    // Verificar se a conta existe
    if (!account) {
      return res.status(404).json({ error: 'Conta não encontrada.' });
    }

    // Verificar se o cliente associado existe
    if (!account.customer) {
      return res.status(404).json({ error: 'Cliente associado à conta não encontrado.' });
    }

    // Verificar se o cliente deu consentimento
    if (!account.customer.consentGiven) {
      return res.status(403).json({
        error: 'Acesso negado: Cliente não forneceu consentimento para compartilhamento de dados.',
        customerId: account.customer.id,
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
