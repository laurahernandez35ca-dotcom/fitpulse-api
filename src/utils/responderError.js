function responderError(res, error) {
  const status = error.status || 500;
  if (status === 500) console.error(error);
  res.status(status).json({
    error: status === 500 ? 'Error interno del servidor' : error.message
  });
}

module.exports = responderError;