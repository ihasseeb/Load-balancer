# Least Connection Load Balancer

## 📖 Overview

Least Connection algorithm routes requests to the server with the fewest active connections. This is more intelligent than Round Robin as it considers current server load.

## 🎯 Algorithm

```
servers = [
    {name: 'server1', connections: 5},
    {name: 'server2', connections: 3},
    {name: 'server3', connections: 7}
]

for each request:
    selected_server = server with minimum connections
    selected_server.connections += 1
    route_to(selected_server)
    
on request complete:
    selected_server.connections -= 1
```

## ✅ Advantages

- ✅ **Load-aware** - Considers active connections
- ✅ **Better than Round Robin** - Adapts to server load
- ✅ **Dynamic** - Responds to real-time load
- ✅ **Fair** - Balances based on actual work

## ❌ Disadvantages

- ❌ **Stateful** - Must track connections
- ❌ **Doesn't consider** - CPU, memory, response time
- ❌ **Connection ≠ Load** - Long vs short requests

## 📊 Expected Performance

| Metric | Value |
|--------|-------|
| Response Time | ~200ms |
| Throughput | ~1200 req/s |
| CPU Usage | ~75% |
| Fairness | High |

## 🚀 Usage

```python
from least_connection import LeastConnectionBalancer

# Initialize
balancer = LeastConnectionBalancer(servers=['server1', 'server2', 'server3'])

# Get server for new request
server = balancer.get_next_server()

# Mark request complete
balancer.release_connection(server)
```

## 📈 Use Case

Best for:
- Varying request durations
- Real-time load distribution
- Better than Round Robin baseline
