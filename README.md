# CloudTasks

Aplicacion web para la gestion de tareas personales o de equipos de trabajo, desplegada en la nube con servicios administrados.

Nuestra URL es: https://cloudtasks-equipo-g17-6mybjdj0h-cordobamariacamila03-8373.vercel.app/

## Descripcion

CloudTasks es una aplicacion de gestion de tareas desarrollada como laboratorio del Seminario de Ingenieria de Software de la Universidad ICESI. Permite a los usuarios crear, visualizar, actualizar y eliminar tareas de forma segura y en tiempo real.

## Caracteristicas

- Crear tareas con titulo, descripcion, fecha limite y prioridad
- Visualizar tareas en una lista ordenada y filtrable
- Marcar completadas tareas con un clic
- Eliminar tareas con confirmacion
- Filtrar por estado (Todas, Pendientes, Completadas)
- Buscar tareas por titulo o descripcion
- Estadisticas en tiempo real (Total, Completadas, Pendientes)
- Validacion de formularios con mensajes de error
- Persistencia de datos en base de datos PostgreSQL administrada
- Acceso seguro con HTTPS (TLS/SSL)
- Manejo completo de excepciones en todas las operaciones

## Arquitectura

CloudTasks implementa una arquitectura moderna de 3 capas:

```
CAPA DE PRESENTACION (Frontend)
- HTML5: Estructura semantica
- CSS3: Diseño responsivo
- JavaScript ES6+: Logica de usuario

CAPA DE LOGICA (JavaScript/Async)
- Funciones CRUD asincronicas
- Validacion de datos
- Manejo de excepciones (try-catch)
- Comunicacion con backend

CAPA DE PERSISTENCIA (Backend & BD)
- Supabase: Backend as a Service
- PostgreSQL: Base de datos relacional
- API REST: Comunicacion automatica
- Row Level Security: Politicas de acceso
```

Flujo:

```
Usuario (Navegador) 
    |
    v
Vercel (Hosting + CDN)
    |
    v
JavaScript Async/Await
    |
    v
Supabase REST API
    |
    v
PostgreSQL (Base de Datos)
```

## Tecnologias Utilizadas

Frontend
- HTML5: Estructura semantica
- CSS3: Diseño responsivo y moderno
- JavaScript ES6+: Logica de la aplicacion, async/await

Control de Versiones
- Git: Control local de versiones
- GitHub: Repositorio remoto

Backend & Base de Datos
- Supabase: Backend as a Service (BaaS)
- PostgreSQL: Base de datos relacional administrada
- Supabase JavaScript Client: Libreria de comunicacion

Despliegue & Seguridad
- Vercel: Hosting y despliegue automatico desde GitHub
- Cloudflare: DNS, HTTPS, CDN (en proceso)

## Estructura del Proyecto

```
cloudtasks-equipoG17/
|- index.html              (Pagina principal)
|- css/
|  |- styles.css          (Estilos CSS)
|- js/
|  |- app.js              (Logica principal - CRUD)
|  |- config.js           (Configuracion de Supabase)
|- .gitignore             (Archivos a ignorar en Git)
|- README.md              (Este archivo)
|- .git/                  (Control de versiones)
```

## Instalacion & Uso Local

Requisitos Previos
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Editor de codigo (VSCode recomendado)
- Git instalado

## Problemas Encontrados y Soluciones

Problema 1: App no cargaba en Vercel (404)
- Causa: Archivo se llamaba index (1).html
- Solucion: Renombrar a index.html en la raiz

Problema 2: Supabase retornaba 404
- Causa: SUPABASE_URL tenia /rest/v1/ al final
- Solucion: Remover /rest/v1/ de la URL en config.js

Problema 3: Variable 'tareas' duplicada
- Causa: app.js estaba cargado dos veces en index.html
- Solucion: Limpiar index.html para incluir app.js solo una vez

## Integrantes del Grupo

- Maria Camila Cordoba (Usuario GitHub: MariaCamila07)
- Maria Alejandra Enriquez (Usuario GitHub: MariaEnriquez07)

Grupo: G7
Curso: Seminario de Ingenieria de Software
Universidad: ICESI
Profesores: Jose Luis Jurado Ph.D

## Flujo de Desarrollo (Git)

```
Desarrollo Local
    |
    v (git commit)
GitHub Repository
    |
    v (webhook)
Vercel (Deploy automatico)
    |
    v
Aplicacion en Linea
```

Cada "git push" a "main" dispara un despliegue automatico en Vercel.

## Etapas del Proyecto

ETAPA 1: Desarrollo Local
- Aplicacion funcional con HTML/CSS/JavaScript
- Persistencia en localStorage
- Control de versiones con Git

ETAPA 2: Despliegue en la Nube
- Integracion con Supabase (PostgreSQL)
- Deploy automatico en Vercel
- Acceso publico desde Internet

ETAPA 3: Dominio Personalizado (En Proceso)
- Solicitud de dominio en nic.eu.org
- Configuracion de Cloudflare (pendiente respuesta)
- HTTPS con certificado TLS
