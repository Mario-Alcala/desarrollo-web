const API_TERRENOS_EMPLEADO = 'http://localhost:8081/api';
const listaTerrenosEmpleado = document.getElementById('terrenos-empleado');
const mensajeTerrenosEmpleado = document.getElementById('mensaje-terrenos-empleado');

function lineaDetalle(etiqueta, valor) {
    const p = document.createElement('p');
    const fuerte = document.createElement('strong');
    fuerte.textContent = etiqueta + ': ';
    p.append(fuerte, document.createTextNode(valor == null ? '—' : valor));
    return p;
}

async function cargarTerrenosEmpleado() {
    mensajeTerrenosEmpleado.textContent = 'Cargando terrenos y parcelas…';
    listaTerrenosEmpleado.replaceChildren();
    try {
        const respuesta = await fetch(API_TERRENOS_EMPLEADO + '/terrenos');
        if (!respuesta.ok) throw new Error('No se pudieron consultar los terrenos.');
        const terrenos = await respuesta.json();
        if (terrenos.length === 0) mensajeTerrenosEmpleado.textContent = 'No hay terrenos registrados.';
        for (const terreno of terrenos) {
            const tarjeta = document.createElement('section');
            tarjeta.className = 'panel espacio';
            const titulo = document.createElement('h2');
            titulo.textContent = terreno.nombre;
            tarjeta.append(titulo,
                lineaDetalle('Ubicación', terreno.ubicacion),
                lineaDetalle('Superficie total', Number(terreno.superficieM2 || 0).toLocaleString('es-MX') + ' m²'),
                lineaDetalle('Tipo de suelo', terreno.tipoSuelo),
                lineaDetalle('Estado', terreno.estado));
            const tituloParcelas = document.createElement('h3');
            tituloParcelas.textContent = 'Parcelas';
            tarjeta.appendChild(tituloParcelas);
            const respuestaParcelas = await fetch(API_TERRENOS_EMPLEADO + '/parcelas/terreno/' + encodeURIComponent(terreno.id));
            if (!respuestaParcelas.ok) throw new Error('No se pudieron consultar las parcelas de ' + terreno.nombre + '.');
            const parcelas = await respuestaParcelas.json();
            if (parcelas.length === 0) tarjeta.appendChild(lineaDetalle('Parcelas', 'No hay parcelas registradas'));
            parcelas.forEach(function (parcela) {
                const bloque = document.createElement('article');
                bloque.className = 'panel';
                const nombre = document.createElement('h3');
                nombre.textContent = parcela.nombre;
                bloque.append(nombre,
                    lineaDetalle('Superficie', Number(parcela.superficieM2 || 0).toLocaleString('es-MX') + ' m²'),
                    lineaDetalle('Estado', parcela.estado),
                    lineaDetalle('Cultivo', parcela.cultivoNombre || 'Sin cultivo asignado'),
                    lineaDetalle('Etapa', parcela.etapaFenologica));
                tarjeta.appendChild(bloque);
            });
            listaTerrenosEmpleado.appendChild(tarjeta);
        }
        if (terrenos.length) mensajeTerrenosEmpleado.textContent = '';
    } catch (error) {
        mensajeTerrenosEmpleado.textContent = error.message;
    }
}

cargarTerrenosEmpleado();
