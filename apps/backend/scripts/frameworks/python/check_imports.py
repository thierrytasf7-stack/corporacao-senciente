#!/usr/bin/env python3
"""
Script para verificar se frameworks Python estão instalados
"""

import sys
import json

checks = {
    "python": True,
    "crewai": False,
    "langchain": False,
    "langgraph": False,
}

try:
    import crewai
    checks["crewai"] = True
except (ImportError, AttributeError):
    # CrewAI tem bug conhecido no Windows (signal.SIGHUP não existe)
    # Isso não impede o uso, apenas marca como não disponível
    pass

try:
    import langchain
    checks["langchain"] = True
except ImportError:
    pass

try:
    import langgraph
    checks["langgraph"] = True
except ImportError:
    pass

print(json.dumps(checks))
sys.exit(0)
