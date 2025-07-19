'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Opportunity', {
      opportunityID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      providerID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: 'Provider',
            key: 'id',
        },
      },
      
      //basic info
      opportunityName: {
        type: Sequelize.STRING(100)
      },
      location: {
        type: Sequelize.STRING
      },
      city: {
        type: Sequelize.STRING(50)
      },
      category: {
        type: Sequelize.STRING(30)
      },
      participationType: {
        type: Sequelize.STRING(20)
      },
      description: {
        type: Sequelize.TEXT
      },
      urgency: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      //coordinator info
      coordinatorName: {
        type: Sequelize.STRING(100)
      },
      coordinatorPhoneNumber : {
        type: Sequelize.STRING(30)
      },
      coordinatorEmail: {
        type: Sequelize.STRING,
      },

      //time info
      applyDeadline: {
        type: Sequelize.DATE
      },
      startDate: {
        type: Sequelize.DATE
      },
      endDate: {
        type: Sequelize.DATE
      },
      hours: {
        type: Sequelize.INTEGER,
      },
      capacity: {
        type: Sequelize.INTEGER,
      },

      //volunteer info
      ageRange: {
        type: Sequelize.RANGE(Sequelize.INTEGER),        
        allowNull: false,
      },
      gender: {
        type: Sequelize.ARRAY(Sequelize.STRING(10)),
      },
      eduLevel: {
        type: Sequelize.JSON,
      },
      eduMajor: {
        type: Sequelize.ARRAY(Sequelize.STRING(50)),
      },
      skills: {
        type: Sequelize.ARRAY(Sequelize.STRING(50)),
      },
      volunteeringLevel: {
        type: Sequelize.STRING(30)
      },
      volunteerSupport: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      benefits: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      tasks: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      interview: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      disabilities: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      reqStatus: {
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
    await queryInterface.dropTable('Opportunity');
  }
};