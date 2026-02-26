## Why

En las fases anteriores, habilitamos con éxito la interceptación, registro y escaneo PII de las interacciones realizadas con ChatGPT (OpenAI). Sin embargo, en un entorno corporativo o de usuario final avanzado, Google Gemini (`gemini.google.com`) es otra de las plataformas de IA generativa más utilizadas. Para asegurar una telemetría integral y evitar fugas de datos (Data Leakage) independientemente de la IA usada, es necesario ampliar nuestro "Shadow Logger" para interceptar y estandarizar también los prompts enviados a Google Gemini.

## What Changes

- **Nuevo frontend matcher**: Se añadirá una nueva Expresión Regular y lógica de extracción específica para la API de Google Gemini dentro de `extension/adapters.js`.
- **Compatibilidad estructural**: El extractor mapeará la compleja estructura de red de Gemini al formato universal de nuestra SQLite (`raw_prompt`, `timestamp`, `provider: "Google Gemini"`).
- **Herencia de motor PII**: El backend procesará los payloads de Gemini pasándolos tácitamente por el módulo `pii_scanner.py` ya existente, garantizando igualdad algorítmica.

## Capabilities

### New Capabilities
- `gemini-interceptor`: Lógica en el lado de la extensión capaz de entender, filtrar y decodificar el payload JSON/Stream que la web oficial de Google Gemini envía a sus servidores.

### Modified Capabilities
- (El backend de FastAPI no requiere modificaciones estructurales, ya que el esquema de base de datos y la recolección de métricas son agnósticos al proveedor).

## Impact

Este cambio amplía radicalmente el valor del AI Agent Toolbar al convertirlo en una herramienta "Multi-Vendor". A nivel técnico, implica hacer ingeniería inversa táctica a las peticiones POST de `gemini.google.com`. Ninguna de las arquitecturas existentes (OpenAI, SQLite, Dashboard) se verá afectada negativamente (Non-breaking change).
