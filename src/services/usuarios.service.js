const repository = require('../repositories/usuarios.repository');
const HttpError = require('../utils/httpError');
const { validarId } = require('../utils/validar');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ['client', 'admin'];

async function registrar({ name, email, password }) {
  if (!name || !email || !password) {
    throw new HttpError(400, 'name, email y password son obligatorios');
  }
  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string'
  ) {
    throw new HttpError(400, 'name, email y password deben ser texto');
  }
  if (!EMAIL_REGEX.test(email)) {
    throw new HttpError(400, 'El correo no tiene un formato válido');
  }
  if (password.length < 6) {
    throw new HttpError(400, 'La contraseña debe tener mínimo 6 caracteres');
  }

  const existente = await repository.buscarPorEmail(email);
  if (existente) {
    throw new HttpError(409, 'Ya existe un usuario con ese correo');
  }

  const id = await repository.crear({
    name: name.trim(),
    email: email.trim(),
    password,
    role: 'client'
  });

  return repository.buscarPorId(id);
}

async function listar() {
  return repository.listarTodos();
}

async function obtener(id) {
  const numero = validarId(id);
  const usuario = await repository.buscarPorId(numero);
  if (!usuario) {
    throw new HttpError(404, 'Usuario no encontrado');
  }
  return usuario;
}

async function actualizar(id, datos) {
  const numero = validarId(id);
  const { name, email, password, role } = datos;

  if (!name || !email) {
    throw new HttpError(400, 'name y email son obligatorios');
  }
  if (typeof name !== 'string' || typeof email !== 'string') {
    throw new HttpError(400, 'name y email deben ser texto');
  }
  if (!EMAIL_REGEX.test(email)) {
    throw new HttpError(400, 'El correo no tiene un formato válido');
  }
  if (
    password !== undefined &&
    (typeof password !== 'string' || password.length < 6)
  ) {
    throw new HttpError(400, 'La contraseña debe tener mínimo 6 caracteres');
  }
  if (role !== undefined && !ROLES.includes(role)) {
    throw new HttpError(400, 'role debe ser client o admin');
  }

  const actual = await repository.buscarPorId(numero);
  if (!actual) {
    throw new HttpError(404, 'Usuario no encontrado');
  }

  const conEseCorreo = await repository.buscarPorEmail(email.trim());
  if (conEseCorreo && conEseCorreo.user_id !== numero) {
    throw new HttpError(409, 'Ya existe un usuario con ese correo');
  }

  await repository.actualizar(numero, {
    name: name.trim(),
    email: email.trim(),
    password,
    role
  });

  return repository.buscarPorId(numero);
}

async function eliminar(id) {
  const numero = validarId(id);

  const usuario = await repository.buscarPorId(numero);
  if (!usuario) {
    throw new HttpError(404, 'Usuario no encontrado');
  }

  try {
    await repository.eliminar(numero);
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      throw new HttpError(
        409,
        'No se puede eliminar: el usuario tiene reservas, compras o marcas personales asociadas'
      );
    }
    throw error;
  }

  return { mensaje: 'Usuario eliminado' };
}

module.exports = { registrar, listar, obtener, actualizar, eliminar };