const repository = require('../repositories/usuarios.repository');
const HttpError = require('../utils/httpError');

async function login({ email, password }) {
  if (!email || !password) {
    throw new HttpError(400, 'email y password son obligatorios');
  }

  const usuario = await repository.buscarPorEmail(email);
  if (!usuario || usuario.password !== password) {
    throw new HttpError(401, 'Credenciales inválidas');
  }

  const { password: _clave, ...usuarioSinClave } = usuario;
  return usuarioSinClave;
}

module.exports = { login };