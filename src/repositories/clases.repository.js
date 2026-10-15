const pool = require('../config/db');

async function obtenerTodas() {
  const [filas] = await pool.query(
    'SELECT class_id, name, category, description, price FROM classes'
  );
  return filas;
}

async function obtenerPorId(id) {
  const [filas] = await pool.query(
    'SELECT class_id, name, category, description, price FROM classes WHERE class_id = ?',
    [id]
  );
  return filas[0];
}

async function crear({ name, category, description, price }) {
  const [resultado] = await pool.query(
    'INSERT INTO classes (name, category, description, price) VALUES (?, ?, ?, ?)',
    [name, category, description, price]
  );
  return resultado.insertId;
}

async function listarSesiones(classId) {
  const [filas] = await pool.query(
    `SELECT session_id, class_id, instructor, location,
            start_time, end_time, max_capacity
     FROM class_sessions
     WHERE class_id = ?
     ORDER BY start_time`,
    [classId]
  );
  return filas;
}

async function obtenerSesion(sessionId) {
  const [filas] = await pool.query(
    `SELECT session_id, class_id, instructor, location,
            start_time, end_time, max_capacity
     FROM class_sessions
     WHERE session_id = ?`,
    [sessionId]
  );
  return filas[0];
}

async function crearSesion({
  classId,
  instructor,
  location,
  startTime,
  endTime,
  maxCapacity
}) {
  const [resultado] = await pool.query(
    `INSERT INTO class_sessions
       (class_id, instructor, location, start_time, end_time, max_capacity)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [classId, instructor, location, startTime, endTime, maxCapacity]
  );
  return resultado.insertId;
}

module.exports = {
  obtenerTodas,
  obtenerPorId,
  crear,
  listarSesiones,
  obtenerSesion,
  crearSesion
};