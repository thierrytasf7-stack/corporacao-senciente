from typing import Optional
from az_os.core.cost_tracker import CostTracker
from az_os.cli.cli import AzCliCommand


class MetricsCommand(AzCliCommand):
    name = "metrics"
    description = "Show cost metrics and usage statistics"

    def __init__(self):
        super().__init__()
        self.cost_tracker = CostTracker()

    def run(self, args: Optional[dict] = None) -> None:
        """Show cost metrics in USD"""
        try:
            total_cost = self.cost_tracker.get_total_cost()
            print(f"Total Cost: ${total_cost:.2f} USD")
            
            # Show detailed breakdown
            breakdown = self.cost_tracker.get_cost_breakdown()
            print("\nCost Breakdown:")
            for service, cost in breakdown.items():
                print(f"  {service}: ${cost:.2f}")
                
        except Exception as e:
            print(f"Error retrieving metrics: {e}")
            raise


metrics_cmd = MetricsCommand()