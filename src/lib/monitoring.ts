
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
}

class MonitoringService {
  private metrics: PerformanceMetric[] = [];
  private static instance: MonitoringService;

  private constructor() {}

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  trackMetric(name: string, value: number) {
    this.metrics.push({
      name,
      value,
      timestamp: new Date()
    });

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Log performance issues
    if (value > 5000 && name.includes('load_time')) {
      console.warn(`Slow ${name}: ${value}ms`);
    }
  }

  trackPageLoad(pageName: string) {
    const loadTime = performance.now();
    this.trackMetric(`page_load_${pageName}`, loadTime);
  }

  trackApiCall(endpoint: string, duration: number, success: boolean) {
    this.trackMetric(`api_${endpoint}_duration`, duration);
    this.trackMetric(`api_${endpoint}_${success ? 'success' : 'error'}`, 1);
  }

  trackUserAction(action: string) {
    this.trackMetric(`user_action_${action}`, 1);
  }

  getMetrics() {
    return this.metrics;
  }

  getAverageMetric(name: string) {
    const relevantMetrics = this.metrics.filter(m => m.name === name);
    if (relevantMetrics.length === 0) return 0;
    
    const sum = relevantMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / relevantMetrics.length;
  }
}

export const monitoring = MonitoringService.getInstance();

// Performance observer for Core Web Vitals
export const setupPerformanceMonitoring = () => {
  if (typeof window === 'undefined') return;

  // Monitor Core Web Vitals
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      // Cast to specific performance entry types that have duration/value properties
      if (entry.entryType === 'measure' || entry.entryType === 'navigation') {
        const performanceEntry = entry as PerformanceNavigationTiming | PerformanceMeasure;
        monitoring.trackMetric(entry.name, performanceEntry.duration || 0);
      } else if (entry.entryType === 'paint') {
        const paintEntry = entry as PerformancePaintTiming;
        monitoring.trackMetric(entry.name, paintEntry.startTime);
      }
    }
  });

  observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });

  // Monitor resource loading
  const resourceObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const resourceEntry = entry as PerformanceResourceTiming;
      if (resourceEntry.duration > 1000) {
        monitoring.trackMetric(`slow_resource_${entry.name}`, resourceEntry.duration);
      }
    }
  });

  resourceObserver.observe({ entryTypes: ['resource'] });
};
