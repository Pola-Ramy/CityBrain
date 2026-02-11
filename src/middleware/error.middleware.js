const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', err);

  // Handle Joi validation errors (if any slip through)
  if (err.isJoi) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation error',
      errors: err.details.map(detail => detail.message)
    });
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      status: 'fail',
      message: `${field} already exists`
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      status: 'fail',
      message: 'Validation error',
      errors
    });
  }

  // Handle custom errors with status codes
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    status: status >= 500 ? 'error' : 'fail',
    message
  });
};

module.exports = errorHandler;  