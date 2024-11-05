const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware(['admin'])); // Only admins can access these routes

router.get('/users', adminController.manageUsers);
router.get('/facilities', adminController.manageFacilities);

module.exports = router;
