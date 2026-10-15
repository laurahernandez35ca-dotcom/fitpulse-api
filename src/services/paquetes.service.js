const repository = require('../repositories/paquetes.repository');
const HttpError = require('../utils/httpError');
const { validarId } = require('../utils/validar');

async function listar() {
  return repository.obtenerTodos();
}

async function obtener(id) {
  const numero = validarId(id);
  const paquete = await repository.obtenerPorId(numero);
  if (!paquete) {
    throw new HttpError(404, 'Paquete no encontrado');
  }
  return paquete;
}

module.exports = { listar, obtener };