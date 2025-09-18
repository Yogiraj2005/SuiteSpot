const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Listing = sequelize.define('Listing', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    image: {
        type: DataTypes.JSON, 
        allowNull: true
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    geometry: {
        type: DataTypes.JSON,
        allowNull: true
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    festival_focus: {
        type: DataTypes.STRING,
        allowNull: true
    },
    
    // --- THIS IS THE NEW, FLEXIBLE FIELD ---
    // It will store data like: 
    // [{ name: "Nashik Road Station", distance: 5 }, { name: "Trimbakeshwar", distance: 20 }]
    nearby_locations: {
        type: DataTypes.JSON,
        allowNull: true
    }

}, {
    tableName: 'listings'
});

module.exports = Listing;

