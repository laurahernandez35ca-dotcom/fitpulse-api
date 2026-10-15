// Reseña de una reserva (relación 1 a 0..1). Se monta en /reservations/:id/review
const { Router } = require('express');
const controller = require('../controllers/resenas.controller');

const router = Router({ mergeParams: true });
router.get('/', controller.obtener);
router.post('/', controller.crear);
router.put('/', controller.actualizar);
router.delete('/', controller.eliminar);

module.exports = router;
