'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Terminal as TerminalIcon } from 'lucide-react'
import { useMaestro } from '@/lib/maestro'

interface AgentTerminalProps {
  agentId: string
  agentName: string
  onClose: () => void
}

export function AgentTerminal({ agentId, agentName, onClose }: AgentTerminalProps) {
  const [output, setOutput] = useState<string[]>([])
  const [command, setCommand] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const maestro = useMaestro()

  useEffect(() => {
    inputRef.current?.focus()
    addOutput(`Connected to ${agentName} (${agentId})`)
    addOutput('Type "help" for available commands')
  }, [])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output])

  const addOutput = (text: string) => {
    setOutput((prev) => [...prev, text])
  }

  const handleExecute = async (cmd: string) => {
    if (!cmd.trim()) return

    addOutput(`$ ${cmd}`)
    setIsExecuting(true)

    try {
      const result = await maestro.sendCommand(agentId, 'shell', { command: cmd })
      if (result && typeof result === 'object' && 'output' in result) {
        addOutput(result.output as string)
      } else {
        addOutput(String(result))
      }
    } catch (error) {
      addOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsExecuting(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (command.trim() && !isExecuting) {
      handleExecute(command)
      setCommand('')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl h-[80vh] bg-gray-900 border border-primary/30 rounded-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-5 h-5 text-primary" />
            <span className="font-mono text-sm">{agentName}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Terminal Output */}
        <div
          ref={terminalRef}
          className="flex-1 p-4 overflow-y-auto font-mono text-sm text-green-400 bg-black"
          style={{ fontFamily: 'Consolas, Monaco, monospace' }}
        >
          {output.map((line, i) => (
            <div key={i} className="mb-1">
              {line}
            </div>
          ))}
          {isExecuting && (
            <div className="inline-block animate-pulse">▋</div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
          <div className="flex gap-2">
            <span className="text-green-400 font-mono">$</span>
            <input
              ref={inputRef}
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              disabled={isExecuting}
              className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono"
              placeholder="Enter command..."
            />
          </div>
        </form>
      </div>
    </div>
  )
}
