const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        status: 'error',
        message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Auth endpoints rate limiter
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 login attempts per hour
    message: {
        status: 'error',
        message: 'Too many login attempts, please try again after an hour.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Create custom rate limiter function
const createCustomLimiter = (options) => rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    ...options
});

module.exports = {
    apiLimiter,
    authLimiter,
    createCustomLimiter
};
