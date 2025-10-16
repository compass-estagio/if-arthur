const request = require('supertest');
const app = require('../api/app');

describe('Transactions API', () => {
  let customerId, accountId;
  let customerData = {
    name: 'Maria Silva',
    cpf: '12345678900',
    email: 'maria.silva@email.com'
  };

  let accountData = {
    type: 'checking',
    branch: '0001',
    number: '12345-6'
  };

  beforeEach(async () => {
    // Limpar dados entre testes
    const customers = require('../api/models/customer');
    const accounts = require('../api/models/account');
    const transactions = require('../api/models/transaction');
    customers.length = 0;
    accounts.length = 0;
    transactions.length = 0;

    // Criar cliente e conta para os testes
    const customerResponse = await request(app)
      .post('/customers')
      .send(customerData);
    customerId = customerResponse.body._id;

    const accountResponse = await request(app)
      .post('/accounts')
      .send({ ...accountData, customerId });
    accountId = accountResponse.body._id;
  });

  describe('POST /transactions', () => {
    const creditTransactionData = {
      description: 'Deposit via wire transfer',
      amount: 1000.00,
      type: 'credit',
      category: 'Income'
    };

    const debitTransactionData = {
      description: 'ATM withdrawal',
      amount: 500.00,
      type: 'debit',
      category: 'Withdrawal'
    };

    it('deve criar uma transação de crédito com dados válidos', async () => {
      const transactionWithAccount = { ...creditTransactionData, accountId };

      const response = await request(app)
        .post('/transactions')
        .send(transactionWithAccount)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('date');
      expect(response.body.description).toBe(creditTransactionData.description);
      expect(response.body.amount).toBe(creditTransactionData.amount);
      expect(response.body.type).toBe(creditTransactionData.type);
      expect(response.body.category).toBe(creditTransactionData.category);
      expect(response.body._id).toMatch(/^txn_\d{3}$/);
      expect(response.body.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('deve criar uma transação de débito com dados válidos', async () => {
      // Primeiro fazer um depósito para ter saldo
      await request(app)
        .post('/transactions')
        .send({ ...creditTransactionData, accountId });

      const transactionWithAccount = { ...debitTransactionData, accountId };

      const response = await request(app)
        .post('/transactions')
        .send(transactionWithAccount)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.description).toBe(debitTransactionData.description);
      expect(response.body.amount).toBe(debitTransactionData.amount);
      expect(response.body.type).toBe(debitTransactionData.type);
      expect(response.body.category).toBe(debitTransactionData.category);
    });

    it('deve atualizar o saldo da conta após transação de crédito', async () => {
      const transactionWithAccount = { ...creditTransactionData, accountId };

      await request(app)
        .post('/transactions')
        .send(transactionWithAccount)
        .expect(201);

      const balanceResponse = await request(app)
        .get(`/accounts/${accountId}/balance`)
        .expect(200);

      expect(balanceResponse.body.balance).toBe(creditTransactionData.amount);
    });

    it('deve atualizar o saldo da conta após transação de débito', async () => {
      // Primeiro fazer um depósito
      await request(app)
        .post('/transactions')
        .send({ ...creditTransactionData, accountId });

      // Depois fazer um saque
      await request(app)
        .post('/transactions')
        .send({ ...debitTransactionData, accountId });

      const balanceResponse = await request(app)
        .get(`/accounts/${accountId}/balance`)
        .expect(200);

      const expectedBalance = creditTransactionData.amount - debitTransactionData.amount;
      expect(balanceResponse.body.balance).toBe(expectedBalance);
    });

    it('deve retornar erro 400 quando accountId está ausente', async () => {
      const response = await request(app)
        .post('/transactions')
        .send(creditTransactionData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Campos obrigatórios: accountId, description, amount, type, category.');
    });

    it('deve retornar erro 400 quando description está ausente', async () => {
      const invalidData = { ...creditTransactionData, accountId };
      delete invalidData.description;

      const response = await request(app)
        .post('/transactions')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Campos obrigatórios: accountId, description, amount, type, category.');
    });

    it('deve retornar erro 400 quando amount está ausente', async () => {
      const invalidData = { ...creditTransactionData, accountId };
      delete invalidData.amount;

      const response = await request(app)
        .post('/transactions')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Campos obrigatórios: accountId, description, amount, type, category.');
    });

    it('deve retornar erro 400 quando type está ausente', async () => {
      const invalidData = { ...creditTransactionData, accountId };
      delete invalidData.type;

      const response = await request(app)
        .post('/transactions')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Campos obrigatórios: accountId, description, amount, type, category.');
    });

    it('deve retornar erro 400 quando category está ausente', async () => {
      const invalidData = { ...creditTransactionData, accountId };
      delete invalidData.category;

      const response = await request(app)
        .post('/transactions')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Campos obrigatórios: accountId, description, amount, type, category.');
    });

    it('deve retornar erro 404 quando conta não existe', async () => {
      const invalidAccountData = { ...creditTransactionData, accountId: 'acc_999' };

      const response = await request(app)
        .post('/transactions')
        .send(invalidAccountData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Conta não encontrada.');
    });

    it('deve retornar erro 400 quando type é inválido', async () => {
      const invalidTypeData = { ...creditTransactionData, accountId, type: 'invalid' };

      const response = await request(app)
        .post('/transactions')
        .send(invalidTypeData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Tipo de transação deve ser credit ou debit.');
    });

    it('deve retornar erro 400 quando saldo é insuficiente para débito', async () => {
      const insufficientDebitData = { ...debitTransactionData, accountId, amount: 1000 };

      const response = await request(app)
        .post('/transactions')
        .send(insufficientDebitData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Saldo insuficiente.');
    });

    it('deve adicionar transação ao array de transações da conta', async () => {
      const transactionWithAccount = { ...creditTransactionData, accountId };

      const transactionResponse = await request(app)
        .post('/transactions')
        .send(transactionWithAccount)
        .expect(201);

      const accounts = require('../api/models/account');
      const account = accounts.find(a => a._id === accountId);

      expect(account.transactions).toContain(transactionResponse.body._id);
    });

    it('deve gerar IDs sequenciais corretamente', async () => {
      const transaction1 = await request(app)
        .post('/transactions')
        .send({ ...creditTransactionData, accountId })
        .expect(201);

      const transaction2 = await request(app)
        .post('/transactions')
        .send({ ...creditTransactionData, accountId, amount: 500 })
        .expect(201);

      expect(transaction1.body._id).toBe('txn_001');
      expect(transaction2.body._id).toBe('txn_002');
    });
  });

  describe('GET /transactions/:accountId', () => {
    beforeEach(async () => {
      // Criar algumas transações para teste
      await request(app)
        .post('/transactions')
        .send({
          accountId,
          description: 'Deposit 1',
          amount: 1000,
          type: 'credit',
          category: 'Income'
        });

      await request(app)
        .post('/transactions')
        .send({
          accountId,
          description: 'Withdrawal 1',
          amount: 200,
          type: 'debit',
          category: 'Withdrawal'
        });
    });

    it('deve retornar todas as transações da conta', async () => {
      const response = await request(app)
        .get(`/transactions/${accountId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].description).toBe('Deposit 1');
      expect(response.body[1].description).toBe('Withdrawal 1');
    });

    it('deve retornar erro 404 quando conta não existe', async () => {
      const response = await request(app)
        .get('/transactions/acc_999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Conta não encontrada.');
    });

    it('deve retornar array vazio quando conta não tem transações', async () => {
      // Criar nova conta sem transações
      const newAccountResponse = await request(app)
        .post('/accounts')
        .send({ ...accountData, customerId, number: '99999-9' });

      const response = await request(app)
        .get(`/transactions/${newAccountResponse.body._id}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });
});
