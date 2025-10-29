'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('customers', {
      id: {
        type: Sequelize.STRING(20),
        primaryKey: true,
        allowNull: false,
        comment: 'ID do cliente no formato cus_001'
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Nome completo do cliente'
      },
      cpf: {
        type: Sequelize.STRING(11),
        allowNull: false,
        unique: true,
        comment: 'CPF do cliente (apenas números)'
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Email do cliente'
      },
      consent_given: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Flag de consentimento LGPD para compartilhamento de dados'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Índices para performance
    await queryInterface.addIndex('customers', ['cpf'], {
      unique: true,
      name: 'customers_cpf_unique_idx'
    });

    await queryInterface.addIndex('customers', ['email'], {
      name: 'customers_email_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('customers');
  }
};
