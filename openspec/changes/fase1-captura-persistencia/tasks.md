## 1. Configuración del Entorno y Repositorio

- [x] 1.1 Inicializar repositorio local Git en la carpeta del proyecto.
- [x] 1.2 Crear el repositorio remoto en GitHub y sincronizar el origen inicial.
- [x] 1.3 Crear entorno virtual de Python (`venv`) en la raíz del proyecto para el backend.
- [x] 1.4 Configurar `.gitignore` para excluir el entorno virtual, caché de Python y base de datos SQLite local.

## 2. Desarrollo del Backend Local (FastAPI)

- [x] 2.1 Especificar dependencias del backend (`fastapi`, `uvicorn`, `sqlalchemy`) en un archivo `requirements.txt`.
- [x] 2.2 Diseñar el esquema de base de datos SQLite usando SQLAlchemy (Tabla: `PromptLogs` con columnas: `id`, `provider`, `model`, `raw_prompt`, `timestamp`).
- [x] 2.3 Implementar el endpoint POST (`/log`) en FastAPI para recibir e inertar las interacciones entrantes en la base de datos, validando el payload con Pydantic.
- [x] 2.4 Configurar CORS en el backend de FastAPI para permitir solicitudes POST seguras desde los orígenes de las páginas web interceptadas y la extensión.

## 3. Desarrollo de la Extensión Web (Interceptación)

- [x] 3.1 Scaffolding de la extensión Web: Crear `manifest.json` (V3) con permisos (`declarativeNetRequest`, `scripting`, `storage`) y estructura inicial de carpetas.
- [x] 3.2 Desarrollar el `content_script.js` principal para inyectar limpiamente el proxy de red (`fetch`/`XHR`) en el contexto real de la página web visitada.
- [x] 3.3 Implementar el módulo `adapters.js` y programar el primer adaptador específico para extraer `{prompt, model, provider}` del tráfico JSON de OpenAI/ChatGPT.
- [x] 3.4 Programar la tubería de retransmisión: El script inyectado envía el payload al content_script aislado vía `postMessage`, y este hace un `sendMessage` al *Background Service Worker*.
- [x] 3.5 Programar el *Background Service Worker* (`background.js`) para recibir el payload estructurado y enviarlo vía API `fetch` POST a `http://localhost:8000/log`.

## 4. Pruebas y End-to-End Test

- [x] 4.1 Arrancar el servidor local FastAPI de forma nativa asegurando la creación del fichero `sqlite.db`.
- [x] 4.2 Cargar la extensión en modo "Developer" en el navegador de prueba (Chrome/Edge/Firefox).
- [x] 4.3 Realizar pruebas manuales de envío de prompts en plataformas compatibles (ChatGPT) verificando la correcta aparición de los registros insertados en la SQLite local.
