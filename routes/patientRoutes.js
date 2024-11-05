const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/appointments', patientController.manageAppointments);

module.exports = router;
