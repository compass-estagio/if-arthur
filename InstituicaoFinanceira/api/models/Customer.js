const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.STRING(20),
    primaryKey: true,
    allowNull: false,
    field: 'id'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  cpf: {
    type: DataTypes.STRING(11),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  consentGiven: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'consent_given'
  }
}, {
  tableName: 'customers',
  timestamps: true,
  underscored: true, // Converte camelCase para snake_case
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Customer;
