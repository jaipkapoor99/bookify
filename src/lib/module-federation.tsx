import React from "react";

// Extend Window interface for third-party libraries
declare global {
  interface Window {
    React?: typeof React;
    ReactDOM?: typeof import("react-dom");
    Chart?: unknown;
    ReactHookForm?: unknown;
    Fuse?: unknown;
    Stripe?: unknown;
    BookifyModules?: Record<string, unknown>;
    modules?: Record<string, unknown>;
  }
}

interface ModuleMetadata {
  name: string;
  version: string;
  url: string;
  dependencies: string[];
  fallbackUrl?: string;
  integrity?: string;
  timeout?: number;
}

interface ModuleWithCleanup {
  cleanup?: () => void;
  [key: string]: unknown;
}

interface LoadedModule {
  module: ModuleWithCleanup;
  metadata: ModuleMetadata;
  loadTime: number;
  cached: boolean;
}

interface ModuleRegistry {
  [key: string]: ModuleMetadata;
}

class ModuleFederationManager {
  private modules: Map<string, LoadedModule> = new Map();
  private registry: ModuleRegistry = {};
  private loadingPromises: Map<string, Promise<LoadedModule>> = new Map();
  private maxConcurrentLoads = 3;
  private loadingQueue: string[] = [];
  private activeLoads = 0;

  constructor() {
    this.initializeRegistry();
    this.setupErrorHandling();
  }

  private initializeRegistry() {
    // Admin micro-frontend modules
    this.registry["admin-dashboard"] = {
      name: "admin-dashboard",
      version: "1.0.0",
      url: "/modules/admin-dashboard.js",
      dependencies: ["react", "react-dom"],
      fallbackUrl: "/modules/admin-dashboard-fallback.js",
      timeout: 10000,
    };

    this.registry["analytics-widget"] = {
      name: "analytics-widget",
      version: "1.2.0",
      url: "/modules/analytics-widget.js",
      dependencies: ["chart.js"],
      timeout: 5000,
    };

    this.registry["user-preferences"] = {
      name: "user-preferences",
      version: "1.1.0",
      url: "/modules/user-preferences.js",
      dependencies: ["react-hook-form"],
      timeout: 8000,
    };

    this.registry["advanced-search"] = {
      name: "advanced-search",
      version: "2.0.0",
      url: "/modules/advanced-search.js",
      dependencies: ["fuse.js"],
      timeout: 7000,
    };

    this.registry["payment-gateway"] = {
      name: "payment-gateway",
      version: "1.5.0",
      url: "/modules/payment-gateway.js",
      dependencies: ["stripe"],
      integrity: "sha384-abc123...",
      timeout: 15000,
    };
  }

  private setupErrorHandling() {
    window.addEventListener("error", (event) => {
      if (event.filename && event.filename.includes("/modules/")) {
        console.error("Module loading error:", event.error);
        this.handleModuleError(event.filename, event.error);
      }
    });
  }

  async loadModule(name: string): Promise<LoadedModule> {
    // Check if already loaded
    const cached = this.modules.get(name);
    if (cached) {
      return cached;
    }

    // Check if already loading
    const loadingPromise = this.loadingPromises.get(name);
    if (loadingPromise) {
      return loadingPromise;
    }

    // Get metadata
    const metadata = this.registry[name];
    if (!metadata) {
      throw new Error(`Module '${name}' not found in registry`);
    }

    // Create loading promise
    const promise = this.performModuleLoad(metadata);
    this.loadingPromises.set(name, promise);

    try {
      const result = await promise;
      this.modules.set(name, result);
      return result;
    } finally {
      this.loadingPromises.delete(name);
    }
  }

  private async performModuleLoad(
    metadata: ModuleMetadata
  ): Promise<LoadedModule> {
    // Wait for available slot if needed
    await this.waitForLoadingSlot();

    this.activeLoads++;
    const startTime = performance.now();

    try {
      // Load dependencies first
      await this.loadDependencies(metadata.dependencies);

      // Load the main module
      const module = await this.loadScript(metadata);
      const loadTime = performance.now() - startTime;

      console.log(
        `✅ Module '${metadata.name}' loaded in ${loadTime.toFixed(2)}ms`
      );

      return {
        module: module as ModuleWithCleanup,
        metadata,
        loadTime,
        cached: false,
      };
    } catch (error) {
      console.error(`❌ Failed to load module '${metadata.name}':`, error);

      // Try fallback if available
      if (metadata.fallbackUrl) {
        try {
          const fallbackModule = await this.loadScript({
            ...metadata,
            url: metadata.fallbackUrl,
          });

          const loadTime = performance.now() - startTime;
          console.log(
            `🔄 Fallback module '${metadata.name}' loaded in ${loadTime.toFixed(
              2
            )}ms`
          );

          return {
            module: fallbackModule as ModuleWithCleanup,
            metadata,
            loadTime,
            cached: false,
          };
        } catch (fallbackError) {
          console.error(
            `❌ Fallback also failed for '${metadata.name}':`,
            fallbackError
          );
        }
      }

      throw error;
    } finally {
      this.activeLoads--;
      this.processQueue();
    }
  }

  private async waitForLoadingSlot(): Promise<void> {
    return new Promise((resolve) => {
      const checkSlot = () => {
        if (this.activeLoads < this.maxConcurrentLoads) {
          resolve();
        } else {
          setTimeout(checkSlot, 100);
        }
      };
      checkSlot();
    });
  }

  private async loadDependencies(dependencies: string[]): Promise<void> {
    // Check which dependencies are already available
    const missingDeps = dependencies.filter(
      (dep) => !this.isDependencyAvailable(dep)
    );

    if (missingDeps.length === 0) {
      return;
    }

    console.log(`📦 Loading dependencies: ${missingDeps.join(", ")}`);

    // Load missing dependencies
    await Promise.all(missingDeps.map((dep) => this.loadDependency(dep)));
  }

  private isDependencyAvailable(dependency: string): boolean {
    switch (dependency) {
      case "react":
        return typeof window.React !== "undefined";
      case "react-dom":
        return typeof window.ReactDOM !== "undefined";
      case "chart.js":
        return typeof window.Chart !== "undefined";
      case "react-hook-form":
        return typeof window.ReactHookForm !== "undefined";
      case "fuse.js":
        return typeof window.Fuse !== "undefined";
      case "stripe":
        return typeof window.Stripe !== "undefined";
      default:
        return false;
    }
  }

  private async loadDependency(dependency: string): Promise<void> {
    const dependencyUrls: Record<string, string> = {
      "chart.js":
        "https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js",
      "fuse.js": "https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.min.js",
      "react-hook-form":
        "https://unpkg.com/react-hook-form@7.43.9/dist/index.umd.min.js",
      stripe: "https://js.stripe.com/v3/",
    };

    const url = dependencyUrls[dependency];
    if (!url) {
      console.warn(`No CDN URL configured for dependency: ${dependency}`);
      return;
    }

    await this.loadScript({
      name: dependency,
      version: "latest",
      url,
      dependencies: [],
    });
  }

  private async loadScript(metadata: ModuleMetadata): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = metadata.url;
      script.async = true;

      if (metadata.integrity) {
        script.integrity = metadata.integrity;
        script.crossOrigin = "anonymous";
      }

      // Set timeout
      const timeout = setTimeout(() => {
        script.remove();
        reject(new Error(`Module '${metadata.name}' loading timeout`));
      }, metadata.timeout || 10000);

      script.onload = () => {
        clearTimeout(timeout);

        // Try to get the module from various global locations
        const module = this.extractModule(metadata.name);
        if (module) {
          resolve(module);
        } else {
          reject(
            new Error(`Module '${metadata.name}' not found after loading`)
          );
        }
      };

      script.onerror = () => {
        clearTimeout(timeout);
        script.remove();
        reject(new Error(`Failed to load script: ${metadata.url}`));
      };

      document.head.appendChild(script);
    });
  }

  private extractModule(name: string): unknown {
    // Try different global locations where the module might be exposed
    const globalLocations = [
      `window.BookifyModules?.${name}`,
      `window.${name}`,
      `window.modules?.${name}`,
    ];

    for (const location of globalLocations) {
      try {
        const module = eval(location);
        if (module) {
          return module;
        }
      } catch {
        // Continue trying other locations
      }
    }

    return null;
  }

  private handleModuleError(filename: string, error: Error) {
    const moduleName = this.extractModuleNameFromUrl(filename);
    if (moduleName) {
      console.error(`Module error in '${moduleName}':`, error);

      // Remove from cache to allow retry
      this.modules.delete(moduleName);
      this.loadingPromises.delete(moduleName);
    }
  }

  private extractModuleNameFromUrl(url: string): string | null {
    const match = url.match(/\/modules\/(.+)\.js/);
    return match ? match[1] : null;
  }

  private processQueue() {
    if (
      this.loadingQueue.length === 0 ||
      this.activeLoads >= this.maxConcurrentLoads
    ) {
      return;
    }

    const nextModule = this.loadingQueue.shift();
    if (nextModule) {
      this.loadModule(nextModule);
    }
  }

  // Preload modules based on user behavior
  async preloadModule(name: string): Promise<void> {
    try {
      await this.loadModule(name);
      console.log(`📦 Preloaded module: ${name}`);
    } catch (error) {
      console.warn(`Failed to preload module '${name}':`, error);
    }
  }

  // Batch preload modules
  async preloadModules(names: string[]): Promise<void> {
    const promises = names.map((name) => this.preloadModule(name));
    await Promise.allSettled(promises);
  }

  // Unload module to free memory
  unloadModule(name: string): boolean {
    const loaded = this.modules.get(name);
    if (!loaded) {
      return false;
    }

    // Call cleanup if available
    if (loaded.module?.cleanup && typeof loaded.module.cleanup === "function") {
      try {
        loaded.module.cleanup();
      } catch (error) {
        console.warn(`Cleanup error for module '${name}':`, error);
      }
    }

    this.modules.delete(name);
    console.log(`🗑️ Unloaded module: ${name}`);
    return true;
  }

  // Get all loaded modules
  getLoadedModules(): string[] {
    return Array.from(this.modules.keys());
  }

  // Get module loading stats
  getStats() {
    const modules = Array.from(this.modules.values());
    const totalLoadTime = modules.reduce((sum, mod) => sum + mod.loadTime, 0);
    const avgLoadTime = modules.length > 0 ? totalLoadTime / modules.length : 0;

    return {
      totalModules: modules.length,
      registeredModules: Object.keys(this.registry).length,
      avgLoadTime: Math.round(avgLoadTime),
      totalLoadTime: Math.round(totalLoadTime),
      activeLoads: this.activeLoads,
      queueLength: this.loadingQueue.length,
    };
  }

  // Clear all modules (for testing)
  clearAll() {
    this.modules.clear();
    this.loadingPromises.clear();
    this.loadingQueue.length = 0;
    this.activeLoads = 0;
  }
}

// Singleton instance
export const moduleFederationManager = new ModuleFederationManager();

// React hook for module federation
export const useModuleFederation = () => {
  const loadModule = async (name: string) => {
    return moduleFederationManager.loadModule(name);
  };

  const preloadModule = async (name: string) => {
    return moduleFederationManager.preloadModule(name);
  };

  const unloadModule = (name: string) => {
    return moduleFederationManager.unloadModule(name);
  };

  const getStats = () => {
    return moduleFederationManager.getStats();
  };

  return {
    loadModule,
    preloadModule,
    unloadModule,
    getStats,
    getLoadedModules: () => moduleFederationManager.getLoadedModules(),
  };
};

// React component for lazy-loaded micro-frontends
interface ModuleWithComponent {
  Component: React.ComponentType<Record<string, unknown>>;
}

export const MicroFrontend: React.FC<{
  moduleName: string;
  fallback?: React.ReactNode;
  onLoad?: (module: unknown) => void;
  onError?: (error: Error) => void;
  props?: Record<string, unknown>;
}> = ({ moduleName, fallback, onLoad, onError, props = {} }) => {
  const [module, setModule] = React.useState<unknown>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const loadMicroFrontend = async () => {
      try {
        setLoading(true);
        const loadedModule = await moduleFederationManager.loadModule(
          moduleName
        );

        if (mounted) {
          setModule(loadedModule.module);
          setError(null);
          onLoad?.(loadedModule.module);
        }
      } catch (err) {
        if (mounted) {
          const error = err as Error;
          setError(error);
          onError?.(error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadMicroFrontend();

    return () => {
      mounted = false;
    };
  }, [moduleName, onLoad, onError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        {fallback || (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading module...</p>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-muted-foreground">
            Failed to load module: {moduleName}
          </p>
        </div>
      </div>
    );
  }

  const moduleWithComponent = module as unknown as ModuleWithComponent;
  if (!moduleWithComponent?.Component) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">
          Module loaded but no component found
        </p>
      </div>
    );
  }

  const ModuleComponent = moduleWithComponent.Component;
  return <ModuleComponent {...props} />;
};

// Helper for dynamic imports with federation fallback
export const dynamicImportWithFederation = async (
  importPath: string,
  federationName?: string
): Promise<unknown> => {
  try {
    // Try dynamic import first
    return await import(/* @vite-ignore */ importPath);
  } catch (error) {
    // Fallback to module federation if available
    if (federationName) {
      console.log(
        `Dynamic import failed, trying federation: ${federationName}`
      );
      const federated = await moduleFederationManager.loadModule(
        federationName
      );
      return federated.module;
    }
    throw error;
  }
};
