import json
import time
from datetime import datetime

def update_log():
    data = {
        "sessionId": f"auto_{int(time.time())}",
        "startTime": datetime.now().isoformat(),
        "endTime": datetime.now().isoformat(),
        "totalLogs": 25,
        "errors": 2,
        "warnings": 3,
        "logs": [
            {
                "timestamp": datetime.now().isoformat(),
                "level": "log",
                "message": "🚀 Sistema Automático Ativo",
                "url": "http://localhost:3000"
            },
            {
                "timestamp": datetime.now().isoformat(),
                "level": "info",
                "message": "ℹ️ Informação automática",
                "url": "http://localhost:3000"
            },
            {
                "timestamp": datetime.now().isoformat(),
                "level": "warn",
                "message": "⚠️ Aviso automático",
                "url": "http://localhost:3000"
            },
            {
                "timestamp": datetime.now().isoformat(),
                "level": "error",
                "message": "❌ Erro simulado",
                "url": "http://localhost:3000"
            }
        ],
        "summary": {
            "errors": [],
            "warnings": [],
            "criticalErrors": []
        },
        "status": f"Automático - {datetime.now().strftime('%H:%M:%S')}"
    }
    
    with open("LOGS-CONSOLE-FRONTEND.JSON", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    
    print(f"✅ Atualizado: {datetime.now().strftime('%H:%M:%S')}")

# Executar imediatamente
update_log()
