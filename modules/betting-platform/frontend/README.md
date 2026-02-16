# Betting Platform Frontend

WebSocket Reliability Implementation with Exponential Backoff

## Features

- **WebSocketManager**: State machine with CONNECTING/CONNECTED/RECONNECTING/DISCONNECTED states
- **Exponential Backoff**: 1s initial delay, 2x multiplier, 30s max
- **Heartbeat System**: Ping every 30s, pong timeout 10s
- **Message Queue**: Buffers messages during reconnection
- **Network Awareness**: Online/offline and visibility change listeners
- **Visual Indicator**: Live/Reconnecting/Offline status badge

## Architecture

```
src/
├── services/
│   └── WebSocketManager.ts          # Core WebSocket with FSM and backoff
├── hooks/
│   └── useWebSocket.ts              # React hook for WebSocket state
├── components/
│   ├── ConnectionIndicator.tsx      # Visual status indicator
│   └── ui/
│       └── ConnectionStatus.tsx     # Status badge component
├── __tests__/
│   ├── WebSocketManager.test.ts     # Unit tests for manager
│   ├── useWebSocket.test.ts         # Hook tests
│   └── ConnectionIndicator.test.tsx # Component tests
└── App.tsx                          # Main app with indicator
```

## Usage

```tsx
import { useWebSocket } from '@/services/WebSocketManager';

function MyComponent() {
  const { status, sendMessage, onMessage } = useWebSocket('wss://your-websocket-url.com');
  
  onMessage((message) => {
    console.log('Received:', message);
  });
  
  const handleClick = () => {
    sendMessage({ type: 'action', data: { id: 123 } });
  };
  
  return (
    <div>
      <ConnectionStatus status={status.status} />
      <button onClick={handleClick}>Send Message</button>
    </div>
  );
}
```

## Testing

```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # Coverage report
npm run typecheck          # TypeScript check
```

## Development

```bash
npm run dev                # Start dev server (port 21300)
npm run build              # Build for production
npm run preview            # Preview production build
```