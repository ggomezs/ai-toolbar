# Attachment Interceptor

## Purpose
Intercept attached files sent in chat to prevent unauthorized exfiltration of documents.

## Requirements

### Requirement: Independent File-Upload Interception (ChatGPT)
The browser extension's proxy MUST listen for matching URL signatures that indicate a file upload event to ChatGPT's backend (e.g., `/backend-api/files` or `/backend-api/attachments`).

#### Scenario: User drags and drops a PDF into the ChatGPT web interface
- **WHEN** the browser executes a POST request to a ChatGPT file upload endpoint containing a `FormData` payload or filename reference in the properties.
- **THEN** the `content_main.js` proxy intercepts the POST request and dispatches an event containing the `file_name` and `timestamp`.

### Requirement: Persisting Upload Events to SQLite
The FastAPI backend MUST expose an endpoint to receive file upload events and save them into a new `attachments` relational table or by using the `has_attachments` flag in the main prompt.

#### Scenario: The Shadow Logger dispatches a captured upload event
- **WHEN** the backend receives an HTTP POST to `/metrics/attachment` (or `/log` with an attachment property array).
- **THEN** it inserts a corresponding row in the SQLite database associated with the timestamp/session to alert security that a physical file was uploaded to an external LLM.
