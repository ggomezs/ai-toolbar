## 1. Configuración del Adaptador (Extension)
- [x] 1.1 Localizar el archivo `extension/adapters.js`.
- [x] 1.2 Añadir un nuevo objeto al array `adapters.matchers` específico para Gemini.
- [x] 1.3 Configurar el `urlPattern` del nuevo matcher para atrapar llamadas POST a dominios `gemini.google.com` (ej: `/v1/Chat`, `/$rpc/...`).

## 2. Lógica de Extracción de Payloads Geminianos
- [x] 2.1 Implementar la función `extract(requestData)` dentro del matcher de Gemini.
- [x] 2.2 Diseñar la lógica de parseo seguro (`try-catch`) para decodificar los arrays anidados infames de Google buscando el string del prompt del usuario.
- [x] 2.3 Estructurar el retorno de la función `extract` para que devuelva `{ provider: "Google Gemini", raw_prompt: "texto", model: "gemini" }` o similar (y de manera opcional/best-effort detectar `has_attachments`).

## 3. Pruebas y Validación End-to-End
- [x] 3.1 Recargar la extensión en el navegador o invalidar la caché forzando un reinicio.
- [x] 3.2 Abrir `gemini.google.com`, redactar un prompt inocuo de prueba y enviarlo.
- [x] 3.3 Verificar que en la tabla `prompt_logs` de la SQLite local (`backend/sqlite.db`) aparece un nuevo registro insertado con el proveedor "Google Gemini" y el texto extraído correctamente.
- [x] 3.4 **(Prueba PII)**: Entrar a Gemini y redactar un prompt incluyendo un número de DNI o Tarjeta de Crédito falsos, y comprobar en el Insights Dashboard (o en SQLite) que el log ha sido tagueado unificadamente con `has_pii=True` y `pii_types` relleno, validando que el backend opera de manera completamente transversal.
