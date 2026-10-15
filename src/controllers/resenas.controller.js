const service = require('../services/resenas.service');
const responderError = require('../utils/responderError');

async function listar(req, res) {
  try {
    const resenas = await service.listar(req.query);
    res.status(200).json(resenas);
  } catch (error) {
    responderError(res, error);
  }
}

async function listarPorUsuario(req, res) {
  try {
    const resenas = await service.listarPorUsuario(req.params.id);
    res.status(200).json(resenas);
  } catch (error) {
    responderError(res, error);
  }
}

async function listarPorClase(req, res) {
  try {
    const resenas = await service.listarPorClase(req.params.id);
    res.status(200).json(resenas);
  } catch (error) {
    responderError(res, error);
  }
}

async function listarEtiquetas(req, res) {
  try {
    const etiquetas = await service.listarEtiquetas();
    res.status(200).json(etiquetas);
  } catch (error) {
    responderError(res, error);
  }
}

// Reseña de una reserva: /reservations/:id/review (:id = reservation_id)
async function obtener(req, res) {
  try {
    const resena = await service.obtenerPorReserva(req.params.id);
    res.status(200).json(resena);
  } catch (error) {
    responderError(res, error);
  }
}

async function crear(req, res) {
  try {
    const resena = await service.crear(req.params.id, req.body || {});
    res.status(201).json(resena);
  } catch (error) {
    responderError(res, error);
  }
}

async function actualizar(req, res) {
  try {
    const resena = await service.actualizar(req.params.id, req.body || {});
    res.status(200).json(resena);
  } catch (error) {
    responderError(res, error);
  }
}

async function eliminar(req, res) {
  try {
    const resultado = await service.eliminar(req.params.id);
    res.status(200).json(resultado);
  } catch (error) {
    responderError(res, error);
  }
}

module.exports = {
  listar,
  listarPorUsuario,
  listarPorClase,
  listarEtiquetas,
  obtener,
  crear,
  actualizar,
  eliminar
};
