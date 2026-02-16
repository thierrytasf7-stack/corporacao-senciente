'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, AlertTriangle, Clock, CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react'

interface WhitelistSource {
  id: string
  name: string
  domain: string
  category: string
  status: 'active' | 'inactive' | 'suspended'
  reputation: {
    score: number
    lastChecked: string
    trusted: boolean
  }
  tags: string[]
  description: string
  addedBy: string
  addedAt: string
}

interface AuditLogEntry {
  timestamp: string
  event: string
  domain: string
  result: 'allowed' | 'blocked'
  reason?: string
}

export default function WhitelistPanel() {
  const [whitelist, setWhitelist] = useState<WhitelistSource[]>([])
  const [blocklist, setBlocklist] = useState<WhitelistSource[]>([])
  const [pending, setPending] = useState<WhitelistSource[]>([])
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newSource, setNewSource] = useState({
    name: '',
    domain: '',
    category: 'news',
    description: '',
    tags: ''
  })

  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:21301'

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000) // Refresh every 10s
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [whitelistRes, blocklistRes, pendingRes, auditRes] = await Promise.all([
        fetch(`${API_BASE}/api/whitelist`),
        fetch(`${API_BASE}/api/whitelist/blocklist`),
        fetch(`${API_BASE}/api/whitelist/pending`),
        fetch(`${API_BASE}/api/whitelist/audit?limit=50`)
      ])

      const [whitelistData, blocklistData, pendingData, auditData] = await Promise.all([
        whitelistRes.json(),
        blocklistRes.json(),
        pendingRes.json(),
        auditRes.json()
      ])

      setWhitelist(whitelistData.data || [])
      setBlocklist(blocklistData.data || [])
      setPending(pendingData.data || [])
      setAuditLog(auditData.data || [])
      setLoading(false)
      setError(null)
    } catch (err) {
      setError('Falha ao carregar dados da whitelist')
      setLoading(false)
    }
  }

  const handleAddSource = async () => {
    if (!newSource.name || !newSource.domain || !newSource.category) {
      setError('Preencha todos os campos obrigatórios')
      return
    }

    try {
      const response = await fetch(`${API_BASE}/api/whitelist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSource,
          tags: newSource.tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      })

      if (!response.ok) throw new Error('Falha ao adicionar fonte')

      setNewSource({ name: '', domain: '', category: 'news', description: '', tags: '' })
      fetchData()
      setError(null)
    } catch (err) {
      setError('Erro ao adicionar fonte à whitelist')
    }
  }

  const handleApprove = async (sourceId: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/whitelist/approve/${sourceId}`, {
        method: 'PATCH'
      })
      if (!response.ok) throw new Error('Falha ao aprovar fonte')
      fetchData()
    } catch (err) {
      setError('Erro ao aprovar fonte')
    }
  }

  const handleReject = async (sourceId: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/whitelist/reject/${sourceId}`, {
        method: 'PATCH'
      })
      if (!response.ok) throw new Error('Falha ao rejeitar fonte')
      fetchData()
    } catch (err) {
      setError('Erro ao rejeitar fonte')
    }
  }

  const handleBlock = async (domain: string, reason: string = 'Bloqueado manualmente') => {
    try {
      const response = await fetch(`${API_BASE}/api/whitelist/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, reason })
      })
      if (!response.ok) throw new Error('Falha ao bloquear fonte')
      fetchData()
    } catch (err) {
      setError('Erro ao bloquear fonte')
    }
  }

  const handleUpdateReputation = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/whitelist/reputation/update`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Falha ao atualizar reputação')
      fetchData()
    } catch (err) {
      setError('Erro ao atualizar reputação')
    }
  }

  const getReputationBadge = (score: number) => {
    if (score >= 7) return <Badge className="bg-green-500">Trusted</Badge>
    if (score >= 5) return <Badge className="bg-yellow-500">Moderate</Badge>
    return <Badge className="bg-red-500">Risky</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-muted-foreground">Carregando whitelist...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Whitelisted</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{whitelist.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blocklist.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pending.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audit Entries</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLog.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="whitelist" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="whitelist">Whitelist</TabsTrigger>
          <TabsTrigger value="blocklist">Blocklist</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="add">Add Source</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="whitelist" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Whitelisted Sources</CardTitle>
                  <CardDescription>Fontes autorizadas para scraping</CardDescription>
                </div>
                <Button onClick={handleUpdateReputation} variant="outline" size="sm">
                  Update Reputation
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {whitelist.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Nenhuma fonte na whitelist
                  </div>
                ) : (
                  whitelist.map((source) => (
                    <div
                      key={source.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{source.name}</h4>
                          {getReputationBadge(source.reputation.score)}
                          <Badge variant="outline">{source.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{source.domain}</p>
                        {source.description && (
                          <p className="text-xs text-muted-foreground mt-1">{source.description}</p>
                        )}
                        <div className="flex gap-2 mt-2">
                          {source.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-muted-foreground">
                          Score: {source.reputation.score.toFixed(1)}
                        </div>
                        <Button
                          onClick={() => handleBlock(source.domain)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blocklist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blocked Sources</CardTitle>
              <CardDescription>Fontes bloqueadas permanentemente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {blocklist.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Nenhuma fonte bloqueada
                  </div>
                ) : (
                  blocklist.map((source) => (
                    <div
                      key={source.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-red-50 dark:bg-red-950"
                    >
                      <div>
                        <h4 className="font-semibold text-red-700 dark:text-red-300">
                          {source.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">{source.domain}</p>
                        <p className="text-xs text-muted-foreground mt-1">{source.description}</p>
                      </div>
                      <Badge variant="destructive">Blocked</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approval</CardTitle>
              <CardDescription>Fontes aguardando aprovação manual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pending.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Nenhuma fonte pendente
                  </div>
                ) : (
                  pending.map((source) => (
                    <div
                      key={source.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold">{source.name}</h4>
                        <p className="text-sm text-muted-foreground">{source.domain}</p>
                        <p className="text-xs text-muted-foreground mt-1">{source.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => handleApprove(source.id)} size="sm" variant="default">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button onClick={() => handleReject(source.id)} size="sm" variant="outline">
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Source</CardTitle>
              <CardDescription>Adicionar fonte diretamente à whitelist</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Source Name *</Label>
                <Input
                  id="name"
                  placeholder="Ex: BBC News"
                  value={newSource.name}
                  onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain">Domain *</Label>
                <Input
                  id="domain"
                  placeholder="Ex: bbc.com"
                  value={newSource.domain}
                  onChange={(e) => setNewSource({ ...newSource, domain: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={newSource.category}
                  onChange={(e) => setNewSource({ ...newSource, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="news">News</option>
                  <option value="sports">Sports</option>
                  <option value="finance">Finance</option>
                  <option value="social">Social Media</option>
                  <option value="api">API</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Descrição opcional"
                  value={newSource.description}
                  onChange={(e) => setNewSource({ ...newSource, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  placeholder="Ex: news, uk, trusted"
                  value={newSource.tags}
                  onChange={(e) => setNewSource({ ...newSource, tags: e.target.value })}
                />
              </div>

              <Button onClick={handleAddSource} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add to Whitelist
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>Últimas 50 tentativas de acesso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {auditLog.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Nenhum registro de auditoria
                  </div>
                ) : (
                  auditLog.reverse().map((entry, idx) => (
                    <div
                      key={idx}
                      className={`p-3 border rounded-lg text-sm ${
                        entry.result === 'blocked'
                          ? 'bg-red-50 dark:bg-red-950 border-red-200'
                          : 'bg-green-50 dark:bg-green-950 border-green-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {entry.result === 'blocked' ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          <span className="font-mono">{entry.domain}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {entry.reason && (
                        <p className="text-xs text-muted-foreground mt-1 ml-6">{entry.reason}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
