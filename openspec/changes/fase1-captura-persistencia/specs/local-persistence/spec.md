## ADDED Requirements

### Requirement: expose-local-logging
The system SHALL expose an HTTP POST endpoint on localhost capable of receiving structured AI interaction logs securely without public internet exposure.

#### Scenario: Receiving a structured log from the extension
- **WHEN** the local backend receives a POST request at `/log` with valid JSON data
- **THEN** backend validates the JSON structure against the expected schema
- **AND** responds with HTTP 200 OK or appropriate error codes without leaking internal stack traces

### Requirement: persist-logs-relational
The system MUST parse validated incoming logs and store the core properties (prompt text, model, provider, timestamp) into a persistent local SQLite database.

#### Scenario: Writing a captured prompt to SQLite
- **WHEN** a valid JSON payload is successfully parsed by the backend
- **THEN** an `INSERT` operation saves the interaction details into a designated table within the SQLite database
- **AND** the transaction is committed reliably to disk
