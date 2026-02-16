"""
==============================================================================
CORPORACAO SENCIENTE - Maestro API
WebSocket Hub para Controle Remoto de Agentes
Industry 7.0 Ready - Heartbeat + Comandos + Notificacoes
==============================================================================
"""

import asyncio
import os
from datetime import datetime, timedelta
from enum import Enum
from typing import Any

import httpx
import redis.asyncio as redis
import socketio
import structlog
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pydantic_settings import BaseSettings

# Configuracao estruturada de logs
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()


# ==============================================================================
# CONFIGURACOES
# ==============================================================================


class Settings(BaseSettings):
    """Configuracoes do Maestro."""

    redis_url: str = "redis://localhost:6379"
    heartbeat_interval: int = 10  # segundos
    heartbeat_miss_threshold: int = 3  # misses antes de CRITICAL
    telegram_bot_token: str | None = None
    discord_webhook_url: str | None = None
    infisical_token: str | None = None

    class Config:
        env_file = ".env"


settings = Settings()


# ==============================================================================
# MODELOS
# ==============================================================================


class AgentStatus(str, Enum):
    """Status possíveis de um agente."""

    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"
    CRITICAL = "CRITICAL"
    UNKNOWN = "UNKNOWN"


class AgentInfo(BaseModel):
    """Informacoes de um agente conectado."""

    agent_id: str
    name: str
    pc_name: str
    ip_address: str
    status: AgentStatus = AgentStatus.UNKNOWN
    last_heartbeat: datetime | None = None
    missed_heartbeats: int = 0
    connected_at: datetime | None = None
    metadata: dict[str, Any] = {}


class CommandRequest(BaseModel):
    """Requisicao de comando para agente."""

    agent_id: str
    command: str
    args: dict[str, Any] = {}


class CommandResponse(BaseModel):
    """Resposta de comando executado."""

    success: bool
    output: str | None = None
    error: str | None = None
    execution_time_ms: int = 0


# ==============================================================================
# APLICACAO FASTAPI
# ==============================================================================

app = FastAPI(
    title="Maestro API",
    description="WebSocket Hub para Controle Remoto de Agentes - Corporacao Senciente",
    version="1.0.0",
)

# Socket.IO server
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    logger=True,
    engineio_logger=True,
)

# Wrapper ASGI para Socket.IO
socket_app = socketio.ASGIApp(sio, app)

# Storage de agentes conectados
connected_agents: dict[str, AgentInfo] = {}

# Cliente Redis para pub/sub
redis_client: redis.Redis | None = None


# ==============================================================================
# LIFECYCLE
# ==============================================================================


@app.on_event("startup")
async def startup():
    """Inicializacao do servidor."""
    global redis_client
    redis_client = redis.from_url(settings.redis_url)
    logger.info("maestro_started", redis_url=settings.redis_url)

    # Iniciar loop de heartbeat
    asyncio.create_task(heartbeat_monitor())


@app.on_event("shutdown")
async def shutdown():
    """Encerramento do servidor."""
    if redis_client:
        await redis_client.close()
    logger.info("maestro_shutdown")


# ==============================================================================
# HEARTBEAT MONITOR
# ==============================================================================


async def heartbeat_monitor():
    """Loop de monitoramento de heartbeats."""
    while True:
        await asyncio.sleep(settings.heartbeat_interval)

        now = datetime.utcnow()
        threshold = timedelta(seconds=settings.heartbeat_interval * 2)

        for agent_id, agent in list(connected_agents.items()):
            if agent.last_heartbeat:
                time_since_heartbeat = now - agent.last_heartbeat

                if time_since_heartbeat > threshold:
                    agent.missed_heartbeats += 1

                    if agent.missed_heartbeats >= settings.heartbeat_miss_threshold:
                        if agent.status != AgentStatus.CRITICAL:
                            agent.status = AgentStatus.CRITICAL
                            logger.warning(
                                "agent_critical",
                                agent_id=agent_id,
                                missed=agent.missed_heartbeats,
                            )
                            await send_alert(
                                f"CRITICAL: Agente {agent.name} ({agent.pc_name}) nao responde!"
                            )
                    else:
                        agent.status = AgentStatus.OFFLINE
                        logger.info(
                            "agent_offline",
                            agent_id=agent_id,
                            missed=agent.missed_heartbeats,
                        )


async def send_alert(message: str):
    """Envia alerta para Telegram/Discord."""
    # Telegram
    if settings.telegram_bot_token:
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage",
                    json={"chat_id": "@senciente_alerts", "text": message},
                )
        except Exception as e:
            logger.error("telegram_alert_failed", error=str(e))

    # Discord
    if settings.discord_webhook_url:
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    settings.discord_webhook_url, json={"content": message}
                )
        except Exception as e:
            logger.error("discord_alert_failed", error=str(e))


# ==============================================================================
# SOCKET.IO EVENTS
# ==============================================================================


@sio.event
async def connect(sid, environ):
    """Handler de conexao Socket.IO."""
    logger.info("socket_connected", sid=sid)


@sio.event
async def disconnect(sid):
    """Handler de desconexao Socket.IO."""
    # Encontrar e remover agente
    for agent_id, agent in list(connected_agents.items()):
        if agent.metadata.get("sid") == sid:
            agent.status = AgentStatus.OFFLINE
            logger.info("agent_disconnected", agent_id=agent_id, name=agent.name)
            break


@sio.event
async def register(sid, data):
    """Registra um novo agente."""
    agent_id = data.get("agent_id")
    if not agent_id:
        return {"success": False, "error": "agent_id required"}

    agent = AgentInfo(
        agent_id=agent_id,
        name=data.get("name", agent_id),
        pc_name=data.get("pc_name", "unknown"),
        ip_address=data.get("ip_address", "unknown"),
        status=AgentStatus.ONLINE,
        connected_at=datetime.utcnow(),
        last_heartbeat=datetime.utcnow(),
        metadata={"sid": sid, **data.get("metadata", {})},
    )

    connected_agents[agent_id] = agent
    logger.info("agent_registered", agent_id=agent_id, name=agent.name)

    return {"success": True, "agent": agent.model_dump()}


@sio.event
async def heartbeat(sid, data):
    """Recebe heartbeat de um agente."""
    agent_id = data.get("agent_id")
    if agent_id in connected_agents:
        agent = connected_agents[agent_id]
        agent.last_heartbeat = datetime.utcnow()
        agent.missed_heartbeats = 0
        agent.status = AgentStatus.ONLINE

        # Atualizar metricas se fornecidas
        if "metrics" in data:
            agent.metadata["metrics"] = data["metrics"]

        return {"success": True}

    return {"success": False, "error": "agent not registered"}


@sio.event
async def command_response(sid, data):
    """Recebe resposta de comando executado."""
    command_id = data.get("command_id")
    logger.info("command_response_received", command_id=command_id, data=data)

    # Publicar no Redis para listeners
    if redis_client:
        await redis_client.publish(
            f"command_response:{command_id}", str(data)
        )


# ==============================================================================
# REST API ENDPOINTS
# ==============================================================================


@app.get("/health")
async def health():
    """Health check."""
    return {
        "status": "healthy",
        "agents_connected": len(connected_agents),
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/agents")
async def list_agents():
    """Lista todos os agentes conectados."""
    return {
        "agents": [agent.model_dump() for agent in connected_agents.values()],
        "total": len(connected_agents),
    }


@app.get("/agents/{agent_id}")
async def get_agent(agent_id: str):
    """Obtem informacoes de um agente especifico."""
    if agent_id not in connected_agents:
        raise HTTPException(status_code=404, detail="Agent not found")

    return connected_agents[agent_id].model_dump()


@app.post("/agents/{agent_id}/command")
async def send_command(agent_id: str, request: CommandRequest):
    """Envia comando para um agente."""
    if agent_id not in connected_agents:
        raise HTTPException(status_code=404, detail="Agent not found")

    agent = connected_agents[agent_id]
    if agent.status != AgentStatus.ONLINE:
        raise HTTPException(status_code=503, detail="Agent is not online")

    sid = agent.metadata.get("sid")
    if not sid:
        raise HTTPException(status_code=500, detail="Agent SID not found")

    command_id = f"cmd_{agent_id}_{datetime.utcnow().timestamp()}"

    # Enviar comando via Socket.IO
    await sio.emit(
        "command",
        {
            "command_id": command_id,
            "command": request.command,
            "args": request.args,
        },
        to=sid,
    )

    logger.info(
        "command_sent",
        agent_id=agent_id,
        command=request.command,
        command_id=command_id,
    )

    return {
        "success": True,
        "command_id": command_id,
        "message": f"Command '{request.command}' sent to agent {agent_id}",
    }


@app.post("/agents/{agent_id}/restart")
async def restart_agent(agent_id: str):
    """Reinicia um agente."""
    return await send_command(
        agent_id, CommandRequest(agent_id=agent_id, command="restart")
    )


@app.post("/agents/{agent_id}/stop")
async def stop_agent(agent_id: str):
    """Para um agente."""
    return await send_command(
        agent_id, CommandRequest(agent_id=agent_id, command="stop")
    )


@app.post("/agents/{agent_id}/screenshot")
async def screenshot_agent(agent_id: str):
    """Solicita screenshot de um agente."""
    return await send_command(
        agent_id, CommandRequest(agent_id=agent_id, command="screenshot")
    )


# ==============================================================================
# MAIN
# ==============================================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(socket_app, host="0.0.0.0", port=8080)
