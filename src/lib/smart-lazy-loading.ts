import React, { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  performanceMonitor,
  initializePerformanceMonitoring,
} from "./performance-monitor";
import {
  userBehaviorPredictor,
  useUserBehaviorPredictor,
} from "./user-behavior-predictor";
import {
  featureFlagManager,
  useFeatureFlag,
  useProgressiveEnhancement,
} from "./feature-flags";
import { moduleFederationManager } from "./module-federation";

interface SmartLazyLoadingConfig {
  enableServiceWorker: boolean;
  enableBehaviorPrediction: boolean;
  enableModuleFederation: boolean;
  enablePerformanceMonitoring: boolean;
  aggressivePreloading: boolean;
}

class SmartLazyLoadingManager {
  private config: SmartLazyLoadingConfig;
  private initialized = false;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.config = this.getConfig();
    this.initialize();
  }

  private getConfig(): SmartLazyLoadingConfig {
    return {
      enableServiceWorker: featureFlagManager.isEnabled(
        "service-worker-caching"
      ),
      enableBehaviorPrediction: featureFlagManager.isEnabled(
        "user-behavior-prediction"
      ),
      enableModuleFederation: featureFlagManager.isEnabled(
        "micro-frontend-loader"
      ),
      enablePerformanceMonitoring: featureFlagManager.isEnabled(
        "performance-monitoring"
      ),
      aggressivePreloading: featureFlagManager.isEnabled(
        "intelligent-preloading"
      ),
    };
  }

  async initialize() {
    if (this.initialized) return;

    console.log("🚀 Initializing Smart Lazy Loading System...");

    try {
      // Initialize performance monitoring first
      if (this.config.enablePerformanceMonitoring) {
        initializePerformanceMonitoring();
      }

      // Register service worker for chunk caching
      if (this.config.enableServiceWorker) {
        await this.registerServiceWorker();
      }

      // Set up user behavior tracking
      if (this.config.enableBehaviorPrediction) {
        this.initializeBehaviorTracking();
      }

      // Connect service worker with performance monitoring
      this.connectServiceWorkerMetrics();

      this.initialized = true;
      console.log("✅ Smart Lazy Loading System initialized");
    } catch (error) {
      console.error(
        "❌ Failed to initialize Smart Lazy Loading System:",
        error
      );
    }
  }

  private async registerServiceWorker(): Promise<void> {
    if (!("serviceWorker" in navigator)) {
      console.warn("Service Worker not supported");
      return;
    }

    try {
      this.serviceWorkerRegistration = await navigator.serviceWorker.register(
        "/sw.js",
        {
          scope: "/",
        }
      );

      console.log("✅ Service Worker registered");

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener("message", (event) => {
        this.handleServiceWorkerMessage(event);
      });

      // Update context in feature flags
      featureFlagManager.updateContext({
        userAgent: navigator.userAgent,
      });
    } catch (error) {
      console.error("❌ Service Worker registration failed:", error);
    }
  }

  private handleServiceWorkerMessage(event: MessageEvent) {
    const { type, data } = event.data;

    switch (type) {
      case "PERFORMANCE_METRIC":
        // Forward SW metrics to performance monitor
        performanceMonitor.trackChunkLoad(
          data.chunkName,
          data.duration,
          data.type === "chunk_cache_hit"
        );
        break;
    }
  }

  private initializeBehaviorTracking() {
    // Track route changes
    this.trackRouteChange(window.location.pathname);

    // Track user interactions
    document.addEventListener("click", (event) => {
      const target = (event.target as Element)?.closest("a, button");
      if (target) {
        userBehaviorPredictor.trackAction(
          "click",
          this.getTargetIdentifier(target)
        );
      }
    });

    document.addEventListener("mouseover", (event) => {
      const target = (event.target as Element)?.closest("a[href]");
      if (target) {
        const startTime = Date.now();
        const handleMouseLeave = () => {
          const duration = Date.now() - startTime;
          userBehaviorPredictor.trackAction(
            "hover",
            this.getTargetIdentifier(target),
            { duration }
          );
          target.removeEventListener("mouseleave", handleMouseLeave);
        };
        target.addEventListener("mouseleave", handleMouseLeave);
      }
    });
  }

  private getTargetIdentifier(element: Element): string {
    const href = element.getAttribute("href");
    const id = element.getAttribute("id");
    const className = element.getAttribute("class");

    return href || id || className || element.tagName.toLowerCase();
  }

  private connectServiceWorkerMetrics() {
    if (!this.serviceWorkerRegistration) return;

    // Send preload requests to service worker
    // @ts-expect-error - window.import doesn't exist but we're extending it
    const originalImport = window.import;
    // @ts-expect-error - Extending window with import functionality
    window.import = async (url: string) => {
      // Track import request
      performanceMonitor.trackPreload(true, url);

      // Notify service worker about chunk request
      this.serviceWorkerRegistration?.active?.postMessage({
        type: "PRELOAD_CHUNK",
        data: { url, chunkName: this.extractChunkNameFromUrl(url) },
      });

      return originalImport(url);
    };
  }

  private extractChunkNameFromUrl(url: string): string {
    const filename = url.split("/").pop() || "";
    const match =
      filename.match(/^(.+?)-[a-f0-9]{8}\.js$/) ||
      filename.match(/^(.+?)\.js$/);
    return match ? match[1] : filename;
  }

  // Smart preloading based on user behavior and feature flags
  async performSmartPreload(currentRoute: string): Promise<void> {
    if (!this.config.enableBehaviorPrediction) return;

    const strategy = userBehaviorPredictor.getPreloadStrategy(currentRoute);
    const abTestConfig = userBehaviorPredictor.getABTestConfig();

    // High priority - preload immediately
    for (const route of strategy.highPriority) {
      await this.preloadRoute(route, 0);
    }

    // Medium priority - preload with delay
    setTimeout(() => {
      strategy.mediumPriority.forEach((route) =>
        this.preloadRoute(route, strategy.delay)
      );
    }, strategy.delay);

    // Low priority - preload only if user is in aggressive variant
    if (abTestConfig.preloadStrategy === "aggressive") {
      setTimeout(() => {
        strategy.lowPriority.forEach((route) =>
          this.preloadRoute(route, strategy.delay * 2)
        );
      }, strategy.delay * 2);
    }
  }

  private async preloadRoute(route: string, delay: number = 0): Promise<void> {
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    try {
      // Map route to component imports
      const componentMap: Record<
        string,
        () => Promise<{ default: React.ComponentType<unknown> }>
      > = {
        "/": () => import("@/pages/HomePage"),
        "/login": () => import("@/pages/LoginPage"),
        "/signup": () => import("@/pages/SignupPage"),
        "/my-bookings": () => import("@/pages/MyBookingsPage"),
        "/account": () => import("@/pages/AccountPage"),
        "/admin/events": () => import("@/pages/AdminEventPage"),
      };

      const importFn = componentMap[route];
      if (importFn) {
        await importFn();
        console.log(`📦 Preloaded route: ${route}`);

        // Track successful preload
        performanceMonitor.trackPreload(true, route);
        userBehaviorPredictor.trackABTestMetric("preloadSuccess", 1);
      }
    } catch (error) {
      console.warn(`Failed to preload route: ${route}`, error);
      performanceMonitor.trackPreload(false, route);
      userBehaviorPredictor.trackABTestMetric("preloadSuccess", 0);
    }
  }

  // Track route changes for behavior analysis
  trackRouteChange(newRoute: string, previousRoute?: string): void {
    if (!this.config.enableBehaviorPrediction) return;

    const startTime = performance.now();

    userBehaviorPredictor.trackAction("route_change", newRoute);
    featureFlagManager.updateContext({ route: newRoute });

    // Measure route transition performance
    requestAnimationFrame(() => {
      const loadTime = performance.now() - startTime;
      const predictions = userBehaviorPredictor.predictNextRoutes(newRoute);
      const wasPreloaded = predictions.some(
        (p) => p.route === newRoute && p.probability > 0.5
      );

      performanceMonitor.trackRouteTransition(
        previousRoute || "",
        newRoute,
        loadTime,
        wasPreloaded
      );

      userBehaviorPredictor.trackABTestMetric("routeTransitionTime", loadTime);
    });

    // Trigger smart preloading for next routes
    this.performSmartPreload(newRoute);
  }

  // Handle dynamic module loading with federation fallback
  async loadModuleSmart(moduleName: string): Promise<unknown> {
    if (!this.config.enableModuleFederation) {
      throw new Error("Module federation disabled");
    }

    const startTime = performance.now();

    try {
      const result = await moduleFederationManager.loadModule(moduleName);
      const loadTime = performance.now() - startTime;

      performanceMonitor.trackChunkLoad(moduleName, loadTime, result.cached);
      return result;
    } catch (error) {
      console.error(`Smart module loading failed for: ${moduleName}`, error);
      throw error;
    }
  }

  // Get comprehensive analytics
  getAnalytics() {
    return {
      config: this.config,
      performance: performanceMonitor.getPerformanceSummary(),
      userBehavior: userBehaviorPredictor.exportAnalytics(),
      featureFlags: featureFlagManager.getAnalyticsData(),
      moduleFederation: this.config.enableModuleFederation
        ? moduleFederationManager.getStats()
        : null,
    };
  }

  // Clear all caches and reset (for development)
  async reset(): Promise<void> {
    // Clear service worker cache
    if (this.serviceWorkerRegistration) {
      this.serviceWorkerRegistration.active?.postMessage({
        type: "CLEAR_CHUNK_CACHE",
      });
    }

    // Clear module federation cache
    if (this.config.enableModuleFederation) {
      moduleFederationManager.clearAll();
    }

    // Clear feature flag overrides
    featureFlagManager.clearAllOverrides();

    console.log("🧹 Smart Lazy Loading System reset");
  }
}

// Singleton instance
export const smartLazyLoadingManager = new SmartLazyLoadingManager();

// React hook for smart lazy loading
export const useSmartLazyLoading = () => {
  const location = useLocation();
  const { trackAction, getPreloadStrategy } = useUserBehaviorPredictor();
  const { capabilities } = useProgressiveEnhancement();
  const intelligentPreloading = useFeatureFlag("intelligent-preloading");

  // Track route changes
  useEffect(() => {
    smartLazyLoadingManager.trackRouteChange(location.pathname);
  }, [location.pathname]);

  // Smart preload function
  const smartPreload = useCallback(
    async (target: string, event: "hover" | "focus" = "hover") => {
      if (!intelligentPreloading.isEnabled) return;

      const strategy = getPreloadStrategy(location.pathname);
      const delay =
        (intelligentPreloading.getVariant("delay") as number) || strategy.delay;

      // Track the interaction
      trackAction(event, target);

      // Preload based on prediction
      setTimeout(() => {
        smartLazyLoadingManager.performSmartPreload(target);
      }, delay);
    },
    [location.pathname, intelligentPreloading, getPreloadStrategy, trackAction]
  );

  // Load module with smart federation
  const loadModule = useCallback(async (moduleName: string) => {
    return smartLazyLoadingManager.loadModuleSmart(moduleName);
  }, []);

  return {
    smartPreload,
    loadModule,
    capabilities,
    analytics: () => smartLazyLoadingManager.getAnalytics(),
    reset: () => smartLazyLoadingManager.reset(),
  };
};

// HOC for smart lazy loading
export const withSmartLazyLoading = <P extends Record<string, unknown>>(
  Component: React.ComponentType<P>,
  preloadTargets?: string[]
) => {
  const WrappedComponent = (props: P) => {
    const { smartPreload } = useSmartLazyLoading();

    useEffect(() => {
      if (preloadTargets) {
        preloadTargets.forEach((target) => smartPreload(target));
      }
    }, [smartPreload]);

    return React.createElement(Component, props);
  };

  return WrappedComponent;
};

// Initialize the system on import
if (typeof window !== "undefined") {
  smartLazyLoadingManager.initialize();
}
