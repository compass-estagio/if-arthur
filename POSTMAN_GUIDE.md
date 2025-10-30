# Guia de Uso - Postman Collection

Este guia explica como usar a collection do Postman para testar a API da Arthur Financial Institution.

## Arquivos Disponíveis

1. **Arthur_Financial_Institution_API.postman_collection.json** - Collection completa com todos os endpoints
2. **Arthur_Financial_Institution_Local.postman_environment.json** - Environment para testes locais
3. **Arthur_Financial_Institution_Production.postman_environment.json** - Environment para produção (Vercel)

## Como Importar no Postman

### Passo 1: Importar a Collection
1. Abra o Postman
2. Clique em **Import** (botão no canto superior esquerdo)
3. Selecione o arquivo `Arthur_Financial_Institution_API.postman_collection.json`
4. Clique em **Import**

### Passo 2: Importar os Environments
1. Clique em **Import** novamente
2. Selecione os dois arquivos de environment:
   - `Arthur_Financial_Institution_Local.postman_environment.json`
   - `Arthur_Financial_Institution_Production.postman_environment.json`
3. Clique em **Import**

### Passo 3: Selecionar o Environment
1. No canto superior direito, clique no dropdown de environments
2. Selecione **"Arthur Financial Institution - Local"** para testes locais
3. Ou selecione **"Arthur Financial Institution - Production (Vercel)"** para testes em produção

## Estrutura da Collection

A collection está organizada em 5 pastas principais:

### 1. Status
- **API Status (Root)** - Verifica status da API através da rota `/`
- **API Status (/api)** - Verifica status da API através da rota `/api`

### 2. Customers
- **Criar Cliente (com consentimento)** - Cria cliente que autoriza compartilhamento de dados
- **Criar Cliente (sem consentimento)** - Cria cliente que NÃO autoriza compartilhamento
- **Criar Cliente (CPF duplicado)** - Teste de erro 409 (conflito)

### 3. Accounts
- **Criar Conta** - Cria conta corrente
- **Criar Conta Poupança** - Cria conta poupança
- **Consultar Saldo (com consentimento)** - Consulta saldo com autorização
- **Consultar Saldo (sem consentimento)** - Teste de erro 401 (não autorizado)

### 4. Transactions
- **Realizar Crédito (Depósito)** - Adiciona dinheiro à conta
- **Realizar Débito (Saque)** - Remove dinheiro da conta
- **Pagamento de Conta** - Realiza pagamento
- **Transferência Recebida** - Registra transferência recebida
- **Débito com Saldo Insuficiente** - Teste de erro 400 (saldo insuficiente)
- **Listar Transações (Extrato)** - Retorna todas as transações
- **Listar Transações (sem consentimento)** - Teste de erro 401

### 5. Fluxo Completo
Sequência de 7 requests para testar o fluxo completo:
1. Criar Cliente
2. Criar Conta
3. Consultar Saldo Inicial
4. Fazer Depósito
5. Fazer Compras
6. Consultar Saldo Atualizado
7. Ver Extrato Completo

## Variáveis de Ambiente

As seguintes variáveis são gerenciadas automaticamente:

- `base_url` - URL base da API (local: http://localhost:3000, prod: https://if-arthur.vercel.app)
- `customer_id` - ID do último cliente criado
- `account_id` - ID da última conta criada
- `last_transaction_id` - ID da última transação
- `flow_customer_id` - ID do cliente no fluxo completo
- `flow_account_id` - ID da conta no fluxo completo

## Como Usar

### Teste Rápido Individual

1. Selecione o environment desejado (Local ou Production)
2. Execute as requests na ordem:
   - **Customers → Criar Cliente (com consentimento)** - Salva automaticamente o `customer_id`
   - **Accounts → Criar Conta** - Usa o `customer_id` salvo e salva o `account_id`
   - **Transactions → Realizar Crédito** - Usa o `account_id` salvo
   - **Accounts → Consultar Saldo** - Requer header `x-customer-id`
   - **Transactions → Listar Transações** - Retorna o extrato

### Teste do Fluxo Completo

1. Vá até a pasta **Fluxo Completo**
2. Execute as 7 requests em ordem (1 → 2 → 3 → 4 → 5 → 6 → 7)
3. Cada request salva automaticamente as variáveis necessárias para a próxima
4. Veja os logs no Console do Postman (View → Show Postman Console)

### Teste em Batch (Runner)

1. Clique com botão direito na pasta **Fluxo Completo**
2. Selecione **Run folder**
3. Configure:
   - **Environment**: Selecione Local ou Production
   - **Iterations**: 1 (ou mais para múltiplos testes)
   - **Delay**: 500ms (opcional, para dar tempo entre requests)
4. Clique em **Run Arthur Financial Institution API**
5. Veja os resultados em tempo real

## Headers Importantes

### Open Finance - Validação de Consentimento

Alguns endpoints requerem o header `x-customer-id` para validar que o cliente autorizou o acesso:

```
x-customer-id: {{customer_id}}
```

**Endpoints que requerem este header:**
- `GET /accounts/:accountId/balance` - Consultar saldo
- `GET /transactions/:accountId` - Listar transações (extrato)

**Importante:** O cliente deve ter sido criado com `consentGiven: true` para que o acesso seja autorizado.

## Exemplos de Payloads

### Criar Cliente
```json
{
  "name": "Maria Silva",
  "cpf": "12345678900",
  "email": "maria.silva@email.com",
  "consentGiven": true
}
```

### Criar Conta
```json
{
  "customerId": "cus_001",
  "type": "CONTA_CORRENTE",
  "branch": "0001",
  "number": "123456-7"
}
```

### Realizar Transação
```json
{
  "accountId": "acc_001",
  "description": "Depósito inicial",
  "amount": 1000.00,
  "type": "credit",
  "category": "Depósito"
}
```

## Códigos de Resposta HTTP

- **200 OK** - Requisição bem-sucedida (GET)
- **201 Created** - Recurso criado com sucesso (POST)
- **400 Bad Request** - Dados inválidos ou saldo insuficiente
- **401 Unauthorized** - Falta de consentimento ou header x-customer-id
- **404 Not Found** - Recurso não encontrado
- **409 Conflict** - Conflito (ex: CPF duplicado)
- **500 Internal Server Error** - Erro no servidor

## Dicas

1. **Use o Console do Postman** para ver os logs dos scripts de test
2. **Verifique as variáveis de ambiente** após cada request para confirmar que foram salvas
3. **Teste primeiro localmente** antes de testar em produção
4. **Limpe as variáveis** (delete os valores) antes de iniciar um novo fluxo de teste
5. **Scripts de test** salvam automaticamente IDs importantes - não precisa copiar/colar!

## Troubleshooting

### Erro 401 ao consultar saldo/transações
- Verifique se você está enviando o header `x-customer-id`
- Confirme que o cliente foi criado com `consentGiven: true`

### Erro 404 ao criar conta
- Verifique se o `customer_id` existe e está correto
- Execute primeiro "Criar Cliente" para gerar um ID válido

### Erro 400 "Saldo insuficiente"
- Execute primeiro uma transação de crédito (depósito) antes de fazer débitos
- Verifique o saldo atual com "Consultar Saldo"

### Variáveis não estão sendo salvas
- Verifique se você selecionou um environment (canto superior direito)
- Veja a tab "Tests" de cada request - os scripts salvam automaticamente as variáveis

## Suporte

Para mais informações, consulte:
- Documentação da API: https://github.com/compass-estagio/if-arthur
- API em produção: https://if-arthur.vercel.app/
