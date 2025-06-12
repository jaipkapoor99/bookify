import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSmartLazyLoading } from "@/lib/smart-lazy-loading";
import { featureFlagManager } from "@/lib/feature-flags";
import { userBehaviorPredictor } from "@/lib/user-behavior-predictor";
import { moduleFederationManager } from "@/lib/module-federation";

interface AnalyticsData {
  performance?: {
    navigation: PerformanceNavigation;
    timing: PerformanceTiming;
  } | null;
  userBehavior: ReturnType<typeof userBehaviorPredictor.exportAnalytics>;
  featureFlags: ReturnType<typeof featureFlagManager.getAnalyticsData>;
  moduleFederation: ReturnType<typeof moduleFederationManager.getStats>;
}

interface FeatureFlag {
  key: string;
  enabled: boolean;
  isActive: boolean;
  variants?: Record<string, unknown>;
}

const DevTools: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const { reset } = useSmartLazyLoading();

  // Always call hooks - move useEffect outside conditional
  useEffect(() => {
    if (isOpen) {
      updateAnalytics();
      updateFlags();
    }
  }, [isOpen]);

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  const updateAnalytics = () => {
    try {
      const analyticsData: AnalyticsData = {
        performance: window.performance
          ? {
              navigation: performance.navigation,
              timing: performance.timing,
            }
          : null,
        userBehavior: userBehaviorPredictor.exportAnalytics(),
        featureFlags: featureFlagManager.getAnalyticsData(),
        moduleFederation: moduleFederationManager.getStats(),
      };
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Failed to get analytics:", error);
    }
  };

  const updateFlags = () => {
    try {
      const allFlags = featureFlagManager.getAllFlags();
      setFlags(allFlags);
    } catch (error) {
      console.error("Failed to get flags:", error);
    }
  };

  const handleToggleFlag = (flagKey: string, enabled: boolean) => {
    featureFlagManager.override(flagKey, enabled);
    updateFlags();
    updateAnalytics();
  };

  const handleReset = async () => {
    try {
      await reset();
      featureFlagManager.clearAllOverrides();
      updateAnalytics();
      updateFlags();
      console.log("🧹 DevTools: System reset complete");
    } catch (error) {
      console.error("Reset failed:", error);
    }
  };

  const handlePreloadTest = async () => {
    try {
      console.log("🧪 DevTools: Testing preload...");
      await import("@/pages/HomePage");
      await import("@/pages/EventDetailPage");
      console.log("✅ DevTools: Preload test complete");
      updateAnalytics();
    } catch (error) {
      console.error("Preload test failed:", error);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
          className="bg-black text-white border-gray-600 hover:bg-gray-800"
        >
          🛠️ DevTools
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-y-auto">
      <Card className="bg-black/95 text-white border-gray-600">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">
              Smart Lazy Loading DevTools
            </CardTitle>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-gray-800"
            >
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 text-xs">
          {/* Quick Actions */}
          <div className="space-y-2">
            <h4 className="font-semibold text-yellow-400">Quick Actions</h4>
            <div className="flex gap-2">
              <Button
                onClick={updateAnalytics}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                🔄 Refresh
              </Button>
              <Button
                onClick={handlePreloadTest}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                🧪 Test Preload
              </Button>
              <Button
                onClick={handleReset}
                size="sm"
                variant="outline"
                className="text-xs text-red-400"
              >
                🧹 Reset
              </Button>
            </div>
          </div>

          {/* Feature Flags */}
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-400">Feature Flags</h4>
            <div className="space-y-1">
              {flags.map((flag) => (
                <div
                  key={flag.key}
                  className="flex items-center justify-between"
                >
                  <span className="text-xs truncate">{flag.key}</span>
                  <div className="flex items-center gap-1">
                    <Badge
                      variant={flag.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {flag.isActive ? "ON" : "OFF"}
                    </Badge>
                    <Button
                      onClick={() => handleToggleFlag(flag.key, !flag.isActive)}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                    >
                      🔄
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          {analytics?.performance && (
            <div className="space-y-2">
              <h4 className="font-semibold text-green-400">Performance</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">Load:</span>
                  <span className="ml-1">
                    {Math.round(
                      analytics.performance.timing.loadEventEnd -
                        analytics.performance.timing.navigationStart
                    )}
                    ms
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">DOM:</span>
                  <span className="ml-1">
                    {Math.round(
                      analytics.performance.timing.domContentLoadedEventEnd -
                        analytics.performance.timing.navigationStart
                    )}
                    ms
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* User Behavior */}
          {analytics?.userBehavior && (
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-400">User Behavior</h4>
              <div className="text-xs space-y-1">
                <div>
                  <span className="text-gray-400">Cluster:</span>
                  <span className="ml-1">
                    {analytics.userBehavior.userCluster}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Actions:</span>
                  <span className="ml-1">
                    {analytics.userBehavior.sessionStats.actionsCount}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">A/B Variant:</span>
                  <span className="ml-1">
                    {analytics.userBehavior.abTest.variant}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Module Federation */}
          {analytics?.moduleFederation && (
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-400">
                Module Federation
              </h4>
              <div className="text-xs space-y-1">
                <div>
                  <span className="text-gray-400">Loaded:</span>
                  <span className="ml-1">
                    {analytics.moduleFederation.totalModules}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Avg Load:</span>
                  <span className="ml-1">
                    {analytics.moduleFederation.avgLoadTime}ms
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Cache Status */}
          <div className="space-y-2">
            <h4 className="font-semibold text-cyan-400">Cache Status</h4>
            <div className="text-xs">
              <div>
                <span className="text-gray-400">SW:</span>
                <span className="ml-1">
                  {navigator.serviceWorker?.controller
                    ? "✅ Active"
                    : "❌ Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Debug Commands */}
          <div className="space-y-2">
            <h4 className="font-semibold text-red-400">Debug</h4>
            <div className="text-xs text-gray-400">
              <div>Console commands:</div>
              <div>• window.bookifyDebug.analytics()</div>
              <div>• window.bookifyDebug.flags()</div>
              <div>• window.bookifyDebug.reset()</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Add debug functions to window for console access
if (typeof window !== "undefined" && import.meta.env.DEV) {
  (
    window as unknown as { bookifyDebug: Record<string, unknown> }
  ).bookifyDebug = {
    analytics: () => {
      const analyticsData = {
        userBehavior: userBehaviorPredictor.exportAnalytics(),
        featureFlags: featureFlagManager.getAnalyticsData(),
        moduleFederation: moduleFederationManager.getStats(),
      };
      console.table(analyticsData);
      return analyticsData;
    },
    flags: () => {
      const flagsData = featureFlagManager.getAllFlags();
      console.table(flagsData);
      return flagsData;
    },
    reset: async () => {
      featureFlagManager.clearAllOverrides();
      moduleFederationManager.clearAll();
      console.log("🧹 Debug: System reset");
    },
    preload: async (route: string) => {
      const componentMap: Record<string, () => Promise<unknown>> = {
        "/": () => import("@/pages/HomePage"),
        "/login": () => import("@/pages/LoginPage"),
        "/signup": () => import("@/pages/SignupPage"),
        "/my-bookings": () => import("@/pages/MyBookingsPage"),
        "/account": () => import("@/pages/AccountPage"),
        "/admin/events": () => import("@/pages/AdminEventPage"),
      };

      const importFn = componentMap[route];
      if (importFn) {
        const start = performance.now();
        await importFn();
        const time = performance.now() - start;
        console.log(`🧪 Preloaded ${route} in ${time.toFixed(2)}ms`);
      } else {
        console.warn(`Unknown route: ${route}`);
      }
    },
  };
}

export default DevTools;
