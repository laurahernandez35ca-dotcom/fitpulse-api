const service = require('../services/compras.service');
const responderError = require('../utils/responderError');

async function ventasDelDia(req, res) {
  try {
    const ventas = await service.ventasDelDia(req.query.date);
    res.status(200).json(ventas);
  } catch (error) {
    responderError(res, error);
  }
}

module.exports = { ventasDelDia };
