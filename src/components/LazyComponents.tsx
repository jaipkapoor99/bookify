import React, { lazy, ComponentType } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { useFeatureFlag } from "@/lib/feature-flags";
import { usePerformanceMonitor } from "@/lib/performance-monitor";

// Enhanced loading component with smart features
export const PageLoader = ({ chunkName }: { chunkName?: string } = {}) => {
  const performanceMonitoring = useFeatureFlag("performance-monitoring");
  const { trackChunkLoad } = usePerformanceMonitor();

  // Track loading start time
  const startTime = performance.now();

  // Track when component unmounts (loading complete)
  React.useEffect(() => {
    return () => {
      if (performanceMonitoring.isEnabled && chunkName) {
        const loadTime = performance.now() - startTime;
        trackChunkLoad(chunkName, loadTime);
      }
    };
  }, [chunkName, performanceMonitoring.isEnabled, startTime, trackChunkLoad]);

  const isAdvancedLoader =
    performanceMonitoring.getVariant<string>("detailLevel") === "enhanced";

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <img
            src="/Bookify_SVG.svg"
            alt="Bookify"
            className="h-8 w-8 object-contain"
          />
          <span className="text-xl font-bold text-gray-700 opacity-75">
            Bookify
          </span>
        </div>
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">
          {isAdvancedLoader && chunkName
            ? `Loading ${chunkName}...`
            : "Loading..."}
        </p>
        {isAdvancedLoader && (
          <div className="text-xs text-muted-foreground/70">
            Smart loading enabled
          </div>
        )}
      </div>
    </div>
  );
};

// Error fallback component
export const PageError = ({
  error,
  retry,
}: {
  error: Error;
  retry?: () => void;
}) => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center space-y-4 max-w-md mx-auto p-6">
      <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        Failed to load page component: {error.message}
      </p>
      {retry && (
        <button
          onClick={retry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);

// Enhanced higher-order component with smart lazy loading
const withLazyLoading = <P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  componentName: string,
) => {
  const LazyComponent = lazy(() => {
    const startTime = performance.now();

    return importFunc().then((module) => {
      const loadTime = performance.now() - startTime;
      console.log(`📦 Loaded ${componentName} in ${loadTime.toFixed(2)}ms`);

      // Track performance if monitoring is enabled
      if (typeof window !== "undefined" && window.performance) {
        window.dispatchEvent(
          new CustomEvent("lazy-chunk-loaded", {
            detail: { componentName, loadTime },
          }),
        );
      }

      return module;
    });
  });

  const WrappedComponent = (props: P) => {
    return <LazyComponent {...props} />;
  };

  WrappedComponent.displayName = `Lazy(${componentName})`;
  return WrappedComponent;
};

// Lazy-loaded page components
export const LazyHomePage = withLazyLoading(
  () => import("@/pages/HomePage"),
  "HomePage",
);

export const LazyLoginPage = withLazyLoading(
  () => import("@/pages/LoginPage"),
  "LoginPage",
);

export const LazySignupPage = withLazyLoading(
  () => import("@/pages/SignupPage"),
  "SignupPage",
);

export const LazyEventDetailPage = withLazyLoading(
  () => import("@/pages/EventDetailPage"),
  "EventDetailPage",
);

export const LazyMyBookingsPage = withLazyLoading(
  () => import("@/pages/MyBookingsPage"),
  "MyBookingsPage",
);

export const LazyBookingConfirmationPage = withLazyLoading(
  () => import("@/pages/BookingConfirmationPage"),
  "BookingConfirmationPage",
);

export const LazyAccountPage = withLazyLoading(
  () => import("@/pages/AccountPage"),
  "AccountPage",
);

// Admin page - highest priority for lazy loading
export const LazyAdminEventPage = withLazyLoading(
  () => import("@/pages/AdminEventPage"),
  "AdminEventPage",
);

export const LazyAuthCallback = withLazyLoading(
  () => import("@/pages/AuthCallback"),
  "AuthCallback",
);

// Enhanced preload functions with smart capabilities
export const preloadComponents = {
  // Preload when user hovers over navigation links
  homepage: () => {
    const startTime = performance.now();
    return import("@/pages/HomePage").then((module) => {
      const loadTime = performance.now() - startTime;
      console.log(`🎯 Preloaded HomePage in ${loadTime.toFixed(2)}ms`);
      return module;
    });
  },

  events: () => {
    const startTime = performance.now();
    return import("@/pages/EventDetailPage").then((module) => {
      const loadTime = performance.now() - startTime;
      console.log(`🎯 Preloaded EventDetailPage in ${loadTime.toFixed(2)}ms`);
      return module;
    });
  },

  bookings: () => {
    const startTime = performance.now();
    return import("@/pages/MyBookingsPage").then((module) => {
      const loadTime = performance.now() - startTime;
      console.log(`🎯 Preloaded MyBookingsPage in ${loadTime.toFixed(2)}ms`);
      return module;
    });
  },

  account: () => {
    const startTime = performance.now();
    return import("@/pages/AccountPage").then((module) => {
      const loadTime = performance.now() - startTime;
      console.log(`🎯 Preloaded AccountPage in ${loadTime.toFixed(2)}ms`);
      return module;
    });
  },

  // Preload admin components only for admin users
  admin: () => {
    const startTime = performance.now();
    return import("@/pages/AdminEventPage").then((module) => {
      const loadTime = performance.now() - startTime;
      console.log(`🎯 Preloaded AdminEventPage in ${loadTime.toFixed(2)}ms`);
      return module;
    });
  },

  // Preload booking flow components when user starts booking process
  bookingFlow: () => {
    const startTime = performance.now();
    return Promise.all([
      import("@/pages/BookingConfirmationPage"),
      import("@/pages/MyBookingsPage"),
    ]).then((modules) => {
      const loadTime = performance.now() - startTime;
      console.log(`🎯 Preloaded booking flow in ${loadTime.toFixed(2)}ms`);
      return modules;
    });
  },
};
