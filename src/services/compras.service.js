const repository = require('../repositories/compras.repository');
const usuariosRepository = require('../repositories/usuarios.repository');
const paquetesRepository = require('../repositories/paquetes.repository');
const HttpError = require('../utils/httpError');
const { validarId } = require('../utils/validar');
const { validarIdCuerpo, validarFecha } = require('../utils/validarCampos');

async function listar({ user_id } = {}) {
  return repository.listar({
    userId: user_id !== undefined ? validarId(user_id, 'user_id') : undefined
  });
}

async function listarPorUsuario(id) {
  const userId = validarId(id);
  const usuario = await usuariosRepository.buscarPorId(userId);
  if (!usuario) {
    throw new HttpError(404, 'Usuario no encontrado');
  }
  return repository.listar({ userId });
}

async function obtener(id) {
  const numero = validarId(id);
  const compra = await repository.obtenerPorId(numero);
  if (!compra) {
    throw new HttpError(404, 'Compra no encontrada');
  }
  return compra;
}

async function crear({ user_id, package_id }) {
  if (user_id === undefined || package_id === undefined) {
    throw new HttpError(400, 'user_id y package_id son obligatorios');
  }
  const userId = validarIdCuerpo(user_id, 'user_id');
  const packageId = validarIdCuerpo(package_id, 'package_id');

  const usuario = await usuariosRepository.buscarPorId(userId);
  if (!usuario) {
    throw new HttpError(404, 'Usuario no encontrado');
  }
  const paquete = await paquetesRepository.obtenerPorId(packageId);
  if (!paquete) {
    throw new HttpError(404, 'Paquete no encontrado');
  }

  // El precio lo fija el servidor desde el paquete (el cliente no lo envía) y se guarda como histórico
  const id = await repository.crear({ userId, packageId, paidPrice: paquete.price });
  return repository.obtenerPorId(id);
}

// RF-08: ventas de un día (hoy por defecto). Resumen desde la vista daily_sales + detalle de compras
async function ventasDelDia(fecha) {
  const fechaValida = fecha !== undefined ? validarFecha(fecha, 'date') : undefined;
  const dia = await repository.resolverFecha(fechaValida);
  const resumen = await repository.resumenDelDia(dia);
  const compras = await repository.detalleDelDia(dia);
  return {
    sale_date: dia,
    total_purchases: resumen ? Number(resumen.total_purchases) : 0,
    total_sales: resumen ? Number(resumen.total_sales) : 0,
    purchases: compras
  };
}

module.exports = { listar, listarPorUsuario, obtener, crear, ventasDelDia };
