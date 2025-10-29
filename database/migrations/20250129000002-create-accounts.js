'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accounts', {
      id: {
        type: Sequelize.STRING(20),
        primaryKey: true,
        allowNull: false,
        comment: 'ID da conta no formato acc_001'
      },
      customer_id: {
        type: Sequelize.STRING(20),
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID do cliente dono da conta'
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Tipo de conta: checking, savings, etc'
      },
      branch: {
        type: Sequelize.STRING(10),
        allowNull: false,
        comment: 'Número da agência'
      },
      number: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'Número da conta'
      },
      balance: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Saldo atual da conta'
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
    await queryInterface.addIndex('accounts', ['customer_id'], {
      name: 'accounts_customer_id_idx'
    });

    await queryInterface.addIndex('accounts', ['branch', 'number'], {
      unique: true,
      name: 'accounts_branch_number_unique_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('accounts');
  }
};
