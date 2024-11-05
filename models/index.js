const { Sequelize } = require('sequelize');
const config = require('../config/database');

const sequelize = new Sequelize(config);

const models = {
    Appointment: require('./Appointment'),
    Patient: require('./Patient'),
    Doctor: require('./Doctor'),
    User: require('./User')
};

// Initialize models
Object.keys(models).forEach(modelName => {
    if (typeof models[modelName] === 'function') {
        models[modelName] = new models[modelName](sequelize);
    }
});

// Set up associations
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;