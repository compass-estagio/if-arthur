const request = require('supertest');
const app = require('../src/app');

describe('Integration Tests - Complete Flow', () => {
  beforeEach(() => {
    // Limpar todos os dados entre testes
    const customers = require('../src/models/customer');
    const accounts = require('../src/models/account');
    const transactions = require('../src/models/transaction');
    customers.length = 0;
    accounts.length = 0;
    transactions.length = 0;
  });

  it('deve executar o fluxo completo: criar cliente -> criar conta -> fazer transações -> consultar extrato', async () => {
    // 1. Criar cliente
    const customerData = {
      name: 'João Silva',
      cpf: '12345678900',
      email: 'joao.silva@email.com'
    };

    const customerResponse = await request(app)
      .post('/customers')
      .send(customerData)
      .expect(201);

    expect(customerResponse.body._id).toBe('cus_001');
    expect(customerResponse.body.name).toBe(customerData.name);

    // 2. Criar conta para o cliente
    const accountData = {
      customerId: customerResponse.body._id,
      type: 'checking',
      branch: '0001',
      number: '12345-6'
    };

    const accountResponse = await request(app)
      .post('/accounts')
      .send(accountData)
      .expect(201);

    expect(accountResponse.body._id).toBe('acc_001');
    expect(accountResponse.body.balance).toBe(0);

    // 3. Verificar saldo inicial
    const initialBalanceResponse = await request(app)
      .get(`/accounts/${accountResponse.body._id}/balance`)
      .expect(200);

    expect(initialBalanceResponse.body.balance).toBe(0);

    // 4. Fazer depósito (crédito)
    const depositData = {
      accountId: accountResponse.body._id,
      description: 'Depósito inicial',
      amount: 1500.00,
      type: 'credit',
      category: 'Income'
    };

    const depositResponse = await request(app)
      .post('/transactions')
      .send(depositData)
      .expect(201);

    expect(depositResponse.body._id).toBe('txn_001');
    expect(depositResponse.body.amount).toBe(1500.00);

    // 5. Verificar saldo após depósito
    const balanceAfterDepositResponse = await request(app)
      .get(`/accounts/${accountResponse.body._id}/balance`)
      .expect(200);

    expect(balanceAfterDepositResponse.body.balance).toBe(1500.00);

    // 6. Fazer saque (débito)
    const withdrawalData = {
      accountId: accountResponse.body._id,
      description: 'Saque no caixa eletrônico',
      amount: 300.00,
      type: 'debit',
      category: 'Withdrawal'
    };

    const withdrawalResponse = await request(app)
      .post('/transactions')
      .send(withdrawalData)
      .expect(201);

    expect(withdrawalResponse.body._id).toBe('txn_002');
    expect(withdrawalResponse.body.amount).toBe(300.00);

    // 7. Verificar saldo após saque
    const balanceAfterWithdrawalResponse = await request(app)
      .get(`/accounts/${accountResponse.body._id}/balance`)
      .expect(200);

    expect(balanceAfterWithdrawalResponse.body.balance).toBe(1200.00);

    // 8. Fazer outra transação de crédito
    const secondDepositData = {
      accountId: accountResponse.body._id,
      description: 'Transferência recebida',
      amount: 800.00,
      type: 'credit',
      category: 'Transfer'
    };

    await request(app)
      .post('/transactions')
      .send(secondDepositData)
      .expect(201);

    // 9. Verificar saldo final
    const finalBalanceResponse = await request(app)
      .get(`/accounts/${accountResponse.body._id}/balance`)
      .expect(200);

    expect(finalBalanceResponse.body.balance).toBe(2000.00);

    // 10. Consultar extrato (todas as transações)
    const statementResponse = await request(app)
      .get(`/transactions/${accountResponse.body._id}`)
      .expect(200);

    expect(statementResponse.body).toHaveLength(3);
    expect(statementResponse.body[0].description).toBe('Depósito inicial');
    expect(statementResponse.body[1].description).toBe('Saque no caixa eletrônico');
    expect(statementResponse.body[2].description).toBe('Transferência recebida');

    // Verificar que as transações estão vinculadas à conta
    const customers = require('../src/models/customer');
    const accounts = require('../src/models/account');

    const customer = customers.find(c => c._id === customerResponse.body._id);
    const account = accounts.find(a => a._id === accountResponse.body._id);

    expect(customer.accounts).toContain(accountResponse.body._id);
    expect(account.transactions).toHaveLength(3);
  });

  it('deve impedir saque quando saldo é insuficiente', async () => {
    // Criar cliente e conta
    const customer = await request(app)
      .post('/customers')
      .send({
        name: 'Maria Santos',
        cpf: '98765432100',
        email: 'maria.santos@email.com'
      });

    const account = await request(app)
      .post('/accounts')
      .send({
        customerId: customer.body._id,
        type: 'savings',
        branch: '0002',
        number: '54321-9'
      });

    // Tentar fazer saque sem saldo
    const withdrawalResponse = await request(app)
      .post('/transactions')
      .send({
        accountId: account.body._id,
        description: 'Tentativa de saque sem saldo',
        amount: 100.00,
        type: 'debit',
        category: 'Withdrawal'
      })
      .expect(400);

    expect(withdrawalResponse.body.error).toBe('Saldo insuficiente.');

    // Verificar que o saldo permanece zero
    const balanceResponse = await request(app)
      .get(`/accounts/${account.body._id}/balance`)
      .expect(200);

    expect(balanceResponse.body.balance).toBe(0);
  });

  it('deve permitir múltiplos clientes com múltiplas contas', async () => {
    // Criar primeiro cliente com duas contas
    const customer1 = await request(app)
      .post('/customers')
      .send({
        name: 'Cliente Um',
        cpf: '11111111111',
        email: 'cliente1@email.com'
      });

    const account1_1 = await request(app)
      .post('/accounts')
      .send({
        customerId: customer1.body._id,
        type: 'checking',
        branch: '0001',
        number: '11111-1'
      });

    const account1_2 = await request(app)
      .post('/accounts')
      .send({
        customerId: customer1.body._id,
        type: 'savings',
        branch: '0001',
        number: '11111-2'
      });

    // Criar segundo cliente com uma conta
    const customer2 = await request(app)
      .post('/customers')
      .send({
        name: 'Cliente Dois',
        cpf: '22222222222',
        email: 'cliente2@email.com'
      });

    const account2_1 = await request(app)
      .post('/accounts')
      .send({
        customerId: customer2.body._id,
        type: 'checking',
        branch: '0002',
        number: '22222-1'
      });

    // Fazer transações em contas diferentes
    await request(app)
      .post('/transactions')
      .send({
        accountId: account1_1.body._id,
        description: 'Depósito conta corrente',
        amount: 1000,
        type: 'credit',
        category: 'Income'
      });

    await request(app)
      .post('/transactions')
      .send({
        accountId: account1_2.body._id,
        description: 'Depósito poupança',
        amount: 2000,
        type: 'credit',
        category: 'Income'
      });

    await request(app)
      .post('/transactions')
      .send({
        accountId: account2_1.body._id,
        description: 'Depósito cliente 2',
        amount: 500,
        type: 'credit',
        category: 'Income'
      });

    // Verificar saldos independentes
    const balance1_1 = await request(app)
      .get(`/accounts/${account1_1.body._id}/balance`);
    const balance1_2 = await request(app)
      .get(`/accounts/${account1_2.body._id}/balance`);
    const balance2_1 = await request(app)
      .get(`/accounts/${account2_1.body._id}/balance`);

    expect(balance1_1.body.balance).toBe(1000);
    expect(balance1_2.body.balance).toBe(2000);
    expect(balance2_1.body.balance).toBe(500);

    // Verificar extratos independentes
    const statement1_1 = await request(app)
      .get(`/transactions/${account1_1.body._id}`);
    const statement1_2 = await request(app)
      .get(`/transactions/${account1_2.body._id}`);
    const statement2_1 = await request(app)
      .get(`/transactions/${account2_1.body._id}`);

    expect(statement1_1.body).toHaveLength(1);
    expect(statement1_2.body).toHaveLength(1);
    expect(statement2_1.body).toHaveLength(1);

    expect(statement1_1.body[0].description).toBe('Depósito conta corrente');
    expect(statement1_2.body[0].description).toBe('Depósito poupança');
    expect(statement2_1.body[0].description).toBe('Depósito cliente 2');
  });
});
