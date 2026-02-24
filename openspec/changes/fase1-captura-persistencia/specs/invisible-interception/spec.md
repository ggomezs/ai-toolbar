## ADDED Requirements

### Requirement: intercept-ai-requests
The system SHALL intercept outgoing network requests destined for supported AI provider domains without altering the native user interface.

#### Scenario: Intercepting a ChatGPT prompt
- **WHEN** the user submits a prompt on chatgpt.com
- **THEN** the extension intercepts the outbound fetch/XHR request
- **AND** the payload is not blocked or modified before reaching the destination

### Requirement: parse-provider-payloads
The system MUST extract the raw prompt text, the model used, and the provider name from the intercepted network request using specific provider adapters.

#### Scenario: Parsing an OpenAI payload
- **WHEN** an intercepted request matches the OpenAI adapter schema (e.g., `/backend-api/conversation`)
- **THEN** the adapter extracts the user's message, the model identifier, and labels the provider as 'OpenAI'

### Requirement: silent-background-relay
The system SHALL securely transmit the extracted payload data to a local background service without prompting the user or interfering with the browser's performance.

#### Scenario: Relaying captured data
- **WHEN** the adapter successfully extracts the prompt data
- **THEN** a background script sends an asynchronous POST request to the local backend URL
- **AND** handles network failures silently without surfacing errors to the user UI
