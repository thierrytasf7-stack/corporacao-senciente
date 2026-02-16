# Security - Source Whitelist System

## Quick Start

### 1. Initialize Whitelist
```bash
cd apps/backend
npx tsx security/init-whitelist.ts
```

This populates the whitelist with 18 trusted sources from `whitelist-seeds.json`.

### 2. View Current Whitelist
```bash
curl http://localhost:21301/api/whitelist | jq
```

### 3. Access Dashboard UI
```
http://localhost:21300/whitelist
```

## Files

| File | Purpose |
|------|---------|
| `source_whitelist.json` | Persistent storage (auto-created) |
| `whitelist-seeds.json` | Initial trusted sources (18 domains) |
| `init-whitelist.ts` | Initialization script |
| `WHITELIST-INTEGRATION-GUIDE.md` | Developer integration guide |

## API Endpoints

**Base:** `http://localhost:21301/api/whitelist`

- `GET /` - List whitelisted sources
- `GET /blocklist` - List blocked sources
- `GET /pending` - List pending approvals
- `GET /audit` - View audit log
- `GET /check?domain=example.com` - Check if domain allowed
- `POST /` - Add source (requires admin auth)
- `POST /block` - Block domain (requires admin auth)
- `PATCH /approve/:id` - Approve pending source (requires admin auth)
- `POST /reputation/update` - Update reputation scores (requires admin auth)

## Authentication

**Dev Mode:** Send any Bearer token
```bash
curl -H "Authorization: Bearer test-token" ...
```

**Production:** Configure JWT validation in `src/middleware/auth-middleware.ts`

## Integration Example

```typescript
import { whitelistFilterMiddleware } from '../middleware/whitelist-filter'

router.get('/scrape', whitelistFilterMiddleware, (req, res) => {
  // Only whitelisted domains reach here
  const { sourceUrl } = req.query
  // ... your scraping logic
})
```

## Reputation Service

**Optional:** Configure VirusTotal API for real reputation scores

```bash
# .env
VIRUSTOTAL_API_KEY=your-key-here
```

Without API key, uses mock scores (still functional).

## Monitoring

**View blocked attempts:**
```bash
curl "http://localhost:21301/api/whitelist/audit?limit=50" | jq '.data[] | select(.result == "blocked")'
```

**Console logs:**
```
[WHITELIST] Blocked access to domain: malicious.com at 2026-02-14T12:30:00Z
```

## Troubleshooting

**Empty whitelist after restart:**
- Whitelist persists in `security/source_whitelist.json`
- Re-run `npx tsx security/init-whitelist.ts` if file was deleted

**All requests blocked:**
- Check `curl http://localhost:21301/api/whitelist` shows sources
- Verify domain normalization (www. prefix removed)

**Auth errors on admin routes:**
- Add `Authorization: Bearer <token>` header
- In dev, any non-empty token works

## Documentation

- **Integration Guide:** `WHITELIST-INTEGRATION-GUIDE.md` (this directory)
- **API Reference:** `../../docs/WHITELIST-API.md`
- **Story:** `../../docs/stories/senciencia-etapa002-task-03-whitelist-fontes.md`
