# AI Agent Toolbar & Shadow Logger

This project is a suite of tools designed to intercept, monitor, and analyze user interactions with AI models like ChatGPT and Google Gemini. It consists of a browser extension for capturing telemetry and a Python backend for storing, analyzing (PII detection), and visualizing the data.

## Components

The project is divided into two main components:

### 1. Browser Extension (`extension/`)
A Chrome/Edge browser extension that intercepts network requests to AI providers.
- **Supported Providers**: OpenAI (ChatGPT) and Google Gemini.
- **Capabilities**: Captures raw user prompts and detects if file attachments are present. It silently forwards this telemetry to the local backend.

### 2. Backend & Dashboard (`backend/`)
A Python-based server and analytics dashboard.
- **FastAPI Backend (`main.py`)**: Receives telemetry from the extension, scans the text for Personally Identifiable Information (PII) like emails, credit cards, and phone numbers using regex heuristics, and stores the results in a local SQLite database (`sqlite.db`).
- **Streamlit Dashboard (`dashboard.py`)**: A visual interface to analyze the captured prompts, view PII risk metrics, and filter data by provider. It includes utilities to refresh data and delete recent entries for testing.

---

## 🚀 Getting Started

### Prerequisites
- Google Chrome or Microsoft Edge browser.
- Python 3.10 or higher.
- `git`

### Step 1: Install the Browser Extension
1. Open your browser and navigate to the Extensions page (`chrome://extensions/` or `edge://extensions/`).
2. Enable **Developer mode** (usually a toggle in the top right corner).
3. Click **Load unpacked**.
4. Select the `extension/` folder from this repository.
5. The "Shadow Logger" extension should now be active. Pin it to your toolbar if desired.

### Step 2: Set Up the Backend
1. Open a terminal and navigate to the root of the project.
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Navigate to the `backend/` directory and install the required dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   pip install -r requirements-dashboard.txt
   ```

### Step 3: Run the Services
You need to run both the FastAPI server (to receive data) and the Streamlit dashboard (to view data). It's recommended to run these in separate terminal windows (with the `venv` activated in both).

**Terminal 1: Start the API Server**
```bash
cd backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
*The server will start listening for incoming prompts from the extension.*

**Terminal 2: Start the Insights Dashboard**
```bash
cd backend
python -m streamlit run dashboard.py
```
*Your browser should automatically open the dashboard at `http://localhost:8501`. If the database doesn't exist yet, it will be blank until you send your first prompt.*

### Step 4: Test the Pipeline
1. Ensure both the API server and Dashboard are running.
2. Go to [ChatGPT](https://chatgpt.com) or [Google Gemini](https://gemini.google.com).
3. Type a prompt (e.g., "Hello world, my phone number is 555-1234").
4. Go to your Streamlit dashboard and click **🔄 Refrescar Datos** in the sidebar. You should see your prompt logged and flagged for PII!

---

## Architecture details

- The extension uses `content_main.js` to monkey-patch `fetch` and `XMLHttpRequest` to intercept network traffic natively.
- Data is passed from the isolated world to the background service worker, which then uses a standard `fetch` call to POST the data to the FastAPI backend.
- The `adapters.js` file contains the specific extraction logic for each AI provider's unique JSON payload structures.
