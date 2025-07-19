'use strict';
const { Model, Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const AppError = require('../../utils/appError');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

const Volunteer = require('./volunteer');
const Application = require('./application');

const Opportunity = sequelize.define(
    'Opportunity',
    {
      opportunityID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      providerID: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Provider',
            key: 'id',
        },
      },

      //basic info
      opportunityName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'opportunityName can not be null',
          },
          notEmpty: {
            msg: 'opportunityName can not be empty',
          },
        },
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
              msg: 'location can not be null',
          },
        }
      },
      city: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notNull: {
              msg: 'city can not be null',
          },
          notEmpty: {
            msg: 'city can not be empty',
          },
        }
      },
      category: {
        type: DataTypes.STRING(30),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'category can not be null',
          },
          notEmpty: {
            msg: 'category can not be empty',
          },
        },
      },
      participationType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'participationType can not be null',
          },
          notEmpty: {
            msg: 'participationType can not be empty',
          },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: {
              msg: 'description can not be null',
          },
      },
      },
      urgency: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        validate: {
          isIn: {
            args: [[true, false]],
            msg: 'urgency value must be true or false',
          },
        },
      },

      //coordinator info
      coordinatorName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'coordinatorName can not be null',
          },
          notEmpty: {
            msg: 'coordinatorName can not be empty',
          },
        },
      },
      coordinatorPhoneNumber : {
        type: DataTypes.STRING(30),
        allowNull: false,
        validate: {
          set(value){
            const parsedNumber = phoneUtil.parse(value);
            if (!phoneUtil.isValidNumber(parsedNumber))
              throw new AppError('Invalid phone number', 400);
          },
          notNull: {
              msg: 'coordinator PhoneNumber can not be null',
            }
          }
      },
      coordinatorEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'coordinatorEmail can not be null',
          },
          notEmpty: {
            msg: 'coordinatorEmail can not be empty',
          },
          isEmail: {
            msg: 'Invalid email id',
          },
        },
      },
      
      //time info
      applyDeadline: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'applyDeadline can not be null'
          },
          notEmpty: {
            msg: 'applyDeadline cannot be empty',
        },
        }
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'startDate can not be null'
          },
          notEmpty: {
            msg: 'startDate cannot be empty',
        },
        }
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'endDate can not be null'
          },
          notEmpty: {
            msg: 'endDate cannot be empty',
        },
        }
      },
      hours: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'hours can not be null'
          },
          notEmpty: {
            msg: 'hours cannot be empty',
        },
        }
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'capacity can not be null'
          },
          notEmpty: {
            msg: 'capacity cannot be empty',
        },
        }
      },

      //volunteer info
      ageRange: {
        type: DataTypes.RANGE(DataTypes.INTEGER),        
        allowNull: false,
        validate: {
          notNull: {
            msg: 'ageRange can not be null'
          },
        }
      },
      gender: {
        type: DataTypes.ARRAY(DataTypes.STRING(10)),
        allowNull: false,
        validate: {
          notNull: {
              msg: 'gender can not be null',
          },
        }
      },
      eduLevel: {
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
          isObject(value) {
            if (typeof value !== 'object' || value === null) {
              throw new AppError('eduLevel must be an object');
            }
          },
          hasFields(value) {
            if (!('level' in value) || !('points' in value)) {
              throw new AppError('eduLevel must have fields "level" and "points"');
            }
          },
        }
      },
      eduMajor: {
        type: DataTypes.ARRAY(DataTypes.STRING(50)),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'eduMajor can not be null'
          },
          notEmpty: {
            msg: 'eduMajor can not be empty'
          }
        }
      },
      skills: {
        type: DataTypes.ARRAY(DataTypes.STRING(50)),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'skills can not be null',
            },
          },
      },

      volunteeringLevel: {
        type: DataTypes.STRING(30),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'volunteeringLevel can not be null'
          },
        }
      },
      volunteerSupport: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'volunteerSupport can not be null',
            },
          },
      },
      benefits: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'benefits can not be null',
            },
          },
      },
      tasks: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'tasks can not be null',
            },
          },
      },
      interview: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        validate: {
          isIn: {
            args: [[true, false]],
            msg: 'interview value must be true or false',
          },
        },
      },
      disabilities: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        validate: {
          isIn: {
            args: [[true, false]],
            msg: 'disabilities value must be true or false',
          },
        },
      },

      reqStatus: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: 'Pending',
        validate: {
          notNull: {
            msg: 'reqStatus can not be null',
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
      modelName: 'Opportunity',
    }
);

Opportunity.hasMany(Application, { foreignKey: 'opportunityID', onDelete: 'CASCADE' });
Application.belongsTo(Opportunity, {
    foreignKey: 'opportunityID',
});

module.exports = Opportunity;

// Opportunity.sync({force: true}).then((data)=>{
//   console.log("DONE");
// }).catch((err)=>{
//   console.log("NOTHING");
// }) 