const request = require('supertest');
const mockDb = require('./mocks/mockDb');

jest.mock('../src/config/db', () => require('./mocks/mockDb'));

const app = require('../src/app');

describe('Transaction Management & Isolation Tests', () => {
  let userAToken;
  let userBToken;
  let userAId;
  let userBId;

  beforeEach(async () => {
    mockDb.reset();

    // Register User A
    const resA = await request(app).post('/api/auth/register').send({
      name: 'User A',
      email: 'usera@example.com',
      password: 'Password123!',
    });
    userAToken = resA.body.data.token;
    userAId = resA.body.data.user.id;

    // Register User B
    const resB = await request(app).post('/api/auth/register').send({
      name: 'User B',
      email: 'userb@example.com',
      password: 'Password123!',
    });
    userBToken = resB.body.data.token;
    userBId = resB.body.data.user.id;
  });

  it('should create an expense transaction with Decimal amount', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        title: 'Whole Foods Groceries',
        amount: 85.50,
        type: 'EXPENSE',
        categoryId: 'cat-food',
        date: new Date().toISOString(),
        paymentMethod: 'Credit Card',
        notes: 'Organic groceries',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.transaction.title).toBe('Whole Foods Groceries');
    expect(res.body.data.transaction.amount).toBe(85.5);
    expect(res.body.data.transaction.type).toBe('EXPENSE');
  });

  it('should strictly isolate user transactions (User B cannot see User A transactions)', async () => {
    // User A creates transaction
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        title: 'Secret User A Transaction',
        amount: 500.00,
        type: 'EXPENSE',
        categoryId: 'cat-rent',
        date: new Date().toISOString(),
      });

    // User B requests their transactions
    const resB = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${userBToken}`);

    expect(resB.status).toBe(200);
    expect(resB.body.data.transactions.length).toBe(0);
    expect(resB.body.data.pagination.totalCount).toBe(0);
  });

  it('should prevent User B from updating or deleting User A transaction', async () => {
    // User A creates transaction
    const createRes = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        title: 'User A Asset',
        amount: 150.00,
        type: 'INCOME',
        categoryId: 'cat-salary',
        date: new Date().toISOString(),
      });

    const txId = createRes.body.data.transaction.id;

    // User B attempts to update User A's transaction
    const updateRes = await request(app)
      .patch(`/api/transactions/${txId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ title: 'Hacked Title' });

    expect(updateRes.status).toBe(404);

    // User B attempts to delete User A's transaction
    const deleteRes = await request(app)
      .delete(`/api/transactions/${txId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(deleteRes.status).toBe(404);
  });

  it('should reject transactions with zero or negative amounts', async () => {
    const resZero = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        title: 'Zero Amount',
        amount: 0,
        type: 'EXPENSE',
        categoryId: 'cat-food',
        date: new Date().toISOString(),
      });

    expect(resZero.status).toBe(400);

    const resNegative = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        title: 'Negative Amount',
        amount: -50,
        type: 'EXPENSE',
        categoryId: 'cat-food',
        date: new Date().toISOString(),
      });

    expect(resNegative.status).toBe(400);
  });

  it('should export transactions to CSV format', async () => {
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        title: 'Coffee Beans',
        amount: 18.50,
        type: 'EXPENSE',
        categoryId: 'cat-food',
        date: '2026-10-14T10:00:00.000Z',
        paymentMethod: 'Cash',
      });

    const res = await request(app)
      .get('/api/transactions/export')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('text/csv');
    expect(res.text).toContain('ID,Date,Title,Type,Category,Amount,Payment Method,Notes');
    expect(res.text).toContain('"Coffee Beans"');
    expect(res.text).toContain('18.50');
  });
});
