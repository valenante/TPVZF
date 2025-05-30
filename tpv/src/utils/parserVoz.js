const verbosAgregar = ['agrega', 'añade', 'anota', 'apunta', 'suma', 'mete', 'pon'];
const verbosRegex = verbosAgregar.join('|');

const tiposPrecio = ['tapa', 'racion', 'copa', 'botella', 'surtido'];
const palabrasIgnorar = ['un', 'una', 'unos', 'unas', 'el', 'la', 'los', 'las', 'de', 'del', 'al'];

function quitarAcentos(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
}

function detectarTipoPrecio(texto) {
  const textoSinAcentos = quitarAcentos(texto.toLowerCase());
  for (const tipo of tiposPrecio) {
    const tipoSinAcentos = quitarAcentos(tipo);
    const regex = new RegExp(`\\b${tipoSinAcentos}\\b`, 'i');
    if (regex.test(textoSinAcentos)) return tipo;
  }
  return null;
}

function limpiarNombreProducto(texto) {
  let palabras = texto.toLowerCase().split(/\s+/);
  palabras = palabras.filter(p => !palabrasIgnorar.includes(p));
  return palabras.join(' ');
}

const palabrasANumeros = {
  uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5,
  seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10
};

export function interpretarComando(textoOriginal) {
  // Trabajamos con texto sin acentos para detectar tipoPrecio y cantidad
  const textoSinAcentos = quitarAcentos(textoOriginal.toLowerCase());

  // Detectar tipoPrecio en texto sin acentos
  const tipoPrecio = detectarTipoPrecio(textoSinAcentos);

  // Eliminar tipoPrecio detectado del texto sin acentos
  let textoSinTipoPrecio = textoSinAcentos;
  if (tipoPrecio) {
    const tipoRegex = new RegExp(`\\b${quitarAcentos(tipoPrecio)}\\b`, 'i');
    textoSinTipoPrecio = textoSinTipoPrecio.replace(tipoRegex, '').trim();
  }

  // Regex con verbo explícito y cantidad opcional (sobre texto sin acentos)
  const regexConVerbo = new RegExp(`(${verbosRegex})(?:r)?\\s+(\\d+|${Object.keys(palabrasANumeros).join('|')})?\\s*([\\w\\s\\-]+?)\\s+(?:a la mesa|para la mesa|mesa)\\s+(\\w+)`, 'i');
  let match = textoSinTipoPrecio.match(regexConVerbo);

  if (match) {
    const verbo = match[1].toLowerCase();
    let cantidadRaw = match[2];
    const productoRaw = match[3].trim();
    const mesaTexto = match[4].toLowerCase();

    let cantidad = 1;
    if (cantidadRaw) {
      cantidadRaw = cantidadRaw.toLowerCase();
      cantidad = /^\d+$/.test(cantidadRaw) ? parseInt(cantidadRaw, 10) : (palabrasANumeros[cantidadRaw] || 1);
    }

    const mesa = /^\d+$/.test(mesaTexto) ? parseInt(mesaTexto, 10) : palabrasANumeros[mesaTexto];
    if (!mesa || isNaN(mesa)) return null;

    // Limpiar el nombre del producto (pero sobre el texto ORIGINAL para no perder acentos en el nombre)
    // Buscamos productoRaw en textoOriginal para conservar acentos y luego limpiamos palabras ignoradas
    const regexProductoOriginal = new RegExp(productoRaw, 'i');
    let productoConAcentos = textoOriginal.match(regexProductoOriginal)?.[0] || productoRaw;
    productoConAcentos = limpiarNombreProducto(productoConAcentos);
    const productoNormalizado = productoConAcentos.replace(/[\s\-]+/g, '');

    return {
      accion: 'agregarProducto',
      verbo,
      producto: productoNormalizado,
      mesa,
      cantidad,
      tipoPrecio
    };
  }

  // Regex sin verbo, con cantidad opcional
  const regexSinVerbo = new RegExp(`^(\\d+|${Object.keys(palabrasANumeros).join('|')})?\\s*([\\w\\s\\-]+?)\\s+(?:a la mesa|para la mesa|mesa)\\s+(\\w+)$`, 'i');
  match = textoSinTipoPrecio.match(regexSinVerbo);

  if (match) {
    let cantidadRaw = match[1];
    const productoRaw = match[2].trim();
    const mesaTexto = match[3].toLowerCase();

    let cantidad = 1;
    if (cantidadRaw) {
      cantidadRaw = cantidadRaw.toLowerCase();
      cantidad = /^\d+$/.test(cantidadRaw) ? parseInt(cantidadRaw, 10) : (palabrasANumeros[cantidadRaw] || 1);
    }

    const mesa = /^\d+$/.test(mesaTexto) ? parseInt(mesaTexto, 10) : palabrasANumeros[mesaTexto];
    if (!mesa || isNaN(mesa)) return null;

    const regexProductoOriginal = new RegExp(productoRaw, 'i');
    let productoConAcentos = textoOriginal.match(regexProductoOriginal)?.[0] || productoRaw;
    productoConAcentos = limpiarNombreProducto(productoConAcentos);
    const productoNormalizado = productoConAcentos.replace(/[\s\-]+/g, '');

    return {
      accion: 'agregarProducto',
      verbo: null,
      producto: productoNormalizado,
      mesa,
      cantidad,
      tipoPrecio
    };
  }

  return null;
}
