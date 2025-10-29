/**
 * Gera IDs sequenciais no formato especificado
 * Exemplos: cus_001, acc_001, txn_001
 */

const { Customer, Account, Transaction } = require('../models');

/**
 * Gera o próximo ID para Customer
 * @returns {Promise<string>} ID no formato cus_001
 */
async function generateCustomerId() {
  const count = await Customer.count();
  const nextNumber = count + 1;
  return `cus_${nextNumber.toString().padStart(3, '0')}`;
}

/**
 * Gera o próximo ID para Account
 * @returns {Promise<string>} ID no formato acc_001
 */
async function generateAccountId() {
  const count = await Account.count();
  const nextNumber = count + 1;
  return `acc_${nextNumber.toString().padStart(3, '0')}`;
}

/**
 * Gera o próximo ID para Transaction
 * @returns {Promise<string>} ID no formato txn_001
 */
async function generateTransactionId() {
  const count = await Transaction.count();
  const nextNumber = count + 1;
  return `txn_${nextNumber.toString().padStart(3, '0')}`;
}

module.exports = {
  generateCustomerId,
  generateAccountId,
  generateTransactionId
};
