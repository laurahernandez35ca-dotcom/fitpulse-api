const repository = require('../repositories/resenas.repository');
const reservasRepository = require('../repositories/reservas.repository');
const usuariosRepository = require('../repositories/usuarios.repository');
const clasesRepository = require('../repositories/clases.repository');
const HttpError = require('../utils/httpError');
const conTransaccion = require('../utils/transaccion');
const { validarId } = require('../utils/validar');
const {
  validarEnteroEnRango,
  validarTexto,
  validarEtiquetas
} = require('../utils/validarCampos');

function validarDatos({ rating, comment, tags }) {
  if (rating === undefined || comment === undefined) {
    throw new HttpError(400, 'rating y comment son obligatorios');
  }
  return {
    rating: validarEnteroEnRango(rating, 'rating', 1, 5),
    comment: validarTexto(comment, 'comment', 1000),
    tags: validarEtiquetas(tags)
  };
}

// Convierte nombres de etiqueta en tag_id del catálogo; si alguno no existe responde 400
async function resolverEtiquetas(nombres) {
  if (nombres.length === 0) return [];
  const encontradas = await repository.buscarEtiquetasPorNombre(nombres);
  const porNombre = new Map(encontradas.map((t) => [t.name.toLowerCase(), t.tag_id]));
  const desconocidas = nombres.filter((n) => !porNombre.has(n.toLowerCase()));
  if (desconocidas.length) {
    throw new HttpError(
      400,
      `Etiquetas que no existen: ${desconocidas.join(', ')} (consultar GET /tags)`
    );
  }
  return nombres.map((n) => porNombre.get(n.toLowerCase()));
}

async function listar({ user_id, class_id } = {}) {
  return repository.listar({
    userId: user_id !== undefined ? validarId(user_id, 'user_id') : undefined,
    classId: class_id !== undefined ? validarId(class_id, 'class_id') : undefined
  });
}

async function listarPorUsuario(id) {
  const userId = validarId(id);
  const usuario = await usuariosRepository.buscarPorId(userId);
  if (!usuario) {
    throw new HttpError(404, 'Usuario no encontrado');
  }
  return repository.listar({ userId });
}

async function listarPorClase(id) {
  const classId = validarId(id);
  const clase = await clasesRepository.obtenerPorId(classId);
  if (!clase) {
    throw new HttpError(404, 'Clase no encontrada');
  }
  return repository.listar({ classId });
}

async function listarEtiquetas() {
  return repository.listarEtiquetas();
}

async function obtenerPorReserva(id) {
  const numero = validarId(id);
  const resena = await repository.obtenerPorReserva(numero);
  if (!resena) {
    const reserva = await reservasRepository.obtenerContexto(numero);
    if (!reserva) {
      throw new HttpError(404, 'Reserva no encontrada');
    }
    throw new HttpError(404, 'La reserva no tiene reseña');
  }
  return resena;
}

async function crear(id, cuerpo) {
  const numero = validarId(id);
  const datos = validarDatos(cuerpo);

  const reserva = await reservasRepository.obtenerContexto(numero);
  if (!reserva) {
    throw new HttpError(404, 'Reserva no encontrada');
  }
  // Regla de negocio: solo se reseñan clases ya realizadas
  if (reserva.status !== 'completed') {
    throw new HttpError(422, 'Solo se pueden reseñar reservas de clases ya realizadas (estado completed)');
  }
  if (await repository.obtenerPorReserva(numero)) {
    throw new HttpError(409, 'Esta reserva ya tiene una reseña');
  }

  const tagIds = await resolverEtiquetas(datos.tags);
  try {
    await conTransaccion(async (db) => {
      await repository.crear(db, numero, datos);
      await repository.reemplazarEtiquetas(db, numero, tagIds);
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new HttpError(409, 'Esta reserva ya tiene una reseña');
    }
    throw error;
  }
  return repository.obtenerPorReserva(numero);
}

async function actualizar(id, cuerpo) {
  const numero = validarId(id);
  const datos = validarDatos(cuerpo);
  await obtenerPorReserva(numero); // 404 si la reserva o la reseña no existen

  const tagIds = await resolverEtiquetas(datos.tags);
  await conTransaccion(async (db) => {
    await repository.actualizar(db, numero, datos);
    await repository.reemplazarEtiquetas(db, numero, tagIds);
  });
  return repository.obtenerPorReserva(numero);
}

async function eliminar(id) {
  const numero = validarId(id);
  await obtenerPorReserva(numero);
  await conTransaccion((db) => repository.eliminar(db, numero));
  return { mensaje: 'Reseña eliminada' };
}

module.exports = {
  listar,
  listarPorUsuario,
  listarPorClase,
  listarEtiquetas,
  obtenerPorReserva,
  crear,
  actualizar,
  eliminar
};
