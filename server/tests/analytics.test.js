const request = require('supertest');
const mockDb = require('./mocks/mockDb');

jest.mock('../src/config/db', () => require('./mocks/mockDb'));

const app = require('../src/app');

describe('Financial Analytics & Aggregations Tests', () => {
  let userToken;
  let userId;

  beforeEach(async () => {
    mockDb.reset();

    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Analytics User',
      email: 'analytics@example.com',
      password: 'Password123!',
      currency: 'USD',
    });
    userToken = regRes.body.data.token;
    userId = regRes.body.data.user.id;
  });

  it('should compute period net cashflow, lifetime balance, and savings rate accurately', async () => {
    // Income: $3000
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Monthly Salary',
        amount: 3000.00,
        type: 'INCOME',
        categoryId: 'cat-salary',
        date: new Date().toISOString(),
      });

    // Expense: $1200
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Monthly Rent',
        amount: 1200.00,
        type: 'EXPENSE',
        categoryId: 'cat-rent',
        date: new Date().toISOString(),
      });

    const res = await request(app)
      .get('/api/analytics/summary?period=this_month')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    const summary = res.body.data.summary;
    expect(summary.totalIncome).toBe(3000);
    expect(summary.totalExpenses).toBe(1200);
    expect(summary.netPeriodCashflow).toBe(1800);
    expect(summary.lifetimeBalance).toBe(1800);

    // Savings rate = (1800 / 3000) * 100 = 60%
    expect(summary.savingsRate).toBe(60);
  });

  it('should prevent division by zero in savings rate when income is zero', async () => {
    // Only expense: $50
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Snacks',
        amount: 50.00,
        type: 'EXPENSE',
        categoryId: 'cat-food',
        date: new Date().toISOString(),
      });

    const res = await request(app)
      .get('/api/analytics/summary?period=this_month')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.summary.savingsRate).toBe(0);
    expect(res.body.data.summary.netPeriodCashflow).toBe(-50);
  });
});
