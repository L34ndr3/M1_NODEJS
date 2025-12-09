/**
 * Centralized error handler middleware
 * Must be registered last (after all routes)
 */
export const errorHandler = (err, req, res, _next) => {
  console.error('Error:', err.message)

  const statusCode = err.statusCode || 500

  // API requests get JSON response
  if (req.url.startsWith('/api/')) {
    return res.status(statusCode).json({
      success: false,
      error: err.message || 'Erreur serveur',
    })
  }

  // View requests get HTML error page
  res.status(statusCode).render('pages/error', {
    title: 'Erreur',
    message: err.message || 'Une erreur est survenue.',
  })
}
