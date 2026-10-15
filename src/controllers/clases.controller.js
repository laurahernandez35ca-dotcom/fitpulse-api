const service = require('../services/clases.service');
const responderError = require('../utils/responderError');

async function listar(req, res) {
  try {
    const clases = await service.listar();
    res.status(200).json(clases);
  } catch (error) {
    responderError(res, error);
  }
}

async function obtener(req, res) {
  try {
    const clase = await service.obtener(req.params.id);
    res.status(200).json(clase);
  } catch (error) {
    responderError(res, error);
  }
}

async function crear(req, res) {
  try {
    const clase = await service.crear(req.body || {});
    res.status(201).json(clase);
  } catch (error) {
    responderError(res, error);
  }
}

async function crearSesion(req, res) {
  try {
    const sesion = await service.crearSesion(req.params.id, req.body || {});
    res.status(201).json(sesion);
  } catch (error) {
    responderError(res, error);
  }
}

module.exports = { listar, obtener, crear, crearSesion };