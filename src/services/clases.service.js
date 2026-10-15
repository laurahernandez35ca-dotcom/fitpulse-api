const repository = require('../repositories/clases.repository');
const HttpError = require('../utils/httpError');
const { validarId } = require('../utils/validar');

const FECHA_REGEX = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

async function listar() {
  return repository.obtenerTodas();
}

async function obtener(id) {
  const numero = validarId(id);
  const clase = await repository.obtenerPorId(numero);
  if (!clase) {
    throw new HttpError(404, 'Clase no encontrada');
  }
  const sesiones = await repository.listarSesiones(numero);
  return { ...clase, sesiones };
}

async function crear({ name, category, description, price }) {
  if (!name || !category || price === undefined || price === null) {
    throw new HttpError(400, 'name, category y price son obligatorios');
  }
  if (typeof name !== 'string' || typeof category !== 'string') {
    throw new HttpError(400, 'name y category deben ser texto');
  }
  if (
    description !== undefined &&
    description !== null &&
    typeof description !== 'string'
  ) {
    throw new HttpError(400, 'description debe ser texto');
  }
  if (typeof price !== 'number' || Number.isNaN(price) || price < 0) {
    throw new HttpError(400, 'price debe ser un número mayor o igual a 0');
  }

  const id = await repository.crear({
    name: name.trim(),
    category: category.trim(),
    description: description ?? null,
    price
  });

  return obtener(id);
}

async function crearSesion(
  id,
  { instructor, location, start_time, end_time, max_capacity }
) {
  const numero = validarId(id);

  if (
    !instructor ||
    !location ||
    !start_time ||
    !end_time ||
    max_capacity === undefined
  ) {
    throw new HttpError(
      400,
      'instructor, location, start_time, end_time y max_capacity son obligatorios'
    );
  }
  if (typeof instructor !== 'string' || typeof location !== 'string') {
    throw new HttpError(400, 'instructor y location deben ser texto');
  }
  if (!FECHA_REGEX.test(start_time) || !FECHA_REGEX.test(end_time)) {
    throw new HttpError(
      400,
      'start_time y end_time deben tener el formato YYYY-MM-DD HH:MM:SS'
    );
  }
  if (end_time <= start_time) {
    throw new HttpError(400, 'end_time debe ser posterior a start_time');
  }
  if (!Number.isInteger(max_capacity) || max_capacity <= 0) {
    throw new HttpError(400, 'max_capacity debe ser un entero mayor a 0');
  }

  const clase = await repository.obtenerPorId(numero);
  if (!clase) {
    throw new HttpError(404, 'Clase no encontrada');
  }

  try {
    const sessionId = await repository.crearSesion({
      classId: numero,
      instructor: instructor.trim(),
      location: location.trim(),
      startTime: start_time,
      endTime: end_time,
      maxCapacity: max_capacity
    });
    return repository.obtenerSesion(sessionId);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new HttpError(
        409,
        'Ya existe una sesión de esta clase en esa sede y horario'
      );
    }
    throw error;
  }
}

module.exports = { listar, obtener, crear, crearSesion };