// ===============================================
// CLOUDTASKS - APLICACIÓN DE GESTIÓN DE TAREAS
// Etapa 1: Desarrollo Local
// ===============================================

// Variables globales
let tareas = [];
let filtroActual = 'todas';
let busquedaActual = '';
let cargando = false; 

// ===============================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    inicializarAplicacion();
});

async function inicializarAplicacion() {
    try {
        mostrarCargando(true);
        agregarEventListeners();
        await cargarTareasDesdeSupabase();
        mostrarCargando(false);
    } catch (error) {
        console.error('Error al inicializar:', error);
        mostrarError('Error al inicializar la aplicación: ' + error.message);
        mostrarCargando(false);
    }
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
// OPERACIONES CON SUPABASE
// ===============================================

// CREATE - Crear nueva tarea
async function crearTareaEnSupabase(titulo, descripcion, deadline, prioridad) {
    try {
        const { data, error } = await supabaseClient
            .from('tasks')
            .insert([
                {
                    title: titulo,
                    description: descripcion || null,
                    deadline: deadline || null,
                    priority: prioridad,
                    completed: false
                }
            ])
            .select();

        if (error) throw error;
        console.log('Tarea creada:', data);
        return data[0];
    } catch (error) {
        console.error('Error al crear tarea:', error);
        throw error;
    }
}

// READ - Cargar todas las tareas
async function cargarTareasDesdeSupabase() {
    try {
        mostrarCargando(true);

        const { data, error } = await supabaseClient
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        tareas = data || [];
        console.log('Tareas cargadas:', tareas);
        mostrarTareas();

        return tareas;
    } catch (error) {
        console.error('Error al cargar tareas:', error);
        mostrarError('Error al cargar tareas: ' + error.message);
        throw error;
    } finally {
        mostrarCargando(false);
    }
}

// UPDATE - Actualizar estado de tarea
async function actualizarTareaEnSupabase(id, datos) {
    try {
        const { error } = await supabaseClient
            .from('tasks')
            .update(datos)
            .eq('id', id);

        if (error) throw error;
        console.log('Tarea actualizada:', id);
        return true;
    } catch (error) {
        console.error('Error al actualizar tarea:', error);
        throw error;
    }
}

// DELETE - Eliminar tarea
async function eliminarTareaDeSupabase(id) {
    try {
        const { error } = await supabaseClient
            .from('tasks')
            .delete()
            .eq('id', id);

        if (error) throw error;
        console.log('Tarea eliminada:', id);
        return true;
    } catch (error) {
        console.error('Error al eliminar tarea:', error);
        throw error;
    }
}


// ===============================================
// CREAR TAREA
// ===============================================

async function manejarCrearTarea(e) {
    e.preventDefault();

    if (cargando) return;

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const deadline = document.getElementById('deadline').value;
    const priority = document.getElementById('priority').value;

    if (!validarFormulario(title, description, deadline)) {
        return;
    }

    limpiarErrores();

    try {
        mostrarCargando(true);

        const nuevaTarea = await crearTareaEnSupabase(title, description, deadline, priority);
        tareas.unshift(nuevaTarea);

        mostrarMensajeExito('¡Tarea agregada correctamente!');
        document.getElementById('taskForm').reset();
        mostrarTareas();

    } catch (error) {
        mostrarError('Error al crear tarea: ' + error.message);
    } finally {
        mostrarCargando(false);
    }
}

// ===============================================
// VALIDACIÓN DE FORMULARIO
// ===============================================

function validarFormulario(title, description, deadline) {
    let esValido = true;
    limpiarErrores();

    if (title === '' || title.length < 3) {
        mostrarError('titleError', 'El título debe tener al menos 3 caracteres');
        esValido = false;
    }

    if (title.length > 100) {
        mostrarError('titleError', 'El título no puede exceder 100 caracteres');
        esValido = false;
    }

    if (description.length > 500) {
        mostrarError('descriptionError', 'La descripción no puede exceder 500 caracteres');
        esValido = false;
    }

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

    setTimeout(() => {
        elemento.classList.remove('show');
    }, 3000);
}

function mostrarCargando(mostrar) {
    cargando = mostrar;
}

// ===============================================
// MOSTRAR TAREAS
// ===============================================

function mostrarTareas() {
    const tasksList = document.getElementById('tasksList');
    let tareasAMostrar = filtrarTareas();

    if (tareasAMostrar.length === 0) {
        tasksList.innerHTML = '<p class="empty-message">No hay tareas que coincidan con tu búsqueda.</p>';
        actualizarEstadisticas();
        return;
    }

    tasksList.innerHTML = tareasAMostrar.map(tarea => crearElementoTarea(tarea)).join('');
    agregarEventListenersTareas();
    actualizarEstadisticas();
}

function filtrarTareas() {
    let tareasFiltradasPorEstado = tareas;

    if (filtroActual === 'pendientes') {
        tareasFiltradasPorEstado = tareas.filter(t => !t.completed);
    } else if (filtroActual === 'completadas') {
        tareasFiltradasPorEstado = tareas.filter(t => t.completed);
    }

    if (busquedaActual.trim() !== '') {
        tareasFiltradasPorEstado = tareasFiltradasPorEstado.filter(t => 
            t.title.toLowerCase().includes(busquedaActual.toLowerCase()) ||
            (t.description && t.description.toLowerCase().includes(busquedaActual.toLowerCase()))
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
    const checkboxes = document.querySelectorAll('.task-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            toggleCompletarTarea(id);
        });
    });

    const botonesCompletar = document.querySelectorAll('.btn-complete');
    botonesCompletar.forEach(boton => {
        boton.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            toggleCompletarTarea(id);
        });
    });

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

async function toggleCompletarTarea(id) {
    try {
        const tarea = tareas.find(t => t.id === id);
        if (!tarea) return;

        const nuevoEstado = !tarea.completed;
        mostrarCargando(true);

        await actualizarTareaEnSupabase(id, { completed: nuevoEstado });
        tarea.completed = nuevoEstado;
        mostrarTareas();

    } catch (error) {
        mostrarError('Error al actualizar tarea: ' + error.message);
    } finally {
        mostrarCargando(false);
    }
}

async function eliminarTarea(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
        try {
            mostrarCargando(true);

            await eliminarTareaDeSupabase(id);
            tareas = tareas.filter(t => t.id !== id);
            mostrarTareas();
            mostrarMensajeExito('Tarea eliminada correctamente');

        } catch (error) {
            mostrarError('Error al eliminar tarea: ' + error.message);
        } finally {
            mostrarCargando(false);
        }
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
window.debugCloudTasks = {
    exportarTareas: () => { console.log('Tareas actuales:', tareas); return JSON.stringify(tareas, null, 2); },
    verTareas: () => console.table(tareas),
    recargarTareas: () => cargarTareasDesdeSupabase()
};