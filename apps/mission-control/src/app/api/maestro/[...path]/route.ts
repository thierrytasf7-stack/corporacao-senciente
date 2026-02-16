import { NextResponse } from 'next/server'

const MAESTRO_URL = process.env.NEXT_PUBLIC_MAESTRO_URL || 'http://100.78.145.65:8080'

function buildTargetUrl(pathParts: string[], searchParams: URLSearchParams) {
  const path = pathParts.map(encodeURIComponent).join('/')
  const base = MAESTRO_URL.replace(/\/+$/, '')
  const url = new URL(`${base}/${path}`)
  searchParams.forEach((value, key) => url.searchParams.append(key, value))
  return url
}

async function proxy(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  // Prefer backend-only env var, fallback to public one, then default (dev mode)
  const BASE_URL = process.env.MAESTRO_URL || process.env.NEXT_PUBLIC_MAESTRO_URL || 'http://100.78.145.65:8080'

  try {
    const { path = [] } = await ctx.params
    const incomingUrl = new URL(req.url)

    // Construct target URL carefully
    const pathStr = path.map(encodeURIComponent).join('/')
    const base = BASE_URL.replace(/\/+$/, '')
    const targetUrl = new URL(`${base}/${pathStr}`)

    // Copy search params
    incomingUrl.searchParams.forEach((value, key) => targetUrl.searchParams.append(key, value))

    console.log(`[Proxy] Forwarding to: ${targetUrl.toString()}`)

    // Forward most headers, but avoid passing hop-by-hop / problematic ones.
    const headers = new Headers(req.headers)
    headers.delete('host')
    headers.delete('connection')
    headers.delete('content-length')
    // Important: Cloudflare Tunnel might expect a Host header match or just ANY Host header.
    // Fetch usually sets it automatically.

    // Screenshot pode levar até 60s no Maestro; proxy precisa esperar
    const isScreenshot = pathStr.includes('screenshot')
    const timeoutMs = isScreenshot ? 70000 : 30000

    const init: RequestInit = {
      method: req.method,
      headers,
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.arrayBuffer(),
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(timeoutMs),
    }

    const res = await fetch(targetUrl, init)

    // Mirror response back to browser (same-origin), so no CORS needed.
    const outHeaders = new Headers(res.headers)
    outHeaders.set('Cache-Control', 'no-store')

    // Allow JS to read useful headers if needed
    outHeaders.delete('content-encoding')

    if (!res.ok) {
      console.warn(`[Proxy] Upstream error: ${res.status} ${res.statusText}`)
    }

    return new NextResponse(res.body, {
      status: res.status,
      headers: outHeaders,
    })
  } catch (error) {
    console.error('[Proxy] Critical Error:', error)

    const isNetworkError = error instanceof TypeError && error.message === 'fetch failed';
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return new NextResponse(
      JSON.stringify({
        error: 'Proxy failed',
        message: errorMessage,
        target: process.env.MAESTRO_URL || process.env.NEXT_PUBLIC_MAESTRO_URL || 'DEFAULT_IP',
        hint: isNetworkError
          ? 'Network connectivity issue. If on Vercel, ensure MAESTRO_URL points to a public Cloudflare Tunnel, NOT a private 100.x.x.x IP.'
          : 'Check server logs.'
      }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

export async function GET(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, ctx)
}

export async function POST(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, ctx)
}

export async function PUT(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, ctx)
}

export async function PATCH(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, ctx)
}

export async function DELETE(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, ctx)
}

export async function OPTIONS(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  // Some clients may preflight; just proxy it.
  return proxy(req, ctx)
}
