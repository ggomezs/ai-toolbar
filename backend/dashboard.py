import streamlit as st
import sqlite3
import pandas as pd
import plotly.express as px
from datetime import datetime

# --- 3.1 Page Config ---
st.set_page_config(
    page_title="AI Agent Toolbar - Insights",
    page_icon="🛡️",
    layout="wide"
)

# --- 2.1 Access Database ---
@st.cache_data(ttl=60) # Cache the data for 60 seconds
def load_data():
    conn = sqlite3.connect("sqlite.db")
    df = pd.read_sql_query("SELECT * FROM prompt_logs", conn)
    conn.close()
    return df

# --- 2.2 Refine Data ---
def clean_data(df):
    if df.empty:
        return df
        
    # Convert string to datetime
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    
    # Handle NaNs
    df["has_pii"] = df["has_pii"].fillna(0).astype(int)
    df["has_attachments"] = df["has_attachments"].fillna(0).astype(int)
    df["pii_types"] = df["pii_types"].fillna("None")
    
    return df

def delete_last_n_for_provider(provider: str, n: int):
    """Deletes the N most recent records for the specified provider."""
    conn = sqlite3.connect("sqlite.db")
    cursor = conn.cursor()
    cursor.execute("""
        DELETE FROM prompt_logs 
        WHERE id IN (
            SELECT id FROM prompt_logs 
            WHERE provider = ? 
            ORDER BY timestamp DESC 
            LIMIT ?
        )
    """, (provider, n))
    conn.commit()
    conn.close()

def main():
    st.title("🛡️ AI Agent Toolbar - Insights Dashboard")
    st.markdown("Visualización analítica de telemetría y riesgos PII en prompts capturados.")

    raw_df = load_data()
    df = clean_data(raw_df.copy())
    
    if df.empty:
        st.info("No data available yet in the local database. Ensure the extension is intercepting prompts.")
        return

    # --- 3.4.1 Sidebar Filters ---
    st.sidebar.header("🔍 Filtros de Búsqueda")
    
    providers = ["Todos"] + df["provider"].unique().tolist()
    selected_provider = st.sidebar.selectbox("Proveedor AI", providers)
    
    if selected_provider != "Todos":
        df = df[df["provider"] == selected_provider]
        
    st.sidebar.divider()
    
    # --- 3.4.2 Acciones ---
    st.sidebar.header("⚙️ Acciones Útiles")
    
    if st.sidebar.button("🔄 Refrescar Datos", use_container_width=True, help="Fuerza a recargar los últimos datos guardados"):
        st.cache_data.clear()
        st.rerun()
        
    st.sidebar.subheader("Limpieza (Testing)")
    delete_n = st.sidebar.number_input("Entradas a eliminar", min_value=1, value=1, step=1, help="Elimina los N registros más recientes del proveedor actual")
    
    delete_disabled = selected_provider == "Todos"
    if st.sidebar.button(f"🗑️ Borrar últimos {delete_n}", disabled=delete_disabled, use_container_width=True):
        delete_last_n_for_provider(selected_provider, delete_n)
        st.sidebar.success(f"Eliminados {delete_n} registros de {selected_provider}.")
        st.cache_data.clear()
        st.rerun()

    # --- 3.2 Global KPIs ---
    st.header("📊 KPIs Globales")
    
    total_prompts = len(df)
    prompts_with_pii = df["has_pii"].sum()
    pct_pii = (prompts_with_pii / total_prompts * 100) if total_prompts > 0 else 0
    total_attachments = df["has_attachments"].sum()

    col1, col2, col3 = st.columns(3)
    col1.metric("Total Prompts", total_prompts)
    col2.metric("% Prompts con PII", f"{pct_pii:.1f}%", f"{prompts_with_pii} en riesgo", delta_color="inverse")
    col3.metric("Archivos Subidos", total_attachments)

    st.divider()

    # --- 3.3 Charts ---
    st.header("📈 Tendencias y Distribución")

    # 3.3.1 Line Chart: Volume over time
    col_chart1, col_chart2 = st.columns(2)
    
    with col_chart1:
        st.subheader("Volumen de Prompts (Temporal)")
        # Agrupar por fecha
        df['date'] = df['timestamp'].dt.date
        daily_counts = df.groupby('date').size().reset_index(name='count')
        
        fig_timeline = px.line(daily_counts, x='date', y='count', markers=True, 
                               labels={'date': 'Fecha', 'count': 'Número de Prompts'})
        fig_timeline.update_layout(xaxis=dict(tickformat="%Y-%m-%d"))
        st.plotly_chart(fig_timeline, use_container_width=True)

    # 3.3.2 Pie Chart: PII Types
    with col_chart2:
        st.subheader("Distribución de Riesgos PII")
        pii_only = df[df['has_pii'] == 1]
        
        if not pii_only.empty:
            # Expandir tipos multiples separados por coma if applicable
            all_pii_types = pii_only["pii_types"].str.split(",").explode()
            pii_counts = all_pii_types.value_counts().reset_index()
            pii_counts.columns = ['Tipo PII', 'Cantidad']
            
            fig_pie = px.pie(pii_counts, values='Cantidad', names='Tipo PII', 
                             hole=0.4, color_discrete_sequence=px.colors.sequential.RdBu)
            st.plotly_chart(fig_pie, use_container_width=True)
        else:
            st.success("🎉 No se ha detectado información PII en la selección actual.")

    st.divider()

    # --- 3.4.2 Raw Data DataFrame ---
    st.header("🗂️ Registro Crudo de Base de Datos")
    
    # Sorting descending
    st.dataframe(
        df.sort_values(by="timestamp", ascending=False),
        column_config={
            "id": "ID",
            "provider": "AI Provider",
            "model": "Model",
            "raw_prompt": st.column_config.TextColumn("Raw Prompt", width="large"),
            "timestamp": st.column_config.DatetimeColumn("Timestamp", format="YYYY-MM-DD HH:mm:ss"),
            "has_pii": st.column_config.CheckboxColumn("PII Risk?", default=False),
            "pii_types": "PII Categories",
            "has_attachments": st.column_config.CheckboxColumn("Attachment?", default=False)
        },
        hide_index=True,
        use_container_width=True
    )

if __name__ == "__main__":
    main()
