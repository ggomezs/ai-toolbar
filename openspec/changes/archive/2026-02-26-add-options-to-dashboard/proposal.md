## Why

During testing and development, or when the extension captures unintended noise (false positives), the database can fill up with irrelevant prompts. Currently, there is no easy way to clear these from the UI. Additionally, users have to completely reload the Streamlit dashboard page to see new data arrive, which disrupts the user experience. Adding direct actions for deletion and manual refresh will improve usability and testing efficiency.

## What Changes

1. **Delete Action**: A new UI component will be added to the dashboard sidebar or main view allowing the user to delete the last `X` entries from the currently selected provider. The default value for `X` will be 1.
2. **Refresh Action**: A "Refresh Data" button will be added to force Streamlit to re-fetch the latest data from the SQLite database without requiring a full browser page reload.

## Capabilities

### New Capabilities
- `dashboard-actions`: Introduces interactive actions to mutate data (delete) and refresh state within the Streamlit dashboard.

### Modified Capabilities


## Impact

- `backend/dashboard.py`: Will require new UI elements (number input, buttons) and logic to execute SQL `DELETE` queries.
- `backend/sqlite.db`: The database will be modified when the delete action is triggered.
- No changes to the browser extension or main FastAPI application are expected for this specific capability.
