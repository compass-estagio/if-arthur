const request = require('supertest');
const app = require('../lib/app');
const { clearDatabase, closeDatabase } = require('../lib/utils/testHelpers');

describe('Customers API', () => {
  let customerData = {
    name: 'Maria Silva',
    cpf: '12345678900',
    email: 'maria.silva@email.com',
    consentGiven: true
  };

  beforeEach(async () => {
    // Limpar banco de dados entre testes
    await clearDatabase();
  });

  afterAll(async () => {
    // Fechar conexão após todos os testes
    await closeDatabase();
  });

  describe('POST /customers', () => {
    it('deve criar um novo cliente com dados válidos', async () => {
      const response = await request(app)
        .post('/customers')
        .send(customerData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(customerData.name);
      expect(response.body.cpf).toBe(customerData.cpf);
      expect(response.body.email).toBe(customerData.email);
      expect(response.body.accounts).toEqual([]);
      expect(response.body._id).toMatch(/^cus_\d{3}$/);
    });

    it('deve retornar erro 400 quando name está ausente', async () => {
      const invalidData = { ...customerData };
      delete invalidData.name;

      const response = await request(app)
        .post('/customers')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Nome, CPF e email são obrigatórios.');
    });

    it('deve retornar erro 400 quando cpf está ausente', async () => {
      const invalidData = { ...customerData };
      delete invalidData.cpf;

      const response = await request(app)
        .post('/customers')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Nome, CPF e email são obrigatórios.');
    });

    it('deve retornar erro 400 quando email está ausente', async () => {
      const invalidData = { ...customerData };
      delete invalidData.email;

      const response = await request(app)
        .post('/customers')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Nome, CPF e email são obrigatórios.');
    });

    it('deve retornar erro 409 quando CPF já existe', async () => {
      // Criar primeiro cliente
      await request(app)
        .post('/customers')
        .send(customerData)
        .expect(201);

      // Tentar criar segundo cliente com mesmo CPF
      const duplicateData = {
        name: 'João Santos',
        cpf: customerData.cpf,
        email: 'joao.santos@email.com',
        consentGiven: true
      };

      const response = await request(app)
        .post('/customers')
        .send(duplicateData)
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Cliente com este CPF já existe.');
    });

    it('deve gerar IDs sequenciais corretamente', async () => {
      const customer1 = await request(app)
        .post('/customers')
        .send(customerData)
        .expect(201);

      const customer2Data = {
        name: 'João Santos',
        cpf: '09876543211',
        email: 'joao.santos@email.com',
        consentGiven: true
      };

      const customer2 = await request(app)
        .post('/customers')
        .send(customer2Data)
        .expect(201);

      expect(customer1.body._id).toBe('cus_001');
      expect(customer2.body._id).toBe('cus_002');
    });

    it('deve retornar erro 400 quando consentGiven está ausente', async () => {
      const invalidData = { ...customerData };
      delete invalidData.consentGiven;

      const response = await request(app)
        .post('/customers')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('O campo consentGiven é obrigatório (true/false).');
    });

    it('deve criar cliente com consentGiven true', async () => {
      const response = await request(app)
        .post('/customers')
        .send({ ...customerData, consentGiven: true })
        .expect(201);

      expect(response.body.consentGiven).toBe(true);
    });

    it('deve criar cliente com consentGiven false', async () => {
      const response = await request(app)
        .post('/customers')
        .send({ ...customerData, consentGiven: false })
        .expect(201);

      expect(response.body.consentGiven).toBe(false);
    });
  });
});
