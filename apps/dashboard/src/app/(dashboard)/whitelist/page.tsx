'use client'

import { useState, useEffect } from 'react'
import WhitelistPanel from '@/components/whitelist/WhitelistPanel'

export default function WhitelistPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Source Whitelist</h1>
          <p className="text-muted-foreground mt-1">
            Gerenciamento de fontes de dados autorizadas para scrapers
          </p>
        </div>
      </div>

      <WhitelistPanel />
    </div>
  )
}
