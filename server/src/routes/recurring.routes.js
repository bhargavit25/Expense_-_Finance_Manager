const express = require('express');
const recurringController = require('../controllers/recurring.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createRecurringSchema,
  updateRecurringSchema,
  recurringIdParamSchema,
} = require('../validators/recurring.validator');

const router = express.Router();

router.use(authenticate);

router.get('/', recurringController.getAll);
router.post('/', validate(createRecurringSchema), recurringController.create);
router.patch('/:id', validate(updateRecurringSchema), recurringController.update);
router.delete('/:id', validate(recurringIdParamSchema), recurringController.remove);
router.post('/:id/pause', validate(recurringIdParamSchema), recurringController.pause);
router.post('/:id/resume', validate(recurringIdParamSchema), recurringController.resume);
router.post('/process-due', recurringController.processDue);

module.exports = router;
