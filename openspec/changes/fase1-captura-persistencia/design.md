## Context

El objetivo de esta fase es establecer la infraestructura base para capturar los *prompts* que el usuario envía a herramientas de IA en la web (inicialmente OpenAI/ChatGPT) y almacenarlos en local de forma estructurada. Las interacciones de estado deben ser "silenciosas" para no interferir con la UX nativa de las herramientas web.

## Goals / Non-Goals

**Goals:**
- Desplegar una extensión de navegador Manifest V3 capaz de inyectar scripts en el contexto de la página web objetivo.
- Interceptar llamadas `fetch` / `XHR` a endpoints específicos de IA.
- Parsear el JSON de salida usando un patrón de "Adapters" para estandarizar el payload.
- Transmitir el payload estandarizado a un servidor local.
- Crear un backend local ligero en Python usando **FastAPI**.
- Persistir los logs recibidos en una base de datos **SQLite** usando SQLAlchemy (o SQLModel) para definición de esquemas.

**Non-Goals:**
- Interceptar archivos binarios adjuntos (`multipart/form-data`) en esta fase (se abordará en la Fase 2).
- Procesamiento de IA (NER/Insights) sobre el texto capturado (se abordará en Fases 2 y 3).
- Proporcionar una Interfaz de Usuario (Dashboard) para leer los logs (se abordará en la Fase 3).
- Dar soporte a navegadores móviles o aplicaciones de escritorio.

## Decisions

- **Arquitectura de Interceptación (Fetch Proxy vs DOM Mutation):**
  - **Decisión:** Sobrescribir `window.fetch` nativo mediante un Content Script inyectado en el contexto `MAIN` de la página.
  - **Razón:** Es mucho más resiliente a los cambios continuos de UI/CSS que aplican los proveedores web. El esquema de la API interna cambia de forma mucho menos frecuente que el DOM.
- **Backend Stack (Python + FastAPI vs Node.js):**
  - **Decisión:** Se utilizará **Python 3.10+ con FastAPI**.
  - **Razón:** FastAPI permite levantar un servidor local extremadamente rápido, con validación de datos automática vía Pydantic (perfecto para tipar los payloads entrantes). Además, y más importante, Python sentará las bases idóneas para la Fase 2 y 3, donde integraremos librerías de Inteligencia Artificial (Microsoft Presidio para NER y frameworks de LLM) que son predominantemente del ecosistema Python. 
- **Persistencia (SQLite):**
  - **Decisión:** SQLite alojado en el disco local del usuario.
  - **Razón:** Cero configuración requerida, fácil de hacer backups enviando un solo archivo `.db`, y suficientemente robusto para el volumen de datos de un usuario individual.

## Risks / Trade-offs

- **[Riesgo]** Content Security Policy (CSP) del sitio web bloqueando el POST hacia `localhost`.
  - **Mitigación:** La inyección en el contexto de la página (MAIN world) solo extraerá los datos y usará `window.postMessage` para enviar el payload al Content Script aislado (ISOLATED world). Desde allí, se usará `chrome.runtime.sendMessage` para que el `Background Service Worker` de la extensión (al que no le afectan las CSP del sitio) sea quien haga el `fetch POST` final hacia `localhost:8000`.
- **[Riesgo]** El usuario cambia de puerto o FastAPI falla al arrancar.
  - **Mitigación:** La extensión de navegador almacenará el payload temporalmente en su memoria o `chrome.storage.local` y reintentará el envío si `localhost` no responde, garantizando que no se pierdan *prompts* si el backend local está apagado temporalmente.
