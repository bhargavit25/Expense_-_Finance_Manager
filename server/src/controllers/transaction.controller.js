const transactionService = require('../services/transaction.service');

async function create(req, res, next) {
  try {
    const transaction = await transactionService.createTransaction(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Transaction created successfully.',
      data: { transaction },
    });
  } catch (err) {
    next(err);
  }
}

async function getAll(req, res, next) {
  try {
    const result = await transactionService.getTransactions(req.user.id, req.query);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const transaction = await transactionService.getTransactionById(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      data: { transaction },
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const transaction = await transactionService.updateTransaction(req.user.id, req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully.',
      data: { transaction },
    });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await transactionService.deleteTransaction(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
}

async function exportCsv(req, res, next) {
  try {
    const csvData = await transactionService.exportTransactionsToCsv(req.user.id, req.query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
    res.status(200).send(csvData);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
  exportCsv,
};
