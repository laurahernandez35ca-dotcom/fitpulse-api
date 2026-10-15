const pool = require('../config/db');

async function crear({ name, email, password, role }) {
  const [resultado] = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, password, role]
  );
  return resultado.insertId;
}

async function buscarPorEmail(email) {
  const [filas] = await pool.query(
    'SELECT user_id, name, email, password, role FROM users WHERE email = ?',
    [email]
  );
  return filas[0];
}

async function buscarPorId(id) {
  const [filas] = await pool.query(
    'SELECT user_id, name, email, role FROM users WHERE user_id = ?',
    [id]
  );
  return filas[0];
}

async function listarTodos() {
  const [filas] = await pool.query(
    'SELECT user_id, name, email, role FROM users'
  );
  return filas;
}

async function actualizar(id, { name, email, password, role }) {
  await pool.query(
    `UPDATE users
     SET name = ?, email = ?,
         password = COALESCE(?, password),
         role = COALESCE(?, role)
     WHERE user_id = ?`,
    [name, email, password ?? null, role ?? null, id]
  );
}

async function eliminar(id) {
  const [resultado] = await pool.query(
    'DELETE FROM users WHERE user_id = ?',
    [id]
  );
  return resultado.affectedRows;
}

module.exports = {
  crear,
  buscarPorEmail,
  buscarPorId,
  listarTodos,
  actualizar,
  eliminar
};