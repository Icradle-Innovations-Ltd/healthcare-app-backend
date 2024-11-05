const express = require('express');
const router = express.Router();
const { Appointment } = require('../models/Appointment');
const authMiddleware = require('../middlewares/authMiddleware');
const { apiLimiter } = require('../middlewares/rateLimiter');

// Get all appointments
router.get('/', authMiddleware, async (req, res) => {
    const appointments = await Appointment.findAll({
        include: ['patient', 'doctor']
    });
    res.json(appointments);
});

// Get appointment by ID
router.get('/:id', authMiddleware, async (req, res) => {
    const appointment = await Appointment.findByPk(req.params.id, {
        include: ['patient', 'doctor']
    });
    if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
});

// Create new appointment
router.post('/', [authMiddleware, apiLimiter], async (req, res) => {
    const appointment = await Appointment.create({
        patientId: req.body.patientId,
        doctorId: req.body.doctorId,
        dateTime: req.body.dateTime,
        reason: req.body.reason,
        duration: req.body.duration,
        status: 'scheduled'
    });
    res.status(201).json(appointment);
});

// Update appointment
router.put('/:id', authMiddleware, async (req, res) => {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
    }
    
    await appointment.update({
        dateTime: req.body.dateTime,
        status: req.body.status,
        reason: req.body.reason,
        duration: req.body.duration,
        notes: req.body.notes
    });
    
    res.json(appointment);
});

// Cancel appointment
router.patch('/:id/cancel', authMiddleware, async (req, res) => {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
    }
    
    await appointment.update({ status: 'cancelled' });
    res.json(appointment);
});

// Get doctor's appointments
router.get('/doctor/:doctorId', authMiddleware, async (req, res) => {
    const appointments = await Appointment.findAll({
        where: { doctorId: req.params.doctorId },
        include: ['patient']
    });
    res.json(appointments);
});

// Get patient's appointments
router.get('/patient/:patientId', authMiddleware, async (req, res) => {
    const appointments = await Appointment.findAll({
        where: { patientId: req.params.patientId },
        include: ['doctor']
    });
    res.json(appointments);
});

// Get appointments by date range
router.get('/range/:startDate/:endDate', authMiddleware, async (req, res) => {
    const appointments = await Appointment.findAll({
        where: {
            dateTime: {
                [Op.between]: [req.params.startDate, req.params.endDate]
            }
        },
        include: ['patient', 'doctor']
    });
    res.json(appointments);
});

module.exports = router;
