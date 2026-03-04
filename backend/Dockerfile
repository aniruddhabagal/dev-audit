# ── Stage 1: Install dependencies with uv ────────────────
FROM python:3.12-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app
COPY pyproject.toml README.md ./

ENV UV_PROJECT_ENVIRONMENT="/opt/venv"
RUN uv sync --no-dev --no-install-project

# ── Stage 2: Runtime ─────────────────────────────────────
FROM python:3.12-slim

WORKDIR /app

COPY --from=builder /opt/venv /opt/venv
COPY . .

ENV PATH="/opt/venv/bin:$PATH"

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
