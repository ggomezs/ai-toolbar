## ADDED Requirements

### Requirement: Intercept Google Gemini Conversational API
The browser extension MUST intercept active chat submissions made on `gemini.google.com` to capture the raw text of the user's prompt.

#### Scenario: User submits a text prompt to Gemini
- **WHEN** the user types a message and hits send, triggering a POST request to a Gemini RPC/Chat endpoint (e.g., matching `*/$rpc/google.internal.workspace.v1.WorkspaceService/Chat*` or similar active chat endpoint).
- **THEN** the extension's interceptor MUST decode the JSON/Text payload, extract the literal string corresponding to the user's message, and dispatch a telemetry event with `provider: "Google Gemini"`.

### Requirement: Uniform Backend Telemetry
All Gemini prompts intercepted MUST be forwarded to the existing `/log` backend API and undergo the exact same PII scanning and SQLite persistence process as OpenAI prompts.

#### Scenario: Gemini prompt containing PII is sent to the backend
- **WHEN** the backend receives a POST `/log` payload where `provider` is "Google Gemini" and `raw_prompt` contains a Spanish DNI.
- **THEN** the backend process evaluates the text using `pii_scanner.py`, flags `has_pii: true`, appends `pii_types: "DNI"`, and saves the row into the `prompt_logs` table.

### Requirement: Attachment Awareness (Optional/Best-Effort)
The extension SHOULD attempt to identify if a file is attached to the Gemini prompt context, matching the capability behavior implemented for OpenAI.

#### Scenario: User uploads an image/document alongside their Gemini prompt
- **WHEN** the intercepted payload contains metadata structures indicating a file upload attached to the current message batch.
- **THEN** the extension MUST set `has_attachments: true` in the telemetry event sent to the backend.
