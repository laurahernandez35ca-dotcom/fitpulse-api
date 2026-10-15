const service = require('../services/compras.service');
const responderError = require('../utils/responderError');

async function listar(req, res) {
  try {
    const compras = await service.listar(req.query);
    res.status(200).json(compras);
  } catch (error) {
    responderError(res, error);
  }
}

async function listarPorUsuario(req, res) {
  try {
    const compras = await service.listarPorUsuario(req.params.id);
    res.status(200).json(compras);
  } catch (error) {
    responderError(res, error);
  }
}

async function obtener(req, res) {
  try {
    const compra = await service.obtener(req.params.id);
    res.status(200).json(compra);
  } catch (error) {
    responderError(res, error);
  }
}

async function crear(req, res) {
  try {
    const compra = await service.crear(req.body || {});
    res.status(201).json(compra);
  } catch (error) {
    responderError(res, error);
  }
}

module.exports = { listar, listarPorUsuario, obtener, crear };
