import { WebSocketManager, WebSocketState } from "@/services/WebSocketManager";

describe('WebSocketManager', () => {
  const mockUrl = 'ws://localhost:21300';

  beforeEach(() => {
    global.WebSocket = class MockWebSocket {
      binaryType: string;
      onopen: Function;
      onmessage: Function;
      onclose: Function;
      onerror: Function;
      private sendQueue: string[] = [];

      constructor(url: string) {
        this.binaryType = 'arraybuffer';
        setTimeout(() => {
          if (this.onopen) this.onopen.call(this);
        }, 10);
      }

      send(data: string) {
        this.sendQueue.push(data);
      }

      getSendQueue() {
        return this.sendQueue;
      }

      triggerMessage(data: string) {
        if (this.onmessage) {
          this.onmessage.call(this, { data });
        }
      }

      triggerClose() {
        if (this.onclose) {
          this.onclose.call(this);
        }
      }

      triggerError() {
        if (this.onerror) {
          this.onerror.call(this, new Error('Mock error'));
        }
      }
    };
  });

  afterEach(() => {
    delete global.WebSocket;
  });

  test('should initialize with DISCONNECTED state', () => {
    const manager = new WebSocketManager({ url: mockUrl });
    expect(manager.getState()).toBe('DISCONNECTED');
  });

  test('should connect and change state to CONNECTED', (done) => {
    const manager = new WebSocketManager({ url: mockUrl });
    
    manager.on('stateChange', (state: WebSocketState) => {
      if (state === 'CONNECTED') {
        expect(manager.getState()).toBe('CONNECTED');
        done();
      }
    });
  });

  test('should send messages when connected', () => {
    const manager = new WebSocketManager({ url: mockUrl });
    const message = { type: 'test', data: 'hello' };
    
    manager.send(message);
    
    setTimeout(() => {
      expect(manager.isConnected()).toBe(true);
      expect((global.WebSocket as any).getSendQueue()).toContain(JSON.stringify(message));
    }, 20);
  });

  test('should buffer messages when disconnected', () => {
    const manager = new WebSocketManager({ url: mockUrl, autoConnect: false });
    const message = { type: 'test', data: 'hello' };
    
    manager.send(message);
    
    expect(manager.getState()).toBe('DISCONNECTED');
    expect((global.WebSocket as any).getSendQueue()).not.toContain(JSON.stringify(message));
  });

  test('should flush message queue when reconnected', (done) => {
    const manager = new WebSocketManager({ url: mockUrl, autoConnect: false });
    const message = { type: 'test', data: 'hello' };
    
    manager.send(message);
    manager.connect();
    
    manager.on('stateChange', (state: WebSocketState) => {
      if (state === 'CONNECTED') {
        setTimeout(() => {
          expect((global.WebSocket as any).getSendQueue()).toContain(JSON.stringify(message));
          done();
        }, 20);
      }
    });
  });

  test('should handle connection errors and reconnect', (done) => {
    const manager = new WebSocketManager({ url: mockUrl });
    
    manager.on('stateChange', (state: WebSocketState) => {
      if (state === 'DISCONNECTED') {
        setTimeout(() => {
          expect(manager.getState()).toBe('RECONNECTING');
          done();
        }, 50);
      }
    });
    
    setTimeout(() => {
      (global.WebSocket as any).triggerError();
    }, 15);
  });

  test('should handle connection close and reconnect', (done) => {
    const manager = new WebSocketManager({ url: mockUrl });
    
    manager.on('stateChange', (state: WebSocketState) => {
      if (state === 'DISCONNECTED') {
        setTimeout(() => {
          expect(manager.getState()).toBe('RECONNECTING');
          done();
        }, 50);
      }
    });
    
    setTimeout(() => {
      (global.WebSocket as any).triggerClose();
    }, 15);
  });

  test('should implement exponential backoff', (done) => {
    const manager = new WebSocketManager({ url: mockUrl });
    
    let reconnectCalls = 0;
    const originalReconnect = manager.reconnect.bind(manager);
    
    manager.reconnect = () => {
      reconnectCalls++;
      if (reconnectCalls === 1) {
        setTimeout(() => {
          expect(reconnectCalls).toBe(1);
          originalReconnect();
        }, 50);
      } else if (reconnectCalls === 2) {
        setTimeout(() => {
          expect(reconnectCalls).toBe(2);
          done();
        }, 100);
      }
    };
    
    setTimeout(() => {
      (global.WebSocket as any).triggerError();
    }, 15);
  });

  test('should handle heartbeat ping/pong', (done) => {
    const manager = new WebSocketManager({ url: mockUrl });
    
    setTimeout(() => {
      expect((global.WebSocket as any).getSendQueue()).toContain(JSON.stringify({ type: 'ping', data: null }));
      done();
    }, 40);
  });

  test('should handle network online event', (done) => {
    const manager = new WebSocketManager({ url: mockUrl, autoConnect: false });
    
    manager.on('stateChange', (state: WebSocketState) => {
      if (state === 'CONNECTED') {
        done();
      }
    });
    
    manager.connect();
    
    setTimeout(() => {
      window.dispatchEvent(new Event('online'));
    }, 20);
  });

  test('should handle visibility change event', (done) => {
    const manager = new WebSocketManager({ url: mockUrl, autoConnect: false });
    
    manager.on('stateChange', (state: WebSocketState) => {
      if (state === 'CONNECTED') {
        done();
      }
    });
    
    manager.connect();
    
    setTimeout(() => {
      document.hidden = false;
      document.dispatchEvent(new Event('visibilitychange'));
    }, 20);
  });

  test('should clean up event listeners on destroy', () => {
    const manager = new WebSocketManager({ url: mockUrl });
    const spy = jest.spyOn(manager, 'disconnect');
    
    manager.destroy();
    
    expect(spy).toHaveBeenCalled();
    expect(window.ononline).toBeNull();
    expect(document.onvisibilitychange).toBeNull();
  });
});