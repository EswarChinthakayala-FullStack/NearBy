#!/usr/bin/env python
"""Lightweight Backend Starter (Low-resource mode)."""
import sys
import uvicorn

if __name__ == "__main__":
    host = "127.0.0.1"
    port = 8000
    if len(sys.argv) > 1 and sys.argv[1] == "prod":
        print(f"Starting Production API on http://{host}:{port}")
        uvicorn.run("app.main:app", host=host, port=port, reload=False)
    else:
        print(f"Starting Development API on http://{host}:{port}")
        uvicorn.run("app.main:app", host=host, port=port, reload=True)
