'use strict';
const { Model, Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Application = sequelize.define(
    'Application',
    {
      voulnteerID: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Volunteer',
            key: 'id',
        },
      },
      opportunityID: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Opportunity',
            key: 'opportunityID',
        },
      },
      status: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: 'Pending',
        validate: {
          notNull: {
            msg: 'status can not be null',
          },          
        },
      },
      
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['voulnteerID', 'opportunityID'],
        },
      ],
      paranoid: false,
      freezeTableName: true,
      modelName: 'Application',
    }
);

module.exports = Application;

// Application.sync({force: true}).then((data)=>{
//   console.log("DONE");
// }).catch((err)=>{
//   console.log("NOTHING");
// }) 