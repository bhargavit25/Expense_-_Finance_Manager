const analyticsService = require('../services/analytics.service');

async function getSummary(req, res, next) {
  try {
    const { period, startDate, endDate } = req.query;
    const summary = await analyticsService.getDashboardSummary(req.user.id, period, startDate, endDate);
    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (err) {
    next(err);
  }
}

async function getIncomeVsExpenses(req, res, next) {
  try {
    const months = req.query.months ? parseInt(req.query.months, 10) : 6;
    const data = await analyticsService.getIncomeVsExpenses(req.user.id, months);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

async function getExpenseBreakdown(req, res, next) {
  try {
    const { period, startDate, endDate } = req.query;
    const data = await analyticsService.getExpenseBreakdown(req.user.id, period, startDate, endDate);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

async function getMonthlyTrend(req, res, next) {
  try {
    const months = req.query.months ? parseInt(req.query.months, 10) : 6;
    const data = await analyticsService.getMonthlySpendingTrend(req.user.id, months);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

async function getCategoryComparison(req, res, next) {
  try {
    const { period, startDate, endDate } = req.query;
    const data = await analyticsService.getCategoryComparison(req.user.id, period, startDate, endDate);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

async function getBudgetComparison(req, res, next) {
  try {
    const { month, year } = req.query;
    const data = await analyticsService.getBudgetVsActual(req.user.id, month, year);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

async function getSavingsTrend(req, res, next) {
  try {
    const months = req.query.months ? parseInt(req.query.months, 10) : 6;
    const data = await analyticsService.getSavingsTrend(req.user.id, months);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSummary,
  getIncomeVsExpenses,
  getExpenseBreakdown,
  getMonthlyTrend,
  getCategoryComparison,
  getBudgetComparison,
  getSavingsTrend,
};
