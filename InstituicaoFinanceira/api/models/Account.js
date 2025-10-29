const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const Account = sequelize.define('Account', {
  id: {
    type: DataTypes.STRING(20),
    primaryKey: true,
    allowNull: false,
    field: 'id'
  },
  customerId: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'customer_id',
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  branch: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    get() {
      const value = this.getDataValue('balance');
      return value ? parseFloat(value) : 0.0;
    }
  }
}, {
  tableName: 'accounts',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Account;
