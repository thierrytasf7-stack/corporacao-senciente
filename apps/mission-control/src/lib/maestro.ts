'use client'

import { io, Socket } from 'socket.io-client'

// IMPORTANTE: Esta variável DEVE estar configurada no Vercel
// Settings > Environment Variables > NEXT_PUBLIC_MAESTRO_URL = http://100.78.145.65:8080
const MAESTRO_URL = process.env.NEXT_PUBLIC_MAESTRO_URL || 'http://100.78.145.65:8080'
const PROXY_BASE = '/api/maestro'

// Log para debug
if (typeof window !== 'undefined') {
  console.log('[Maestro] MAESTRO_URL:', MAESTRO_URL)
  console.log('[Maestro] Env var:', process.env.NEXT_PUBLIC_MAESTRO_URL || 'NOT SET')
}

class MaestroClient {
  private socket: Socket | null = null
  private listeners: Map<string, Set<Function>> = new Map()

  private shouldUseSocketIo() {
    if (typeof window === 'undefined') return false
    // If Mission Control is on HTTPS and Maestro is HTTP, browser will block ws/http (Mixed Content).
    // But if Maestro is HTTPS (via tunnel), Socket.IO can use WSS (secure WebSocket).
    if (window.location.protocol === 'https:' && MAESTRO_URL.startsWith('http://')) return false
    // If both are HTTPS, Socket.IO will use WSS automatically
    return true
  }

  private buildProxyUrl(path: string) {
    const cleaned = path.startsWith('/') ? path.slice(1) : path
    return `${PROXY_BASE}/${cleaned}`
  }

  connect() {
    if (this.socket?.connected) {
      return
    }

    console.log('[Maestro] Attempting to connect to:', MAESTRO_URL)
    console.log('[Maestro] Env var available:', !!process.env.NEXT_PUBLIC_MAESTRO_URL)

    // Verificar conexão HTTP primeiro (via proxy same-origin, sem CORS/Mixed Content)
    this.checkHttpConnection().then((httpWorks) => {
      if (httpWorks) {
        console.log('[Maestro] HTTP connection verified, attempting WebSocket...')
      }
    })

    if (!this.shouldUseSocketIo()) {
      console.warn('[Maestro] Socket.IO disabled (HTTPS -> HTTP blocked). Using HTTP proxy mode.')
      return
    }

    this.socket = io(MAESTRO_URL, {
      transports: ['websocket', 'polling'], // Tentar polling como fallback
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 10000,
      forceNew: true,
    })

    this.socket.on('connect', () => {
      console.log('[Maestro] WebSocket connected successfully')
      this.emit('connection', { connected: true, mode: 'websocket' })
    })

    this.socket.on('disconnect', (reason) => {
      console.log('[Maestro] WebSocket disconnected:', reason)
      // Verificar se HTTP ainda funciona
      this.checkHttpConnection()
    })

    this.socket.on('connect_error', (error) => {
      console.error('[Maestro] WebSocket connection error:', error.message)
      // Tentar verificar se HTTP funciona mesmo sem WebSocket
      this.checkHttpConnection()
    })

    this.socket.on('agent_update', (data) => {
      this.emit('agent_update', data)
    })

    this.socket.on('heartbeat_received', (data) => {
      this.emit('heartbeat', data)
    })

    this.socket.on('alert', (data) => {
      this.emit('alert', data)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  isConnected() {
    return this.socket?.connected || false
  }

  // Event emitter pattern
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)

    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach((callback) => callback(data))
  }

  // Commands
  async sendCommand(agentId: string, command: string, args: Record<string, any> = {}) {
    // Sempre tentar HTTP primeiro se Socket.IO não estiver conectado
    if (!this.socket?.connected) {
      try {
        const body = {
          agent_id: agentId,
          command,
          args,
        }
        
        const response = await fetch(this.buildProxyUrl(`/agents/${agentId}/command`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }
        
        return await response.json()
      } catch (error) {
        console.error('[Maestro] HTTP fallback failed:', error)
        throw new Error(`Not connected to Maestro and HTTP fallback failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return new Promise((resolve, reject) => {
      const commandId = `cmd_${Date.now()}_${Math.random()}`
      const timeout = setTimeout(() => {
        reject(new Error('Command timeout'))
      }, 30000)

      // Escutar resposta do comando
      const responseHandler = (data: any) => {
        if (data.command_id === commandId) {
          clearTimeout(timeout)
          this.socket!.off('command_response', responseHandler)
          if (data.success) {
            resolve(data)
          } else {
            reject(new Error(data.error || 'Command failed'))
          }
        }
      }

      this.socket!.on('command_response', responseHandler)

      // Enviar comando
      this.socket!.emit('command', {
        agent_id: agentId,
        command_id: commandId,
        command,
        args,
      })
    })
  }

  async checkHttpConnection() {
    try {
      const response = await fetch(this.buildProxyUrl('/health'), {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      })
      if (response.ok) {
        console.log('[Maestro] HTTP connection works, WebSocket may be blocked')
        // HTTP funciona, então podemos usar fallback
        this.emit('connection', { connected: true, mode: 'http' })
        return true
      }
    } catch (error) {
      console.error('[Maestro] HTTP health check failed:', error)
      // Tentar verificar se é problema de CORS ou rede
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('[Maestro] Network error - possible CORS or connectivity issue')
      }
    }
    return false
  }

  // Verificar conexão HTTP periodicamente
  async verifyConnection() {
    try {
      const response = await fetch(this.buildProxyUrl('/health'), {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      })
      if (response.ok) {
        this.emit('connection', { connected: true, mode: 'http' })
        return true
      }
    } catch (error) {
      this.emit('connection', { connected: false })
      return false
    }
    return false
  }

  async getAgents() {
    try {
      const response = await fetch(this.buildProxyUrl('/agents'), {
        method: 'GET',
        signal: AbortSignal.timeout(10000),
      })
      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.status} ${response.statusText}`)
      }
      return response.json()
    } catch (error) {
      console.error('[Maestro] getAgents error:', error)
      throw error
    }
  }

  async restartAgent(agentId: string) {
    // Sempre usar HTTP: restart mata o agente, que não consegue enviar resposta via Socket
    try {
      const response = await fetch(this.buildProxyUrl(`/agents/${agentId}/restart`), {
        method: 'POST',
        signal: AbortSignal.timeout(15000),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    } catch (error) {
      throw new Error(`Failed to restart agent: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async stopAgent(agentId: string) {
    // Sempre usar HTTP: stop mata o agente
    try {
      const response = await fetch(this.buildProxyUrl(`/agents/${agentId}/stop`), {
        method: 'POST',
        signal: AbortSignal.timeout(15000),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    } catch (error) {
      throw new Error(`Failed to stop agent: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async requestScreenshot(agentId: string) {
    // Sempre usar HTTP: Maestro aguarda resposta do agente e retorna base64
    try {
      const response = await fetch(this.buildProxyUrl(`/agents/${agentId}/screenshot`), {
        method: 'POST',
        signal: AbortSignal.timeout(65000), // 65s (Maestro espera até 60s)
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    } catch (error) {
      throw new Error(`Failed to request screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// Singleton
export const maestro = new MaestroClient()

// React hook
export function useMaestro() {
  return maestro
}
