interface FeatureFlag {
  key: string;
  enabled: boolean;
  variants?: Record<string, unknown>;
  rolloutPercentage: number;
  conditions?: {
    userAgent?: string[];
    userRole?: string[];
    route?: string[];
    timeWindow?: {
      start: string;
      end: string;
    };
  };
}

interface FeatureFlagContext {
  userId?: string;
  userRole?: string;
  route: string;
  userAgent: string;
  timestamp: number;
}

class FeatureFlagManager {
  private flags: Map<string, FeatureFlag> = new Map();
  private context: FeatureFlagContext;
  private overrides: Map<string, boolean> = new Map();

  constructor() {
    this.context = this.initializeContext();
    this.initializeFlags();
    this.loadOverrides();
  }

  private initializeContext(): FeatureFlagContext {
    return {
      route: window.location.pathname,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    };
  }

  private initializeFlags() {
    // Core lazy loading features
    this.flags.set("lazy-loading-v2", {
      key: "lazy-loading-v2",
      enabled: true,
      rolloutPercentage: 100,
      variants: {
        strategy: "aggressive",
        preloadDelay: 100,
      },
    });

    this.flags.set("service-worker-caching", {
      key: "service-worker-caching",
      enabled: true,
      rolloutPercentage: 80,
      conditions: {
        userAgent: ["Chrome", "Firefox", "Safari", "Edge"],
      },
    });

    this.flags.set("user-behavior-prediction", {
      key: "user-behavior-prediction",
      enabled: true,
      rolloutPercentage: 50,
      variants: {
        modelVersion: "v2",
        predictionThreshold: 0.2,
      },
    });

    this.flags.set("intelligent-preloading", {
      key: "intelligent-preloading",
      enabled: true,
      rolloutPercentage: 70,
      conditions: {
        userRole: ["customer", "admin"],
      },
      variants: {
        algorithm: "ml-enhanced",
        cacheStrategy: "adaptive",
      },
    });

    this.flags.set("performance-monitoring", {
      key: "performance-monitoring",
      enabled: true,
      rolloutPercentage: 100,
      variants: {
        detailLevel: "standard",
        reportingInterval: 30000,
      },
    });

    this.flags.set("micro-frontend-loader", {
      key: "micro-frontend-loader",
      enabled: false,
      rolloutPercentage: 10,
      conditions: {
        userRole: ["admin"],
        route: ["/admin"],
      },
      variants: {
        loadingStrategy: "dynamic",
        isolationLevel: "sandbox",
      },
    });

    this.flags.set("advanced-image-lazy-loading", {
      key: "advanced-image-lazy-loading",
      enabled: true,
      rolloutPercentage: 90,
      variants: {
        intersectionThreshold: 0.1,
        rootMargin: "50px",
        enableWebP: true,
      },
    });

    this.flags.set("route-based-prefetching", {
      key: "route-based-prefetching",
      enabled: true,
      rolloutPercentage: 85,
      variants: {
        prefetchStrategy: "hover-intent",
        maxConcurrentPrefetch: 2,
      },
    });
  }

  updateContext(updates: Partial<FeatureFlagContext>) {
    this.context = { ...this.context, ...updates };
  }

  isEnabled(flagKey: string): boolean {
    // Check for override first
    if (this.overrides.has(flagKey)) {
      return this.overrides.get(flagKey)!;
    }

    const flag = this.flags.get(flagKey);
    if (!flag) {
      console.warn(`Feature flag '${flagKey}' not found`);
      return false;
    }

    // Check if flag is globally disabled
    if (!flag.enabled) {
      return false;
    }

    // Check rollout percentage
    if (!this.isInRollout(flag)) {
      return false;
    }

    // Check conditions
    if (flag.conditions && !this.meetConditions(flag.conditions)) {
      return false;
    }

    return true;
  }

  getVariant<T = unknown>(flagKey: string, variantKey: string): T | null {
    if (!this.isEnabled(flagKey)) {
      return null;
    }

    const flag = this.flags.get(flagKey);
    if (!flag?.variants) {
      return null;
    }

    return (flag.variants[variantKey] as T) || null;
  }

  getAllVariants(flagKey: string): Record<string, unknown> | null {
    if (!this.isEnabled(flagKey)) {
      return null;
    }

    const flag = this.flags.get(flagKey);
    return flag?.variants || null;
  }

  private isInRollout(flag: FeatureFlag): boolean {
    if (flag.rolloutPercentage >= 100) {
      return true;
    }

    // Use consistent hash for same user
    const hashInput = this.context.userId || this.context.userAgent;
    const hash = this.simpleHash(hashInput + flag.key);
    const percentage = hash % 100;

    return percentage < flag.rolloutPercentage;
  }

  private meetConditions(conditions: FeatureFlag["conditions"]): boolean {
    if (!conditions) return true;

    // Check user agent
    if (conditions.userAgent) {
      const userAgent = this.context.userAgent.toLowerCase();
      const hasMatchingUA = conditions.userAgent.some((ua) =>
        userAgent.includes(ua.toLowerCase()),
      );
      if (!hasMatchingUA) return false;
    }

    // Check user role
    if (conditions.userRole && this.context.userRole) {
      if (!conditions.userRole.includes(this.context.userRole)) {
        return false;
      }
    }

    // Check route
    if (conditions.route) {
      const hasMatchingRoute = conditions.route.some((route) =>
        this.context.route.startsWith(route),
      );
      if (!hasMatchingRoute) return false;
    }

    // Check time window
    if (conditions.timeWindow) {
      const now = new Date();
      const start = new Date(conditions.timeWindow.start);
      const end = new Date(conditions.timeWindow.end);

      if (now < start || now > end) {
        return false;
      }
    }

    return true;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Override flags for testing/development
  override(flagKey: string, enabled: boolean) {
    this.overrides.set(flagKey, enabled);
    this.saveOverrides();
  }

  removeOverride(flagKey: string) {
    this.overrides.delete(flagKey);
    this.saveOverrides();
  }

  clearAllOverrides() {
    this.overrides.clear();
    this.saveOverrides();
  }

  private loadOverrides() {
    try {
      const stored = localStorage.getItem("bookify_feature_flag_overrides");
      if (stored) {
        const overrides = JSON.parse(stored);
        this.overrides = new Map(Object.entries(overrides));
      }
    } catch {
      console.warn("Failed to load feature flag overrides");
    }
  }

  private saveOverrides() {
    try {
      const overrides = Object.fromEntries(this.overrides);
      localStorage.setItem(
        "bookify_feature_flag_overrides",
        JSON.stringify(overrides),
      );
    } catch {
      console.warn("Failed to save feature flag overrides");
    }
  }

  // Get all flags for debugging
  getAllFlags(): Array<{
    key: string;
    enabled: boolean;
    isActive: boolean;
    variants?: Record<string, unknown>;
  }> {
    return Array.from(this.flags.values()).map((flag) => ({
      key: flag.key,
      enabled: flag.enabled,
      isActive: this.isEnabled(flag.key),
      variants: flag.variants,
    }));
  }

  // Analytics export
  getAnalyticsData() {
    const activeFlags = Array.from(this.flags.keys()).filter((key) =>
      this.isEnabled(key),
    );

    return {
      context: this.context,
      activeFlags,
      totalFlags: this.flags.size,
      overridesCount: this.overrides.size,
    };
  }
}

// Singleton instance
export const featureFlagManager = new FeatureFlagManager();

// React hook for feature flags
export const useFeatureFlag = (flagKey: string) => {
  const isEnabled = featureFlagManager.isEnabled(flagKey);

  const getVariant = <T = unknown>(variantKey: string): T | null => {
    return featureFlagManager.getVariant<T>(flagKey, variantKey);
  };

  const getAllVariants = (): Record<string, unknown> | null => {
    return featureFlagManager.getAllVariants(flagKey);
  };

  return {
    isEnabled,
    getVariant,
    getAllVariants,
  };
};

// React hook for progressive enhancement
export const useProgressiveEnhancement = () => {
  const hasServiceWorkerSupport = "serviceWorker" in navigator;
  const hasIntersectionObserverSupport = "IntersectionObserver" in window;
  const hasPerformanceObserverSupport = "PerformanceObserver" in window;
  const hasWebPSupport = checkWebPSupport();

  const capabilities = {
    serviceWorker: hasServiceWorkerSupport,
    intersectionObserver: hasIntersectionObserverSupport,
    performanceObserver: hasPerformanceObserverSupport,
    webP: hasWebPSupport,
    localStorage: checkLocalStorageSupport(),
    modules: checkModuleSupport(),
  };

  const canUseLazyLoading = capabilities.intersectionObserver;
  const canUseServiceWorker =
    capabilities.serviceWorker &&
    featureFlagManager.isEnabled("service-worker-caching");
  const canUsePerformanceMonitoring =
    capabilities.performanceObserver &&
    featureFlagManager.isEnabled("performance-monitoring");

  return {
    capabilities,
    canUseLazyLoading,
    canUseServiceWorker,
    canUsePerformanceMonitoring,
    getEnhancementLevel: () => calculateEnhancementLevel(capabilities),
  };
};

function checkWebPSupport(): boolean {
  try {
    // Check if we're in a test environment (JSDOM)
    if (
      typeof window !== "undefined" &&
      window.navigator?.userAgent?.includes("jsdom")
    ) {
      return false; // Assume no WebP support in test environment
    }

    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const dataUrl = canvas.toDataURL("image/webp");
    return !!(dataUrl && dataUrl.indexOf("data:image/webp") === 0);
  } catch {
    return false;
  }
}

function checkLocalStorageSupport(): boolean {
  try {
    const test = "__test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

function checkModuleSupport(): boolean {
  const script = document.createElement("script");
  return "noModule" in script;
}

function calculateEnhancementLevel(
  capabilities: Record<string, boolean>,
): "basic" | "enhanced" | "premium" {
  const supportedFeatures = Object.values(capabilities).filter(Boolean).length;

  if (supportedFeatures >= 5) return "premium";
  if (supportedFeatures >= 3) return "enhanced";
  return "basic";
}
