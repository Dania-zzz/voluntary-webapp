'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Provider', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
      },
      password: {
        type: Sequelize.STRING
      },

      providerName: {
        type: Sequelize.STRING(100)
      },
      industry: {
        type: Sequelize.STRING(30)
      },
      location: {
        type: Sequelize.STRING
      },
      estDate: {
        type: Sequelize.DATE
      },
      authDoc: {
        type: Sequelize.STRING
      },
      
      providerBio: {
        type: Sequelize.TEXT
      },
      profilePicture: {
        type: Sequelize.STRING
      },

      verified: {
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
    await queryInterface.dropTable('Provider');
  }
};