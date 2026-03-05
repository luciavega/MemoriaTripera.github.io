// glosario.js
const glosario = {
  "AAA": "Alianza Anticomunista Argentina",
  "ACNUR": "Alto Comisionado de las Naciones Unidas para los Refugiados",
  "APDH": "Asamblea Permanente por los Derechos Humanos",
  "ARS": "Astillero Río Santiago",
  "ATE": "Asociación de Trabajadores del Estado",
  "ATULP": "Asociación de Trabajadores de la Universidad Nacional de La Plata",
  "CCD": "Centro Clandestino de Detención",
  "CCDTyE": "Centro Clandestino de Detención Tortura y Exterminio",
  "CCDyT": "Centro Clandestino de Detención y Tortura",
  "CNU": "Concentración Nacional Universitaria",
  "CPM": "Comisión Provincial por la Memoria",
  "DGCyE": "Dirección General de Cultura y Educación",
  "EAAF": "Equipo Argentino de Antropología Forense",
  "ERP": "Ejército Revolucionario del Pueblo",
  "FAEP": "Frente de agrupaciones Eva Perón",
  "FaHCE": "Facultad de Humanidades y Ciencias de la Educación de la UNLP",
  "FAL22": "Fuerzas Argentinas de Liberación “22 de agosto”",
  "FAR": "Fuerzas Armadas Revolucionarias",
  "FAS": "Frente Antiimperialista por el Socialismo",
  "FAU": "Facultad de Arquitectura y Urbanismo de la UNLP",
  "FAUDI": "Frente de Agrupaciones Universitarias de Izquierda",
  "FCE": "Facultad de Ciencias Económicas de la UNLP",
  "FCEx": "Facultad de Ciencias Exactas de la UNLP",
  "FCJyS": "Facultad de Ciencias Jurídicas y Sociales de la UNLP",
  "FCM": "Facultad de Ciencias Médicas de la UNLP",
  "FCNyM": "Facultad de Ciencias Naturales y Museo de la UNLP",
  "FDA": "Facultad de Artes de la UNLP",
  "FEP": "Federación de Estudiantes Peronistas",
  "FI": "Facultad de Ingeniería de la UNLP",
  "FJC": "Federación Juvenil Comunista",
  "FOLP": "Facultad de Odontología de la UNLP",
  "FORA": "Federación Obrera Regional Argentina",
  "FRP": "Frente Revolucionario Peronista",
  "FULP": "Federación Universitaria de La Plata",
  "FURN": "Federación Universitaria de la Revolución Nacional",
  "GUS": "Grupo Universitario Socialista",
  "GRA": "Grupo Revolucionario Anarquista",
  "GRB": "Grupos Revolucionarios de Base",
  "GRESS": "Grupo de Estudiantes Secundarios Socialistas",
  "IMP": "Intransigencia y Movilización Peronista",
  "JP": "Juventud Peronista",
  "JTP": "Juventud Trabajadora Peronista",
  "JUP": "Juventud Universitaria Peronista",
  "MR17": "Movimiento Revolucionario “17 de octubre”",
  "OCPO": "Organización Comunista Poder Obrero",
  "PBA": "Provincia de Buenos Aires",
  "PCML": "Partido Comunista Marxista Leninista",
  "PCR": "Partido Comunista Revolucionario",
  "PRT": "Partido Revolucionario de los Trabajadores",
  "PST": "Partido Socialista de los Trabajadores",
  "RL": "Resistencia Libertaria",
  "SIAP": "Sociedad Industrial de Aparatos de Precisión",
  "SUPE": "Sindicato Unido Petroleros del Estado",
  "UAR": "Unión Argentina de Rugby",
  "UBA": "Universidad de Buenos Aires",
  "UES": "Unión de Estudiantes Secundarios",
  "UNESCO": "Organización de las Naciones Unidas para la Educación, la Ciencia y la Cultura",
  "UNLP": "Universidad Nacional de La Plata",
  "YPF": "Yacimientos Petrolíferos Fiscales"
};

function aplicarGlosario() {
    const body = document.body;
    const clavesGlosario = Object.keys(glosario)
        .sort((a, b) => b.length - a.length)
        .map(clave => clave.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regexGlosario = new RegExp(`\\b(${clavesGlosario.join('|')})\\b`, 'g');

    function recorrerNodo(nodo) {
        if (nodo.nodeType === 3) { // Nodo de texto
            if (nodo.parentElement && nodo.parentElement.closest('.tooltip, .tooltiptext, script, style')) {
                return;
            }

            let texto = nodo.nodeValue;

            // Reemplazar siglas del glosario en una sola pasada.
            texto = texto.replace(regexGlosario, (sigla) => {
                return `<span class="tooltip">${sigla}<span class="tooltiptext">${glosario[sigla]}</span></span>`;
            });

            // Reemplazar la frase especial "Gimnasia ¡Presente, siempre!"
            const fraseEspecial = "Gimnasia ¡Presente, siempre!";
            const regexFrase = new RegExp(fraseEspecial, "g");
            texto = texto.replace(regexFrase, `<span class="tooltip">${fraseEspecial}</span>`);

            if (texto !== nodo.nodeValue) {
                const wrapper = document.createElement('span');
                wrapper.innerHTML = texto;
                nodo.replaceWith(wrapper);
            }
        } else {
            nodo.childNodes.forEach(nodoHijo => recorrerNodo(nodoHijo));
        }
    }

    recorrerNodo(body);
}