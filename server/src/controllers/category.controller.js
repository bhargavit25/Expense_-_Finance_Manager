const categoryService = require('../services/category.service');

async function getAll(req, res, next) {
  try {
    const categories = await categoryService.getCategories(req.user.id);
    res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const category = await categoryService.createCategory(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: { category },
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const category = await categoryService.updateCategory(req.user.id, req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      data: { category },
    });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await categoryService.deleteCategory(
      req.user.id,
      req.params.id,
      req.query.reassignToCategoryId
    );
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
  create,
  update,
  remove,
};
