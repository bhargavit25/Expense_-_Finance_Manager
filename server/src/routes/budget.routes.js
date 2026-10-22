const express = require('express');
const budgetController = require('../controllers/budget.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  setBudgetSchema,
  updateBudgetSchema,
  queryBudgetSchema,
  budgetIdParamSchema,
} = require('../validators/budget.validator');

const router = express.Router();

router.use(authenticate);

router.get('/', validate(queryBudgetSchema), budgetController.getAll);
router.post('/', validate(setBudgetSchema), budgetController.setBudget);
router.patch('/:id', validate(updateBudgetSchema), budgetController.update);
router.delete('/:id', validate(budgetIdParamSchema), budgetController.remove);

module.exports = router;
