'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.STRING(20),
        primaryKey: true,
        allowNull: false,
        comment: 'ID da transação no formato txn_001'
      },
      account_id: {
        type: Sequelize.STRING(20),
        allowNull: false,
        references: {
          model: 'accounts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID da conta onde a transação foi realizada'
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Data da transação (YYYY-MM-DD)'
      },
      description: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: 'Descrição da transação'
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Valor da transação'
      },
      type: {
        type: Sequelize.ENUM('credit', 'debit'),
        allowNull: false,
        comment: 'Tipo de transação: credit (crédito) ou debit (débito)'
      },
      category: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Categoria da transação: Income, Withdrawal, Transfer, etc'
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
    await queryInterface.addIndex('transactions', ['account_id'], {
      name: 'transactions_account_id_idx'
    });

    await queryInterface.addIndex('transactions', ['date'], {
      name: 'transactions_date_idx'
    });

    await queryInterface.addIndex('transactions', ['type'], {
      name: 'transactions_type_idx'
    });

    await queryInterface.addIndex('transactions', ['category'], {
      name: 'transactions_category_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('transactions');
  }
};
