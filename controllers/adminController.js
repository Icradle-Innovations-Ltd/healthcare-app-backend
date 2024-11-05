const User = require('../models/User');
const Facility = require('../models/Facility');

exports.manageUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.manageFacilities = async (req, res) => {
  try {
    const facilities = await Facility.findAll();
    res.status(200).json(facilities);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
