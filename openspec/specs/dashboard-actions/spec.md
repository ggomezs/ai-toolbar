## ADDED Requirements

### Requirement: Delete Recent Prompts
The Streamlit dashboard MUST provide a mechanism to delete the `N` most recent prompt entries for the currently selected AI provider.

#### Scenario: User deletes the last entry to remove noise
- **WHEN** the user selects an AI provider (e.g., "Google Gemini") from the sidebar.
- **AND** the user sets the number of entries to delete (`N`) to 1 (the default).
- **AND** the user clicks the "Delete last N entries" button.
- **THEN** the dashboard backend MUST execute a `DELETE` SQL query to remove the 1 most recent row for "Google Gemini" from the `prompt_logs` table.
- **AND** the dashboard MUST display a success message confirming the deletion.
- **AND** the dashboard MUST automatically refresh its visualizations and data tables to reflect the removal of the deleted entry.

#### Scenario: User deletes multiple recent entries
- **WHEN** the user sets `N` to a number greater than 1 (e.g., 5).
- **AND** the user clicks the "Delete last N entries" button.
- **THEN** the dashboard backend MUST execute a `DELETE` SQL query targeting the `N` most recent rows for the selected provider.

### Requirement: Manual Data Refresh
The Streamlit dashboard MUST provide a button to manually refresh the data from the SQLite database without requiring a full browser page reload.

#### Scenario: User refreshes data after new prompts are logged
- **WHEN** the user clicks the "Refresh Data" button.
- **THEN** the dashboard MUST clear its cached data (using `st.cache_data.clear()` or equivalent mechanism).
- **AND** the dashboard MUST re-execute the SQL queries to fetch the latest `prompt_logs` and `pii_logs`.
- **AND** the dashboard MUST update all metrics, charts, and tables with the fresh data.
