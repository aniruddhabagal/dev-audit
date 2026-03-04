# DevAudit Backend

Multi-agent AI-powered codebase auditing platform — FastAPI backend.

## Quick Start

```bash
# Create venv and install
python -m venv venv
.\venv\Scripts\Activate.ps1   # Windows
pip install -e ".[dev]"

# Run the dev server
uvicorn app.main:app --reload

# Run tests
pytest
```

## Stack

- **FastAPI** — async REST API
- **Beanie** — async MongoDB ODM
- **Redis** — caching + pub/sub (Week 2)
- **LangGraph** — multi-agent orchestration (Week 2)
