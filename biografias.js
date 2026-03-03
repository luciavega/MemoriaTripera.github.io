// Cargar datos y manejar la construcción de la grilla y filtrado
let personas = [];
let filtros = {
  texto: '',
  nacimiento: '',
  primarios: '',
  secundarios: '',
  superiores: '',
  militancia: '',
  deporte: '',
  instituciones: '',
  ccdd: '',
  victima: ''
};

// Mapeo de provincias
const mapProvincias = {
  'buenos-aires': 'Buenos Aires',
  'caba': 'CABA',
  'santa-fe': 'Santa Fe',
  'cordoba': 'Córdoba',
  'tucuman': 'Tucumán',
  'san-luis': 'San Luis'
};

// Mapeo inverso
const mapProvinciasInverso = {};
Object.keys(mapProvincias).forEach(key => {
  mapProvinciasInverso[mapProvincias[key]] = key;
});

// Elementos DOM
const grid = document.getElementById('grid');
const buscador = document.getElementById('buscador');
const botonReset = document.querySelector('.btn-reset');

// Limpiar contenido estático
if (grid) {
  grid.innerHTML = '';
}

// Inicialización
// Load main data and optional filter metadata
Promise.all([
  fetch('biografias.json').then(r => r.json()),
  fetch('biografias_filtros.json').then(r => r.json()).catch(() => [])
])
  .then(([data, filtrosMeta]) => {
    personas = data;
    inicializarFiltros(filtrosMeta);
    render(personas);
  })
  .catch(err => {
    console.error('Error al cargar archivos de datos:', err);
  });

// Inicializar dropdowns con opciones extraídas de JSON explícito y textos
function inicializarFiltros(explicitData = []) {
  const provincias = new Set();
  const primarios = new Set();
  const secundarios = new Set();
  const superiores = new Set();
  const militancia = new Set();
  const deporte = new Set();
  const instituciones = new Set();
  const ccdd = new Set();
  const victima = new Set();

  personas.forEach(p => {
    // PROVINCIAS (Nacimiento)
    if (p.provincia) {
      provincias.add(mapProvincias[p.provincia] || p.provincia);
    }
    
    // Extraer de datos explícitos
    if (p.primarios && Array.isArray(p.primarios)) {
      p.primarios.forEach(x => primarios.add(x));
    }
    if (p.secundarios && Array.isArray(p.secundarios)) {
      p.secundarios.forEach(x => secundarios.add(x));
    }
    if (p.superiores && Array.isArray(p.superiores)) {
      p.superiores.forEach(x => superiores.add(x));
    }
    if (p.militancia && Array.isArray(p.militancia)) {
      p.militancia.forEach(x => militancia.add(x));
    }
    if (p.deporte && Array.isArray(p.deporte)) {
      p.deporte.forEach(x => deporte.add(x));
    }
    if (p.instituciones && Array.isArray(p.instituciones)) {
      p.instituciones.forEach(x => instituciones.add(x));
    }
    if (p.ccdd && Array.isArray(p.ccdd)) {
      p.ccdd.forEach(x => ccdd.add(x));
    }
    if (p.tipo_victima && p.tipo_victima.trim()) {
      victima.add(p.tipo_victima);
    }
    
    // EXTRAER DEL TEXTO
    const texto = p.texto || '';
    const textoLower = texto.toLowerCase();

    // Primarios: patrones para escuelas primarias
    const regexPrimarios = /realizó sus estudios primarios\s+(?:en|en la)\s+(?:la\s+)?(?:Escuela|Colegio)\s+(?:")?([^,"]+?)(?:")?(?:\s+y|\s+,|\s+en|\s+;|\.)/gi;
    let match;
    while ((match = regexPrimarios.exec(texto)) !== null) {
      if (match[1] && match[1].trim().length > 0 && match[1].trim().length < 70) {
        primarios.add(match[1].trim());
      }
    }

    // Secundarios: patrones para escuelas secundarias
    const regexSecundarios = /(?:luego|después|posteriormente|later)\s+(?:cursó|realizó|estudió)\s+(?:sus\s+)?(?:estudios\s+)?(?:secundarios|media)\s+(?:en|en la)\s+(?:la\s+)?(?:Colegio|Escuela|Liceo)\s+(?:")?([^,"]+?)(?:")?(?:\s+y|\s+,|\s+en|\s+;|\.)/gi;
    while ((match = regexSecundarios.exec(texto)) !== null) {
      if (match[1] && match[1].trim().length > 0 && match[1].trim().length < 70) {
        secundarios.add(match[1].trim());
      }
    }

    // Superiores: patrones para universidades y facultades
    const regexSuperiores = /(?:ingres[oó]|inscribió|carrera)\s+(?:a|en|a la)\s+(?:la\s+)?(?:Facultad|Universidad)\s+de\s+([^,.;]+)/gi;
    while ((match = regexSuperiores.exec(texto)) !== null) {
      if (match[1] && match[1].trim().length > 0 && match[1].trim().length < 70) {
        superiores.add(match[1].trim());
      }
    }

    // Militancia: buscar palabras clave de organizaciones políticas
    const palabrasClaveOrgPolitica = [
      'Montoneros', 'ERP', 'FAR', 'PRT', 'PCML', 'JP', 'JUP', 'UES', 
      'FJC', 'JTP', 'FAS', 'PST', 'OCPO', 'PROA', 'Siloísta', 'GRESS', 
      'GUS', 'MAS', 'RL', 'FULP', 'GRA', 'FAL', 'PCR', 'FEP', 'PCA', 'ARP'
    ];
    palabrasClaveOrgPolitica.forEach(org => {
      if (textoLower.includes(org.toLowerCase())) {
        militancia.add(org);
      }
    });

    // Deporte: buscar palabras clave de deportes
    const palabrasClaveDeporte = [
      'rugby', 'fútbol', 'vóley', 'básquet', 'atletismo', 'esgrima',
      'pelota paleta', 'natación', 'ajedrez', 'pileta', 'Gimnasia', 'tenis',
      'buceo', 'esquí', 'boxeo'
    ];
    palabrasClaveDeporte.forEach(depo => {
      if (textoLower.includes(depo.toLowerCase())) {
        deporte.add(depo);
      }
    });

    // Instituciones: buscar palabras clave de instituciones
    const palabrasClaveInstituciones = [
      'UNLP', 'UBA', 'Facultad de Humanidades', 'Facultad de Ciencias Exactas',
      'Facultad de Medicina', 'Facultad de Ingeniería', 'FaHCE', 'FCM', 'FAU',
      'FCJyS', 'FCE', 'FCNyM', 'Colegio Nacional', 'Colegio Ward', 'Colegio Sagrada Familia',
      'Liceo Víctor Mercante', 'Escuela Normal'
    ];
    palabrasClaveInstituciones.forEach(inst => {
      if (textoLower.includes(inst.toLowerCase())) {
        instituciones.add(inst);
      }
    });

    // Centros Clandestinos de Detención
    const palabrasClaveCCDD = [
      'CCDTyE', 'CCDyT', 'CCD', 'Cacha', 'Campo de Mayo', 'ESMA',
      'Arana', 'Banfield', 'Vesubio', 'Campito', 'Comisaría Quinta',
      'Club Atlético', 'El Banco', 'La Plata', 'Pozo de Banfield'
    ];
    palabrasClaveCCDD.forEach(lugar => {
      if (textoLower.includes(lugar.toLowerCase())) {
        ccdd.add(lugar);
      }
    });

    // Asesinato/Secuestro/Desaparición
    const palabrasClaveVictima = [
      'asesinado', 'asesinada', 'fusilado', 'fusilada', 
      'secuestrado', 'secuestrada', 'desaparecido', 'desaparecida'
    ];
    palabrasClaveVictima.forEach(palabra => {
      if (textoLower.includes(palabra.toLowerCase())) {
        if (palabra.includes('asesina')) victima.add('Asesinado');
        else if (palabra.includes('fusila')) victima.add('Fusilado');
        else if (palabra.includes('secuestra')) victima.add('Secuestrado');
        else if (palabra.includes('desapareci')) victima.add('Desaparecido');
      }
    });
  });

  // Incorporar valores explícitos desde biografias_filtros.json si existen
  if (Array.isArray(explicitData)) {
    explicitData.forEach(e => {
      if (e.nacimiento) provincias.add(e.nacimiento);
      (e.primarios || []).forEach(x => primarios.add(x));
      (e.secundarios || []).forEach(x => secundarios.add(x));
      (e.superiores || []).forEach(x => superiores.add(x));
      (e.militancia || []).forEach(x => militancia.add(x));
      (e.deporte || []).forEach(x => deporte.add(x));
      (e.instituciones || []).forEach(x => instituciones.add(x));
      (e.ccdd || []).forEach(x => ccdd.add(x));
    });
  }

  // Poblar selectores
  poblarSelect('filtro-nacimiento', Array.from(provincias).sort());
  poblarSelect('filtro-primarios', Array.from(primarios).sort());
  poblarSelect('filtro-secundarios', Array.from(secundarios).sort());
  poblarSelect('filtro-superiores', Array.from(superiores).sort());
  poblarSelect('filtro-militancia', Array.from(militancia).sort());
  poblarSelect('filtro-deporte', Array.from(deporte).sort());
  poblarSelect('filtro-instituciones', Array.from(instituciones).sort());
  poblarSelect('filtro-ccdd', Array.from(ccdd).sort());
  poblarSelect('filtro-victima', Array.from(victima).sort());
}

function poblarSelect(selectId, opciones) {
  const select = document.getElementById(selectId);
  if (!select) return;
  
  opciones.forEach(opcion => {
    if (opcion && opcion.trim()) {
      const option = document.createElement('option');
      option.value = opcion;
      option.textContent = opcion.substring(0, 60);
      select.appendChild(option);
    }
  });

  select.addEventListener('change', () => {
    const filterKey = selectId.replace('filtro-', '');
    filtros[filterKey] = select.value;
    aplicarFiltros();
  });
}

function render(lista) {
  grid.innerHTML = '';
  const tpl = document.getElementById('card-template');
  lista.forEach(p => {
    const card = tpl.content.cloneNode(true);
    const img = card.querySelector('img');
    const h3 = card.querySelector('h3');

    img.src = p.foto;
    img.alt = p.nombre;
    h3.textContent = p.nombre;

    card.querySelector('.card-click').onclick = () => {
      location.href = `detalle.html?id=${p.id}`;
    };
    grid.appendChild(card);
  });
}

function aplicarFiltros() {
  let resultado = personas.slice();

  // Filtro de texto (nombre)
  if (filtros.texto) {
    const txt = filtros.texto.toLowerCase();
    resultado = resultado.filter(p =>
      p.nombre.toLowerCase().includes(txt)
    );
  }

  // Filtro Nacimiento (provincia)
  if (filtros.nacimiento) {
    const provinciaCodigo = mapProvinciasInverso[filtros.nacimiento] || filtros.nacimiento;
    resultado = resultado.filter(p =>
      p.provincia === provinciaCodigo
    );
  }

  // Filtro Primarios
  if (filtros.primarios) {
    resultado = resultado.filter(p => {
      if (p.primarios && Array.isArray(p.primarios)) {
        return p.primarios.some(x => x.toLowerCase() === filtros.primarios.toLowerCase());
      }
      return (p.texto || '').toLowerCase().includes(filtros.primarios.toLowerCase());
    });
  }

  // Filtro Secundarios
  if (filtros.secundarios) {
    resultado = resultado.filter(p => {
      if (p.secundarios && Array.isArray(p.secundarios)) {
        return p.secundarios.some(x => x.toLowerCase() === filtros.secundarios.toLowerCase());
      }
      return (p.texto || '').toLowerCase().includes(filtros.secundarios.toLowerCase());
    });
  }

  // Filtro Estudios Superiores
  if (filtros.superiores) {
    resultado = resultado.filter(p => {
      if (p.superiores && Array.isArray(p.superiores)) {
        return p.superiores.some(x => x.toLowerCase() === filtros.superiores.toLowerCase());
      }
      return (p.texto || '').toLowerCase().includes(filtros.superiores.toLowerCase());
    });
  }

  // Filtro Militancia
  if (filtros.militancia) {
    resultado = resultado.filter(p => {
      if (p.militancia && Array.isArray(p.militancia)) {
        return p.militancia.some(x => x.toLowerCase() === filtros.militancia.toLowerCase());
      }
      return (p.texto || '').toLowerCase().includes(filtros.militancia.toLowerCase());
    });
  }

  // Filtro Deporte
  if (filtros.deporte) {
    resultado = resultado.filter(p => {
      if (p.deporte && Array.isArray(p.deporte)) {
        return p.deporte.some(x => x.toLowerCase() === filtros.deporte.toLowerCase());
      }
      return (p.texto || '').toLowerCase().includes(filtros.deporte.toLowerCase());
    });
  }

  // Filtro Instituciones
  if (filtros.instituciones) {
    resultado = resultado.filter(p => {
      if (p.instituciones && Array.isArray(p.instituciones)) {
        return p.instituciones.some(x => x.toLowerCase() === filtros.instituciones.toLowerCase());
      }
      return (p.texto || '').toLowerCase().includes(filtros.instituciones.toLowerCase());
    });
  }

  // Filtro CCDs
  if (filtros.ccdd) {
    resultado = resultado.filter(p => {
      if (p.ccdd && Array.isArray(p.ccdd)) {
        return p.ccdd.some(x => x.toLowerCase() === filtros.ccdd.toLowerCase());
      }
      return (p.texto || '').toLowerCase().includes(filtros.ccdd.toLowerCase());
    });
  }

  // Filtro Tipo de Víctima
  if (filtros.victima) {
    resultado = resultado.filter(p => {
      if (p.tipo_victima && p.tipo_victima.toLowerCase() === filtros.victima.toLowerCase()) {
        return true;
      }
      return (p.texto || '').toLowerCase().includes(filtros.victima.toLowerCase());
    });
  }

  render(resultado);
}

// Event listeners
buscador.addEventListener('input', e => {
  filtros.texto = e.target.value;
  aplicarFiltros();
});

botonReset.addEventListener('click', () => {
  filtros = {
    texto: '',
    nacimiento: '',
    primarios: '',
    secundarios: '',
    superiores: '',
    militancia: '',
    deporte: '',
    instituciones: '',
    ccdd: '',
    victima: ''
  };
  buscador.value = '';
  document.querySelectorAll('select').forEach(s => s.value = '');
  render(personas);
});