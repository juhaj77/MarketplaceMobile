export const notFound = (req, res, next) => {
  res.status(404);
  next({ status: 404, message: 'Route not found' });
};

export const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || undefined;

  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({ status: 'error', message, errors });
};
