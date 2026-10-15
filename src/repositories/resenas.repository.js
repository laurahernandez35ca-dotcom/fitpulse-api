const pool = require('../config/db');

// La reseña se identifica por reservation_id (relación 1 a 0..1 con la reserva)
const BASE = `SELECT rv.reservation_id, r.user_id, u.name AS user_name, s.class_id, c.name AS class_name,
                     rv.rating, rv.comment, rv.review_date,
                     GROUP_CONCAT(t.name ORDER BY t.name SEPARATOR '||') AS tags
              FROM reviews rv
              JOIN reservations r ON r.reservation_id = rv.reservation_id
              JOIN users u ON u.user_id = r.user_id
              JOIN class_sessions s ON s.session_id = r.session_id
              JOIN classes c ON c.class_id = s.class_id
              LEFT JOIN review_tags rt ON rt.reservation_id = rv.reservation_id
              LEFT JOIN tags t ON t.tag_id = rt.tag_id`;
const GRUPO = ` GROUP BY rv.reservation_id, r.user_id, u.name, s.class_id, c.name,
                         rv.rating, rv.comment, rv.review_date`;

const formatear = (fila) => ({ ...fila, tags: fila.tags ? fila.tags.split('||') : [] });

async function listar({ userId, classId } = {}) {
  const condiciones = [];
  const parametros = [];
  if (userId) {
    condiciones.push('r.user_id = ?');
    parametros.push(userId);
  }
  if (classId) {
    condiciones.push('s.class_id = ?');
    parametros.push(classId);
  }
  const where = condiciones.length ? ` WHERE ${condiciones.join(' AND ')}` : '';
  const [filas] = await pool.query(`${BASE}${where}${GRUPO} ORDER BY rv.review_date DESC`, parametros);
  return filas.map(formatear);
}

async function obtenerPorReserva(reservationId) {
  const [filas] = await pool.query(`${BASE} WHERE rv.reservation_id = ?${GRUPO}`, [reservationId]);
  return filas[0] ? formatear(filas[0]) : undefined;
}

async function crear(db, reservationId, { rating, comment }) {
  await db.query('INSERT INTO reviews (reservation_id, rating, comment, review_date) VALUES (?, ?, ?, NOW())', [
    reservationId,
    rating,
    comment
  ]);
}

async function actualizar(db, reservationId, { rating, comment }) {
  await db.query('UPDATE reviews SET rating = ?, comment = ? WHERE reservation_id = ?', [
    rating,
    comment,
    reservationId
  ]);
}

async function eliminar(db, reservationId) {
  await db.query('DELETE FROM review_tags WHERE reservation_id = ?', [reservationId]);
  await db.query('DELETE FROM reviews WHERE reservation_id = ?', [reservationId]);
}

async function listarEtiquetas() {
  const [filas] = await pool.query('SELECT tag_id, name FROM tags ORDER BY name');
  return filas;
}

async function buscarEtiquetasPorNombre(nombres) {
  const [filas] = await pool.query('SELECT tag_id, name FROM tags WHERE name IN (?)', [nombres]);
  return filas;
}

async function reemplazarEtiquetas(db, reservationId, tagIds) {
  await db.query('DELETE FROM review_tags WHERE reservation_id = ?', [reservationId]);
  if (tagIds.length) {
    await db.query('INSERT INTO review_tags (reservation_id, tag_id) VALUES ?', [
      tagIds.map((tagId) => [reservationId, tagId])
    ]);
  }
}

module.exports = {
  listar,
  obtenerPorReserva,
  crear,
  actualizar,
  eliminar,
  listarEtiquetas,
  buscarEtiquetasPorNombre,
  reemplazarEtiquetas
};
