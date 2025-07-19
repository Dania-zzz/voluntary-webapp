'use strict';
const { Model, Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

const sequelize = require('../../config/database');
const AppError = require('../../utils/appError');
const Opportunity = require('./opportunity');
const Application = require('./application');

const Volunteer = sequelize.define(
    'Volunteer',
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

      firstName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'الاسم الأول لا يمكن أن يكون فارغ',
          },
          notEmpty: {
            msg: 'الاسم الأول لا يمكن أن يكون فارغ',
          },
        },
      },
      lastName: {
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
      birthDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'تاريخ الميلاد لا يمكن أن يكون فارغ'
          },
          isWithinAgeRange(value) {
            const today = new Date();
            const age = today.getFullYear() - value.getFullYear();
            if (age < 14 || age > 80) {
              throw new AppError('يجب أن يكون عمرك 14 عامًا أو أكبر', 400);
            }
          }
        }
      },
      nationality: {
        type: DataTypes.STRING(30),
        allowNull: false,
        validate: {
          notNull: {
              msg: 'الجنسية لا يمكن أن تكون فارغة',
          },
        }
      },
      countryResidence: {
        type: DataTypes.STRING(30),
        allowNull: false,
        validate: {
          notNull: {
              msg: 'بلد الإقامة لا يمكن أن يكون فارغ',
          },
        }
      },
      martialStatus: {
        type: DataTypes.STRING(15),
        allowNull: false,
        validate: {
          notNull: {
              msg: 'الحالة الاجتماعية لا يمكن أن تكون فارغة',
          },
          isIn: {
            args: [['متزوج', 'أرمل', 'مطلق', 'أعزب']],
            msg: 'قيمة الحالة الاجتماعية غير صالحة',
        },
        }
      },
      gender: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        validate: {
          notNull: {
              msg: 'الجنس لا يمكن أن يكون فارغ',
          },
          isIn: {
            args: [['m', 'f']],
            msg: 'الجنس يمكن أن يكون ذكرا أو أنثى',
        },
        }
      },

      chronicDiseases: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        validate: {
          isIn: {
              args: [[true, false]],
              msg: 'يجب أن تكون قيمة الأمراض المزمنة صحيحة أو خاطئة',
          },
      },
      },
      specialNeeds: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        validate: {
          isIn: {
              args: [[true, false]],
              msg: 'يجب أن تكون قيمة الاحتياجات الخاصة صحيحة أو خاطئة',
          },
      },
      },

      eduLevel: {
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
          isObject(value) {
            if (typeof value !== 'object' || value === null) {
              throw new AppError('يجب أن يكون نوع مستوى التعليم كائنًا');
            }
          },
          hasFields(value) {
            if (!('level' in value) || !('points' in value)) {
              // throw new AppError('eduLevel must have fields "level" and "points"');
              throw new AppError('يجب أن يحتوي المستوى التعليمي على حقلي "المستوى" و"النقاط"');
            }
          },
        }
      },
      eduMajor: {
        type: DataTypes.STRING(50),
        allowNull: true,
        // validate: {
        //   notNull: {
        //     msg: 'التخصص لا يمكن أن يكون فارغ'
        //   },
        //   notEmpty: {
        //     msg: 'التخصص لا يمكن أن يكون فارغ'
        //   }
        // }
      },
      laborSector: {
        type: DataTypes.STRING(50),
        allowNull: true,
        // validate: {
        //   notNull: {
        //     msg: 'قطاع العمل لا يمكن أن يكون فارغ'
        //   },
        // }
      },
      cv: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      voulnteerBio: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      profilePicture: {
        type: DataTypes.STRING,
        allowNull: false,
            validate: {
                notNull: {
                    msg: 'لا يمكن أن تكون صورة الملف الشخصي فارغة',
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
      modelName: 'Volunteer',
    }
);

Volunteer.hasMany(Application, { foreignKey: 'voulnteerID', onDelete: 'CASCADE' });
Application.belongsTo(Volunteer, {
    foreignKey: 'voulnteerID',
});

module.exports = Volunteer;

// Volunteer.sync({force: true}).then((data)=>{
//   console.log("DONE");
// }).catch((err)=>{
//   console.log("NOTHING");
// }) 