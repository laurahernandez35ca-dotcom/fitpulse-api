const { Router } = require('express');
const controller = require('../controllers/resenas.controller');

const router = Router();
router.get('/', controller.listarEtiquetas);

module.exports = router;
