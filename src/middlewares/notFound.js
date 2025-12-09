/**
 * 404 Not Found middleware
 * Must be registered after all routes
 */
export const notFound = (req, _res, next) => {
  const error = new Error(`Route non trouvée: ${req.method} ${req.url}`)
  error.statusCode = 404
  next(error)
}
