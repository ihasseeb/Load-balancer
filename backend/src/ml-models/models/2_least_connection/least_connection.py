"""
Least Connection Load Balancer - Dynamic Baseline Algorithm
Routes requests to server with fewest active connections
"""

import json
import time
import random
from typing import List, Dict

class Server:
    """Server with connection tracking"""
    
    def __init__(self, name: str):
        self.name = name
        self.active_connections = 0
        self.total_requests = 0
        
    def add_connection(self):
        """Add a new connection"""
        self.active_connections += 1
        self.total_requests += 1
        
    def release_connection(self):
        """Release a connection"""
        self.active_connections = max(0, self.active_connections - 1)
        
    def __repr__(self):
        return f"Server({self.name}, connections={self.active_connections})"

class LeastConnectionBalancer:
    """Least Connection Load Balancing Algorithm"""
    
    def __init__(self, server_names: List[str]):
        """
        Initialize Least Connection balancer
        
        Args:
            server_names: List of server names/IDs
        """
        self.servers = [Server(name) for name in server_names]
        self.total_requests = 0
        
    def get_next_server(self) -> str:
        """
        Get server with least connections
        
        Returns:
            Server name/ID
        """
        # Find server with minimum connections
        min_server = min(self.servers, key=lambda s: s.active_connections)
        min_server.add_connection()
        self.total_requests += 1
        
        return min_server.name
    
    def release_connection(self, server_name: str):
        """
        Release connection from server
        
        Args:
            server_name: Name of server to release connection from
        """
        for server in self.servers:
            if server.name == server_name:
                server.release_connection()
                break
    
    def get_metrics(self) -> Dict:
        """Get balancer metrics"""
        server_stats = {
            server.name: {
                'active_connections': server.active_connections,
                'total_requests': server.total_requests
            }
            for server in self.servers
        }
        
        return {
            'algorithm': 'Least Connection',
            'total_requests': self.total_requests,
            'server_stats': server_stats,
            'load_balance_score': self._calculate_load_balance()
        }
    
    def _calculate_load_balance(self) -> float:
        """Calculate how well load is balanced (0-1, 1 = perfectly balanced)"""
        if self.total_requests == 0:
            return 1.0
        
        request_counts = [s.total_requests for s in self.servers]
        expected_per_server = self.total_requests / len(self.servers)
        deviations = [abs(count - expected_per_server) for count in request_counts]
        avg_deviation = sum(deviations) / len(deviations)
        
        # Normalize to 0-1
        balance_score = 1 - (avg_deviation / expected_per_server) if expected_per_server > 0 else 1.0
        return max(0, min(1, balance_score))
    
    def reset(self):
        """Reset balancer state"""
        for server in self.servers:
            server.active_connections = 0
            server.total_requests = 0
        self.total_requests = 0

def simulate_load_balancing(num_requests=1000, num_servers=3, avg_duration=0.1):
    """
    Simulate Least Connection load balancing with varying request durations
    
    Args:
        num_requests: Number of requests to simulate
        num_servers: Number of servers
        avg_duration: Average request duration (seconds)
    """
    print(f"🔄 Simulating Least Connection with {num_servers} servers, {num_requests} requests\n")
    
    # Create servers
    server_names = [f"server_{i+1}" for i in range(num_servers)]
    balancer = LeastConnectionBalancer(server_names)
    
    # Track active requests
    active_requests = []
    
    # Simulate requests
    start_time = time.time()
    completed = 0
    
    for i in range(num_requests):
        # Get next server
        server = balancer.get_next_server()
        
        # Simulate request duration (random around average)
        duration = random.uniform(avg_duration * 0.5, avg_duration * 1.5)
        completion_time = time.time() + duration
        
        active_requests.append({
            'server': server,
            'completion_time': completion_time
        })
        
        # Check for completed requests
        current_time = time.time()
        active_requests = [req for req in active_requests if req['completion_time'] > current_time]
        
        # Release completed connections
        for req in [r for r in active_requests if r['completion_time'] <= current_time]:
            balancer.release_connection(req['server'])
            completed += 1
        
        # Print progress
        if (i + 1) % (num_requests // 10) == 0:
            print(f"✅ Processed {i + 1}/{num_requests} requests, {len(active_requests)} active")
    
    # Wait for remaining requests to complete
    while active_requests:
        time.sleep(0.01)
        current_time = time.time()
        for req in [r for r in active_requests if r['completion_time'] <= current_time]:
            balancer.release_connection(req['server'])
            active_requests.remove(req)
            completed += 1
    
    end_time = time.time()
    elapsed = end_time - start_time
    
    # Get metrics
    metrics = balancer.get_metrics()
    metrics['elapsed_time'] = elapsed
    metrics['throughput'] = num_requests / elapsed
    metrics['completed_requests'] = completed
    
    # Display results
    print(f"\n📊 Least Connection Results:")
    print(f"   Total Requests: {metrics['total_requests']}")
    print(f"   Completed: {completed}")
    print(f"   Elapsed Time: {elapsed:.2f}s")
    print(f"   Throughput: {metrics['throughput']:.0f} req/s")
    print(f"   Load Balance Score: {metrics['load_balance_score']:.3f}")
    print(f"\n   Server Distribution:")
    for server_name, stats in metrics['server_stats'].items():
        percentage = (stats['total_requests'] / num_requests) * 100
        print(f"      {server_name}: {stats['total_requests']} requests ({percentage:.1f}%), "
              f"{stats['active_connections']} active")
    
    # Save metrics
    with open('metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2, default=str)
    
    print(f"\n💾 Metrics saved to: metrics.json")
    
    return metrics

if __name__ == "__main__":
    # Run simulation
    simulate_load_balancing(num_requests=10000, num_servers=3, avg_duration=0.01)
