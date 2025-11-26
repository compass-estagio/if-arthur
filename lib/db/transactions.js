const { query } = require('../../config/postgres');

const createTransaction = async (id, accountId, date, description, amount, type, category) => {
  const text = `
    INSERT INTO transactions (id, account_id, date, description, amount, type, category, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
    RETURNING *
  `;
  const values = [id, accountId, date, description, amount, type, category];
  const result = await query(text, values);
  return result.rows[0];
};

const getTransactionsByAccountId = async (accountId) => {
  const text = `
    SELECT * FROM transactions
    WHERE account_id = $1
    ORDER BY created_at DESC
  `;
  const result = await query(text, [accountId]);
  return result.rows;
};

const findTransactionById = async (id) => {
  const text = 'SELECT * FROM transactions WHERE id = $1';
  const result = await query(text, [id]);
  return result.rows[0];
};

module.exports = {
  createTransaction,
  getTransactionsByAccountId,
  findTransactionById
};
