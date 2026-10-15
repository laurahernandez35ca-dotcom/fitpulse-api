const { Router } = require('express');
const controller = require('../controllers/ventas.controller');

const router = Router();
router.get('/daily', controller.ventasDelDia);

module.exports = router;
