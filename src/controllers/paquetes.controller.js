const service = require('../services/paquetes.service');
const responderError = require('../utils/responderError');

async function listar(req, res) {
  try {
    const paquetes = await service.listar();
    res.status(200).json(paquetes);
  } catch (error) {
    responderError(res, error);
  }
}

async function obtener(req, res) {
  try {
    const paquete = await service.obtener(req.params.id);
    res.status(200).json(paquete);
  } catch (error) {
    responderError(res, error);
  }
}

module.exports = { listar, obtener };