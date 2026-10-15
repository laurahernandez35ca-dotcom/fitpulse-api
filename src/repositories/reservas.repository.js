const pool = require('../config/db');

const BASE = `SELECT r.reservation_id, r.user_id, r.session_id, s.class_id, c.name AS class_name,
                     s.instructor, s.location, s.start_time, s.end_time,
                     r.status, r.reservation_date
              FROM reservations r
              JOIN class_sessions s ON s.session_id = r.session_id
              JOIN classes c ON c.class_id = s.class_id`;

// type: 'upcoming' (pending/confirmed y sesión sin terminar) | 'completed' (reservas completadas)
async function listar({ userId, sessionId, type } = {}) {
  const condiciones = [];
  const parametros = [];
  if (userId) {
    condiciones.push('r.user_id = ?');
    parametros.push(userId);
  }
  if (sessionId) {
    condiciones.push('r.session_id = ?');
    parametros.push(sessionId);
  }
  if (type === 'upcoming') {
    condiciones.push("r.status IN ('pending', 'confirmed') AND s.end_time > NOW()");
  }
  if (type === 'completed') {
    condiciones.push("r.status = 'completed'");
  }
  const where = condiciones.length ? ` WHERE ${condiciones.join(' AND ')}` : '';
  const [filas] = await pool.query(`${BASE}${where} ORDER BY s.start_time`, parametros);
  return filas;
}

async function obtenerPorId(id) {
  const [filas] = await pool.query(`${BASE} WHERE r.reservation_id = ?`, [id]);
  return filas[0];
}

// Estado de la reserva y si su sesión ya comenzó (la comparación la hace MySQL con NOW())
async function obtenerContexto(id) {
  const [filas] = await pool.query(
    `SELECT r.reservation_id, r.session_id, r.status,
            s.start_time <= NOW() AS session_started
     FROM reservations r
     JOIN class_sessions s ON s.session_id = r.session_id
     WHERE r.reservation_id = ?`,
    [id]
  );
  return filas[0];
}

// Bloquea la fila de la sesión: reservas simultáneas se atienden una a una y no superan el cupo
async function bloquearSesion(db, sessionId) {
  const [filas] = await db.query(
    `SELECT session_id, max_capacity, start_time > NOW() AS is_future
     FROM class_sessions WHERE session_id = ? FOR UPDATE`,
    [sessionId]
  );
  return filas[0];
}

async function buscarPorUsuarioYSesion(db, userId, sessionId) {
  const [filas] = await db.query(
    'SELECT reservation_id, status FROM reservations WHERE user_id = ? AND session_id = ?',
    [userId, sessionId]
  );
  return filas[0];
}

async function contarOcupados(db, sessionId) {
  const [filas] = await db.query(
    "SELECT COUNT(*) AS ocupados FROM reservations WHERE session_id = ? AND status <> 'cancelled'",
    [sessionId]
  );
  return Number(filas[0].ocupados);
}

async function crear(db, userId, sessionId, status) {
  const [resultado] = await db.query(
    'INSERT INTO reservations (user_id, session_id, reservation_date, status) VALUES (?, ?, NOW(), ?)',
    [userId, sessionId, status]
  );
  return resultado.insertId;
}

async function reactivar(db, id, status) {
  await db.query('UPDATE reservations SET status = ?, reservation_date = NOW() WHERE reservation_id = ?', [
    status,
    id
  ]);
}

async function actualizarEstado(id, status) {
  await pool.query('UPDATE reservations SET status = ? WHERE reservation_id = ?', [status, id]);
}

module.exports = {
  listar,
  obtenerPorId,
  obtenerContexto,
  bloquearSesion,
  buscarPorUsuarioYSesion,
  contarOcupados,
  crear,
  reactivar,
  actualizarEstado
};
