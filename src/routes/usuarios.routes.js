const { Router } = require('express');
const controller = require('../controllers/usuarios.controller');

const router = Router();
router.post('/', controller.registrar);
router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

module.exports = router;