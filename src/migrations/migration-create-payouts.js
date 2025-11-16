'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {

        await queryInterface.addColumn('payouts', 'platform_fee', {
            type: Sequelize.DECIMAL(10, 2),
            defaultValue: 0,
            allowNull: true
        });

        await queryInterface.addColumn('payouts', 'payment_fee', {
            type: Sequelize.DECIMAL(10, 2),
            defaultValue: 0,
            allowNull: true
        });

        await queryInterface.addColumn('payouts', 'net_amount', {
            type: Sequelize.DECIMAL(10, 2),
            defaultValue: 0,
            allowNull: true
        });

        await queryInterface.addColumn('payouts', 'processed_at', {
            type: Sequelize.DATE,
            allowNull: true
        });

        await queryInterface.addColumn('payouts', 'bank_account', {
            type: Sequelize.STRING,
            allowNull: true
        });

        await queryInterface.addColumn('payouts', 'bank_name', {
            type: Sequelize.STRING,
            allowNull: true
        });

        await queryInterface.addColumn('payouts', 'note', {
            type: Sequelize.TEXT,
            allowNull: true
        });


        await queryInterface.addIndex('payouts', ['provider_id', 'payout_status_code'], {
            name: 'idx_payout_provider_status'
        });

        await queryInterface.addIndex('payouts', ['payout_status_code'], {
            name: 'idx_payout_status'
        });

        await queryInterface.addIndex('payouts', ['created_at'], {
            name: 'idx_payout_created'
        });

        await queryInterface.addIndex('transactions', ['consumer_id'], {
            name: 'idx_transaction_consumer'
        });

        await queryInterface.addIndex('transactions', ['data_source_id'], {
            name: 'idx_transaction_dataset'
        });

        await queryInterface.addIndex('transactions', ['payment_status_code'], {
            name: 'idx_transaction_status'
        });

        await queryInterface.addIndex('transactions', ['created_at'], {
            name: 'idx_transaction_created'
        });

    },

    async down(queryInterface, Sequelize) {

        await queryInterface.removeIndex('transactions', 'idx_transaction_created');
        await queryInterface.removeIndex('transactions', 'idx_transaction_status');
        await queryInterface.removeIndex('transactions', 'idx_transaction_dataset');
        await queryInterface.removeIndex('transactions', 'idx_transaction_consumer');

        await queryInterface.removeIndex('payouts', 'idx_payout_created');
        await queryInterface.removeIndex('payouts', 'idx_payout_status');
        await queryInterface.removeIndex('payouts', 'idx_payout_provider_status');

        await queryInterface.removeColumn('payouts', 'note');
        await queryInterface.removeColumn('payouts', 'bank_name');
        await queryInterface.removeColumn('payouts', 'bank_account');
        await queryInterface.removeColumn('payouts', 'processed_at');
        await queryInterface.removeColumn('payouts', 'net_amount');
        await queryInterface.removeColumn('payouts', 'payment_fee');
        await queryInterface.removeColumn('payouts', 'platform_fee');
    }
};