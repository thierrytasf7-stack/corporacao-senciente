from typing import List, Callable, Dict
from src.core.logger import get_logger

class Ether:
    """
    Sistema de Broadcast da Corporação (Pub/Sub).
    Permite que agentes e sistemas 'gritem' para o todo.
    """
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Ether, cls).__new__(cls)
            cls._instance.subscribers = {} # {channel: [callbacks]}
            cls._instance.logger = get_logger("ETHER")
        return cls._instance

    def subscribe(self, channel: str, callback: Callable):
        if channel not in self.subscribers:
            self.subscribers[channel] = []
        self.subscribers[channel].append(callback)
        self.logger.debug(f"Novo assinante no canal '{channel}'")

    def publish(self, channel: str, message: str, sender: str = "SYSTEM"):
        """Emite uma mensagem para o canal."""
        full_msg = f"[{sender} -> {channel}]: {message}"
        self.logger.info(f"📡 BROADCAST: {full_msg}")
        
        if channel in self.subscribers:
            for callback in self.subscribers[channel]:
                try:
                    callback(message, sender)
                except Exception as e:
                    self.logger.error(f"Erro no callback do Ether: {e}")

    def shout(self, message: str):
        """Atalho para canal global."""
        self.publish("GLOBAL", message, sender="CORE")

# Singleton helper
ether = Ether()
