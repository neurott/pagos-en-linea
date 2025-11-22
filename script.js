let servicios = [];

const serviciosPorDefecto = [
    { id: 'chilquinta', nombre: 'Chilquinta', dia: '11', url: 'https://www.chilquinta.cl/pagoenlinea' },
    { id: 'esval', nombre: 'Esval', dia: '18', url: 'https://www.esval.cl/personas/inicio?pago-rapido' },
    { id: 'claro', nombre: 'Claro Chile', dia: '30', url: 'https://sucursalvirtual.clarochile.cl/PagoExpress/index' },
    { id: 'entel', nombre: 'Entel', dia: '8', url: 'https://miperfil.entel.cl/CL_Web_Unified_Payment_EU/' },
    { id: 'movistar', nombre: 'Movistar', dia: '29', url: 'https://pagos.movistar.cl/publico' },
    { id: 'wom', nombre: 'Wom', dia: '5', url: 'https://www.wom.cl/paga-aqui/' }
];

document.addEventListener('DOMContentLoaded', function() {
    cargarServicios();
    cargarEstados();
    initEventosHistorial();
});

function cargarServicios() {
    const almacenados = localStorage.getItem('mis_servicios');
    if (almacenados) {
        servicios = JSON.parse(almacenados);
    } else {
        servicios = serviciosPorDefecto;
        guardarEnStorage();
    }
    renderizarServicios();
}

function guardarEnStorage() {
    localStorage.setItem('mis_servicios', JSON.stringify(servicios));
}

function renderizarServicios() {
    const grid = document.getElementById('gridServicios');
    const filtroSelect = document.getElementById('filtroServicio');
    
    grid.innerHTML = '';
    
    let opcionesFiltro = '<option value="todos">Todos los servicios</option>';

    servicios.forEach(servicio => {
        const id = servicio.id;
        opcionesFiltro += `<option value="${id}">${servicio.nombre}</option>`;

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-actions">
                <button class="action-btn" onclick="editarServicio('${id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button class="action-btn" onclick="borrarServicio('${id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
            <h2>${servicio.nombre}</h2>
            <div class="fecha-vencimiento">
                Vence el <span class="dia-span">${servicio.dia}</span> de cada mes
            </div>
            <button class="pago-btn" onclick="window.open('${servicio.url}', '_blank')">Pagar ahora</button>
            <div class="estado-pago">
                <div class="custom-select" tabindex="0" id="select-${id}">
                    <select class="select-hidden" onchange="actualizarEstado('${id}', this.value)">
                        <option value="pendiente">Pendiente</option>
                        <option value="pagado">Pagado</option>
                    </select>
                    <div class="select-selected">Pendiente</div>
                    <div class="select-items">
                        <div class="select-item" data-value="pendiente">Pendiente</div>
                        <div class="select-item" data-value="pagado">Pagado</div>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    filtroSelect.innerHTML = opcionesFiltro;
    inicializarSelects();
    cargarEstados();
}

function inicializarSelects() {
    const customSelects = document.querySelectorAll('.custom-select');

    customSelects.forEach(select => {
        const selectElement = select.querySelector('select');
        const selectedDiv = select.querySelector('.select-selected');
        const itemsContainer = select.querySelector('.select-items');

        // Reset listeners clone trick
        const newSelectedDiv = selectedDiv.cloneNode(true);
        selectedDiv.parentNode.replaceChild(newSelectedDiv, selectedDiv);
        
        newSelectedDiv.addEventListener('click', function(e) {
            e.stopPropagation();
            closeAllSelect(this);
            itemsContainer.style.display = 'block';
            this.classList.add('select-arrow-active');
        });

        const items = itemsContainer.querySelectorAll('.select-item');
        items.forEach(item => {
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);

            newItem.addEventListener('click', function() {
                const value = this.getAttribute('data-value');
                const text = this.textContent;
                selectElement.value = value;
                newSelectedDiv.textContent = text;
                itemsContainer.style.display = 'none';
                newSelectedDiv.classList.remove('select-arrow-active');
                selectElement.dispatchEvent(new Event('change'));
            });
        });
    });

    document.addEventListener('click', closeAllSelect);
}

function closeAllSelect(elmnt) {
    const items = document.querySelectorAll('.select-items');
    const selected = document.querySelectorAll('.select-selected');

    for (let i = 0; i < selected.length; i++) {
        if (elmnt !== selected[i]) {
            selected[i].classList.remove('select-arrow-active');
        }
    }

    for (let i = 0; i < items.length; i++) {
        if (elmnt !== items[i].previousElementSibling) {
            items[i].style.display = 'none';
        }
    }
}

function actualizarEstado(id, estado) {
    localStorage.setItem('estado_' + id, estado);

    const selectContainer = document.getElementById(`select-${id}`);
    const card = selectContainer.closest('.card');
    const boton = card.querySelector('.pago-btn');

    if (estado === 'pagado') {
        card.classList.add('pagado');
        boton.style.display = 'none';
        guardarEnHistorial(id, estado);
    } else {
        card.classList.remove('pagado');
        boton.style.display = 'block';
    }
}

function cargarEstados() {
    servicios.forEach(servicio => {
        const id = servicio.id;
        const estadoGuardado = localStorage.getItem('estado_' + id);
        
        if (estadoGuardado) {
            const selectContainer = document.getElementById(`select-${id}`);
            if(selectContainer) {
                const selectElement = selectContainer.querySelector('select');
                const selectedDiv = selectContainer.querySelector('.select-selected');
                const card = selectContainer.closest('.card');
                const boton = card.querySelector('.pago-btn');

                selectElement.value = estadoGuardado;
                
                if (estadoGuardado === 'pagado') {
                    card.classList.add('pagado');
                    boton.style.display = 'none';
                    selectedDiv.textContent = 'Pagado';
                } else {
                    card.classList.remove('pagado');
                    boton.style.display = 'block';
                    selectedDiv.textContent = 'Pendiente';
                }
            }
        }
    });
}

// CRUD
function abrirModalServicio() {
    document.getElementById('formServicio').reset();
    document.getElementById('servicioId').value = '';
    document.getElementById('tituloModalServicio').textContent = 'Nuevo Servicio';
    document.getElementById('modalServicio').style.display = 'block';
}

function cerrarModalServicio() {
    document.getElementById('modalServicio').style.display = 'none';
}

function guardarServicio(e) {
    e.preventDefault();
    const id = document.getElementById('servicioId').value;
    const nombre = document.getElementById('nombreServicio').value;
    const dia = document.getElementById('diaVencimiento').value;
    const url = document.getElementById('urlPago').value;

    if (id) {
        const index = servicios.findIndex(s => s.id === id);
        if (index !== -1) {
            servicios[index] = { ...servicios[index], nombre, dia, url };
        }
    } else {
        const newId = 'srv_' + Date.now();
        servicios.push({ id: newId, nombre, dia, url });
    }

    guardarEnStorage();
    renderizarServicios();
    cerrarModalServicio();
}

function editarServicio(id) {
    const servicio = servicios.find(s => s.id === id);
    if (servicio) {
        document.getElementById('servicioId').value = servicio.id;
        document.getElementById('nombreServicio').value = servicio.nombre;
        document.getElementById('diaVencimiento').value = servicio.dia;
        document.getElementById('urlPago').value = servicio.url;
        document.getElementById('tituloModalServicio').textContent = 'Editar Servicio';
        document.getElementById('modalServicio').style.display = 'block';
    }
}

function borrarServicio(id) {
    if (confirm('¿Estás seguro de borrar este servicio?')) {
        servicios = servicios.filter(s => s.id !== id);
        localStorage.removeItem('estado_' + id);
        guardarEnStorage();
        renderizarServicios();
    }
}

// Historial
function initEventosHistorial() {
    document.getElementById('btnHistorial').addEventListener('click', function() {
        document.getElementById('modalHistorial').style.display = 'block';
        mostrarHistorial();
    });

    document.getElementById('filtroServicio').addEventListener('change', mostrarHistorial);
    document.getElementById('limpiarHistorial').addEventListener('click', limpiarHistorial);
}

function cerrarModalHistorial() {
    document.getElementById('modalHistorial').style.display = 'none';
}

function guardarEnHistorial(servicioId, estado) {
    if (estado !== 'pagado') return;
    const servicio = servicios.find(s => s.id === servicioId);
    const nombreServicio = servicio ? servicio.nombre : servicioId;

    const ahora = new Date();
    const registro = {
        servicio: servicioId,
        nombreBackup: nombreServicio,
        fecha: ahora.toISOString(),
        timestamp: ahora.getTime()
    };

    let historial = JSON.parse(localStorage.getItem('historial_pagos')) || [];
    historial.unshift(registro);
    localStorage.setItem('historial_pagos', JSON.stringify(historial));

    if (document.getElementById('modalHistorial').style.display === 'block') {
        mostrarHistorial();
    }
}

function mostrarHistorial() {
    const listaHistorial = document.getElementById('listaHistorial');
    const filtro = document.getElementById('filtroServicio').value;
    let historial = JSON.parse(localStorage.getItem('historial_pagos')) || [];

    if (filtro !== 'todos') {
        historial = historial.filter(item => item.servicio === filtro);
    }

    if (historial.length === 0) {
        listaHistorial.innerHTML = '<div class="vacio" style="text-align:center; padding:20px; color:#888;">No hay registros</div>';
        return;
    }

    listaHistorial.innerHTML = historial.map(item => {
        const fecha = new Date(item.fecha);
        const servicioActual = servicios.find(s => s.id === item.servicio);
        const nombreMostrar = servicioActual ? servicioActual.nombre : (item.nombreBackup || item.servicio);

        const fechaFormateada = fecha.toLocaleDateString('es-CL', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        return `
            <div class="item-historial pagado">
                <div class="info-pago">
                    <div class="servicio">${nombreMostrar}</div>
                    <div class="fecha">${fechaFormateada}</div>
                </div>
                <div class="accion-historial" onclick="eliminarRegistroHistorial(${item.timestamp})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </div>
            </div>
        `;
    }).join('');
}

function eliminarRegistroHistorial(timestamp) {
    let historial = JSON.parse(localStorage.getItem('historial_pagos')) || [];
    historial = historial.filter(item => item.timestamp !== timestamp);
    localStorage.setItem('historial_pagos', JSON.stringify(historial));
    mostrarHistorial();
}

function limpiarHistorial() {
    if (confirm('¿Eliminar todo el historial?')) {
        localStorage.removeItem('historial_pagos');
        mostrarHistorial();
    }
}

window.onclick = function(event) {
    if (event.target == document.getElementById('modalServicio')) {
        cerrarModalServicio();
    }
    if (event.target == document.getElementById('modalHistorial')) {
        cerrarModalHistorial();
    }
}