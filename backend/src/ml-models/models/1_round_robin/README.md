# Round Robin Load Balancer

## 📖 Overview

Round Robin is the simplest load balancing algorithm. It distributes requests sequentially across all available servers in a circular manner.

## 🎯 Algorithm

```
servers = [server1, server2, server3]
current_index = 0

for each request:
    selected_server = servers[current_index % len(servers)]
    current_index += 1
    route_to(selected_server)
```

## ✅ Advantages

- ✅ **Simple** - Easy to implement
- ✅ **Fair** - Equal distribution
- ✅ **No state** - Stateless algorithm
- ✅ **Fast** - O(1) time complexity

## ❌ Disadvantages

- ❌ **Ignores server load** - Doesn't consider CPU/memory
- ❌ **Ignores response time** - Slow servers get same load
- ❌ **No intelligence** - No learning or adaptation

## 📊 Expected Performance

| Metric | Value |
|--------|-------|
| Response Time | ~250ms |
| Throughput | ~1000 req/s |
| CPU Usage | ~85% |
| Fairness | High |

## 🚀 Usage

```python
from round_robin import RoundRobinBalancer

# Initialize
balancer = RoundRobinBalancer(servers=['server1', 'server2', 'server3'])

# Get next server
server = balancer.get_next_server()
```

## 📈 Use Case

Best for:
- Homogeneous servers (same capacity)
- Simple applications
- Baseline comparison
