## Context

The Streamlit dashboard (`backend/dashboard.py`) currently provides a read-only view of the prompt telemetry stored in `sqlite.db`. To improve utility during development and testing, users need actionable controls: one to delete recent, potentially noisy records, and another to manually force a data refresh without performing a hard browser reload.

## Goals / Non-Goals

**Goals:**
- Provide a UI control to delete the last `N` records for a specifically selected AI provider.
- Provide a UI control to clear the Streamlit data cache and fetch fresh data from the SQLite database.
- Ensure the UI remains responsive and automatically reflects the data state after these actions.

**Non-Goals:**
- Implementing complex, granular deletion (e.g., deleting specific records by ID or date range) is out of scope.
- Refactoring the entire dashboard data model; changes should be localized to the sidebar.

## Proposed Solution

1. **Delete Action**:
   - Add a number input (`st.sidebar.number_input`) in the sidebar for `N` (default 1, min 1, step 1) to determine how many recent records to delete.
   - Add a "Delete" button (`st.sidebar.button`).
   - When the button is clicked, execute a SQL query on `sqlite.db` that targets the current `selected_provider`.
   - The query will delete the latest `N` rows for that provider, ordered by `timestamp` descending.
   - Since deleting modifies the source data, the `@st.cache_data` must be cleared so the UI re-fetches the updated tables.

2. **Refresh Action**:
   - Add a "Refresh Data" button (`st.sidebar.button`) to the sidebar.
   - When clicked, it will simply invoke `st.cache_data.clear()` and optionally `st.rerun()` to immediately update the view without a browser-level reload.

## Data Model

No schema changes to `sqlite.db`. The application will merely execute `DELETE` statements against the existing `prompt_logs` table.

## API Design

No REST API changes. Interaction is purely local within the Streamlit application and direct SQLite file access.

## Decisions

- **Location of Controls**: The sidebar was chosen because the provider filter already resides there. Placing the delete action logically beneath the provider selection ensures users understand they are deleting records *for that specific provider*.
- **Direct SQL Execution**: Since the dashboard already connects directly to `sqlite.db` for reading, it is simplest to execute the `DELETE` directly rather than building a new REST endpoint in the main FastAPI application. This keeps the dashboard self-contained for these utility functions.

## Risks / Trade-offs

- **Accidental Deletion**: Because there is no granular row selection or confirmation modal (Streamlit's interactive model makes pure modals tricky), users could accidentally click the delete button. However, since this is primarily a local developer/testing tool, this risk is acceptable.
- **Provider Filtering Edge Case**: If the user selects "Todos" (All) providers, the delete query should ideally be disabled or it should delete the newest `N` records globally regardless of provider. To keep it safe and predictable, we will disable the delete button if "Todos" is selected.
