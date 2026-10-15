const service = require('../services/usuarios.service');
const responderError = require('../utils/responderError');

async function registrar(req, res) {
  try {
    const usuario = await service.registrar(req.body || {});
    res.status(201).json(usuario);
  } catch (error) {
    responderError(res, error);
  }
}

async function listar(req, res) {
  try {
    const usuarios = await service.listar();
    res.status(200).json(usuarios);
  } catch (error) {
    responderError(res, error);
  }
}

async function obtener(req, res) {
  try {
    const usuario = await service.obtener(req.params.id);
    res.status(200).json(usuario);
  } catch (error) {
    responderError(res, error);
  }
}

async function actualizar(req, res) {
  try {
    const usuario = await service.actualizar(req.params.id, req.body || {});
    res.status(200).json(usuario);
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

module.exports = { registrar, listar, obtener, actualizar, eliminar };