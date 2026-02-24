## Why

El uso de asistentes de IA se ha vuelto ubicuo, pero ocurre de forma fragmentada a través de múltiples proveedores web (ChatGPT, Claude, Perplexity, etc.). Existe la necesidad de tener un registro personal, centralizado y privado de todas estas interacciones ("shadow-logger") para poder auditar qué información se está compartiendo con terceros (especialmente Información Personal Identificable - PII) y para habilitar futuros análisis retrospectivos sobre el propio conocimiento y uso de estas herramientas. Esta primera fase construye los cimientos técnicos necesarios para capturar esta actividad de forma invisible directamente desde el navegador y persistirla en un entorno local seguro.

## What Changes

*   **[NEW]** Extensión de navegador (Chrome/Firefox) con permisos para interceptar tráfico de red.
*   **[NEW]** Script de inyección en el contexto de la página capaz de hacer de proxy sobre `window.fetch` / `XMLHttpRequest` para capturar payloads de salida.
*   **[NEW]** Sistema de adaptadores (`adapters.js`) para parsear peticiones específicas por proveedor, comenzando con OpenAI/ChatGPT.
*   **[NEW]** Servicio local en segundo plano (Backend) exponiendo una API REST (`POST /log`).
*   **[NEW]** Base de datos SQLite gestionada por el Backend Local para almacenar el registro de la actividad (proveedor, timestamp, texto del prompt).

## Capabilities

### New Capabilities
- `invisible-interception`: Mecanismo en el navegador para interceptar peticiones de red salientes hacia proveedores de IA de forma silente, sin alterar el DOM ni la experiencia de usuario.
- `local-persistence`: Servicio de backend local responsable de recibir payloads desde la extensión y almacenarlos de forma segura en una base de datos SQLite relacional.

### Modified Capabilities

## Impact

*   **Navegador del Usuario:** Instalación de una extensión con permisos elevados de lectura de red (`declarativeNetRequest`, `scripting`) sobre dominios específicos de IA.
*   **Sistema Local:** Ejecución de un proceso en segundo plano (servidor API) ocupando un puerto local (ej. 8000 o 3000) y consumiendo espacio en disco para el archivo SQLite.
*   **Privacidad:** Todos los datos interceptados fluyen hacia `localhost`; no hay transmisión de telemetría a servidores externos en esta fase.
