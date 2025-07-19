'use strict';
const { Model, Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const bcrypt = require('bcrypt');

const RefreshToken = sequelize.define(
    'RefreshToken',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      token: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        set(value) {
          const hash = bcrypt.hashSync(value, 10);
          this.setDataValue('token', hash); 
        },
        validate: {
          notNull: {
            msg: 'token can not be null',
          }
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'userId can not be null',
          }
        },
      },
      userType: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'userType can not be null',
          }
        },
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
        freezeTableName: true,
        modelName: 'RefreshToken',
    }
);

module.exports = RefreshToken;

// RefreshToken.sync({force: true}).then((data)=>{
//   console.log("DONE");
// }).catch((err)=>{
//   console.log("NOTHING");
// }) 