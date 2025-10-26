// Configuration management for environment variables

export interface Config {
  spotify: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  openai: {
    apiKey: string;
  };
  server: {
    port: number;
    nodeEnv: string;
  };
  cache: {
    directory: string;
  };
}

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

export function loadConfig(): Config {
  const requiredEnvVars = [
    "SPOTIFY_CLIENT_ID",
    "SPOTIFY_CLIENT_SECRET",
    "SPOTIFY_REDIRECT_URI",
    "OPENAI_API_KEY",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new ConfigurationError(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }

  return {
    spotify: {
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI!,
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY!,
    },
    server: {
      port: parseInt(process.env.PORT || "3000", 10),
      nodeEnv: process.env.NODE_ENV || "development",
    },
    cache: {
      directory: process.env.CACHE_DIR || "data/analysis-cache.json",
    },
  };
}

