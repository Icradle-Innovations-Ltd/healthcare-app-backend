const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Patients',
      key: 'id'
    }
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Doctors',
      key: 'id'
    }
  },
  dateTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'cancelled', 'rescheduled'),
    defaultValue: 'scheduled'
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    allowNull: false
  }
}, {
  timestamps: true
});

// Define associations
Appointment.associate = (models) => {
  Appointment.belongsTo(models.Patient, {
    foreignKey: 'patientId',
    as: 'patient'
  });
  Appointment.belongsTo(models.Doctor, {
    foreignKey: 'doctorId',
    as: 'doctor'
  });
};

module.exports = Appointment;
