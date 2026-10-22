const express = require('express');
const categoryController = require('../controllers/category.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
} = require('../validators/category.validator');

const router = express.Router();

router.use(authenticate);

router.get('/', categoryController.getAll);
router.post('/', validate(createCategorySchema), categoryController.create);
router.patch('/:id', validate(updateCategorySchema), categoryController.update);
router.delete('/:id', validate(deleteCategorySchema), categoryController.remove);

module.exports = router;
