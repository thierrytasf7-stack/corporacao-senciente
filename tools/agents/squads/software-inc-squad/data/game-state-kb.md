# Game State Knowledge Base

## Game Mechanics
- Employee states: working, idle, stressed, on_break
- Resource types: money, materials, products
- Time system: game_time, real_time

## API Endpoints
- GET /employees - List all employees
- POST /events - Trigger game events
- GET /metrics - Get game metrics

## Data Structures
- Employee: {id, name, status, productivity}
- Event: {type, parameters, timestamp}
- Metric: {name, value, timestamp}
