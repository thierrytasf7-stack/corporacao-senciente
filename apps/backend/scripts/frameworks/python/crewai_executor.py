#!/usr/bin/env python3
"""
Executor CrewAI via Node.js
"""
import sys
import json
import os
from dotenv import load_dotenv

load_dotenv()

try:
    from crewai import Crew, Agent, Task, Process
    CREWAI_AVAILABLE = True
except ImportError:
    CREWAI_AVAILABLE = False
    print(json.dumps({"error": "CrewAI não instalado"}))
    sys.exit(1)

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Configuração não fornecida"}))
        sys.exit(1)

    try:
        config = json.loads(sys.argv[1])
        
        # Criar agentes
        agents = []
        for agent_config in config.get("agents", []):
            agent = Agent(
                role=agent_config.get("role", "Agent"),
                goal=agent_config.get("goal", ""),
                backstory=agent_config.get("backstory", ""),
                verbose=agent_config.get("verbose", False),
            )
            agents.append(agent)
        
        # Criar tasks
        tasks = []
        for task_config in config.get("tasks", []):
            task = Task(
                description=task_config.get("description", ""),
                agent=agents[task_config.get("agent_index", 0)] if agents else None,
            )
            tasks.append(task)
        
        # Criar crew
        crew = Crew(
            agents=agents,
            tasks=tasks,
            process=Process.sequential,
            verbose=config.get("verbose", False),
        )
        
        # Executar
        result = crew.kickoff()
        
        print(json.dumps({
            "success": True,
            "result": str(result),
        }))
    except Exception as e:
        print(json.dumps({
            "error": str(e),
            "success": False,
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()




























