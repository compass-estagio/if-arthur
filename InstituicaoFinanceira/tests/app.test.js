const request = require('supertest');
const app = require('../api/app');
const { clearDatabase, closeDatabase } = require('../api/utils/testHelpers');

describe('App Basic Tests', () => {
  beforeEach(async () => {
    // Limpar banco de dados entre testes
    await clearDatabase();
  });

  afterAll(async () => {
    // Fechar conexão após todos os testes
    await closeDatabase();
  });

  it('deve retornar status da API na rota raiz', async () => {
    const response = await request(app)
      .get('/')
      .set('Accept', 'application/json')
      .expect(200);

    expect(response.body).toHaveProperty('status');
    expect(response.body.status).toBe('✅ Online');
    expect(response.body).toHaveProperty('name');
    expect(response.body.name).toBe('Arthur Financial Institution API');
  });

  it('deve retornar 404 para rotas não existentes', async () => {
    await request(app)
      .get('/rota-inexistente')
      .expect(404);
  });

  it('deve aceitar requisições com Content-Type application/json', async () => {
    const response = await request(app)
      .post('/customers')
      .set('Content-Type', 'application/json')
      .send({
        name: 'Teste JSON',
        cpf: '12345678900',
        email: 'teste@email.com',
        consentGiven: true
      })
      .expect(201);

    expect(response.body.name).toBe('Teste JSON');
  });
});
