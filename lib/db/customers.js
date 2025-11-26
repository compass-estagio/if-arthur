const { query } = require('../../config/postgres');

const createCustomer = async (id, name, cpf, email, consentGiven) => {
  const text = `
    INSERT INTO customers (id, name, cpf, email, consent_given, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    RETURNING *
  `;
  const values = [id, name, cpf, email, consentGiven];
  const result = await query(text, values);
  return result.rows[0];
};

const findCustomerByCpf = async (cpf) => {
  const text = 'SELECT * FROM customers WHERE cpf = $1';
  const result = await query(text, [cpf]);
  return result.rows[0];
};

const findCustomerById = async (id) => {
  const text = 'SELECT * FROM customers WHERE id = $1';
  const result = await query(text, [id]);
  return result.rows[0];
};

const getAllCustomers = async () => {
  const text = 'SELECT * FROM customers ORDER BY created_at DESC';
  const result = await query(text);
  return result.rows;
};

module.exports = {
  createCustomer,
  findCustomerByCpf,
  findCustomerById,
  getAllCustomers
};
