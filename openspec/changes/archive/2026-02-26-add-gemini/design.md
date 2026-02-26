# Add Gemini - Technical Design

## Context
Actualmente, la extensión del *AI Agent Toolbar* intercepta exitosamente las llamadas de red (fetch) que la interfaz web de ChatGPT hace a su backend (`/backend-api/conversation`). El usuario ha solicitado ampliar esta cobertura para incluir Google Gemini, interceptando sus prompts y aplicando el mismo tratamiento de telemetría y escaneo PII (Fase 1 y Fase 2).

## Goals / Non-Goals

**Goals:**
- Identificar y capturar el endpoint específico de Google Gemini utilizado para enviar prompts del usuario.
- Extraer el texto bruto (`raw_prompt`) y, si es posible, identificar eventos de subida de archivos adjuntos.
- Reutilizar al 100% la infraestructura existente de FastAPI y SQLite.

**Non-Goals:**
- No se creará una API separada para Gemini en el backend; todo debe unificarse bajo la misma tabla `prompt_logs` con la columna `provider` variando.
- No se modificará el PII Scanner ni el Dashboard (ya que son agnósticos al proveedor).

## Design

La implementación técnica ocurrirá casi en su totalidad dentro del script inyectado de la extensión (`extension/adapters.js`).

**1. Intercepción de Red (El Matcher)**
El tráfico web de Google Gemini no usa APIs REST estándar como OpenAI, sino variaciones pesadas de RPC/Batched JSON sobre el dominio `gemini.google.com`. 
El nuevo matcher en `adapters.js` buscará URLs que coincidan con el patrón común de envío de mensajes de Gemini (típicamente endpoints que terminan en `/$rpc/google.internal.workspace.v1.WorkspaceService/Chat` o similares, como `chat/streaming`). 

**2. Extracción del Payload (Parseo de Gemini)**
Gemini estructura sus payloads en formatos de arrays anidados muy ofuscados (Ej: `[[[ "Texto del prompt", ... ]]]`). 
La función `extract` del nuevo matcher implementará una heurística de búsqueda recursiva o decodificación de la posición en el array específica donde Google inyecta el texto del usuario escrito en la caja de chat.

**Modelo de Datos Resultante:**
```json
{
  "provider": "Google Gemini",
  "model": "gemini-auto",
  "raw_prompt": "<Texto extraído de la estructura anidada>",
  "timestamp": "2026-02-26T...",
  "has_attachments": false 
}
```
*(Nota: la detección de adjuntos de Gemini se intentará si la estructura expone claramente metadatos de archivos, de lo contrario se priorizará el texto).*

## Decisions

- **Adaptador Unificado:** La lógica específica de Gemini vivirá encapsulada dentro de un nuevo objeto en el array `adapters.matchers` del archivo `adapters.js`. El proxy de `content_main.js` no necesitará saber nada de Gemini; simplemente iterará sobre los matchers y llamará a la API existente que ya está perfectamente documentada.

## Risks / Trade-offs

- **Formatos ofuscados (Obfuscation Risk):** Google suele cambiar frecuentemente la estructura de sus arrays de datos por motivos de optimización interna o prevención de scraping. El parser de JSON del adaptador de Gemini corre el riesgo de romperse más a menudo que el de OpenAI. Este es un trade-off aceptado en este tipo de utilidades.
