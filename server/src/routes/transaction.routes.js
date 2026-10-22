const express = require('express');
const transactionController = require('../controllers/transaction.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createTransactionSchema,
  updateTransactionSchema,
  queryTransactionsSchema,
  transactionIdParamSchema,
} = require('../validators/transaction.validator');

const router = express.Router();

router.use(authenticate);

router.get('/', validate(queryTransactionsSchema), transactionController.getAll);
router.post('/', validate(createTransactionSchema), transactionController.create);
router.get('/export', transactionController.exportCsv);
router.get('/:id', validate(transactionIdParamSchema), transactionController.getById);
router.patch('/:id', validate(updateTransactionSchema), transactionController.update);
router.delete('/:id', validate(transactionIdParamSchema), transactionController.remove);

module.exports = router;
