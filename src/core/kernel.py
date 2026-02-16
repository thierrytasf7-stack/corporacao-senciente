import json
import time
import sys
import os
from typing import Dict, Any
from src.core.logger import get_logger

class Kernel:
    def __init__(self):
        self.config: Dict[str, Any] = {}
        self.is_running = False
        self.identity = None
        self.logger = get_logger("KERNEL")

    def boot(self):
        """Inicializa os sistemas centrais."""
        self.logger.info("🟢 Inicializando sequencia de boot...")
        self._load_identity()
        
        name = self.identity.get('name', 'Unknown')
        self.logger.info(f"🟢 Identidade carregada: {name}")
        self.logger.info("🟢 Genesis Logger ativado. Memoria persistente iniciada.")
        
        self.is_running = True
        return True

    def _load_identity(self):
        """Carrega a identidade do arquivo JSON."""
        try:
            path = os.path.join("config", "identity", "brand_identity.json")
            with open(path, "r", encoding="utf-8") as f:
                self.identity = json.load(f)
        except Exception as e:
            self.logger.error(f"🔴 Erro ao carregar identidade: {e}")
            self.identity = {"name": "Corporacao Senciente (Fallback)"}

    def run(self):
        """Loop principal de execução."""
        self.logger.info("🟢 Sistema ONLINE. Aguardando input...")
        print("Digite 'exit' para sair.")
        
        while self.is_running:
            try:
                # Simulação de REPL básico (Read-Eval-Print Loop)
                print(f"[{self.identity.get('codename', 'AIOS')}]> ", end='', flush=True)
                
                try:
                    user_input = input().strip()
                except EOFError:
                    self.shutdown()
                    break

                if not user_input:
                    continue
                
                if user_input.lower() in ["exit", "stop", "shutdown"]:
                    self.shutdown()
                    break
                
                if user_input.lower() == "ping":
                    self.logger.info(f"Pong! (Uptime: {time.process_time()}s)")
                    continue

                if user_input.lower() == "whoami":
                    self.logger.info(f"Eu sou a {self.identity.get('name')}. Arquetipo: {self.identity.get('archetype')}.")
                    continue

                # Processamento genérico
                self.logger.debug(f"Recebido: {user_input}")

            except KeyboardInterrupt:
                self.shutdown()
            except Exception as e:
                self.logger.error(f"🔴 Erro no loop: {e}")

    def shutdown(self):
        """Encerra o sistema com segurança."""
        self.logger.warning("🟡 Iniciando protocolo de desligamento...")
        self.is_running = False
        self.logger.info("🔴 Sistema OFFLINE.")
        sys.exit(0)