## 1. UI Elements (Sidebar)
- [x] 1.1 Add a "Refresh Data" button (`st.sidebar.button`) to the sidebar.
- [x] 1.2 Add a number input (`st.sidebar.number_input`) for `N` (default 1, min 1) to specify how many rows to delete.
- [x] 1.3 Add a "Delete last N entries" button (`st.sidebar.button`).

## 2. Refresh Logic Implementation
- [x] 2.1 Bind the "Refresh Data" button click event to explicitly clear the Streamlit data cache (`st.cache_data.clear()`).
- [x] 2.2 Ensure the dashboard re-fetches the latest SQLite data seamlessly after clearing the cache.

## 3. Delete Logic Implementation
- [x] 3.1 Implement a safety check to disable or ignore the delete action if the user has selected "Todos" as the provider.
- [x] 3.2 Bind the "Delete" button click event to a new function that connects to `sqlite.db`.
- [x] 3.3 Construct and execute the SQL `DELETE` query: `DELETE FROM prompt_logs WHERE id IN (SELECT id FROM prompt_logs WHERE provider = ? ORDER BY timestamp DESC LIMIT ?)` using the `selected_provider` and `N`.
- [x] 3.4 Upon successful deletion, show a success message (`st.sidebar.success`), clear the data cache (`st.cache_data.clear()`), and force a UI rerun (`st.rerun()`) so the tables and charts update immediately.
