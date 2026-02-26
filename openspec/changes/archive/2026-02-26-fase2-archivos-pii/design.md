## Context

Tras el éxito de la Fase 1 ("El Tubo Tonto"), la extensión de navegador ya es capaz de interceptar de forma silenciosa e invisible los prompts enviados a ChatGPT web y reenviarlos al backend local basado en FastAPI, donde se almacenan en una base de datos SQLite.
Actualmente se guarda texto bruto sin ningún tipo de análisis. El siguiente paso natural en la evolución hacia una herramienta DLP (Data Loss Prevention) es dotar al sistema de inteligencia básica para detectar si el usuario está enviando información sensible (PII) o subiendo archivos (los cuales son una caja negra de alto riesgo).

## Goals / Non-Goals

**Goals:**
- Detectar patrones PII críticos (DNI/NIE español, Tarjetas de crédito, IBAN europeo) en el texto de los prompts.
- Detectar cuándo un usuario sube un archivo adjunto a ChatGPT y registrar sus metadatos (nombre, extensión).
- Almacenar estos hallazgos estructuradamente en la base de datos local junto con el prompt original.
- Realizar el escaneo de PII de forma eficiente sin penalizar la experiencia de usuario en el navegador.

**Non-Goals:**
- **NO** bloquear ni censurar la petición original hacia OpenAI; la extensión sigue actuando como un *shadow logger* pasivo.
- **NO** descargar ni almacenar el contenido binario/físico de los archivos adjuntos (solo capturaremos el nombre/metadatos por razones de almacenamiento e interceptación pasiva).
- **NO** utilizar servicios externos de NLP o APIs comerciales para detectar PII; todo se basará en lógica local (Expresiones Regulares / Heurística) para garantizar privacidad *local-first*.

## Decisions

1. **Ubicación del Escáner PII (Backend vs Frontend):**
   - *Decisión:* El escaneo mediante Regex se realizará **en el Backend (FastAPI)**, no en la extensión de Chrome.
   - *Justificación:* Mantiene la extensión web ligera, rápida y resistente a fallos. Centralizar la lógica en Python permite usar librerías más complejas si fuera necesario en el futuro (ej. Presidio de Microsoft para PII) y facilita la actualización de los patrones sin tener que recompilar/recargar la extensión del navegador.

2. **Captura de Archivos (Frontend):**
   - *Decisión:* Se ampliará `adapters.js` para añadir un nuevo *matcher* que escuche peticiones POST hacia los endpoints de subida de archivos de OpenAI (típicamente `/backend-api/files` o similar).
   - *Justificación:* Al interceptar el JSON o FormData de la subida, extraeremos el "nombre del archivo". En la lógica del adaptador, esta alerta de subida se puede vincular temporalmente en la extensión o enviarse como un evento separado al backend.

3. **Evolución del Esquema de Base de Datos (SQLite):**
   - *Decisión:* Se ampliará la tabla `prompt_logs` existente añadiendo columnas informativas.
   - *Justificación:* Añadiremos `has_pii` (Boolean), `pii_types` (String, separada por comas ej: "DNI,IBAN") y `has_attachments` (Boolean). Alternativamente, para metadatos complejos de archivos, se creará una tabla relacionada `attachments` unida por Foreign Key a `prompt_logs`. Optaremos por la tabla relacionada `attachments` para mantener limpieza.

4. **Flujo de PII en FastAPI:**
   - *Decisión:* Crear un submódulo o servicio dentro de FastAPI (ej: `pii_scanner.py`) que ofrezca una función `scan_text(prompt: str) -> list[str]`. Antes de invocar `session.add(db_log)`, se llamará a este escáner para poblar la columna `pii_types`.

## Risks / Trade-offs

- **Opacidad de OpenAI con Archivos:** Es posible que OpenAI utilice firmas temporales, WebSockets o envíos directos a Storage que compliquen capturar qué archivo concreto se junta a qué prompt. 
  - *Mitigación:* Si la vinculación exacta Prompt-Archivo es compleja por la red anónima de OpenAI, se optará por un modelo de "eventos aislados": registrar que "A tal hora se subió el archivo X" independientemente de si logramos unirlo al prompt de "hazme un resumen de esto", ya que el valor DLP se mantiene (saber qué sale de la empresa).
- **Falsos Positivos en PII:** Las Expresiones Regulares para Tarjetas o IBAN pueden generar falsos positivos con series numéricas largas (ej. IDs de tickets, códigos de barras).
  - *Mitigación:* Refinar los regex (comprobación del algoritmo de Luhn para tarjetas de crédito o suma de control del IBAN en Python) en lugar de dependencias ciegas a patrones genéricos.
