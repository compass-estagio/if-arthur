'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('consents', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      customer_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      permissions: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'AUTHORIZED'
      },
      expiration_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      }
    });

    // Adicionar índice para busca rápida por customer_id
    await queryInterface.addIndex('consents', ['customer_id']);

    // Adicionar índice para busca por status e data de expiração
    await queryInterface.addIndex('consents', ['status', 'expiration_date']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('consents');
  }
};
