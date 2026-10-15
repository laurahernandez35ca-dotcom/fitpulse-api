const service = require('../services/reservas.service');
const responderError = require('../utils/responderError');

async function listar(req, res) {
  try {
    const reservas = await service.listar(req.query);
    res.status(200).json(reservas);
  } catch (error) {
    responderError(res, error);
  }
}

async function listarPorUsuario(req, res) {
  try {
    const reservas = await service.listarPorUsuario(req.params.id, req.query.type);
    res.status(200).json(reservas);
  } catch (error) {
    responderError(res, error);
  }
}

async function obtener(req, res) {
  try {
    const reserva = await service.obtener(req.params.id);
    res.status(200).json(reserva);
  } catch (error) {
    responderError(res, error);
  }
}

async function crear(req, res) {
  try {
    const reserva = await service.crear(req.body || {});
    res.status(201).json(reserva);
  } catch (error) {
    responderError(res, error);
  }
}

async function actualizarEstado(req, res) {
  try {
    const reserva = await service.actualizarEstado(req.params.id, req.body || {});
    res.status(200).json(reserva);
  } catch (error) {
    responderError(res, error);
  }
}

async function cancelar(req, res) {
  try {
    const reserva = await service.cancelar(req.params.id);
    res.status(200).json(reserva);
  } catch (error) {
    responderError(res, error);
  }
}

module.exports = { listar, listarPorUsuario, obtener, crear, actualizarEstado, cancelar };
