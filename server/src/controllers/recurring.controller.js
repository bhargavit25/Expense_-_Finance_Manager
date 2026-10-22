const recurringService = require('../services/recurring.service');

async function getAll(req, res, next) {
  try {
    const rules = await recurringService.getRecurringRules(req.user.id);
    res.status(200).json({
      success: true,
      data: { rules },
    });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const rule = await recurringService.createRecurringRule(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Recurring rule created successfully.',
      data: { rule },
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const rule = await recurringService.updateRecurringRule(req.user.id, req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Recurring rule updated successfully.',
      data: { rule },
    });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await recurringService.deleteRecurringRule(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
}

async function pause(req, res, next) {
  try {
    const rule = await recurringService.toggleRuleStatus(req.user.id, req.params.id, false);
    res.status(200).json({
      success: true,
      message: 'Recurring rule paused.',
      data: { rule },
    });
  } catch (err) {
    next(err);
  }
}

async function resume(req, res, next) {
  try {
    const rule = await recurringService.toggleRuleStatus(req.user.id, req.params.id, true);
    res.status(200).json({
      success: true,
      message: 'Recurring rule resumed.',
      data: { rule },
    });
  } catch (err) {
    next(err);
  }
}

async function processDue(req, res, next) {
  try {
    // Process due recurring transactions across the system
    const result = await recurringService.processDueRecurringTransactions();
    res.status(200).json({
      success: true,
      message: 'Due recurring transactions processed.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll,
  create,
  update,
  remove,
  pause,
  resume,
  processDue,
};
