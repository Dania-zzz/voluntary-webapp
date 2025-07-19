'use strict';
const { Model, Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

const sequelize = require('../../config/database');
const AppError = require('../../utils/appError');
const Opportunity = require('./opportunity');

const Provider = sequelize.define(
    'Provider',
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
                throw new App
                (
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

      providerName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'الاسم لا يمكن أن يكون فارغا',
          },
          notEmpty: {
            msg: 'الاسم لا يمكن أن يكون فارغا',
          },
        },
      },
      industry: {
        type: DataTypes.STRING(30),
        allowNull: false,
        validate: {
          notNull: {
              msg: 'الصناعة لا يمكن أن تكون فارغة',
          },
        }
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
              msg: 'الموقع لا يمكن أن يكون فارغا',
          },
        }
      },
      estDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'estDate can not be null'
          },
        }
      },
      authDoc: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'authDoc cannot be null',
            },
            notEmpty: {
                msg: 'authDoc cannot be empty',
            },
          },
        },

      providerBio: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: {
              msg: 'providerBio can not be null',
          },
      },
      },
      profilePicture: {
        type: DataTypes.STRING,
        allowNull: false,
            validate: {
                notNull: {
                    msg: 'profilePicture can not be null',
                },
            },
      },
      verified: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: 'Pending',
        validate: {
          notNull: {
            msg: 'verified can not be null',
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
      deletedAt: {
      allowNull: true,
      defaultValue: null,
      type: DataTypes.DATE
      }
    },
    {
      paranoid: true,
      freezeTableName: true,
      modelName: 'Provider',
    }
);

Provider.hasMany(Opportunity, { foreignKey: 'providerID', onDelete: 'CASCADE' });
Opportunity.belongsTo(Provider, {
    foreignKey: 'providerID',
});

module.exports = Provider;

// Provider.sync({force: true}).then((data)=>{
//   console.log("DONE");
// }).catch((err)=>{
//   console.log("NOTHING");
// }) 