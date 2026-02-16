'use client'

import { useEffect, useState, useCallback } from 'react'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  HardDrive, 
  MemoryStick,
  Monitor,
  Power,
  RefreshCw,
  Wifi,
  WifiOff,
  XCircle,
  Terminal,
  Camera
} from 'lucide-react'
import { useMaestro } from '@/lib/maestro'
import { AgentTerminal } from '@/components/AgentTerminal'

// Types
interface Agent {
  agent_id: string
  name: string
  pc_name: string
  ip_address: string
  status: 'ONLINE' | 'OFFLINE' | 'CRITICAL'
  last_heartbeat: string | null
  metrics?: {
    cpu_percent: number
    memory_percent: number
    disk_percent: number
  }
}

// Status indicator component
function StatusIndicator({ status }: { status: Agent['status'] }) {
  const styles = {
    ONLINE: 'bg-neon-green animate-pulse',
    OFFLINE: 'bg-gray-500',
    CRITICAL: 'bg-neon-red animate-pulse',
  }
  
  return (
    <span className={`inline-block w-3 h-3 rounded-full ${styles[status]}`} />
  )
}

// Client-only time display component
function ClientTime({ date }: { date: string | null }) {
  const [time, setTime] = useState<string>('--:--:--')
  
  useEffect(() => {
    if (date) {
      setTime(new Date(date).toLocaleTimeString())
    }
  }, [date])
  
  return <span>{time}</span>
}

// Agent card component
function AgentCard({ agent, onCommand, loading }: { agent: Agent; onCommand: (cmd: string) => void; loading?: string }) {
  const isBusy = loading && loading !== 'terminal'
  return (
    <div className={`
      relative p-4 rounded-lg border transition-all duration-300
      ${agent.status === 'ONLINE' 
        ? 'border-neon-green/30 bg-neon-green/5' 
        : agent.status === 'CRITICAL'
        ? 'border-neon-red/30 bg-neon-red/5'
        : 'border-gray-700 bg-gray-900/50'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Monitor className="w-5 h-5 text-primary" />
          <span className="font-semibold">{agent.name}</span>
        </div>
        <StatusIndicator status={agent.status} />
      </div>
      
      {/* Info */}
      <div className="space-y-1 text-sm text-muted-foreground mb-3">
        <p className="font-mono">{agent.pc_name}</p>
        <p className="font-mono text-xs">{agent.ip_address}</p>
      </div>
      
      {/* Metrics */}
      {agent.metrics && agent.status === 'ONLINE' && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 rounded bg-background/50">
            <Cpu className="w-4 h-4 mx-auto mb-1 text-neon-blue" />
            <span className="text-xs font-mono">{agent.metrics.cpu_percent}%</span>
          </div>
          <div className="text-center p-2 rounded bg-background/50">
            <MemoryStick className="w-4 h-4 mx-auto mb-1 text-neon-purple" />
            <span className="text-xs font-mono">{agent.metrics.memory_percent}%</span>
          </div>
          <div className="text-center p-2 rounded bg-background/50">
            <HardDrive className="w-4 h-4 mx-auto mb-1 text-neon-amber" />
            <span className="text-xs font-mono">{agent.metrics.disk_percent}%</span>
          </div>
        </div>
      )}
      
      {/* Actions - Restart habilitado para CRITICAL (recuperação); demais apenas ONLINE */}
      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={() => onCommand('restart')}
          disabled={(agent.status !== 'ONLINE' && agent.status !== 'CRITICAL') || !!isBusy}
          className="px-3 py-1.5 text-xs font-medium rounded bg-primary/20 hover:bg-primary/30 text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
        >
          <RefreshCw className={`w-3 h-3 ${loading === 'restart' ? 'animate-spin' : ''}`} />
          {loading === 'restart' ? '...' : 'Restart'}
        </button>
        <button 
          onClick={() => onCommand('stop')}
          disabled={agent.status !== 'ONLINE' || !!isBusy}
          className="px-3 py-1.5 text-xs font-medium rounded bg-destructive/20 hover:bg-destructive/30 text-destructive disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
        >
          <Power className={`w-3 h-3 ${loading === 'stop' ? 'animate-spin' : ''}`} />
          {loading === 'stop' ? '...' : 'Stop'}
        </button>
        <button 
          onClick={() => onCommand('screenshot')}
          disabled={agent.status !== 'ONLINE' || !!isBusy}
          className="px-3 py-1.5 text-xs font-medium rounded bg-accent/20 hover:bg-accent/30 text-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
        >
          <Camera className={`w-3 h-3 ${loading === 'screenshot' ? 'animate-spin' : ''}`} />
          {loading === 'screenshot' ? '...' : 'Screenshot'}
        </button>
        <button 
          onClick={() => onCommand('terminal')}
          disabled={agent.status !== 'ONLINE'}
          className="px-3 py-1.5 text-xs font-medium rounded bg-secondary/20 hover:bg-secondary/30 text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
        >
          <Terminal className="w-3 h-3" />
          Terminal
        </button>
      </div>
      
      {/* Last heartbeat */}
      {agent.last_heartbeat && (
        <div className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <ClientTime date={agent.last_heartbeat} />
        </div>
      )}
    </div>
  )
}

// Client-only current time component
function CurrentTime() {
  const [time, setTime] = useState<string>('--:--:--')
  
  useEffect(() => {
    setTime(new Date().toLocaleTimeString())
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  
  return <span>{time}</span>
}

// Main page component
export default function MissionControl() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [connected, setConnected] = useState(false)
  const [terminalAgent, setTerminalAgent] = useState<{ id: string; name: string } | null>(null)
  const [executingCommand, setExecutingCommand] = useState<{ agentId: string; command: string } | null>(null)

  const maestro = useMaestro()

  // Métricas calculadas diretamente (sem estado separado, valores estáticos)
  const agentsConnected = agents.length
  const agentsOnline = agents.filter((a) => a.status === 'ONLINE').length
  const agentsCritical = agents.filter((a) => a.status === 'CRITICAL').length

  // Conectar ao Maestro e carregar agentes
  useEffect(() => {
    maestro.connect()

    // Carregar agentes iniciais
    const loadAgents = async () => {
      try {
        const data = await maestro.getAgents()
        if (data.agents) {
          setAgents(data.agents)
        }
      } catch (error) {
        console.error('Failed to load agents:', error)
      }
    }

    loadAgents()

    // Escutar atualizações em tempo real
    const unsubscribeConnection = maestro.on('connection', (data: { connected: boolean }) => {
      setConnected(data.connected)
    })

    const unsubscribeAgentUpdate = maestro.on('agent_update', (data: any) => {
      setAgents((prev) => {
        return prev.map((a) => 
          a.agent_id === data.agent_id ? { ...a, ...data } : a
        )
      })
    })

    const unsubscribeHeartbeat = maestro.on('heartbeat', (data: any) => {
      setAgents((prev) => {
        return prev.map((a) => {
          if (a.agent_id === data.agent_id) {
            return {
              ...a,
              last_heartbeat: data.timestamp,
              metrics: data.metrics,
              status: 'ONLINE' as const,
            }
          }
          return a
        })
      })
    })

    // Polling de fallback a cada 5 segundos
    const interval = setInterval(async () => {
      if (!maestro.isConnected()) {
        await maestro.verifyConnection()
      }
      if (maestro.isConnected()) {
        loadAgents()
      }
    }, 5000)

    // Verificar conexão HTTP imediatamente ao montar
    const timeoutId = setTimeout(async () => {
      if (!maestro.isConnected()) {
        await maestro.verifyConnection()
        if (maestro.isConnected()) {
          loadAgents()
        }
      }
    }, 1000)

    return () => {
      unsubscribeConnection()
      unsubscribeAgentUpdate()
      unsubscribeHeartbeat()
      clearInterval(interval)
      clearTimeout(timeoutId)
      maestro.disconnect()
    }
  }, [maestro])

  const handleCommand = useCallback(async (agentId: string, command: string) => {
    try {
      if (command === 'terminal') {
        const agent = agents.find((a) => a.agent_id === agentId)
        if (agent) {
          setTerminalAgent({ id: agentId, name: agent.name })
        }
        return
      }

      setExecutingCommand({ agentId, command })
      try {
        if (command === 'restart') {
          await maestro.restartAgent(agentId)
          // Restart envia comando e retorna; agente reinicia em segundo plano
        } else if (command === 'stop') {
          await maestro.stopAgent(agentId)
        } else if (command === 'screenshot') {
          const result = await maestro.requestScreenshot(agentId)
          if (result && typeof result === 'object' && 'data' in result) {
            const screenshotData = (result as any).data
            if (screenshotData) {
              const newWindow = window.open('', '_blank')
              if (newWindow) {
                newWindow.document.write(`
                  <html>
                    <head><title>Screenshot - ${agentId}</title></head>
                    <body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh;">
                      <img src="data:image/png;base64,${screenshotData}" style="max-width:100%;max-height:100vh;" />
                    </body>
                  </html>
                `)
              }
            }
          }
        } else {
          await maestro.sendCommand(agentId, command)
        }
      } finally {
        setExecutingCommand(null)
      }
    } catch (error) {
      setExecutingCommand(null)
      console.error(`Failed to execute command '${command}':`, error)
      alert(`Erro ao executar comando: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }, [maestro, agents])

  return (
    <main className="min-h-screen p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <span className="text-primary">⬡</span>
              Mission Control
            </h1>
            <p className="text-muted-foreground mt-1">
              Corporação Senciente • Industry 7.0
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Connection status */}
            <div className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
              ${connected 
                ? 'bg-neon-green/10 text-neon-green border border-neon-green/30' 
                : 'bg-destructive/10 text-destructive border border-destructive/30'}
            `}>
              {connected ? (
                <>
                  <Wifi className="w-4 h-4" />
                  Maestro Online
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  Desconectado
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Metrics Overview */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-sm">Agentes Conectados</span>
          </div>
          <p className="text-3xl font-bold">{agentsConnected}</p>
        </div>
        
        <div className="p-4 rounded-lg border border-neon-green/30 bg-neon-green/5">
          <div className="flex items-center gap-2 text-neon-green mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm">Online</span>
          </div>
          <p className="text-3xl font-bold text-neon-green">{agentsOnline}</p>
        </div>
        
        <div className="p-4 rounded-lg border border-neon-red/30 bg-neon-red/5">
          <div className="flex items-center gap-2 text-neon-red mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">Crítico</span>
          </div>
          <p className="text-3xl font-bold text-neon-red">{agentsCritical}</p>
        </div>
        
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Hora Atual</span>
          </div>
          <p className="text-lg font-mono">
            <CurrentTime />
          </p>
        </div>
      </section>

      {/* Agents Grid */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-primary" />
          Agentes da Corporação
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <AgentCard 
              key={agent.agent_id} 
              agent={agent}
              onCommand={(cmd) => handleCommand(agent.agent_id, cmd)}
              loading={executingCommand?.agentId === agent.agent_id ? executingCommand.command : undefined}
            />
          ))}
        </div>
        
        {agents.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <XCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum agente conectado</p>
            <p className="text-sm mt-2">Configure o agent-listener nos PCs da corporação</p>
          </div>
        )}
      </section>
      
      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-border text-center text-sm text-muted-foreground">
        <p>Corporação Senciente © 2026 • Mission Control v1.0.0</p>
        <p className="mt-1 font-mono text-xs">Industry 7.0 • Areté Stack</p>
      </footer>

      {/* Terminal Modal */}
      {terminalAgent && (
        <AgentTerminal
          agentId={terminalAgent.id}
          agentName={terminalAgent.name}
          onClose={() => setTerminalAgent(null)}
        />
      )}
    </main>
  )
}
