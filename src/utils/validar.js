const HttpError = require('./httpError');

function validarId(valor, nombre = 'id') {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new HttpError(400, `El ${nombre} debe ser un número entero positivo`);
  }
  return numero;
}

module.exports = { validarId };