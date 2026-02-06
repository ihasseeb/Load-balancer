"""
Round Robin Load Balancer - Baseline Algorithm
Distributes requests evenly across all servers in sequential order
"""

import json
import time
from typing import List, Dict

class RoundRobinBalancer:
    """Round Robin Load Balancing Algorithm"""
    
    def __init__(self, servers: List[str]):
        """
        Initialize Round Robin balancer
        
        Args:
            servers: List of server names/IDs
        """
        self.servers = servers
        self.current_index = 0
        self.total_requests = 0
        self.server_counts = {server: 0 for server in servers}
        
    def get_next_server(self) -> str:
        """
        Get next server using Round Robin
        
        Returns:
            Server name/ID
        """
        server = self.servers[self.current_index % len(self.servers)]
        self.current_index += 1
        self.total_requests += 1
        self.server_counts[server] += 1
        
        return server
    
    def get_metrics(self) -> Dict:
        """Get balancer metrics"""
        return {
            'algorithm': 'Round Robin',
            'total_requests': self.total_requests,
            'server_distribution': self.server_counts,
            'fairness_score': self._calculate_fairness()
        }
    
    def _calculate_fairness(self) -> float:
        """Calculate distribution fairness (0-1, 1 = perfectly fair)"""
        if self.total_requests == 0:
            return 1.0
        
        expected_per_server = self.total_requests / len(self.servers)
        deviations = [abs(count - expected_per_server) for count in self.server_counts.values()]
        avg_deviation = sum(deviations) / len(deviations)
        
        # Normalize to 0-1 (lower deviation = higher fairness)
        fairness = 1 - (avg_deviation / expected_per_server) if expected_per_server > 0 else 1.0
        return max(0, min(1, fairness))
    
    def reset(self):
        """Reset balancer state"""
        self.current_index = 0
        self.total_requests = 0
        self.server_counts = {server: 0 for server in self.servers}

def simulate_load_balancing(num_requests=1000, num_servers=3):
    """
    Simulate Round Robin load balancing
    
    Args:
        num_requests: Number of requests to simulate
        num_servers: Number of servers
    """
    print(f"🔄 Simulating Round Robin with {num_servers} servers, {num_requests} requests\n")
    
    # Create servers
    servers = [f"server_{i+1}" for i in range(num_servers)]
    
    # Initialize balancer
    balancer = RoundRobinBalancer(servers)
    
    # Simulate requests
    start_time = time.time()
    
    for i in range(num_requests):
        server = balancer.get_next_server()
        
        # Print progress
        if (i + 1) % (num_requests // 10) == 0:
            print(f"✅ Processed {i + 1}/{num_requests} requests")
    
    end_time = time.time()
    elapsed = end_time - start_time
    
    # Get metrics
    metrics = balancer.get_metrics()
    metrics['elapsed_time'] = elapsed
    metrics['throughput'] = num_requests / elapsed
    
    # Display results
    print(f"\n📊 Round Robin Results:")
    print(f"   Total Requests: {metrics['total_requests']}")
    print(f"   Elapsed Time: {elapsed:.2f}s")
    print(f"   Throughput: {metrics['throughput']:.0f} req/s")
    print(f"   Fairness Score: {metrics['fairness_score']:.3f}")
    print(f"\n   Server Distribution:")
    for server, count in metrics['server_distribution'].items():
        percentage = (count / num_requests) * 100
        print(f"      {server}: {count} requests ({percentage:.1f}%)")
    
    # Save metrics
    with open('metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)
    
    print(f"\n💾 Metrics saved to: metrics.json")
    
    return metrics

if __name__ == "__main__":
    # Run simulation
    simulate_load_balancing(num_requests=10000, num_servers=3)
