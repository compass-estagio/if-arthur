const customers = require('../models/customer');
const accounts = require('../models/account');

/**
 * Middleware para validar o consentimento do cliente antes de listar dados sensíveis
 * Conforme LGPD e Open Finance Brasil
 */
const validateConsent = (req, res, next) => {
  const { accountId } = req.params;

  // Verificar se a conta existe
  const account = accounts.find(a => a._id === accountId);
  if (!account) {
    return res.status(404).json({ error: 'Conta não encontrada.' });
  }

  // Encontrar o cliente dono da conta
  const customer = customers.find(c => c.accounts.includes(accountId));
  if (!customer) {
    return res.status(404).json({ error: 'Cliente associado à conta não encontrado.' });
  }

  // Verificar se o cliente deu consentimento
  if (!customer.consentGiven) {
    return res.status(403).json({
      error: 'Acesso negado: Cliente não forneceu consentimento para compartilhamento de dados.',
      customerId: customer._id,
      accountId: accountId,
      message: 'O cliente precisa autorizar o compartilhamento de dados financeiros conforme LGPD.'
    });
  }

  // Cliente consentiu, permitir acesso
  next();
};

module.exports = { validateConsent };
