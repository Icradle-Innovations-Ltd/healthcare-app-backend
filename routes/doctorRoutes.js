const express = require('express');
const router = express.Router();

// Doctor routes
router.get('/', (req, res) => {
    res.json({ message: 'Doctor routes working' });
});

module.exports = router;
