'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payment_methods', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      methodType: {
        type: Sequelize.ENUM('creditcard', 'bank', 'momo', 'zalopay'),
        allowNull: false
      },
      cardNumber: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Encrypted card number'
      },
      cardHolder: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      expiryDate: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      bankCode: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      accountNumber: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      isDefault: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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

    await queryInterface.addIndex('payment_methods', ['userId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payment_methods');
  }
};
