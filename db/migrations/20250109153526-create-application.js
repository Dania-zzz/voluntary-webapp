'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Application', {
      voulnteerID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Volunteer',
            key: 'id',
        },
      },
      opportunityID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Opportunity',
            key: 'opportunityID',
        },
      },
      status: {
        type: Sequelize.STRING(30),
        defaultValue: 'pending'
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Application');
  }
};