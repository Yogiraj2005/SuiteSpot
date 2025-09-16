const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Booking = sequelize.define('Booking', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    
    // REPLACED expiresAt with startDate and endDate
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },

    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    }

}, {
    tableName: 'bookings'
});

module.exports = Booking;

