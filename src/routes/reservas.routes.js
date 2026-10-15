const { Router } = require('express');
const controller = require('../controllers/reservas.controller');
const reviewRoutes = require('./review.routes');

const router = Router();
router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', controller.crear);
router.patch('/:id/status', controller.actualizarEstado);
router.delete('/:id', controller.cancelar);
router.use('/:id/review', reviewRoutes);

module.exports = router;
