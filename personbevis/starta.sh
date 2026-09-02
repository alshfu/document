#!/bin/bash
# Startar personbevis-verktyget som Flask-app på http://127.0.0.1:5001
cd "$(dirname "$0")"
exec .venv/bin/python app.py
