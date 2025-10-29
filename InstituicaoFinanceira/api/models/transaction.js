const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.STRING(20),
    primaryKey: true,
    allowNull: false,
    field: 'id'
  },
  accountId: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'account_id',
    references: {
      model: 'accounts',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    get() {
      const value = this.getDataValue('amount');
      return value ? parseFloat(value) : 0.0;
    }
  },
  type: {
    type: DataTypes.ENUM('credit', 'debit'),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Transaction;
