const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error(err.message, { stack: err.stack, path: req.path, method: req.method });

  // Prisma Unique Constraint Violation
  if (err.code === 'P2002') {
    const target = err.meta?.target ? err.meta.target.join(', ') : 'field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${target} already exists.`,
    });
  }

  // Prisma Record Not Found
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'The requested resource was not found.',
    });
  }

  // Prisma Foreign Key Constraint Failure (e.g. attempting to delete category with existing transactions)
  if (err.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete or modify this resource because dependent records exist.',
    });
  }

  // Custom App Error
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  // Syntax / Body Parser error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload.',
    });
  }

  // Default Internal Server Error
  const isProduction = process.env.NODE_ENV === 'production';
  return res.status(500).json({
    success: false,
    message: isProduction ? 'An unexpected server error occurred.' : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
}

module.exports = errorHandler;
