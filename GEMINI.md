# infra402

Infrastructure leasing demo built around `x402` payments. This system allows users to lease and manage Proxmox LXC containers via an AI agent that handles `x402` payment negotiation automatically.

## Architecture

The project consists of three distinct services:

1.  **Frontend (`frontend/`)**
    *   **Tech:** Vite + React (TypeScript).
    *   **Role:** User interface for chatting with the AI agent.
    *   **Port:** 3000 (default)

2.  **Agent Backend (`backend-llm/`)**
    *   **Tech:** Python, FastAPI, `pydantic-ai`.
    *   **Role:** An AI agent that interprets user requests and calls the paywalled Proxmox API. It holds an EVM private key to sign `x402` payment headers when challenged by the paywall.
    *   **Port:** 8000

3.  **Paywalled API (`backend-proxmox/`)**
    *   **Tech:** Python, FastAPI, `x402` middleware.
    *   **Role:** Interfaces directly with the Proxmox VE host to create/manage containers. It enforces payment via `x402` for sensitive operations.
    *   **Port:** 4021

## Getting Started

### Prerequisites
*   Python 3.10+ and `uv` (dependency manager)
*   Node.js 18+ and `pnpm`
*   Proxmox VE host + API token
*   EVM wallet (Address for receiving, Private Key for sending)

### Configuration
Each service requires its own `.env` file. Refer to the respective directories or `README.md` for example configurations.

*   **`backend-proxmox/.env`**: Proxmox credentials (`PVE_HOST`, `PVE_TOKEN_ID`, etc.) and payment receiver config (`ADDRESS`, `NETWORK`).
*   **`backend-llm/.env`**: Agent wallet (`PRIVATE_KEY`) and LLM provider config (`LLM_PROVIDER`, `OPENAI_API_KEY`, etc.).
*   **`frontend/.env`**: API base URL (`VITE_CHAT_API_BASE=http://localhost:8000`).

### Running the Project

Run each service in a separate terminal:

**1. Paywalled API**
```bash
cd backend-proxmox
uv sync
uv run python main.py
```

**2. Agent Backend**
```bash
cd backend-llm
uv sync
uv run python pydantic-server.py
```

**3. Frontend**
```bash
cd frontend
pnpm install
pnpm dev
```

## Development Guidelines

### Structure & Organization
*   **Boundaries:** The frontend talks *only* to the Agent (`backend-llm`). The Agent talks to the Paywall (`backend-proxmox`). The Paywall talks to Proxmox.
*   **Shared Code:** `backend-proxmox/x402/` contains the `x402` library source code bundled for this project.
*   **Agent Tools:** When adding new functionality, implement the logic in `backend-proxmox` first, then expose it as a tool in `backend-llm` for the agent to use.

### Coding Style
*   **Python:** 4-space indent, snake_case. Use type hints and Pydantic models.
*   **TypeScript:** PascalCase for components. Functional components with hooks. Strictly typed (avoid `any`).

### Testing
*   **Manual:** Verify flows via the UI or by hitting endpoints directly.
*   **Agent:** `backend-llm/agentkit-test.py` contains probes for testing agent tooling.
*   **Paywall:** `backend-proxmox/API_USAGE.md` details payment flows and example requests.
