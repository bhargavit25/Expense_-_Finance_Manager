const request = require('supertest');
const mockDb = require('./mocks/mockDb');

jest.mock('../src/config/db', () => require('./mocks/mockDb'));

const app = require('../src/app');
const recurringService = require('../src/services/recurring.service');

describe('Recurring Transactions & Idempotency Tests', () => {
  let userToken;
  let userId;

  beforeEach(async () => {
    mockDb.reset();

    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Recurring User',
      email: 'recurring@example.com',
      password: 'Password123!',
    });
    userToken = regRes.body.data.token;
    userId = regRes.body.data.user.id;
  });

  it('should create a monthly recurring rule and pause/resume it', async () => {
    const createRes = await request(app)
      .post('/api/recurring')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Cloud Server VPS',
        amount: 25.00,
        type: 'EXPENSE',
        categoryId: 'cat-rent',
        frequency: 'MONTHLY',
        startDate: new Date().toISOString(),
        paymentMethod: 'Credit Card',
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.rule.title).toBe('Cloud Server VPS');
    expect(createRes.body.data.rule.isActive).toBe(true);

    const ruleId = createRes.body.data.rule.id;

    // Pause rule
    const pauseRes = await request(app)
      .post(`/api/recurring/${ruleId}/pause`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(pauseRes.status).toBe(200);
    expect(pauseRes.body.data.rule.isActive).toBe(false);

    // Resume rule
    const resumeRes = await request(app)
      .post(`/api/recurring/${ruleId}/resume`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(resumeRes.status).toBe(200);
    expect(resumeRes.body.data.rule.isActive).toBe(true);
  });

  it('should process due recurring rules idempotently without duplicate transactions', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // Yesterday -> due!

    // Create a due rule in DB
    const rule = await mockDb.recurringTransaction.create({
      data: {
        userId,
        title: 'Monthly Gym Membership',
        amount: 45.00,
        type: 'EXPENSE',
        categoryId: 'cat-food',
        frequency: 'MONTHLY',
        startDate: pastDate,
        nextExecutionDate: pastDate,
        paymentMethod: 'Bank Transfer',
        isActive: true,
      },
    });

    const initialTxCount = mockDb.transactions.length;

    // First execution pass: Should process rule and create transaction
    const pass1 = await recurringService.processDueRecurringTransactions();
    expect(pass1.processedCount).toBe(1);
    expect(pass1.skippedCount).toBe(0);
    expect(mockDb.transactions.length).toBe(initialTxCount + 1);

    // Check execution record
    expect(mockDb.recurringTransactionExecutions.length).toBe(1);
    expect(mockDb.recurringTransactionExecutions[0].status).toBe('SUCCESS');

    // Re-run processor immediately (simulating cron running twice or container restart):
    // MUST NOT create duplicate transaction!
    const pass2 = await recurringService.processDueRecurringTransactions();
    expect(pass2.processedCount).toBe(0);
    expect(mockDb.transactions.length).toBe(initialTxCount + 1); // Count unchanged!
  });
});
