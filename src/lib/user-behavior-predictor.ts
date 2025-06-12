interface UserAction {
  type: "hover" | "click" | "scroll" | "focus" | "route_change";
  target: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface UserPattern {
  userId?: string;
  sessionId: string;
  actions: UserAction[];
  predictions: Record<string, number>; // route -> probability
  preferences: {
    hoverDelay: number;
    clickFrequency: number;
    navigationSpeed: number;
    preferredRoutes: string[];
  };
}

interface PredictionModel {
  routeTransitions: Record<string, Record<string, number>>; // from -> to -> probability
  timeBasedPatterns: Record<string, number[]>; // hour -> route probability
  userClusters: Record<string, string[]>; // cluster -> routes
}

class UserBehaviorPredictor {
  private currentPattern: UserPattern;
  private model: PredictionModel;
  private abTestConfig: ABTestConfig;
  private storageKey = "bookify_user_behavior";
  private modelKey = "bookify_prediction_model";

  constructor() {
    this.currentPattern = this.initializePattern();
    this.model = this.loadModel();
    this.abTestConfig = this.initializeABTest();

    // Auto-save every 30 seconds
    setInterval(() => this.savePattern(), 30000);
  }

  private initializePattern(): UserPattern {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          sessionId: this.generateSessionId(),
          actions: parsed.actions?.slice(-50) || [], // Keep last 50 actions
        };
      } catch {
        console.warn("Failed to parse stored user pattern");
      }
    }

    return {
      sessionId: this.generateSessionId(),
      actions: [],
      predictions: {},
      preferences: {
        hoverDelay: 200,
        clickFrequency: 0,
        navigationSpeed: 1000,
        preferredRoutes: [],
      },
    };
  }

  private loadModel(): PredictionModel {
    const stored = localStorage.getItem(this.modelKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        console.warn("Failed to parse prediction model");
      }
    }

    return {
      routeTransitions: {},
      timeBasedPatterns: {},
      userClusters: {
        event_browsers: ["/events", "/"],
        bookers: ["/my-bookings", "/book/confirm"],
        admins: ["/admin/events", "/account"],
      },
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Track user action
  trackAction(
    type: UserAction["type"],
    target: string,
    metadata?: Record<string, unknown>
  ) {
    const action: UserAction = {
      type,
      target,
      timestamp: Date.now(),
      metadata,
    };

    this.currentPattern.actions.push(action);
    this.updatePreferences(action);
    this.updateModel(action);

    // Keep only recent actions
    if (this.currentPattern.actions.length > 50) {
      this.currentPattern.actions = this.currentPattern.actions.slice(-50);
    }
  }

  private updatePreferences(action: UserAction) {
    const { preferences } = this.currentPattern;

    switch (action.type) {
      case "hover": {
        // Adjust hover delay based on user behavior
        const duration = action.metadata?.duration as number;
        if (duration) {
          preferences.hoverDelay = Math.max(
            100,
            preferences.hoverDelay * 0.9 + duration * 0.1
          );
        }
        break;
      }

      case "click": {
        preferences.clickFrequency += 1;
        break;
      }

      case "route_change": {
        const route = action.target;
        if (!preferences.preferredRoutes.includes(route)) {
          preferences.preferredRoutes.push(route);
        }
        // Keep only top 10 preferred routes
        if (preferences.preferredRoutes.length > 10) {
          preferences.preferredRoutes = preferences.preferredRoutes.slice(-10);
        }
        break;
      }
    }
  }

  private updateModel(action: UserAction) {
    if (action.type === "route_change") {
      const previousAction = this.currentPattern.actions.slice(-2, -1)[0]; // Get previous action

      if (previousAction?.type === "route_change") {
        const from = previousAction.target;
        const to = action.target;

        // Update transition probabilities
        if (!this.model.routeTransitions[from]) {
          this.model.routeTransitions[from] = {};
        }

        this.model.routeTransitions[from][to] =
          (this.model.routeTransitions[from][to] || 0) + 1;
      }

      // Update time-based patterns
      const hour = new Date().getHours();
      if (!this.model.timeBasedPatterns[action.target]) {
        this.model.timeBasedPatterns[action.target] = new Array(24).fill(0);
      }
      this.model.timeBasedPatterns[action.target][hour] += 1;
    }
  }

  // Predict next likely routes
  predictNextRoutes(
    currentRoute: string
  ): Array<{ route: string; probability: number }> {
    const predictions: Array<{ route: string; probability: number }> = [];

    // Route transition predictions
    const transitions = this.model.routeTransitions[currentRoute] || {};
    const totalTransitions = Object.values(transitions).reduce(
      (sum, count) => sum + count,
      0
    );

    if (totalTransitions > 0) {
      for (const [route, count] of Object.entries(transitions)) {
        predictions.push({
          route,
          probability: count / totalTransitions,
        });
      }
    }

    // Time-based predictions
    const currentHour = new Date().getHours();
    for (const [route, hourCounts] of Object.entries(
      this.model.timeBasedPatterns
    )) {
      const hourCount = hourCounts[currentHour];
      const totalHourCount = hourCounts.reduce((sum, count) => sum + count, 0);

      if (totalHourCount > 0) {
        const timeProbability = hourCount / totalHourCount;
        const existing = predictions.find((p) => p.route === route);

        if (existing) {
          // Combine probabilities
          existing.probability = (existing.probability + timeProbability) / 2;
        } else {
          predictions.push({ route, probability: timeProbability * 0.3 }); // Lower weight for time-only
        }
      }
    }

    // User preference boost
    for (const route of this.currentPattern.preferences.preferredRoutes) {
      const existing = predictions.find((p) => p.route === route);
      if (existing) {
        existing.probability *= 1.2; // 20% boost for preferred routes
      } else {
        predictions.push({ route, probability: 0.1 });
      }
    }

    // Sort by probability and return top 5
    return predictions
      .filter((p) => p.probability > 0.05) // Minimum threshold
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5);
  }

  // Get optimal preload strategy based on user behavior
  getPreloadStrategy(currentRoute: string): {
    highPriority: string[];
    mediumPriority: string[];
    lowPriority: string[];
    delay: number;
  } {
    const predictions = this.predictNextRoutes(currentRoute);
    const { hoverDelay } = this.currentPattern.preferences;

    // A/B test for preload aggressiveness
    const isAggressiveVariant =
      this.abTestConfig.preloadStrategy === "aggressive";
    const threshold = isAggressiveVariant ? 0.1 : 0.2;

    return {
      highPriority: predictions
        .filter((p) => p.probability > 0.5)
        .map((p) => p.route),

      mediumPriority: predictions
        .filter((p) => p.probability > 0.2 && p.probability <= 0.5)
        .map((p) => p.route),

      lowPriority: predictions
        .filter((p) => p.probability > threshold && p.probability <= 0.2)
        .map((p) => p.route),

      delay: Math.max(100, hoverDelay * (isAggressiveVariant ? 0.5 : 1)),
    };
  }

  // Save pattern to localStorage
  private savePattern() {
    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(this.currentPattern)
      );
      localStorage.setItem(this.modelKey, JSON.stringify(this.model));
    } catch {
      console.warn("Failed to save user behavior pattern");
    }
  }

  // Get user cluster for analytics
  getUserCluster(): string {
    const routes = this.currentPattern.preferences.preferredRoutes;

    for (const [cluster, clusterRoutes] of Object.entries(
      this.model.userClusters
    )) {
      const overlap = routes.filter((route) =>
        clusterRoutes.includes(route)
      ).length;
      if (overlap >= 2) {
        return cluster;
      }
    }

    return "general";
  }

  // Initialize A/B test configuration
  private initializeABTest(): ABTestConfig {
    const userId = this.currentPattern.userId || this.currentPattern.sessionId;
    const variant = this.assignABTestVariant(userId);

    return {
      userId,
      variant,
      preloadStrategy: variant === "A" ? "conservative" : "aggressive",
      cacheStrategy: variant === "A" ? "minimal" : "extensive",
      metrics: {
        routeTransitionTime: [],
        cacheHitRate: 0,
        preloadSuccess: 0,
        userSatisfaction: 0,
      },
    };
  }

  private assignABTestVariant(userId: string): "A" | "B" {
    // Deterministic assignment based on user ID
    const hash = userId
      .split("")
      .reduce((hash, char) => (hash << 5) - hash + char.charCodeAt(0), 0);
    return Math.abs(hash) % 2 === 0 ? "A" : "B";
  }

  // Get A/B test configuration
  getABTestConfig(): ABTestConfig {
    return this.abTestConfig;
  }

  // Track A/B test metrics
  trackABTestMetric(metric: keyof ABTestConfig["metrics"], value: number) {
    const metrics = this.abTestConfig.metrics;

    if (metric === "routeTransitionTime") {
      metrics.routeTransitionTime.push(value);
      // Keep only last 20 measurements
      if (metrics.routeTransitionTime.length > 20) {
        metrics.routeTransitionTime = metrics.routeTransitionTime.slice(-20);
      }
    } else {
      metrics[metric] = value;
    }
  }

  // Export analytics data
  exportAnalytics() {
    return {
      userCluster: this.getUserCluster(),
      preferences: this.currentPattern.preferences,
      abTest: this.abTestConfig,
      modelStats: {
        totalTransitions: Object.keys(this.model.routeTransitions).length,
        totalTimePatterns: Object.keys(this.model.timeBasedPatterns).length,
      },
      sessionStats: {
        actionsCount: this.currentPattern.actions.length,
        sessionDuration:
          Date.now() - parseInt(this.currentPattern.sessionId.split("_")[1]),
      },
    };
  }
}

interface ABTestConfig {
  userId: string;
  variant: "A" | "B";
  preloadStrategy: "conservative" | "aggressive";
  cacheStrategy: "minimal" | "extensive";
  metrics: {
    routeTransitionTime: number[];
    cacheHitRate: number;
    preloadSuccess: number;
    userSatisfaction: number;
  };
}

// Singleton instance
export const userBehaviorPredictor = new UserBehaviorPredictor();

// React hook for user behavior prediction
export const useUserBehaviorPredictor = () => {
  const trackAction = (
    type: UserAction["type"],
    target: string,
    metadata?: Record<string, unknown>
  ) => {
    userBehaviorPredictor.trackAction(type, target, metadata);
  };

  const predictNextRoutes = (currentRoute: string) => {
    return userBehaviorPredictor.predictNextRoutes(currentRoute);
  };

  const getPreloadStrategy = (currentRoute: string) => {
    return userBehaviorPredictor.getPreloadStrategy(currentRoute);
  };

  const getABTestConfig = () => {
    return userBehaviorPredictor.getABTestConfig();
  };

  return {
    trackAction,
    predictNextRoutes,
    getPreloadStrategy,
    getABTestConfig,
    exportAnalytics: () => userBehaviorPredictor.exportAnalytics(),
  };
};
