const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');

router.get('/information', visitorController.viewInformation);

module.exports = router;
