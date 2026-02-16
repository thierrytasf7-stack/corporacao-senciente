import logging
import os
import sys
from logging.handlers import RotatingFileHandler
from datetime import datetime

class GenesisLogger:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(GenesisLogger, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        self.logger = logging.getLogger("CorporacaoSenciente")
        self.logger.setLevel(logging.DEBUG)

        # Formato: [2026-02-05T14:00:00] [INFO] [KERNEL] Mensagem
        formatter = logging.Formatter(
            '[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s',
            datefmt='%Y-%m-%dT%H:%M:%S'
        )

        # Garantir diretório
        log_dir = os.path.join("data", "logs")
        os.makedirs(log_dir, exist_ok=True)
        
        # Arquivo: genesis.log (Rotação 5MB, mantém 5 backups)
        file_path = os.path.join(log_dir, "genesis.log")
        file_handler = RotatingFileHandler(file_path, maxBytes=5*1024*1024, backupCount=5, encoding='utf-8')
        file_handler.setFormatter(formatter)
        
        # Console Handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(formatter)

        self.logger.addHandler(file_handler)
        self.logger.addHandler(console_handler)
    
    def get_logger(self, component_name="SYSTEM"):
        return logging.getLogger(f"CorporacaoSenciente.{component_name}")

# Helper para uso rápido
def get_logger(component):
    return GenesisLogger().get_logger(component)
