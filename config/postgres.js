const { Pool } = require('pg');

let pool = null;

const getPool = () => {
  if (pool) {
    return pool;
  }

  const env = process.env.NODE_ENV || 'development';
  const connectionString = env === 'production'
    ? (process.env.POSTGRES_URL || process.env.DATABASE_URL)
    : process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL or POSTGRES_URL not configured');
  }

  pool = new Pool({
    connectionString,
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  return pool;
};

const query = async (text, params) => {
  const pool = getPool();
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production') {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

const testConnection = async () => {
  try {
    const pool = getPool();
    await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connection established successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error connecting to PostgreSQL:', error.message);
    return false;
  }
};

// Funções para transações SQL
const beginTransaction = async (client) => {
  await client.query('BEGIN');
};

const commitTransaction = async (client) => {
  await client.query('COMMIT');
};

const rollbackTransaction = async (client) => {
  await client.query('ROLLBACK');
};

const getClient = async () => {
  const pool = getPool();
  return await pool.connect();
};

module.exports = {
  getPool,
  query,
  testConnection,
  getClient,
  beginTransaction,
  commitTransaction,
  rollbackTransaction
};
