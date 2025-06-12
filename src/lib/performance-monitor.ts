interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface LazyLoadingMetrics {
  chunkLoadTime: number;
  totalBundleSize: number;
  chunksLoaded: string[];
  cacheHitRate: number;
  preloadSuccess: number;
  preloadFailure: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private lazyLoadingMetrics: LazyLoadingMetrics = {
    chunkLoadTime: 0,
    totalBundleSize: 0,
    chunksLoaded: [],
    cacheHitRate: 0,
    preloadSuccess: 0,
    preloadFailure: 0,
  };

  // Track lazy loading performance
  trackChunkLoad(
    chunkName: string,
    loadTime: number,
    fromCache: boolean = false
  ) {
    this.addMetric("chunk_load_time", loadTime, {
      chunkName,
      fromCache,
    });

    this.lazyLoadingMetrics.chunksLoaded.push(chunkName);
    this.lazyLoadingMetrics.chunkLoadTime += loadTime;

    if (fromCache) {
      this.lazyLoadingMetrics.cacheHitRate += 1;
    }
  }

  // Track preload success/failure
  trackPreload(success: boolean, chunkName: string, duration?: number) {
    if (success) {
      this.lazyLoadingMetrics.preloadSuccess += 1;
      this.addMetric("preload_success", duration || 0, { chunkName });
    } else {
      this.lazyLoadingMetrics.preloadFailure += 1;
      this.addMetric("preload_failure", 0, { chunkName });
    }
  }

  // Track Core Web Vitals
  trackWebVitals() {
    if (typeof window === "undefined") return;

    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === "first-contentful-paint") {
          this.addMetric("first_contentful_paint", entry.startTime);
        }
      });
    });

    try {
      fcpObserver.observe({ entryTypes: ["paint"] });
    } catch {
      // Browser doesn't support this metric
    }

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.addMetric("largest_contentful_paint", lastEntry.startTime);
    });

    try {
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch {
      // Browser doesn't support this metric
    }

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShiftEntry = entry as PerformanceEntry & {
          hadRecentInput?: boolean;
          value?: number;
        };
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value || 0;
        }
      }
      this.addMetric("cumulative_layout_shift", clsValue);
    });

    try {
      clsObserver.observe({ entryTypes: ["layout-shift"] });
    } catch {
      // Browser doesn't support this metric
    }
  }

  // Track route transitions with lazy loading
  trackRouteTransition(
    from: string,
    to: string,
    loadTime: number,
    wasPreloaded: boolean
  ) {
    this.addMetric("route_transition", loadTime, {
      from,
      to,
      wasPreloaded,
    });
  }

  // Add a metric
  private addMetric(
    name: string,
    value: number,
    metadata?: Record<string, unknown>
  ) {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      metadata,
    });

    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  // Get performance summary
  getPerformanceSummary() {
    const summary = {
      lazyLoading: this.lazyLoadingMetrics,
      webVitals: this.getWebVitalsMetrics(),
      routeTransitions: this.getRouteTransitionMetrics(),
      bundleOptimization: this.getBundleOptimizationMetrics(),
    };

    return summary;
  }

  private getWebVitalsMetrics() {
    const fcp = this.metrics.find((m) => m.name === "first_contentful_paint");
    const lcp = this.metrics.find((m) => m.name === "largest_contentful_paint");
    const cls = this.metrics.find((m) => m.name === "cumulative_layout_shift");

    return {
      firstContentfulPaint: fcp?.value || null,
      largestContentfulPaint: lcp?.value || null,
      cumulativeLayoutShift: cls?.value || null,
    };
  }

  private getRouteTransitionMetrics() {
    const transitions = this.metrics.filter(
      (m) => m.name === "route_transition"
    );
    const preloadedTransitions = transitions.filter(
      (t) => t.metadata?.wasPreloaded
    );

    return {
      totalTransitions: transitions.length,
      preloadedTransitions: preloadedTransitions.length,
      avgTransitionTime:
        transitions.reduce((sum, t) => sum + t.value, 0) / transitions.length ||
        0,
      avgPreloadedTransitionTime:
        preloadedTransitions.reduce((sum, t) => sum + t.value, 0) /
          preloadedTransitions.length || 0,
    };
  }

  private getBundleOptimizationMetrics() {
    const chunkLoads = this.metrics.filter((m) => m.name === "chunk_load_time");
    const cacheHits = chunkLoads.filter((c) => c.metadata?.fromCache);

    return {
      totalChunksLoaded: chunkLoads.length,
      cacheHitRate: (cacheHits.length / chunkLoads.length) * 100 || 0,
      avgChunkLoadTime:
        chunkLoads.reduce((sum, c) => sum + c.value, 0) / chunkLoads.length ||
        0,
      totalPreloadAttempts:
        this.lazyLoadingMetrics.preloadSuccess +
        this.lazyLoadingMetrics.preloadFailure,
      preloadSuccessRate:
        (this.lazyLoadingMetrics.preloadSuccess /
          (this.lazyLoadingMetrics.preloadSuccess +
            this.lazyLoadingMetrics.preloadFailure)) *
          100 || 0,
    };
  }

  // Export data for analysis (development only)
  exportMetrics() {
    if (import.meta.env.DEV) {
      console.group("🚀 Lazy Loading Performance Metrics");
      console.table(this.getPerformanceSummary());
      console.log("Raw metrics:", this.metrics);
      console.groupEnd();
    }
  }

  // Send metrics to analytics (production)
  sendToAnalytics() {
    if (import.meta.env.PROD) {
      const summary = this.getPerformanceSummary();

      // In a real app, send to your analytics service
      // Example: analytics.track('lazy_loading_performance', summary);
      console.log("Performance metrics ready for analytics:", summary);
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const trackChunkLoad = (
    chunkName: string,
    loadTime: number,
    fromCache?: boolean
  ) => {
    performanceMonitor.trackChunkLoad(chunkName, loadTime, fromCache);
  };

  const trackPreload = (
    success: boolean,
    chunkName: string,
    duration?: number
  ) => {
    performanceMonitor.trackPreload(success, chunkName, duration);
  };

  const trackRouteTransition = (
    from: string,
    to: string,
    loadTime: number,
    wasPreloaded: boolean
  ) => {
    performanceMonitor.trackRouteTransition(from, to, loadTime, wasPreloaded);
  };

  return {
    trackChunkLoad,
    trackPreload,
    trackRouteTransition,
    exportMetrics: () => performanceMonitor.exportMetrics(),
    getMetrics: () => performanceMonitor.getPerformanceSummary(),
  };
};

// Initialize performance monitoring
export const initializePerformanceMonitoring = () => {
  performanceMonitor.trackWebVitals();

  // Export metrics every 30 seconds in development
  if (import.meta.env.DEV) {
    setInterval(() => {
      performanceMonitor.exportMetrics();
    }, 30000);
  }

  // Send metrics on page unload in production
  if (import.meta.env.PROD) {
    window.addEventListener("beforeunload", () => {
      performanceMonitor.sendToAnalytics();
    });
  }
};
