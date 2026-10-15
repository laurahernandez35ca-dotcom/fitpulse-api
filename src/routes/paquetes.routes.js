const { Router } = require('express');
const controller = require('../controllers/paquetes.controller');

const router = Router();
router.get('/', controller.listar);
router.get('/:id', controller.obtener);

module.exports = router;