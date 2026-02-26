# Phase 3 Insights Dashboard - Technical Design

## Context
La Fase 1 y 2 implementaron un sistema de interceptación de prompts y subida de archivos que persisten una gran cantidad de telemetría valiosa en una base de datos SQLite local (`backend/sqlite.db`), incluyendo banderas de detección de variables PII. Actualmente carecemos de una interfaz para visualizar esta información, lo que obliga a analizar la base de datos a mano.

## Goals / Non-Goals

**Goals:**
- Proporcionar a los analistas de seguridad un "volante visual" en tiempo real sobre el uso de la IA en los endpoints que tienen la Toolbar instalada.
- Leer la base de datos `sqlite.db` existente para graficar métricas volumétricas y ratios de PII.
- Fomentar un despliegue rápido y Python-nativo usando Streamlit que pueda correr junto al backend actual.

**Non-Goals:**
- No se busca desarrollar una aplicación web pesada estilo React/Vue, sino una herramienta rápida de insights en Python puro.
- No se alterará la lógica de intercepción del lado del cliente ni la ingesta actual.
- No se incorporarán sistemas de autenticación o roles en este MVP del dashboard.

## Design

El script de *Streamlit* (`backend/dashboard.py` o `dashboard/app.py`) actuará como un consumidor de datos de solo lectura.

**1. Data Access Layer:**
Utilizaremos `SQLAlchemy` o `sqlite3` junto con `pandas` para ingerir las filas de la tabla `prompt_logs`. `pandas` procesará los campos `timestamp` para agrupaciones temporales y pivotará las columnas `has_pii` y `has_attachments`.

**2. Visualización:**
La UI se dividirá estructuradamente:
- **Top Level (Métricas Clave):** Usando `st.metric()` para mostrar Prompts Totales, % Prompts con PII y % Prompts con Adjuntos.
- **Gráficos:** `plotly.express` o los gráficos nativos de Streamlit para renderizar:
  - Serie temporal de uso (Prompts por día/hora).
  - Tarta de distribución de tipos de PII (ej. DNI vs Tarjetas).
- **Explorador Raw:** Una tabla interactiva (`st.dataframe()`) mostrando los últimos eventos de la base de datos, coloreando en rojo aquellos con `has_pii=True`.

## Decisions

- **Framework de visualización:** Se elige *Streamlit* porque permite crear cuadros de mando analíticos directamente en Python, aprovechando el ecosistema de datos (Pandas) ya familiar para equipos backend, ahorrando el tiempo y coste de desarrollar/soportar un marco SPA de JS.
- **Acoplamiento a base de datos:** El dashboard leerá directamente del archivo `sqlite.db`. Esto acopla la lectura a la ruta local, pero al ser un sidecar o una herramienta paralela al backend de ingesta, es un trade-off aceptable para simplicidad extrema en Fase 3.

## Risks / Trade-offs

- **Bloqueos SQLite (Database Locks):** Dado que SQLite no maneja de forma ideal la concurrencia alta entre escrituras (prompts entrando) y lecturas (dashboard analizando todos los datos), lecturas inmensas del dashboard podrían entrar en conflicto con la inserción puntual desde la extensión, aunque muy marginalmente en escala individual.
- **Migración a Producción:** Streamlit por defecto expone un servidor HTTP sin autenticar. Al pasar esta prueba de concepto a entorno corporativo será necesario aislar el dashboard detrás de un proxy (Nginx) con autenticación (OAUTH) si contiene datos PII filtrados.
