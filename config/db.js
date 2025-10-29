require('dotenv').config();
const { Sequelize } = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require('./database')[env];

// Debug: verificar variáveis de ambiente
console.log('🔍 NODE_ENV:', env);
console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '❌ Não configurada');
console.log('🔍 POSTGRES_URL:', process.env.POSTGRES_URL ? '✅ Configurada' : '❌ Não configurada');
console.log('🔍 config.url:', config.url ? '✅ Configurada' : '❌ Não configurada');

// Validar se a URL do banco está configurada
if (!config.url) {
  throw new Error(
    `❌ URL do banco de dados não configurada!
    Ambiente: ${env}
    Certifique-se de configurar POSTGRES_URL ou DATABASE_URL nas variáveis de ambiente da Vercel.`
  );
}

// Criar instância do Sequelize
const sequelize = new Sequelize(config.url, {
  dialect: config.dialect,
  dialectOptions: config.dialectOptions,
  logging: config.logging,
  pool: config.pool
});

// Testar conexão
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com PostgreSQL estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com PostgreSQL:', error.message);
    return false;
  }
};

module.exports = { sequelize, testConnection };
