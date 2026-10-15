// Colecciones de solo lectura anidadas bajo usuarios y clases (un solo nivel).
// Se montan en la raíz para no modificar usuarios.routes.js ni clases.routes.js de Persona B.
const { Router } = require('express');
const reservas = require('../controllers/reservas.controller');
const compras = require('../controllers/compras.controller');
const resenas = require('../controllers/resenas.controller');

const router = Router();
router.get('/usuarios/:id/reservations', reservas.listarPorUsuario);
router.get('/usuarios/:id/purchases', compras.listarPorUsuario);
router.get('/usuarios/:id/reviews', resenas.listarPorUsuario);
router.get('/clases/:id/reviews', resenas.listarPorClase);

module.exports = router;
