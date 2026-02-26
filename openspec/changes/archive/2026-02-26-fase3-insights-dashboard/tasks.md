## 1. Configuración de Streamlit
- [x] 1.1 Crear un archivo `backend/requirements-dashboard.txt` (o actualizar el actual) añadiendo `streamlit`, `pandas` y `plotly`.
- [x] 1.2 Instalar las nuevas dependencias en el entorno virtual (`pip install -r requirements-dashboard.txt`).
- [x] 1.3 Crear el archivo principal de la aplicación: `backend/dashboard.py`.

## 2. Acceso a Datos (SQLite & Pandas)
- [x] 2.1 Implementar en `dashboard.py` una función cacheada (`@st.cache_data`) que conecte a `sqlite.db` y extraiga todos los registros de la tabla `prompt_logs` en un DataFrame de Pandas.
- [x] 2.2 Refinar el DataFrame limpiando valores nulos y parseando la columna `timestamp` a objetos `datetime`.

## 3. Construcción de la Interfaz Web (UI)
- [x] 3.1 Configurar el layout de Streamlit (`st.set_page_config`) con el título "AI Agent Toolbar - Insights" y layout amplio.
- [x] 3.2 Implementar la sección de **KPIs Globales**: mostrar Total de Prompts, % de Prompts con PII y Cantidad de Archivos Adjuntos usando `st.metric()`.
- [x] 3.3 Implementar la sección de **Gráficos**:
    - [x] 3.3.1 Crear un gráfico de líneas/barras agrupando el volumen de prompts por fecha/hora.
    - [x] 3.3.2 Crear un gráfico de tarta mostrando la distribución de `pii_types` (separando y contando los valores de la columna).
- [x] 3.4 Implementar la sección de **Exploración de Raw Data**:
    - [x] 3.4.1 Añadir filtros interactivos en el *sidebar* (por Proveedor o Rango de fechas).
    - [x] 3.4.2 Mostrar el DataFrame filtrado usando `st.dataframe()`, ordenado descendentemente por fecha.

## 4. Pruebas y Despliegue Local
- [x] 4.1 Arrancar el dashboard localmente ejecutando `streamlit run dashboard.py` dentro del venv.
- [x] 4.2 Verificar visualmente que los datos interceptados en las Fases 1 y 2 cargan correctamente y los gráficos interactivos responden a los filtros.
