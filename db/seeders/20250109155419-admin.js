const bcrypt = require('bcrypt');

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('Admin', [
            {
              email: "dania@gmail.com",
              password: bcrypt.hashSync("Dania2002", 10),
              adminFirstName: 'Dania',
              adminLastName: 'Kadiri',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              email: "esra@gmail.com",
              password: bcrypt.hashSync("Esra2002", 10),
              adminFirstName: 'Esra',
              adminLastName: 'Mahdi',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
        ]);
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Admin', null, {});
    },
};