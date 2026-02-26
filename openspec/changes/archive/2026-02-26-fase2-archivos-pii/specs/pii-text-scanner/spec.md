## ADDED Requirements

### Requirement: PII Local Dictionary Scanning
The system MUST scan all complete intercepted text prompts locally (in the FastAPI backend) against a predefined set of Regular Expressions before persisting them to the SQLite database. The predefined types are Spanish DNI/NIE, Credit Card numbers (with Luhn validation), and European IBAN accounts.

#### Scenario: User submits a prompt containing a Spanish National ID (DNI)
- **WHEN** the captured `raw_prompt` contains a string matching a valid Spanish DNI/NIE format.
- **THEN** the backend sets `has_pii` to `true` and appends `"DNI"` to the `pii_types` string array in the database log.

#### Scenario: User submits a clean prompt without PII
- **WHEN** the captured `raw_prompt` does not trigger any of the localized PII Regex matchers.
- **THEN** the backend process sets `has_pii` to `false` and leaves `pii_types` empty.

### Requirement: PII False Positive Avoidance (Luhn)
The system MUST NOT flag arbitrary 16-digit numbers as Credit Cards unless they pass standard checksum validations (e.g., Luhn algorithm).

#### Scenario: User submits a prompt with a random 16-digit product ID
- **WHEN** the `raw_prompt` contains a 16-digit number that fails the Luhn check algorithm mathematically.
- **THEN** the backend DOES NOT flag the number as a Credit Card and `has_pii` remains `false`.
