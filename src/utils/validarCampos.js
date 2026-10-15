const HttpError = require('./httpError');

// Id recibido en el cuerpo JSON: debe ser un número entero positivo (no texto)
function validarIdCuerpo(valor, nombre) {
  if (typeof valor !== 'number' || !Number.isInteger(valor) || valor <= 0) {
    throw new HttpError(400, `${nombre} debe ser un número entero positivo`);
  }
  return valor;
}

function validarEnteroEnRango(valor, nombre, min, max) {
  if (typeof valor !== 'number' || !Number.isInteger(valor) || valor < min || valor > max) {
    throw new HttpError(400, `${nombre} debe ser un entero entre ${min} y ${max}`);
  }
  return valor;
}

function validarTexto(valor, nombre, max) {
  if (typeof valor !== 'string' || valor.trim().length === 0 || valor.trim().length > max) {
    throw new HttpError(400, `${nombre} debe ser texto de 1 a ${max} caracteres`);
  }
  return valor.trim();
}

// Fecha YYYY-MM-DD que exista en el calendario
function validarFecha(valor, nombre) {
  let ok = typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor);
  if (ok) {
    const fecha = new Date(`${valor}T00:00:00Z`);
    // Date acepta meses/días imposibles según el formato; se compara contra el texto original
    ok = !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
  }
  if (!ok) {
    throw new HttpError(400, `${nombre} debe tener el formato YYYY-MM-DD y ser una fecha real`);
  }
  return valor;
}

// Etiquetas opcionales: arreglo de nombres del catálogo (máximo 5, sin repetidos)
function validarEtiquetas(valor) {
  if (valor === undefined || valor === null) return [];
  if (!Array.isArray(valor) || valor.length > 5) {
    throw new HttpError(400, 'tags debe ser un arreglo de máximo 5 nombres de etiqueta');
  }
  const vistos = new Set();
  const limpias = [];
  for (const e of valor) {
    if (typeof e !== 'string' || e.trim().length === 0 || e.trim().length > 60) {
      throw new HttpError(400, 'Cada etiqueta debe ser texto de 1 a 60 caracteres');
    }
    const nombre = e.trim();
    if (!vistos.has(nombre.toLowerCase())) {
      vistos.add(nombre.toLowerCase());
      limpias.push(nombre);
    }
  }
  return limpias;
}

module.exports = {
  validarIdCuerpo,
  validarEnteroEnRango,
  validarTexto,
  validarFecha,
  validarEtiquetas
};
