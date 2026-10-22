const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/summary', analyticsController.getSummary);
router.get('/income-expenses', analyticsController.getIncomeVsExpenses);
router.get('/expense-breakdown', analyticsController.getExpenseBreakdown);
router.get('/monthly-trend', analyticsController.getMonthlyTrend);
router.get('/category-comparison', analyticsController.getCategoryComparison);
router.get('/budget-comparison', analyticsController.getBudgetComparison);
router.get('/savings-trend', analyticsController.getSavingsTrend);

module.exports = router;
