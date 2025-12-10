export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  console.error('💥 Erreur :', err.message);

  // Si c'est une requête API (commence par /api), on renvoie du JSON
  if (req.originalUrl.startsWith('/api')) {
    return res.status(statusCode).json({
      success: false,
      message: err.message || 'Erreur interne du serveur',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }

  // Sinon (c'est une page web), on affiche la page d'erreur EJS
  res.status(statusCode).render('pages/error', {
    title: 'Erreur',
    error: err
  });
};