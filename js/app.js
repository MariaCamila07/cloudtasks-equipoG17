// ===============================================
// CLOUDTASKS - APLICACIÓN DE GESTIÓN DE TAREAS
// Etapa 1: Desarrollo Local
// ===============================================

// Variables globales
let tareas = [];
let idContador = 1;
let filtroActual = 'todas';
let busquedaActual = '';

// ===============================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    inicializarAplicacion();
});

function inicializarAplicacion() {
    // Cargar tareas del localStorage si existen
    cargarTareasDelLocal();
    
    // Agregar event listeners
    agregarEventListeners();
    
    // Mostrar tareas iniciales
    mostrarTareas();
}

// ===============================================
// EVENT LISTENERS
// ===============================================

function agregarEventListeners() {
    // Formulario
    const formulario = document.getElementById('taskForm');
    formulario.addEventListener('submit', manejarCrearTarea);

    // Búsqueda
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', manejarBusqueda);

    // Filtros
    const filtros = document.querySelectorAll('.filter-btn');
    filtros.forEach(filtro => {
        filtro.addEventListener('click', manejarFiltro);
    });
}

// ===============================================
// CREAR TAREA
// ===============================================

function manejarCrearTarea(e) {
    e.preventDefault();

    // Obtener valores del formulario
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const deadline = document.getElementById('deadline').value;
    const priority = document.getElementById('priority').value;

    // Validar datos
    if (!validarFormulario(title, description, deadline)) {
        return;
    }

    // Limpiar mensajes de error
    limpiarErrores();

    // Crear objeto tarea
    const nuevaTarea = {
        id: idContador++,
        title: title,
        description: description,
        completed: false,
        created_at: new Date().toISOString(),
        deadline: deadline,
        priority: priority
    };

    // Agregar tarea al array
    tareas.push(nuevaTarea);

    // Guardar en localStorage
    guardarTareasEnLocal();

    // Mostrar mensaje de éxito
    mostrarMensajeExito('¡Tarea agregada correctamente!');

    // Limpiar formulario
    document.getElementById('taskForm').reset();

    // Actualizar vista
    mostrarTareas();
}

// ===============================================
// VALIDACIÓN DE FORMULARIO
// ===============================================

function validarFormulario(title, description, deadline) {
    let esValido = true;

    // Limpiar errores previos
    limpiarErrores();

    // Validar título
    if (title === '' || title.length < 3) {
        mostrarError('titleError', 'El título debe tener al menos 3 caracteres');
        esValido = false;
    }

    if (title.length > 100) {
        mostrarError('titleError', 'El título no puede exceder 100 caracteres');
        esValido = false;
    }

    // Validar descripción si la tiene
    if (description.length > 500) {
        mostrarError('descriptionError', 'La descripción no puede exceder 500 caracteres');
        esValido = false;
    }

    // Validar fecha límite si está presente
    if (deadline) {
        const fechaDeadline = new Date(deadline);
        const fechaHoy = new Date();
        
        if (fechaDeadline < fechaHoy) {
            mostrarError('deadlineError', 'La fecha límite no puede ser en el pasado');
            esValido = false;
        }
    }

    return esValido;
}

function mostrarError(elementId, mensaje) {
    const elemento = document.getElementById(elementId);
    elemento.textContent = mensaje;
    elemento.classList.add('show');
}

function limpiarErrores() {
    const errores = document.querySelectorAll('.error');
    errores.forEach(error => {
        error.textContent = '';
        error.classList.remove('show');
    });
}

function mostrarMensajeExito(mensaje) {
    const elemento = document.getElementById('successMessage');
    elemento.textContent = mensaje;
    elemento.classList.add('show');

    // Ocultar después de 3 segundos
    setTimeout(() => {
        elemento.classList.remove('show');
    }, 3000);
}

// ===============================================
// MOSTRAR TAREAS
// ===============================================

function mostrarTareas() {
    const tasksList = document.getElementById('tasksList');
    
    // Filtrar tareas según criterios
    let tareasAMostrar = filtrarTareas();

    // Si no hay tareas, mostrar mensaje vacío
    if (tareasAMostrar.length === 0) {
        tasksList.innerHTML = '<p class="empty-message">No hay tareas que coincidan con tu búsqueda.</p>';
        actualizarEstadisticas();
        return;
    }

    // Construir HTML de tareas
    tasksList.innerHTML = tareasAMostrar.map(tarea => crearElementoTarea(tarea)).join('');

    // Agregar event listeners a los elementos creados
    agregarEventListenersTareas();

    // Actualizar estadísticas
    actualizarEstadisticas();
}

function filtrarTareas() {
    let tareasFiltradasPorEstado = tareas;

    // Filtrar por estado (todas, pendientes, completadas)
    if (filtroActual === 'pendientes') {
        tareasFiltradasPorEstado = tareas.filter(t => !t.completed);
    } else if (filtroActual === 'completadas') {
        tareasFiltradasPorEstado = tareas.filter(t => t.completed);
    }

    // Filtrar por búsqueda
    if (busquedaActual.trim() !== '') {
        tareasFiltradasPorEstado = tareasFiltradasPorEstado.filter(t => 
            t.title.toLowerCase().includes(busquedaActual.toLowerCase()) ||
            t.description.toLowerCase().includes(busquedaActual.toLowerCase())
        );
    }

    return tareasFiltradasPorEstado;
}

function crearElementoTarea(tarea) {
    const fechaCreacion = formatearFecha(new Date(tarea.created_at));
    const fechaDeadline = tarea.deadline ? formatearFecha(new Date(tarea.deadline)) : 'Sin fecha';
    const esOverdue = verificarSiEsOverdue(tarea.deadline) && !tarea.completed;

    return `
        <div class="task-card ${tarea.completed ? 'completed' : ''}" data-id="${tarea.id}">
            <input 
                type="checkbox" 
                class="task-checkbox" 
                ${tarea.completed ? 'checked' : ''}
                data-id="${tarea.id}"
            >
            <div class="task-content">
                <div class="task-header">
                    <h3 class="task-title">${escapeHtml(tarea.title)}</h3>
                    <span class="priority-badge priority-${tarea.priority}">
                        ${tarea.priority}
                    </span>
                </div>
                ${tarea.description ? `<p class="task-description">${escapeHtml(tarea.description)}</p>` : ''}
                <div class="task-meta">
                    <div class="task-meta-item">
                        📅 Creada: <span class="task-date-badge">${fechaCreacion}</span>
                    </div>
                    <div class="task-meta-item">
                        ⏰ Límite: 
                        <span class="task-date-badge ${esOverdue ? 'task-date-overdue' : ''}">
                            ${fechaDeadline}
                            ${esOverdue ? ' (VENCIDA)' : ''}
                        </span>
                    </div>
                </div>
            </div>
            <div class="task-actions">
                <button class="btn btn-success btn-sm btn-complete" data-id="${tarea.id}">
                    ${tarea.completed ? '↩️ Deshacer' : '✓ Completar'}
                </button>
                <button class="btn btn-danger btn-sm btn-delete" data-id="${tarea.id}">
                    🗑️ Eliminar
                </button>
            </div>
        </div>
    `;
}

function agregarEventListenersTareas() {
    // Event listeners para checkboxes
    const checkboxes = document.querySelectorAll('.task-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            toggleCompletarTarea(id);
        });
    });

    // Event listeners para botones de completar
    const botonesCompletar = document.querySelectorAll('.btn-complete');
    botonesCompletar.forEach(boton => {
        boton.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            toggleCompletarTarea(id);
        });
    });

    // Event listeners para botones de eliminar
    const botonesEliminar = document.querySelectorAll('.btn-delete');
    botonesEliminar.forEach(boton => {
        boton.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            eliminarTarea(id);
        });
    });
}

// ===============================================
// OPERACIONES CRUD
// ===============================================

function toggleCompletarTarea(id) {
    const tarea = tareas.find(t => t.id === id);
    if (tarea) {
        tarea.completed = !tarea.completed;
        guardarTareasEnLocal();
        mostrarTareas();
    }
}

function eliminarTarea(id) {
    // Confirmar eliminación
    if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
        tareas = tareas.filter(t => t.id !== id);
        guardarTareasEnLocal();
        mostrarTareas();
        mostrarMensajeExito('Tarea eliminada correctamente');
    }
}

// ===============================================
// FILTROS Y BÚSQUEDA
// ===============================================

function manejarFiltro(e) {
    const filtro = e.target.getAttribute('data-filter');
    filtroActual = filtro;

    // Actualizar clase activa
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');

    // Mostrar tareas filtradas
    mostrarTareas();
}

function manejarBusqueda(e) {
    busquedaActual = e.target.value;
    mostrarTareas();
}

// ===============================================
// ESTADÍSTICAS
// ===============================================

function actualizarEstadisticas() {
    const totalTareas = tareas.length;
    const tareasCompletadas = tareas.filter(t => t.completed).length;
    const tareasPendientes = totalTareas - tareasCompletadas;

    document.getElementById('totalTasks').textContent = totalTareas;
    document.getElementById('completedTasks').textContent = tareasCompletadas;
    document.getElementById('pendingTasks').textContent = tareasPendientes;
}

// ===============================================
// PERSISTENCIA DE DATOS (LocalStorage)
// ===============================================

function guardarTareasEnLocal() {
    // Guardar en localStorage
    localStorage.setItem('cloudtasks_tareas', JSON.stringify(tareas));
    localStorage.setItem('cloudtasks_contador', idContador.toString());
}

function cargarTareasDelLocal() {
    // Cargar del localStorage
    const tareasGuardadas = localStorage.getItem('cloudtasks_tareas');
    const contadorGuardado = localStorage.getItem('cloudtasks_contador');

    if (tareasGuardadas) {
        tareas = JSON.parse(tareasGuardadas);
    }

    if (contadorGuardado) {
        idContador = parseInt(contadorGuardado);
    }
}

// ===============================================
// FUNCIONES AUXILIARES
// ===============================================

function formatearFecha(fecha) {
    const opciones = { year: 'numeric', month: 'short', day: 'numeric' };
    return fecha.toLocaleDateString('es-ES', opciones);
}

function verificarSiEsOverdue(deadline) {
    if (!deadline) return false;
    const fechaDeadline = new Date(deadline);
    const fechaHoy = new Date();
    return fechaDeadline < fechaHoy;
}

function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

// ===============================================
// FUNCIONES DE DEPURACIÓN (Opcional)
// ===============================================

function exportarTareas() {
    console.log('Tareas actuales:', tareas);
    return JSON.stringify(tareas, null, 2);
}

function limpiarTodosDatos() {
    if (confirm('¿Estás seguro? Esta acción eliminará TODAS las tareas.')) {
        tareas = [];
        idContador = 1;
        guardarTareasEnLocal();
        mostrarTareas();
        console.log('Todos los datos han sido eliminados.');
    }
}

// Funciones disponibles en consola para pruebas
window.debugCloudTasks = {
    exportarTareas,
    limpiarTodosDatos,
    verTareas: () => console.table(tareas)
};
