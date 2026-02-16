import socketio
import asyncio

# Connect to Maestro as if we were a client or admin tool
sio = socketio.AsyncClient()

async def main():
    print("Connecting to Maestro...")
    # Use the same URL as the agent
    await sio.connect('http://100.78.145.65:8080')
    print("Connected!")
    
    # We can't easily spoof a command "FROM" Maestro to Agent without being Maestro.
    # But we can check if the agent is actually registered by asking Maestro for the list.
    
    # Or we can try to use the HTTP API to send a command
    import aiohttp
    
    async with aiohttp.ClientSession() as session:
        url = 'http://100.78.145.65:8080/agents/pc-principal/command'
        print(f"Sending command to {url}...")
        try:
            async with session.post(url, json={'agent_id': 'pc-principal', 'command': 'shell', 'args': {'command': 'echo TEST_SUCCESS'}}) as resp:
                print(f"Status: {resp.status}")
                print(f"Response: {await resp.text()}")
        except Exception as e:
            print(f"Error: {e}")

    await sio.disconnect()

if __name__ == '__main__':
    asyncio.run(main())
