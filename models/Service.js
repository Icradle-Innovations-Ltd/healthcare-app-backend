const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Service = sequelize.define('Service', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  facilityId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Service;
