## ADDED Requirements

### Requirement: Interactive Dashboard Initialization
The system MUST provide a standalone web interface built with Streamlit that connects to the existing `sqlite.db`.

#### Scenario: Security analyst accesses the dashboard
- **WHEN** the user navigates to the Streamlit local application URL (e.g., `http://localhost:8501`).
- **THEN** the dashboard successfully connects to the SQLite database and renders the main insights page without altering the database state.

### Requirement: KPI Visualization
The dashboard MUST calculate and display high-level metrics representing the global state of AI interactions.

#### Scenario: Viewing global telemetry counters
- **WHEN** the dashboard loads the datasets.
- **THEN** it displays the Total number of Prompts intercepted, the percentage (%) of prompts containing PII, and the total count of file attachments uploaded.

### Requirement: Temporal and Distribution Charts
The dashboard MUST provide visual charts to identify trends and data distributions over time.

#### Scenario: Exploring PII distribution
- **WHEN** the user scrolls to the charts section.
- **THEN** the system displays a line chart (or bar chart) showing prompt volume over time, and a pie chart breaking down the types of PII detected (e.g., DNI vs Credit Card).

### Requirement: Raw Data Exploration
The dashboard MUST allow analysts to drill down into the atomic telemetry logs to investigate specific events.

#### Scenario: Hunting for a specific PII exposure event
- **WHEN** the user interacts with the raw data table at the bottom of the dashboard.
- **THEN** the system displays a paginated or scrollable grid containing the actual `raw_prompt`, `timestamp`, `has_pii` flag, and `provider` information for detailed auditing.
