const Sequelize = require('sequelize');
const sequelize = require('./database');

const User = sequelize.define('users', {
    // id: {
    //     type: Sequelize.INTEGER,
    //     autoIncrement: true,
    //     allowNull: false,
    //     primaryKey: true
    // },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false, // or true if email can be optional
    unique: true,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false, // or true if password can be optional
  }
});
sequelize.sync({ force: false })
  .then(() => {
    console.log('Database and tables created!');
  })
  .catch(err => {
    console.log('Unable to create database:', err);
  });

module.exports = User;
