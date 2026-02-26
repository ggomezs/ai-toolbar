# Phase 2: PII Files & Attachments - Implementation Tasks

## 1. Evolución del Backend y Base de Datos
- [x] 1.1 Actualizar el modelo SQLAlchemy en `backend/database.py` añadiendo las columnas `has_pii` (Boolean), `pii_types` (String) y `has_attachments` (Boolean).
- [x] 1.2 Actualizar los esquemas Pydantic en `backend/main.py` (`PromptLogCreate` y `PromptLogResponse`) para aceptar y validar estos nuevos campos opcionales.

## 2. Motor de Escaneo PII (Python)
- [x] 2.1 Crear el archivo `backend/pii_scanner.py`.
- [x] 2.2 Implementar en `pii_scanner.py` la función heurística/Regex para detectar DNI/NIE español.
- [x] 2.3 Implementar en `pii_scanner.py` la función heurística/Regex para detectar Tarjetas de Crédito, incluyendo la validación del algoritmo de Luhn para evitar falsos positivos.
- [x] 2.4 Implementar en `pii_scanner.py` la función heurística/Regex para detectar cuentas formato IBAN europeo.
- [x] 2.5 Modificar el endpoint POST `/log` en `backend/main.py` para invocar el escáner sobre `raw_prompt` y poblar automáticamente `has_pii` y `pii_types` antes de guardar en SQLite.

## 3. Extensión: Interceptación de Archivos
- [x] 3.1 Añadir un nuevo *matcher* en `extension/adapters.js` que intercepte llamadas a `/backend-api/files` (o endpoints equivalentes de ChatGPT para subida de adjuntos).
- [x] 3.2 Extraer en el matcher el nombre del archivo (si es posible) y estructurar el payload para indicar que es un evento de adjunto (`has_attachments: true`).
- [x] 3.3 Revisar `extension/content_main.js` para asegurar que el proxy `fetch` puede procesar payloads tipo `FormData` sin lanzar excepciones, permitiendo el pase de datos binarios limpios al servidor de OpenAI mientras robamos los metadatos.

## 4. Pruebas y End-to-End
- [x] 4.1 Reiniciar el backend FastAPI forzando la recreación o actualización del archivo `sqlite.db` con el nuevo esquema.
- [ ] 4.2 Probar manualmente enviando un prompt limpio y verificar que `has_pii` sea `false`.
- [ ] 4.3 Probar manualmente enviando un prompt con un DNI y Tarjeta falsos, verificando que se marcan correctamente en base de datos.
- [ ] 4.4 Probar manualmente enviando un número de 16 dígitos aleatorio para comprobar que el algoritmo de Luhn bloquea el falso positivo.
- [ ] 4.5 Subir un archivo de prueba al chat y verificar que se registra el evento `has_attachments: true` en la SQLite local.
