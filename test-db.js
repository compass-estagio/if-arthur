require('dotenv').config();
const { testConnection, sequelize } = require('./config/db');
const { Customer, Account, Transaction } = require('./lib/models');

async function testDatabase() {
  console.log('🔍 Testando conexão com banco de dados PostgreSQL (Neon)...\n');

  // Testar conexão
  const connected = await testConnection();

  if (!connected) {
    console.error('\n❌ Não foi possível conectar ao banco de dados.');
    process.exit(1);
  }

  console.log('\n📊 Verificando tabelas no banco de dados...\n');

  try {
    // Contar registros nas tabelas
    const customerCount = await Customer.count();
    const accountCount = await Account.count();
    const transactionCount = await Transaction.count();

    console.log('✅ Tabela "customers":', customerCount, 'registros');
    console.log('✅ Tabela "accounts":', accountCount, 'registros');
    console.log('✅ Tabela "transactions":', transactionCount, 'registros');

    console.log('\n✨ Banco de dados configurado corretamente!');
    console.log('🚀 Você pode agora usar os endpoints da API para criar dados.\n');

  } catch (error) {
    console.error('\n❌ Erro ao verificar tabelas:', error.message);
  } finally {
    await sequelize.close();
  }
}

testDatabase();
