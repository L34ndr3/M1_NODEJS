/**
 * Wrapper for async API route handlers
 * Automatically catches errors and passes them to next()
 * @param {Function} fn - Async handler (req, res, next) => Promise
 * @returns {Function} Express middleware
 */
export const asyncHandler = fn => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
