const request = require('supertest');
const mockDb = require('./mocks/mockDb');

jest.mock('../src/config/db', () => require('./mocks/mockDb'));

const app = require('../src/app');

describe('Budget Management & Overspending Alert Tests', () => {
  let userToken;
  let userId;
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  beforeEach(async () => {
    mockDb.reset();

    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Budget User',
      email: 'budget@example.com',
      password: 'Password123!',
    });
    userToken = regRes.body.data.token;
    userId = regRes.body.data.user.id;
  });

  it('should allocate a monthly category budget and compute usage percentage accurately', async () => {
    // 1. Set budget of $200 for Food & Dining
    const budgetRes = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        categoryId: 'cat-food',
        month: currentMonth,
        year: currentYear,
        amount: 200.00,
      });

    expect(budgetRes.status).toBe(200);
    expect(budgetRes.body.success).toBe(true);

    // 2. Add an expense of $100 (50% usage)
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Weekly Dinner',
        amount: 100.00,
        type: 'EXPENSE',
        categoryId: 'cat-food',
        date: new Date().toISOString(),
      });

    // 3. Query budgets
    const getRes = await request(app)
      .get(`/api/budgets?month=${currentMonth}&year=${currentYear}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(getRes.status).toBe(200);
    const budget = getRes.body.data.budgets[0];
    expect(budget.budgetAmount).toBe(200);
    expect(budget.spentAmount).toBe(100);
    expect(budget.remainingAmount).toBe(100);
    expect(budget.usagePercentage).toBe(50);
    expect(budget.status).toBe('normal');
  });

  it('should trigger alert at 75% threshold and deduplicate subsequent triggers', async () => {
    // Set budget of $100
    await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        categoryId: 'cat-food',
        month: currentMonth,
        year: currentYear,
        amount: 100.00,
      });

    // Spend $80 (80% -> crosses 75% threshold)
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Dinner at Bistro',
        amount: 80.00,
        type: 'EXPENSE',
        categoryId: 'cat-food',
        date: new Date().toISOString(),
      });

    // Check notifications
    const notifRes1 = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${userToken}`);

    expect(notifRes1.status).toBe(200);
    expect(notifRes1.body.data.notifications.length).toBe(1);
    expect(notifRes1.body.data.notifications[0].threshold).toBe(75);
    expect(notifRes1.body.data.notifications[0].title).toContain('Budget Warning');

    // Add another small expense ($5) -> still in 75-90% range (85%)
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Coffee',
        amount: 5.00,
        type: 'EXPENSE',
        categoryId: 'cat-food',
        date: new Date().toISOString(),
      });

    // Verify deduplication: Notification count must STILL be 1, NOT duplicate 75% alert!
    const notifRes2 = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${userToken}`);

    expect(notifRes2.body.data.notifications.length).toBe(1);
  });

  it('should trigger overspent alert (>100%) when expenses exceed budget limit', async () => {
    // Budget $50
    await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        categoryId: 'cat-transport',
        month: currentMonth,
        year: currentYear,
        amount: 50.00,
      });

    // Spend $75 (150% -> overspent)
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Uber rides',
        amount: 75.00,
        type: 'EXPENSE',
        categoryId: 'cat-transport',
        date: new Date().toISOString(),
      });

    const notifRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${userToken}`);

    const overspentAlert = notifRes.body.data.notifications.find((n) => n.threshold === 101);
    expect(overspentAlert).toBeDefined();
    expect(overspentAlert.type).toBe('BUDGET_EXCEEDED');
    expect(overspentAlert.message).toContain('exceeded your budget');
  });
});
