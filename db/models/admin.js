'use strict';
const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

const sequelize = require('../../config/database');
const AppError = require('../../utils/appError');

const Admin = sequelize.define(
    'Admin',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notNull: {
            msg: 'البريد الإلكتروني لا يمكن أن يكون فارغ',
          },
          notEmpty: {
            msg: 'البريد الإلكتروني لا يمكن أن يكون فارغ',
          },
          isEmail: {
            msg: 'البريد الإلكتروني غير صالح',
          },
        },   
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'كلمة المرور لا يمكن أن تكون فارغة',
          },
          notEmpty: {
            msg: 'كلمة المرور لا يمكن أن تكون فارغة',
          },
        },
      },
      confirmPassword: {
        type: DataTypes.VIRTUAL,
        set(value) {
            if (this.password.length < 7) {
                throw new AppError(
                    'يجب أن يكون طول كلمة المرور أكثر من 7', 400);
            }
            if (value === this.password) {
                const hashPassword = bcrypt.hashSync(value, 10);
                this.setDataValue('password', hashPassword);
            } else {
                throw new AppError(
                    'تأكد من صحة كلمة المرور', 400);
                  }
        },
    },

    adminFirstName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'اسم الأول لا يمكن أن يكون فارغ',
          },
          notEmpty: {
            msg: 'اسم الأول لا يمكن أن يكون فارغ',
          },
        },
      },
      adminLastName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'اسم العائلة لا يمكن أن يكون فارغ',
          },
          notEmpty: {
            msg: 'اسم العائلة لا يمكن أن يكون فارغ',
          },
        },
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
    },
    },
    {
        freezeTableName: true,
        modelName: 'Admin',
    }
);

module.exports = Admin;

// Admin.sync({force: true}).then((data)=>{
//   console.log("DONE");
// }).catch((err)=>{
//   console.log("NOTHING");
// }) 