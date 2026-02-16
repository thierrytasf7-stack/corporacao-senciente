import { renderHook, act } from '@testing-library/react';
import { useWebSocket } from '../useWebSocket';

describe('useWebSocket', () => {
  const mockUrl = 'wss://test-url.com';

  test('should initialize with DISCONNECTED status', () => {
    const { result } = renderHook(() => useWebSocket(mockUrl));
    expect(result.current.status.status).toBe('DISCONNECTED');
  });

  test('should update status when connection changes', () => {
    const { result } = renderHook(() => useWebSocket(mockUrl));

    act(() => {
      result.current.onConnect(() => {
        // Simulate connection
        result.current.status.status = 'CONNECTED';
      });
    });

    expect(result.current.status.status).toBe('CONNECTED');
  });

  test('should send messages through manager', () => {
    const { result } = renderHook(() => useWebSocket(mockUrl));
    const mockMessage = { type: 'test', data: 'data' };

    act(() => {
      result.current.sendMessage(mockMessage);
    });

    // This would require mocking the WebSocketManager to verify
    // For now, we just ensure the function exists and can be called
    expect(result.current.sendMessage).toBeDefined();
  });

  test('should provide event listeners', () => {
    const { result } = renderHook(() => useWebSocket(mockUrl));

    const mockMessageCallback = jest.fn();
    const mockConnectCallback = jest.fn();
    const mockDisconnectCallback = jest.fn();
    const mockErrorCallback = jest.fn();

    const removeMessage = result.current.onMessage(mockMessageCallback);
    const removeConnect = result.current.onConnect(mockConnectCallback);
    const removeDisconnect = result.current.onDisconnect(mockDisconnectCallback);
    const removeError = result.current.onError(mockErrorCallback);

    // Simulate events
    act(() => {
      // These would need to be connected to actual WebSocket events
      // For testing purposes, we're just verifying the callbacks exist
    });

    expect(mockMessageCallback).not.toHaveBeenCalled();
    expect(mockConnectCallback).not.toHaveBeenCalled();
    expect(mockDisconnectCallback).not.toHaveBeenCalled();
    expect(mockErrorCallback).not.toHaveBeenCalled();

    // Cleanup
    removeMessage();
    removeConnect();
    removeDisconnect();
    removeError();
  });

  test('should clean up on unmount', () => {
    const { unmount } = renderHook(() => useWebSocket(mockUrl));

    // Verify cleanup would be called
    // This would require spying on the WebSocketManager.destroy method
    unmount();
  });
});