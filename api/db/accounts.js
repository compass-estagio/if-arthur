const { query } = require('../../config/postgres');

const createAccount = async (id, customerId, type, branch, number, balance = 0.0) => {
  const text = `
    INSERT INTO accounts (id, customer_id, type, branch, number, balance, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    RETURNING *
  `;
  const values = [id, customerId, type, branch, number, balance];
  const result = await query(text, values);
  return result.rows[0];
};

const findAccountById = async (id) => {
  const text = 'SELECT * FROM accounts WHERE id = $1';
  const result = await query(text, [id]);
  return result.rows[0];
};

const updateAccountBalance = async (id, newBalance) => {
  const text = `
    UPDATE accounts
    SET balance = $2, updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const result = await query(text, [id, newBalance]);
  return result.rows[0];
};

const getAccountsByCustomerId = async (customerId) => {
  const text = 'SELECT * FROM accounts WHERE customer_id = $1 ORDER BY created_at DESC';
  const result = await query(text, [customerId]);
  return result.rows;
};

module.exports = {
  createAccount,
  findAccountById,
  updateAccountBalance,
  getAccountsByCustomerId
};
