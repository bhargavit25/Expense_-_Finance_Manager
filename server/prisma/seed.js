const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from server/.env before initializing Prisma
dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.DATABASE_URL) {
  console.error('❌ [SEED ERROR] DATABASE_URL is not defined in server/.env.');
  console.error('Please configure your PostgreSQL connection string in server/.env before seeding.');
  process.exit(1);
}

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  // Expense Categories
  { name: 'Food & Dining', type: 'EXPENSE', color: '#F97316', icon: 'Utensils' },
  { name: 'Transportation', type: 'EXPENSE', color: '#0EA5E9', icon: 'Car' },
  { name: 'Shopping', type: 'EXPENSE', color: '#EC4899', icon: 'ShoppingBag' },
  { name: 'Rent & Housing', type: 'EXPENSE', color: '#6366F1', icon: 'Home' },
  { name: 'Bills & Utilities', type: 'EXPENSE', color: '#EAB308', icon: 'Zap' },
  { name: 'Health', type: 'EXPENSE', color: '#EF4444', icon: 'HeartPulse' },
  { name: 'Education', type: 'EXPENSE', color: '#8B5CF6', icon: 'GraduationCap' },
  { name: 'Entertainment', type: 'EXPENSE', color: '#14B8A6', icon: 'Film' },
  { name: 'Travel', type: 'EXPENSE', color: '#06B6D4', icon: 'Plane' },
  { name: 'Other Expense', type: 'EXPENSE', color: '#64748B', icon: 'MoreHorizontal' },

  // Income Categories
  { name: 'Salary', type: 'INCOME', color: '#10B981', icon: 'Briefcase' },
  { name: 'Freelance', type: 'INCOME', color: '#059669', icon: 'Laptop' },
  { name: 'Business', type: 'INCOME', color: '#047857', icon: 'Building2' },
  { name: 'Investments', type: 'INCOME', color: '#3B82F6', icon: 'TrendingUp' },
  { name: 'Gifts', type: 'INCOME', color: '#F43F5E', icon: 'Gift' },
  { name: 'Other Income', type: 'INCOME', color: '#6B7280', icon: 'Wallet' },
];

async function seed() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Default Categories (Safe & Idempotent)
  for (const cat of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: {
        name: cat.name,
        userId: null,
        type: cat.type,
      },
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          name: cat.name,
          type: cat.type,
          color: cat.color,
          icon: cat.icon,
          isDefault: true,
          userId: null,
        },
      });
      console.log(` ✅ Created default category: ${cat.name} (${cat.type})`);
    } else {
      console.log(` ℹ️ Category already exists: ${cat.name} (${cat.type})`);
    }
  }

  // 2. Create Demo User
  const demoEmail = 'demo@financeflow.com';
  let demoUser = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  if (!demoUser) {
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    demoUser = await prisma.user.create({
      data: {
        name: 'Alex Johnson',
        email: demoEmail,
        password: hashedPassword,
        currency: 'INR',
      },
    });
    console.log(` ✅ Created demo user: ${demoEmail} (Password: Password123!)`);

    // Fetch categories for sample data
    const categories = await prisma.category.findMany({
      where: { userId: null },
    });
    const catMap = {};
    categories.forEach((c) => {
      catMap[c.name] = c.id;
    });

    // Sample current date info
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Seed Sample Budgets for Current Month (in INR)
    const sampleBudgets = [
      { category: 'Food & Dining', amount: 15000 },
      { category: 'Transportation', amount: 6000 },
      { category: 'Shopping', amount: 10000 },
      { category: 'Bills & Utilities', amount: 5000 },
      { category: 'Entertainment', amount: 4000 },
    ];

    for (const b of sampleBudgets) {
      if (catMap[b.category]) {
        await prisma.budget.create({
          data: {
            userId: demoUser.id,
            categoryId: catMap[b.category],
            month: currentMonth,
            year: currentYear,
            amount: b.amount,
          },
        });
      }
    }
    console.log(' ✅ Seeded demo budgets for current month (INR).');

    // Seed Sample Transactions (in INR)
    const sampleTransactions = [
      // Income
      {
        title: 'Tech Corp Monthly Salary',
        amount: 75000.00,
        type: 'INCOME',
        category: 'Salary',
        date: new Date(currentYear, currentMonth - 1, 1),
        paymentMethod: 'Bank Transfer',
        notes: 'Monthly direct deposit salary',
      },
      {
        title: 'Freelance UI/UX Project',
        amount: 25000.00,
        type: 'INCOME',
        category: 'Freelance',
        date: new Date(currentYear, currentMonth - 1, 10),
        paymentMethod: 'Bank Transfer',
        notes: 'Client invoice paid',
      },
      {
        title: 'Dividend Payout',
        amount: 4500.00,
        type: 'INCOME',
        category: 'Investments',
        date: new Date(currentYear, currentMonth - 1, 15),
        paymentMethod: 'Bank Transfer',
        notes: 'Quarterly ETF dividends',
      },
      // Expenses
      {
        title: 'Apartment Rent',
        amount: 22000.00,
        type: 'EXPENSE',
        category: 'Rent & Housing',
        date: new Date(currentYear, currentMonth - 1, 2),
        paymentMethod: 'Bank Transfer',
        notes: 'Monthly apartment rent',
      },
      {
        title: 'Supermarket Groceries',
        amount: 8450.00,
        type: 'EXPENSE',
        category: 'Food & Dining',
        date: new Date(currentYear, currentMonth - 1, 4),
        paymentMethod: 'Credit Card',
        notes: 'Weekly family groceries',
      },
      {
        title: 'Electric & Water Utility Bill',
        amount: 3200.00,
        type: 'EXPENSE',
        category: 'Bills & Utilities',
        date: new Date(currentYear, currentMonth - 1, 7),
        paymentMethod: 'Debit Card',
        notes: 'City power & water',
      },
      {
        title: 'Petrol Fill-up',
        amount: 2400.00,
        type: 'EXPENSE',
        category: 'Transportation',
        date: new Date(currentYear, currentMonth - 1, 8),
        paymentMethod: 'Credit Card',
        notes: 'Full tank of fuel',
      },
      {
        title: 'Weekend Family Dinner',
        amount: 2800.00,
        type: 'EXPENSE',
        category: 'Food & Dining',
        date: new Date(currentYear, currentMonth - 1, 12),
        paymentMethod: 'Credit Card',
        notes: 'Dinner with family',
      },
      {
        title: 'Running Shoes & Apparel',
        amount: 4500.00,
        type: 'EXPENSE',
        category: 'Shopping',
        date: new Date(currentYear, currentMonth - 1, 14),
        paymentMethod: 'Credit Card',
        notes: 'Athletic footwear',
      },
      {
        title: 'Cinema Tickets & Snacks',
        amount: 1200.00,
        type: 'EXPENSE',
        category: 'Entertainment',
        date: new Date(currentYear, currentMonth - 1, 16),
        paymentMethod: 'Cash',
        notes: 'Weekend movie',
      },
    ];

    for (const tx of sampleTransactions) {
      if (catMap[tx.category]) {
        await prisma.transaction.create({
          data: {
            userId: demoUser.id,
            title: tx.title,
            amount: tx.amount,
            type: tx.type,
            categoryId: catMap[tx.category],
            date: tx.date,
            paymentMethod: tx.paymentMethod,
            notes: tx.notes,
          },
        });
      }
    }
    console.log(' ✅ Seeded demo transactions (INR).');

    // Seed Sample Recurring Transactions
    if (catMap['Rent & Housing']) {
      await prisma.recurringTransaction.create({
        data: {
          userId: demoUser.id,
          title: 'Monthly Rent Payment',
          amount: 22000.00,
          type: 'EXPENSE',
          categoryId: catMap['Rent & Housing'],
          paymentMethod: 'Bank Transfer',
          startDate: new Date(currentYear, currentMonth - 1, 1),
          frequency: 'MONTHLY',
          nextExecutionDate: new Date(currentYear, currentMonth, 1),
          isActive: true,
        },
      });
    }

    if (catMap['Salary']) {
      await prisma.recurringTransaction.create({
        data: {
          userId: demoUser.id,
          title: 'Monthly Salary Paycheck',
          amount: 75000.00,
          type: 'INCOME',
          categoryId: catMap['Salary'],
          paymentMethod: 'Bank Transfer',
          startDate: new Date(currentYear, currentMonth - 1, 1),
          frequency: 'MONTHLY',
          nextExecutionDate: new Date(currentYear, currentMonth, 1),
          isActive: true,
        },
      });
    }
    console.log(' ✅ Seeded demo recurring rules (INR).');
  } else {
    // Update existing demo user to INR and adjust salary to INR rupees
    await prisma.user.update({
      where: { id: demoUser.id },
      data: { currency: 'INR' },
    });

    // Update Salary transaction to ₹75,000
    await prisma.transaction.updateMany({
      where: {
        userId: demoUser.id,
        title: { contains: 'Salary' },
      },
      data: { amount: 75000.00 },
    });

    // Update Rent transaction to ₹22,000
    await prisma.transaction.updateMany({
      where: {
        userId: demoUser.id,
        title: { contains: 'Rent' },
      },
      data: { amount: 22000.00 },
    });

    // Update Recurring rules
    await prisma.recurringTransaction.updateMany({
      where: {
        userId: demoUser.id,
        title: { contains: 'Salary' },
      },
      data: { amount: 75000.00 },
    });

    await prisma.recurringTransaction.updateMany({
      where: {
        userId: demoUser.id,
        title: { contains: 'Rent' },
      },
      data: { amount: 22000.00 },
    });

    console.log(` ℹ️ Demo user ${demoEmail} updated to currency INR with ₹75,000 salary!`);
  }

  console.log('🎉 Database seed completed successfully!');
}

seed()
  .catch((e) => {
    if (e.code === 'P1001') {
      console.error('\n❌ Database Connection Error (Prisma P1001):');
      console.error('Cannot reach PostgreSQL server at the configured DATABASE_URL.');
      console.error('Please ensure your PostgreSQL server is running or configure your cloud database connection in server/.env.\n');
    } else if (e.code === 'P2021') {
      console.error('\n❌ Table Not Found Error (Prisma P2021):');
      console.error('Database tables do not exist yet. Please run migrations first:');
      console.error('  npm run prisma:deploy\n');
    } else {
      console.error('\n❌ Database Seeding Failed:', e.message || e);
    }
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
