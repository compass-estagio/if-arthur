const Customer = require('./Customer');
const Account = require('./Account');
const Transaction = require('./Transaction');

// Definir relacionamentos

// Customer tem muitas Accounts
Customer.hasMany(Account, {
  foreignKey: 'customerId',
  as: 'accounts'
});

Account.belongsTo(Customer, {
  foreignKey: 'customerId',
  as: 'customer'
});

// Account tem muitas Transactions
Account.hasMany(Transaction, {
  foreignKey: 'accountId',
  as: 'transactions'
});

Transaction.belongsTo(Account, {
  foreignKey: 'accountId',
  as: 'account'
});

module.exports = {
  Customer,
  Account,
  Transaction
};
