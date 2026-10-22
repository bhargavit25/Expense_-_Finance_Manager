const budgetService = require('../services/budget.service');

async function getAll(req, res, next) {
  try {
    const { month, year } = req.query;
    const result = await budgetService.getBudgets(req.user.id, month, year);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function setBudget(req, res, next) {
  try {
    const budget = await budgetService.setBudget(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Budget allocated successfully.',
      data: { budget },
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const budget = await budgetService.updateBudget(req.user.id, req.params.id, req.body.amount);
    res.status(200).json({
      success: true,
      message: 'Budget updated successfully.',
      data: { budget },
    });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await budgetService.deleteBudget(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll,
  setBudget,
  update,
  remove,
};
