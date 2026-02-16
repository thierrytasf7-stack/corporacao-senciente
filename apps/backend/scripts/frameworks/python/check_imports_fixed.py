#!/usr/bin/env python3
"""
Script para verificar se frameworks Python estão instalados
Versão com workaround para Windows
"""
import sys
import json
import os

# Workaround para Windows - signal.SIGHUP não existe
if sys.platform == 'win32':
    import signal
    if not hasattr(signal, 'SIGHUP'):
        signal.SIGHUP = 1
    if not hasattr(signal, 'SIGUSR1'):
        signal.SIGUSR1 = 10
    if not hasattr(signal, 'SIGUSR2'):
        signal.SIGUSR2 = 12

checks = {
    "python": True,
    "crewai": False,
    "langchain": False,
    "langgraph": False,
    "platform": sys.platform,
}

try:
    import crewai
    checks["crewai"] = True
except Exception as e:
    checks["crewai_error"] = str(e)[:100]

try:
    import langchain
    checks["langchain"] = True
except Exception as e:
    checks["langchain_error"] = str(e)[:100]

try:
    import langgraph
    checks["langgraph"] = True
except Exception as e:
    checks["langgraph_error"] = str(e)[:100]

print(json.dumps(checks))
sys.exit(0)




























