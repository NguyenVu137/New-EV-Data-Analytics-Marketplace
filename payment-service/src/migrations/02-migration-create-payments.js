'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true
      },
      paymentMethod: {
        type: Sequelize.ENUM('creditcard', 'bank', 'momo', 'zalopay'),
        allowNull: false
      },
      transactionId: {
        type: Sequelize.STRING(255),
        unique: true,
        allowNull: true
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'success', 'failed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      },
      paymentGatewayResponse: {
        type: Sequelize.JSON,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });

    await queryInterface.addIndex('payments', ['transactionId']);
    await queryInterface.addIndex('payments', ['status']);
    await queryInterface.addIndex('payments', ['orderId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payments');
  }
};
