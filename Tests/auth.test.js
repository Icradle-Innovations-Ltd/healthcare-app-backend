const request = require('supertest');
const app = require('../app');
const db = require('../config/db');
const logger = require('../utils/logger');

describe('Authentication Tests', () => {
  const testUser = {
    email: 'test@healthcare.com',
    password: 'Test123!@#',
    firstName: 'Test',
    lastName: 'User',
    role: 'patient',
    phoneNumber: '1234567890'
  };

  beforeAll(async () => {
    // Clear test users
    await db.run('DELETE FROM users WHERE email = ?', [testUser.email]);
  });

  test('Should successfully register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe(testUser.email);
    
    // Verify logging
    const logs = await logger.query({
      from: new Date() - 1000,
      until: new Date(),
      limit: 1,
      order: 'desc'
    });
    
    expect(logs[0]).toContain(`New user registered: ${testUser.email}`);
  });

  test('Should not register duplicate email', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty('error', 'Email already registered');
  });
});
