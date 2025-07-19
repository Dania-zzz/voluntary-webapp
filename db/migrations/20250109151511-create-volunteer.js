'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Volunteer', {
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

      firstName: {
        type: Sequelize.STRING(50)
      },
      lastName: {
        type: Sequelize.STRING(50)
      },
      birthDate: {
        type: Sequelize.DATE
      },
      nationality: {
        type: Sequelize.STRING(30)
      },
      countryResidence: {
        type: Sequelize.STRING(30)
      },
      martialStatus: {
        type: Sequelize.STRING(15)
      },
      gender: {
        type: Sequelize.CHAR(1)
      },

      chronicDiseases: {
        type: Sequelize.BOOLEAN
      },
      specialNeeds: {
        type: Sequelize.BOOLEAN
      },
      
      eduLevel: {
        type: Sequelize.JSON,
      },
      eduMajor: {
        type: Sequelize.STRING(50)
      },
      laborSector: {
        type: Sequelize.STRING(50)
      },
      skills: {
        type: Sequelize.ARRAY(Sequelize.STRING(50)),
      },
      cv: {
        type: Sequelize.STRING
      },

      voulnteerBio: {
        type: Sequelize.TEXT
      },
      profilePicture: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Volunteer');
  }
};