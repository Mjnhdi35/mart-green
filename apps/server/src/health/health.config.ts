export interface HealthConfig {
  cache: {
    ttl: number; // Time to live in milliseconds
    maxSize: number; // Maximum number of cached entries
  };
  timeouts: {
    database: number;
    redis: number;
    http: number;
    memory: number;
    disk: number;
  };
  thresholds: {
    memory: {
      heap: number; // MB
      rss: number; // MB
    };
    disk: {
      thresholdPercent: number; // 0-1
    };
  };
  features: {
    enableHttpCheck: boolean;
    enableMemoryCheck: boolean;
    enableDiskCheck: boolean;
    enableCaching: boolean;
  };
}

export const defaultHealthConfig: HealthConfig = {
  cache: {
    ttl: 5000, // 5 seconds
    maxSize: 100,
  },
  timeouts: {
    database: 3000, // 3 seconds
    redis: 3000, // 3 seconds
    http: 5000, // 5 seconds
    memory: 1000, // 1 second
    disk: 2000, // 2 seconds
  },
  thresholds: {
    memory: {
      heap: 150, // 150MB
      rss: 150, // 150MB
    },
    disk: {
      thresholdPercent: 0.9, // 90%
    },
  },
  features: {
    enableHttpCheck: true,
    enableMemoryCheck: true,
    enableDiskCheck: true,
    enableCaching: true,
  },
};

export const developmentHealthConfig: HealthConfig = {
  ...defaultHealthConfig,
  cache: {
    ttl: 1000, // 1 second in development
    maxSize: 50,
  },
  features: {
    enableHttpCheck: false, // Disable external HTTP checks in development
    enableMemoryCheck: true,
    enableDiskCheck: false, // Disable disk checks in development
    enableCaching: false, // Disable caching in development for easier debugging
  },
};
