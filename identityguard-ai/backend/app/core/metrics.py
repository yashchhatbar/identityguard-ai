from collections import defaultdict
from threading import Lock


class InMemoryMetrics:
    def __init__(self):
        self._lock = Lock()
        self.request_count = 0
        self.error_count = 0
        self.path_counts = defaultdict(int)
        self.path_latency_totals = defaultdict(float)

    def record(self, path: str, status_code: int, duration_ms: float):
        with self._lock:
            self.request_count += 1
            self.path_counts[path] += 1
            self.path_latency_totals[path] += duration_ms
            if status_code >= 400:
                self.error_count += 1

    def snapshot(self):
        with self._lock:
            average_latency_ms = {
                path: round(self.path_latency_totals[path] / count, 2)
                for path, count in self.path_counts.items()
                if count
            }
            error_rate = (self.error_count / self.request_count) if self.request_count else 0.0
            return {
                "requests_total": self.request_count,
                "errors_total": self.error_count,
                "error_rate": round(error_rate, 4),
                "paths": dict(self.path_counts),
                "average_latency_ms": average_latency_ms,
            }


metrics_store = InMemoryMetrics()
