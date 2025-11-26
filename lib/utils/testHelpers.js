const { Customer, Account, Transaction } = require('../models');
const { sequelize } = require('../../config/db');

/**
 * Limpa todas as tabelas do banco de dados
 * Usado em testes para garantir isolamento entre testes
 */
async function clearDatabase() {
  try {
    // Deletar na ordem correta (respeitando foreign keys)
    // Transactions primeiro (não tem dependentes)
    await Transaction.destroy({ where: {}, force: true });

    // Accounts depois (depende de Transactions)
    await Account.destroy({ where: {}, force: true });

    // Customers por último (depende de Accounts)
    await Customer.destroy({ where: {}, force: true });
  } catch (error) {
    console.error('Erro ao limpar banco de dados:', error);
    throw error;
  }
}

/**
 * Fecha a conexão com o banco de dados
 * Usado após todos os testes terminarem
 */
async function closeDatabase() {
  try {
    await sequelize.close();
  } catch (error) {
    console.error('Erro ao fechar conexão:', error);
    throw error;
  }
}

module.exports = {
  clearDatabase,
  closeDatabase
};
