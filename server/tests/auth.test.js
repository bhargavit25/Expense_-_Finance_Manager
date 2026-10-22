const request = require('supertest');
const mockDb = require('./mocks/mockDb');

// Mock Prisma client with in-memory DB
jest.mock('../src/config/db', () => require('./mocks/mockDb'));

const app = require('../src/app');

describe('Authentication & User Management Tests', () => {
  beforeEach(() => {
    mockDb.reset();
  });

  it('should register a new user with hashed password and return JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Sarah Connor',
        email: 'sarah@example.com',
        password: 'Password123!',
        currency: 'USD',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('sarah@example.com');
    expect(res.body.data.user.name).toBe('Sarah Connor');
    expect(res.body.data.token).toBeDefined();

    // Verify password is NOT returned in plain text
    expect(res.body.data.user.password).toBeUndefined();

    // Verify stored user password in DB is bcrypt hashed
    const stored = mockDb.users.find((u) => u.email === 'sarah@example.com');
    expect(stored.password).not.toBe('Password123!');
    expect(stored.password).toMatch(/^\$2[aby]\$\d+\$/);
  });

  it('should reject registration with duplicate email address', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'User One',
      email: 'duplicate@example.com',
      password: 'Password123!',
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'User Two',
      email: 'duplicate@example.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should reject weak password failing validation requirements', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Weak Pass',
      email: 'weak@example.com',
      password: 'weak', // Less than 8 chars, no special char
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('should authenticate user with valid credentials', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'john@example.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('john@example.com');
  });

  it('should reject login with incorrect password', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'john@example.com',
      password: 'WrongPassword999!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject access to protected endpoint without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should allow access to protected endpoint with valid Bearer token', async () => {
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Protected User',
      email: 'protected@example.com',
      password: 'Password123!',
    });

    const token = regRes.body.data.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('protected@example.com');
  });
});
