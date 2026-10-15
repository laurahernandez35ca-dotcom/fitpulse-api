const repository = require('../repositories/reservas.repository');
const usuariosRepository = require('../repositories/usuarios.repository');
const HttpError = require('../utils/httpError');
const conTransaccion = require('../utils/transaccion');
const { validarId } = require('../utils/validar');
const { validarIdCuerpo } = require('../utils/validarCampos');

const ESTADOS = ['pending', 'confirmed', 'completed', 'cancelled'];
const TIPOS = ['upcoming', 'completed'];
// Ciclo de vida de una reserva: completed y cancelled son estados finales
const TRANSICIONES = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
};

function validarTipo(type) {
  if (type === undefined) return undefined;
  if (!TIPOS.includes(type)) {
    throw new HttpError(400, 'type debe ser upcoming o completed');
  }
  return type;
}

async function asegurarUsuario(userId) {
  const usuario = await usuariosRepository.buscarPorId(userId);
  if (!usuario) {
    throw new HttpError(404, 'Usuario no encontrado');
  }
}

async function listar({ user_id, session_id, type } = {}) {
  return repository.listar({
    userId: user_id !== undefined ? validarId(user_id, 'user_id') : undefined,
    sessionId: session_id !== undefined ? validarId(session_id, 'session_id') : undefined,
    type: validarTipo(type)
  });
}

async function listarPorUsuario(id, type) {
  const userId = validarId(id);
  const tipoValido = validarTipo(type);
  await asegurarUsuario(userId);
  return repository.listar({ userId, type: tipoValido });
}

async function obtener(id) {
  const numero = validarId(id);
  const reserva = await repository.obtenerPorId(numero);
  if (!reserva) {
    throw new HttpError(404, 'Reserva no encontrada');
  }
  return reserva;
}

async function crear({ user_id, session_id }) {
  if (user_id === undefined || session_id === undefined) {
    throw new HttpError(400, 'user_id y session_id son obligatorios');
  }
  const userId = validarIdCuerpo(user_id, 'user_id');
  const sessionId = validarIdCuerpo(session_id, 'session_id');

  await asegurarUsuario(userId);

  try {
    const id = await conTransaccion(async (db) => {
      const sesion = await repository.bloquearSesion(db, sessionId);
      if (!sesion) {
        throw new HttpError(404, 'Sesión no encontrada');
      }
      if (!sesion.is_future) {
        throw new HttpError(422, 'No se puede reservar una sesión que ya comenzó');
      }

      const existente = await repository.buscarPorUsuarioYSesion(db, userId, sessionId);
      if (existente && existente.status !== 'cancelled') {
        throw new HttpError(409, 'El usuario ya tiene una reserva para esta sesión');
      }

      const ocupados = await repository.contarOcupados(db, sessionId);
      if (ocupados >= sesion.max_capacity) {
        throw new HttpError(409, 'La sesión no tiene cupos disponibles');
      }

      // El modelo exige un par (usuario, sesión) único: si había una reserva cancelada se reactiva
      if (existente) {
        await repository.reactivar(db, existente.reservation_id, 'confirmed');
        return existente.reservation_id;
      }
      return repository.crear(db, userId, sessionId, 'confirmed');
    });
    return repository.obtenerPorId(id);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new HttpError(409, 'El usuario ya tiene una reserva para esta sesión');
    }
    throw error;
  }
}

async function actualizarEstado(id, { status }) {
  const numero = validarId(id);
  if (status === undefined) {
    throw new HttpError(400, 'status es obligatorio');
  }
  if (!ESTADOS.includes(status)) {
    throw new HttpError(400, `status debe ser uno de: ${ESTADOS.join(', ')}`);
  }

  const reserva = await repository.obtenerContexto(numero);
  if (!reserva) {
    throw new HttpError(404, 'Reserva no encontrada');
  }
  if (reserva.status === status) {
    throw new HttpError(409, `La reserva ya está en estado ${status}`);
  }
  if (!TRANSICIONES[reserva.status].includes(status)) {
    throw new HttpError(409, `No se puede pasar una reserva de ${reserva.status} a ${status}`);
  }
  if (status === 'completed' && !reserva.session_started) {
    throw new HttpError(422, 'No se puede completar una reserva de una sesión que aún no comienza');
  }
  if (status === 'cancelled' && reserva.session_started) {
    throw new HttpError(422, 'No se puede cancelar una reserva de una sesión que ya comenzó');
  }

  await repository.actualizarEstado(numero, status);
  return repository.obtenerPorId(numero);
}

// DELETE /reservas/:id es una cancelación lógica: conserva el historial
async function cancelar(id) {
  return actualizarEstado(id, { status: 'cancelled' });
}

module.exports = { listar, listarPorUsuario, obtener, crear, actualizarEstado, cancelar };
