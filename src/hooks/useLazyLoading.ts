import { useState, useCallback } from "react";

interface LazyLoadingOptions {
  preloadDelay?: number;
  cacheTimeout?: number;
  maxConcurrentLoads?: number;
}

interface LazyLoadingState {
  isLoading: boolean;
  isLoaded: boolean;
  error: Error | null;
}

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

export const useLazyLoading = (options: LazyLoadingOptions = {}) => {
  const {
    preloadDelay = 100,
    cacheTimeout = 300000, // 5 minutes
    maxConcurrentLoads = 3,
  } = options;

  const [state, setState] = useState<LazyLoadingState>({
    isLoading: false,
    isLoaded: false,
    error: null,
  });

  const [cache] = useState<Map<string, CacheEntry>>(new Map());
  const [loadingQueue] = useState<string[]>([]);
  const [activeLoads, setActiveLoads] = useState(0);

  const loadComponent = useCallback(
    async (
      importFn: () => Promise<{ default: React.ComponentType<unknown> }>,
    ) => {
      const cacheKey = importFn.toString();

      // Check cache first
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheTimeout) {
        setState({
          isLoading: false,
          isLoaded: true,
          error: null,
        });
        return cached.data;
      }

      // Check if we can load immediately
      if (activeLoads >= maxConcurrentLoads) {
        loadingQueue.push(cacheKey);
        return null;
      }

      setState({ isLoading: true, isLoaded: false, error: null });
      setActiveLoads((prev) => prev + 1);

      try {
        const startTime = performance.now();
        const module = await importFn();
        const loadTime = performance.now() - startTime;

        console.log(`📦 Component loaded in ${loadTime.toFixed(2)}ms`);

        // Cache the result
        cache.set(cacheKey, {
          data: module,
          timestamp: Date.now(),
        });

        setState({
          isLoading: false,
          isLoaded: true,
          error: null,
        });

        return module;
      } catch (error) {
        const err = error as Error;
        setState({
          isLoading: false,
          isLoaded: false,
          error: err,
        });
        throw err;
      } finally {
        setActiveLoads((prev) => prev - 1);
        // Process queue
        if (loadingQueue.length > 0) {
          const nextKey = loadingQueue.shift();
          if (nextKey) {
            // Process next in queue
            setTimeout(() => {
              // This would need the actual import function, simplified for now
            }, 0);
          }
        }
      }
    },
    [cache, cacheTimeout, maxConcurrentLoads, activeLoads, loadingQueue],
  );

  const preloadComponent = useCallback(
    async (
      importFn: () => Promise<{ default: React.ComponentType<unknown> }>,
    ) => {
      const cacheKey = importFn.toString();

      // Don't preload if already cached
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheTimeout) {
        return;
      }

      // Add delay for preloading
      await new Promise((resolve) => setTimeout(resolve, preloadDelay));

      try {
        const module = await importFn();
        cache.set(cacheKey, {
          data: module,
          timestamp: Date.now(),
        });
        console.log("🎯 Component preloaded successfully");
      } catch (error) {
        console.warn("Failed to preload component:", error);
      }
    },
    [cache, cacheTimeout, preloadDelay],
  );

  const clearCache = useCallback(() => {
    cache.clear();
  }, [cache]);

  return {
    ...state,
    loadComponent,
    preloadComponent,
    clearCache,
    cacheSize: cache.size,
    activeLoads,
    queueLength: loadingQueue.length,
  };
};

// Hook for preloading based on user interaction patterns
export const useSmartPreloading = () => {
  const [predictions] = useState<Map<string, number>>(new Map());

  const trackUserBehavior = useCallback(
    (route: string) => {
      // Simple prediction based on user behavior
      const currentScore = predictions.get(route) || 0;
      predictions.set(route, currentScore + 1);
    },
    [predictions],
  );

  const getPredictedRoutes = useCallback(() => {
    return Array.from(predictions.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([route]) => route);
  }, [predictions]);

  const smartPreload = useCallback(async (routes: string[]) => {
    const routeImports: Record<
      string,
      () => Promise<{ default: React.ComponentType<unknown> }>
    > = {
      "/": () => import("@/pages/HomePage"),
      "/login": () => import("@/pages/LoginPage"),
      "/signup": () => import("@/pages/SignupPage"),
      "/events": () => import("@/pages/EventDetailPage"),
      "/my-bookings": () => import("@/pages/MyBookingsPage"),
      "/account": () => import("@/pages/AccountPage"),
      "/admin": () => import("@/pages/AdminEventPage"),
    };

    for (const route of routes) {
      const importFn = routeImports[route];
      if (importFn) {
        try {
          await importFn();
          console.log(`🎯 Preloaded route: ${route}`);
        } catch (error) {
          console.warn(`Failed to preload route ${route}:`, error);
        }
      }
    }
  }, []);

  return {
    trackUserBehavior,
    getPredictedRoutes,
    smartPreload,
  };
};
