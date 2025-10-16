const request = require('supertest');
const app = require('../src/app');

describe('Accounts API', () => {
  let customerId;
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
    const customers = require('../src/models/customer');
    const accounts = require('../src/models/account');
    customers.length = 0;
    accounts.length = 0;

    // Criar um cliente para os testes
    const customerResponse = await request(app)
      .post('/customers')
      .send(customerData);
    customerId = customerResponse.body._id;
  });

  describe('POST /accounts', () => {
    it('deve criar uma nova conta com dados válidos', async () => {
      const accountWithCustomer = { ...accountData, customerId };

      const response = await request(app)
        .post('/accounts')
        .send(accountWithCustomer)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.type).toBe(accountData.type);
      expect(response.body.branch).toBe(accountData.branch);
      expect(response.body.number).toBe(accountData.number);
      expect(response.body.balance).toBe(0.0);
      expect(response.body.transactions).toEqual([]);
      expect(response.body._id).toMatch(/^acc_\d{3}$/);
    });

    it('deve retornar erro 400 quando customerId está ausente', async () => {
      const response = await request(app)
        .post('/accounts')
        .send(accountData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Campos obrigatórios: customerId, type, branch, number.');
    });

    it('deve retornar erro 400 quando type está ausente', async () => {
      const invalidData = { ...accountData, customerId };
      delete invalidData.type;

      const response = await request(app)
        .post('/accounts')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Campos obrigatórios: customerId, type, branch, number.');
    });

    it('deve retornar erro 400 quando branch está ausente', async () => {
      const invalidData = { ...accountData, customerId };
      delete invalidData.branch;

      const response = await request(app)
        .post('/accounts')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Campos obrigatórios: customerId, type, branch, number.');
    });

    it('deve retornar erro 400 quando number está ausente', async () => {
      const invalidData = { ...accountData, customerId };
      delete invalidData.number;

      const response = await request(app)
        .post('/accounts')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Campos obrigatórios: customerId, type, branch, number.');
    });

    it('deve retornar erro 404 quando cliente não existe', async () => {
      const invalidCustomerData = { ...accountData, customerId: 'cus_999' };

      const response = await request(app)
        .post('/accounts')
        .send(invalidCustomerData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Cliente não encontrado.');
    });

    it('deve adicionar conta ao array de contas do cliente', async () => {
      const accountWithCustomer = { ...accountData, customerId };

      const accountResponse = await request(app)
        .post('/accounts')
        .send(accountWithCustomer)
        .expect(201);

      const customers = require('../src/models/customer');
      const customer = customers.find(c => c._id === customerId);

      expect(customer.accounts).toContain(accountResponse.body._id);
    });

    it('deve gerar IDs sequenciais corretamente', async () => {
      const account1Data = { ...accountData, customerId };
      const account2Data = { ...accountData, customerId, number: '54321-9' };

      const account1 = await request(app)
        .post('/accounts')
        .send(account1Data)
        .expect(201);

      const account2 = await request(app)
        .post('/accounts')
        .send(account2Data)
        .expect(201);

      expect(account1.body._id).toBe('acc_001');
      expect(account2.body._id).toBe('acc_002');
    });
  });

  describe('GET /accounts/:accountId/balance', () => {
    let accountId;

    beforeEach(async () => {
      const accountWithCustomer = { ...accountData, customerId };
      const accountResponse = await request(app)
        .post('/accounts')
        .send(accountWithCustomer);
      accountId = accountResponse.body._id;
    });

    it('deve retornar o saldo da conta', async () => {
      const response = await request(app)
        .get(`/accounts/${accountId}/balance`)
        .expect(200);

      expect(response.body).toHaveProperty('accountId');
      expect(response.body).toHaveProperty('balance');
      expect(response.body.accountId).toBe(accountId);
      expect(response.body.balance).toBe(0);
    });

    it('deve retornar erro 404 quando conta não existe', async () => {
      const response = await request(app)
        .get('/accounts/acc_999/balance')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Conta não encontrada.');
    });
  });
});
