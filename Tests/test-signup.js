const axios = require('axios');

const testSignup = async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/auth/signup', {
      email: 'doctor@healthcare.com',
      password: 'Doctor123!@#',
      firstName: 'John',
      lastName: 'Doe',
      role: 'doctor',
      phoneNumber: '1234567890'
    });

    console.log('Signup successful:', response.data);
  } catch (error) {
    console.error('Signup failed:', error.response ? error.response.data : error.message);
  }
};

testSignup();
