const service = require('../services/auth.service');

async function login(req, res) {
  try {
    const usuario = await service.login(req.body || {});
    res.status(200).json({ mensaje: 'Inicio de sesión exitoso', usuario });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      error: status === 500 ? 'Error interno del servidor' : error.message
    });
  }
}

module.exports = { login };