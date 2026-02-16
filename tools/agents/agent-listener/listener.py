import asyncio
import json
import logging
from typing import Any, Dict, Optional, Union
from pathlib import Path
from datetime import datetime
from uuid import uuid4

import aiohttp
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(title="Agent Listener API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
CONFIG = {
    "agent_url": "http://localhost:8000",
    "agent_token": "your-agent-token-here",
    "max_retries": 3,
    "retry_delay": 1.0,
    "timeout": 30.0,
}

# Data models
class CommandRequest(BaseModel):
    command: str
    args: Dict[str, Any]

class CommandResponse(BaseModel):
    success: bool
    result: Optional[Union[str, Dict[str, Any]]]
    error: Optional[str]

class AgentStatus(BaseModel):
    online: bool
    last_heartbeat: Optional[datetime]
    error: Optional[str]

# Agent connection state
agent_status = AgentStatus(online=False, last_heartbeat=None, error=None)

# Helper functions
async def call_agent(command: str, args: Dict[str, Any]) -> CommandResponse:
    """Call the agent with the given command and arguments"""
    url = f"{CONFIG['agent_url']}/execute"
    headers = {
        "Authorization": f"Bearer {CONFIG['agent_token']}",
        "Content-Type": "application/json",
    }
    data = {
        "command": command,
        "args": args,
    }

    for attempt in range(CONFIG['max_retries']):
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=data, headers=headers) as response:
                    if response.status == 200:
                        result = await response.json()
                        return CommandResponse(
                            success=True,
                            result=result,
                            error=None
                        )
                    else:
                        error = await response.text()
                        raise HTTPException(status_code=response.status, detail=error)
        except Exception as e:
            logger.error(f"Attempt {attempt + 1} failed: {e}")
            if attempt < CONFIG['max_retries'] - 1:
                await asyncio.sleep(CONFIG['retry_delay'])
            else:
                return CommandResponse(
                    success=False,
                    result=None,
                    error=str(e)
                )

# API endpoints
@app.post("/execute")
async def execute_command(request: CommandRequest):
    """Execute a command on the agent"""
    try:
        result = await call_agent(request.command, request.args)
        if result.success:
            return JSONResponse(content=result.result)
        else:
            raise HTTPException(status_code=500, detail=result.error)
    except Exception as e:
        logger.error(f"Error executing command: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status")
async def get_status():
    """Get the agent status"""
    return agent_status

@app.post("/heartbeat")
async def heartbeat():
    """Receive a heartbeat from the agent"""
    agent_status.online = True
    agent_status.last_heartbeat = datetime.now()
    agent_status.error = None
    return {"status": "ok"}

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
    )

# Main entry point
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
