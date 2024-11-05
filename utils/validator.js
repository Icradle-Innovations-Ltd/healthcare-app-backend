const { body } = require('express-validator');

const patientValidation = {
  bookAppointment: [
    body('providerId')
      .notEmpty()
      .withMessage('Provider ID is required'),
    body('dateTime')
      .isISO8601()
      .withMessage('Valid appointment date and time is required'),
    body('type')
      .isIn(['consultation', 'follow-up', 'emergency', 'routine-checkup'])
      .withMessage('Invalid appointment type')
  ],

  updateProfile: [
    body('firstName')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 2 })
      .withMessage('First name must be at least 2 characters long'),
    body('lastName')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Last name must be at least 2 characters long'),
    body('phoneNumber')
      .optional()
      .matches(/^\+?[\d\s-]+$/)
      .withMessage('Invalid phone number format'),
    body('address')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Address cannot be empty if provided')
  ]
};

module.exports = patientValidation;
