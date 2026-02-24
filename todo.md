# Historias de Usuario - Extension Toolbar IA

El proyecto se dividirá en 3 épicas o fases. Cada una de ellas debe gestionarse con su propio ciclo OpenSpec, utilizando los nombres de comando propuestos.

## Fase 1: El Tubo Tonto (Captura Cruda y Persistencia)

**Objetivo:** Demostrar que se puede extraer el texto del navegador y almacenarlo localmente de fondo en el disco duro.

**Comando Propuesto:** `/opsx-new fase1-captura-persistencia`

*   **Historia 1.1:** Inicializar la Extensión Web (Chrome/Firefox) con su Manifest V3, configurando permisos base (`declarativeNetRequest`, `scripting`) y la estructura de un *Service Worker* (script de background) funcional.
*   **Historia 1.2:** Implementar inyección de scripts en el contexto principal de la página (XHR/Fetch Proxy) capaz de interceptar tráfico de red saliente sin romper el DOM nativo ni alertar al usuario.
*   **Historia 1.3:** Crear la interfaz arquitectónica `adapters.js` e implementar el primer adaptador funcional (ej. ChatGPT Web) que parsee la petición y extraiga el formato estandarizado: `{ prompt, modelo, proveedor }`.
*   **Historia 1.4:** Crear un pequeño Backend Local (ej. Python FastAPI / Node.js Express) con un endpoint `POST /log` preparado para recibir los payloads estructurados de la extensión.
*   **Historia 1.5:** Conectar el Backend Local a una base de datos SQLite persistente, definiendo un esquema relacional básico, y almacenar en disco duro las peticiones crudas junto con su timestamp (marca temporal).

---

## Fase 2: Archivos y Enriquecimiento PII (El Cerebro Analítico)

**Objetivo:** Evolucionar el sistema para interceptar documentos adjuntos (contexto pesado) y clasificar automáticamente el nivel de privacidad de los datos compartidos.

**Comando Propuesto:** `/opsx-new fase2-archivos-pii`

*   **Historia 2.1:** Extender la lógica del interceptor Fetch en el navegador para soportar peticiones de múltiples partes (`multipart/form-data`), extrayendo el contenido binario (o las codificaciones base64) de los archivos enviados como adjuntos.
*   **Historia 2.2:** Actualizar el Backend Local y la BD SQLite para gestionar, almacenar localmente en disco, referenciar y enlazar dichos archivos binarios y documentos a su *prompt* origen correspondiente.
*   **Historia 2.3:** Integrar y aprovisionar un *Middleware* de Reconocimiento de Entidades Nombradas (NER) —como Microsoft Presidio o un LLM local mínimo— funcionando como paso intermedio en el Backend.
*   **Historia 2.4:** Desplegar un *pipeline* automatizado donde cada prompt y su contexto pasen por el NER en tránsito, generando un JSON de metadatos clasificatorios (nombres, DNI, IBAN, IPs, nivel de riesgo), que quedará pre-etiquetado en SQLite para búsquedas posteriores.

---

## Fase 3: Insights y Explotación (El Espejo)

**Objetivo:** Proveer sentido histórico a los datos capturados y habilitar la capacidad analítica (consultar y chatear con el propio historial unificado).

**Comando Propuesto:** `/opsx-new fase3-insights-dashboard`

*   **Historia 3.1:** Crear un Dashboard Local mínimo y funcional (ej. usando Streamlit, Next.js UI local, o Vistas estáticas servidas por el Backend) para poder visualizar la base de datos SQLite utilizando tablas filtrables y ordenables por fechas/etiquetas.
*   **Historia 3.2:** Implementar dentro del Dashboard librerías o widgets de gráficos estadísticos ("Analytics") para visualizar métricas clave (Uso por plataforma, Frecuencia de proveedores, Volumen de datos PII expuestos a lo largo del tiempo).
*   **Historia 3.3:** Crear un conector experimental que lea la Base de Datos Histórica con un motor de LLM Local (Ollama / Llama.cpp) y, a través de *System Prompts* dirigidos ("Retrieval-Augmented Generation"), permitir realizar búsquedas semánticas profundas (Ej: *'¿Qué le he contado de mi salud a Claude este mes?'*).
*   **Historia 3.4:** Añadir progresivamente soporte (a la Extensión y al Backend) para identificar, parsear y estandarizar el flujo de interceptación contra nuevos proveedores relevantes (Claude, Gemini, Perplexity, TypingMind, WebUI, etc).
