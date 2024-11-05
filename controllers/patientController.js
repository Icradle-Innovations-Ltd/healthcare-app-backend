const Appointment = require('../models/Appointment');

exports.manageAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({ where: { patientId: req.user.id } });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Add more functions for booking and canceling appointments as needed.
