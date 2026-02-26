## Why

Actualmente capturamos de manera exitosa los prompts, detectamos PII (DNIs, Tarjetas de Crédito, IBANs) e interceptamos los eventos de subida de archivos adjuntos, guardando toda esta telemetría en una base de datos SQLite local. Sin embargo, no disponemos de una forma visual y analítica para consumir esta información. La creación de un Dashboard interactivo usando Streamlit permitirá a los equipos de seguridad consultar rápidamente tendencias de uso, picos de riesgo (subidas indiscriminadas masivas de PII o adjuntos) e investigar interacciones sospechosas con la IA sin tener que hacer consultas SQL manuales.

## What Changes

- **Nuevo frontend de analítica**: Creación de una aplicación web independiente con Streamlit (`dashboard/app.py`).
- **Conexión a SQLite**: El nuevo módulo leerá los datos directamente desde `backend/sqlite.db` u ofrecerá una abstracción de acceso a datos si fuera necesario a través del framework de Pandas.
- **Gráficos y Métricas**: Incorporar KPIs generales (total de prompts, prompts con PII, archivos subidos), gráficos de series temporales (volumen por día/hora) y gráficos de tarta (distribución de modelos de IA y tipos de PII).
- **Tabla de logs**: Añadir un componente de visualización de datos crudos (data table) con capacidad de buscar y filtrar por fecha, proveedor o ID, paginando los resultados si es necesario.
- **Dependencias adicionales**: Actualizar o crear un nuevo `requirements.txt` en el backend (o en su propia carpeta `dashboard`) incluyendo `streamlit`, `pandas`, `plotly` u otras bibliotecas de visualización.

## Capabilities

### New Capabilities
- `metrics-dashboard`: Una interfaz gráfica construida en Streamlit para visualizar estadísticas de uso, riesgos de PII y explorar el registro de telemetría de manera amigable.

### Modified Capabilities
- (Ninguna existente se ve afectada, el backend y la extensión seguirán operando igual).

## Impact

Este cambio introduce un nuevo subsistema de servidor (el proceso de Streamlit) que debe correr en paralelo al proceso actual de FastAPI. No hay código de impacto negativo conocido (breaking changes) en el proxy (frontend) ni en la API (backend), ya que el dashboard simplemente lee pasivamente los datos generados por Phase 1 y Phase 2.
