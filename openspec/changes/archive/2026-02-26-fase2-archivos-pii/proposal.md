## Why

A medida que los empleados utilizan herramientas de IA generativa como ChatGPT, existe un alto riesgo de fuga de datos confidenciales (Data Loss Prevention - DLP). Es crucial para la seguridad corporativa identificar proactivamente cuándo se están enviando Datos de Identidad Personal (PII) críticos, como DNIs, tarjetas de crédito o cuentas bancarias, ya sea introducidos directamente en el texto del prompt o subidos mediante documentos adjuntos. Esto permitirá tener visibilidad del riesgo, registrar la incidencia, y en el futuro habilitar alertas preventivas.

## What Changes

- Implementación de un motor de escaneo (basado en Regex/heurística) para detectar patrones PII (DNI, Tarjetas, IBAN, etc.) en el texto plano del prompt interceptado.
- Ampliación de los *adapters* de la extensión para identificar rutas de red exclusivas de la subida de archivos (endpoints de *upload/attachments*).
- Capacidad de etiquetar (*flag*) los registros en la base de datos (SQLite) local, indicando si el mensaje o sus adjuntos contienen material sensible.

## Capabilities

### New Capabilities

- `pii-text-scanner`: Capacidad para analizar el texto capturado de los prompts y buscar patrones Regex correspondientes a documentos de identidad y datos bancarios de alto riesgo.
- `attachment-interceptor`: Capacidad para interceptar las llamadas de red donde se suben archivos físicos a la IA, extrayendo metadatos del archivo y relacionándolo con el prompt para evaluar el riesgo de fuga.

### Modified Capabilities


## Impact

- **Extensión Web:** Se modificarán `adapters.js` y `content_main.js` para capturar nuevas llamadas de red referidas a la subida de archivos.
- **Backend (FastAPI):** Se actualizarán los esquemas Pydantic del endpoint `/log` para procesar banderas booleanas de PII y listas de adjuntos.
- **Base de Datos (SQLite):** El modelo SQLAlchemy de la tabla `prompt_logs` necesitará nuevas columnas (ej. `has_pii`, `pii_types`, `has_attachments`) o la creación de una tabla anexa (relacional) para el registro estructurado de esta información.
