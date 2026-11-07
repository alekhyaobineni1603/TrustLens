export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}
export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.statusCode || (err.name === 'ValidationError' || err.name === 'ZodError' ? 400 : 500);
  res.status(status).json({
    success: false,
    message: status >= 500 ? 'An unexpected server error occurred' : (err.name === 'ZodError' ? err.issues?.[0]?.message || 'Invalid request' : err.message),
    ...(process.env.NODE_ENV !== 'production' && status >= 500 ? { detail: err.message } : {})
  });
}
