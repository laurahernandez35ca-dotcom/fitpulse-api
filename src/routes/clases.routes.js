const { Router } = require('express');
const controller = require('../controllers/clases.controller');

const router = Router();
router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', controller.crear);
router.post('/:id/sesiones', controller.crearSesion);

module.exports = router;