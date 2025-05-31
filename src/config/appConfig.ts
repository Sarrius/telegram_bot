// Централізована конфігурація для всього додатку
import dotenv from 'dotenv';

// Завантажуємо змінні середовища
dotenv.config();

export interface DatabaseConfig {
  url?: string;
  host?: string;
  port?: number;
  name?: string;
  username?: string;
  password?: string;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  enableConsole: boolean;
  enableFile: boolean;
  filePath?: string;
}

export interface TelegramConfig {
  token: string;
  pollingInterval: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface ContentModerationConfig {
  enableModerationInGroups: boolean;
  enableModerationInPrivate: boolean;
  warnOnMild: boolean;
  moderateOnModerate: boolean;
  strictOnSevere: boolean;
  sensitivityLevel: 'low' | 'medium' | 'high';
  customForbiddenWords: string[];
  enableSarcasm: boolean;
  enablePenalties: boolean;
  adminUserIds: string[];
  primaryLanguage: 'uk' | 'en';
}

export interface AtmosphereConfig {
  quietPeriodThresholdMs: number;
  enableAutomaticEngagement: boolean;
  enableRoleAssignment: boolean;
  enablePolls: boolean;
  enableFunFacts: boolean;
  maxEngagementPerHour: number;
  primaryLanguage: 'uk' | 'en';
}

export interface NewsWeatherConfig {
  newsApiKey?: string;
  weatherApiKey?: string;
  enableNewsMonitoring: boolean;
  enableWeatherMonitoring: boolean;
  morningBriefingTime: string; // "08:00"
  criticalNewsCheckInterval: number; // мілісекунди
}

export interface AppConfig {
  // Загальні налаштування
  environment: 'development' | 'production' | 'test';
  port: number;
  enableHealthCheck: boolean;
  
  // CLI режим
  cliMode: boolean;
  cliCommands: {
    showStats: boolean;
    showConfig: boolean;
    testMode: boolean;
  };
  
  // Модульні конфігурації
  telegram: TelegramConfig;
  contentModeration: ContentModerationConfig;
  atmosphere: AtmosphereConfig;
  newsWeather: NewsWeatherConfig;
  database: DatabaseConfig;
  logging: LoggingConfig;
  
  // Функціональні прапорці
  features: {
    nlpConversations: boolean;
    contentModeration: boolean;
    atmosphereEnhancement: boolean;
    memeGeneration: boolean;
    sentimentReactions: boolean;
    userMemory: boolean;
    profanityFilter: boolean;
    newsWeatherMonitoring: boolean;
    learningSystem: boolean;
  };
}

// Функція для отримання конфігурації з змінних середовища
function getConfigFromEnv(): AppConfig {
  return {
    environment: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    enableHealthCheck: process.env.ENABLE_HEALTH_CHECK !== 'false',
    
    cliMode: process.argv.includes('--cli') || process.env.CLI_MODE === 'true',
    cliCommands: {
      showStats: process.argv.includes('--stats'),
      showConfig: process.argv.includes('--config'),
      testMode: process.argv.includes('--test-mode')
    },
    
    telegram: {
      token: process.env.BOT_TOKEN || '',
      pollingInterval: parseInt(process.env.POLLING_INTERVAL || '2000', 10),
      retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || '3', 10),
      retryDelay: parseInt(process.env.RETRY_DELAY || '30000', 10)
    },
    
    contentModeration: {
      enableModerationInGroups: process.env.MODERATION_IN_GROUPS !== 'false',
      enableModerationInPrivate: process.env.MODERATION_IN_PRIVATE === 'true',
      warnOnMild: process.env.WARN_ON_MILD !== 'false',
      moderateOnModerate: process.env.MODERATE_ON_MODERATE !== 'false',
      strictOnSevere: process.env.STRICT_ON_SEVERE !== 'false',
      sensitivityLevel: (process.env.CONTENT_SENSITIVITY as 'low' | 'medium' | 'high') || 'medium',
      customForbiddenWords: process.env.CUSTOM_FORBIDDEN_WORDS?.split(',') || [],
      enableSarcasm: process.env.ENABLE_SARCASM !== 'false',
      enablePenalties: process.env.ENABLE_PENALTIES !== 'false',
      adminUserIds: process.env.ADMIN_USER_IDS?.split(',') || [],
      primaryLanguage: (process.env.PRIMARY_LANGUAGE as 'uk' | 'en') || 'uk'
    },
    
    atmosphere: {
      quietPeriodThresholdMs: parseInt(process.env.QUIET_PERIOD_MS || '600000', 10), // 10 хвилин
      enableAutomaticEngagement: process.env.ENABLE_AUTO_ENGAGEMENT !== 'false',
      enableRoleAssignment: process.env.ENABLE_ROLE_ASSIGNMENT !== 'false',
      enablePolls: process.env.ENABLE_POLLS !== 'false',
      enableFunFacts: process.env.ENABLE_FUN_FACTS !== 'false',
      maxEngagementPerHour: parseInt(process.env.MAX_ENGAGEMENT_PER_HOUR || '3', 10),
      primaryLanguage: (process.env.PRIMARY_LANGUAGE as 'uk' | 'en') || 'uk'
    },
    
    newsWeather: {
      newsApiKey: process.env.NEWS_API_KEY,
      weatherApiKey: process.env.WEATHER_API_KEY,
      enableNewsMonitoring: process.env.ENABLE_NEWS_MONITORING !== 'false' && !!process.env.NEWS_API_KEY,
      enableWeatherMonitoring: process.env.ENABLE_WEATHER_MONITORING !== 'false' && !!process.env.WEATHER_API_KEY,
      morningBriefingTime: process.env.MORNING_BRIEFING_TIME || '08:00',
      criticalNewsCheckInterval: parseInt(process.env.CRITICAL_NEWS_CHECK_INTERVAL || '1800000', 10) // 30 хвилин
    },
    
    database: {
      url: process.env.DATABASE_URL,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      name: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD
    },
    
    logging: {
      level: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
      enableConsole: process.env.LOG_CONSOLE !== 'false',
      enableFile: process.env.LOG_FILE === 'true',
      filePath: process.env.LOG_FILE_PATH || './logs/app.log'
    },
    
    features: {
      nlpConversations: process.env.ENABLE_NLP !== 'false',
      contentModeration: process.env.ENABLE_CONTENT_MODERATION !== 'false',
      atmosphereEnhancement: process.env.ENABLE_ATMOSPHERE !== 'false',
      memeGeneration: process.env.ENABLE_MEMES !== 'false',
      sentimentReactions: process.env.ENABLE_SENTIMENT_REACTIONS !== 'false',
      userMemory: process.env.ENABLE_USER_MEMORY !== 'false',
      profanityFilter: process.env.ENABLE_PROFANITY_FILTER !== 'false',
      newsWeatherMonitoring: (process.env.ENABLE_NEWS_WEATHER !== 'false') && 
                           !!(process.env.NEWS_API_KEY && process.env.WEATHER_API_KEY),
      learningSystem: process.env.ENABLE_LEARNING !== 'false'
    }
  };
}

// Експортуємо глобальний екземпляр конфігурації
export const appConfig: AppConfig = getConfigFromEnv();

// Функція для оновлення конфігурації
export function updateConfig(newConfig: Partial<AppConfig>): void {
  Object.assign(appConfig, newConfig);
}

// Функція для валідації конфігурації
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Обов'язкові поля
  if (!appConfig.telegram.token && !appConfig.cliMode) {
    errors.push('BOT_TOKEN is required when not in CLI mode');
  }
  
  if (appConfig.port < 1 || appConfig.port > 65535) {
    errors.push('PORT must be between 1 and 65535');
  }
  
  if (appConfig.telegram.pollingInterval < 1000) {
    errors.push('POLLING_INTERVAL must be at least 1000ms');
  }
  
  if (appConfig.telegram.retryAttempts < 0 || appConfig.telegram.retryAttempts > 10) {
    errors.push('RETRY_ATTEMPTS must be between 0 and 10');
  }
  
  // Валідація модераційних налаштувань
  if (!['low', 'medium', 'high'].includes(appConfig.contentModeration.sensitivityLevel)) {
    errors.push('CONTENT_SENSITIVITY must be low, medium, or high');
  }
  
  if (!['uk', 'en'].includes(appConfig.contentModeration.primaryLanguage)) {
    errors.push('PRIMARY_LANGUAGE must be uk or en');
  }
  
  // Валідація атмосферних налаштувань
  if (appConfig.atmosphere.quietPeriodThresholdMs < 60000) {
    errors.push('QUIET_PERIOD_MS must be at least 60000ms (1 minute)');
  }
  
  if (appConfig.atmosphere.maxEngagementPerHour < 0 || appConfig.atmosphere.maxEngagementPerHour > 10) {
    errors.push('MAX_ENGAGEMENT_PER_HOUR must be between 0 and 10');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Функція для отримання конфігурації для певного модуля
export function getModuleConfig<T extends keyof AppConfig>(module: T): AppConfig[T] {
  return appConfig[module];
}

// Функція для виводу конфігурації (безпечно, без секретів)
export function getSafeConfig(): Partial<AppConfig> {
  const safeConfig = { ...appConfig };
  
  // Приховуємо секретні дані
  safeConfig.telegram = {
    ...safeConfig.telegram,
    token: safeConfig.telegram.token ? '***HIDDEN***' : ''
  };
  
  if (safeConfig.newsWeather.newsApiKey) {
    safeConfig.newsWeather.newsApiKey = '***HIDDEN***';
  }
  
  if (safeConfig.newsWeather.weatherApiKey) {
    safeConfig.newsWeather.weatherApiKey = '***HIDDEN***';
  }
  
  if (safeConfig.database.password) {
    safeConfig.database.password = '***HIDDEN***';
  }
  
  return safeConfig;
}

// Логування конфігурації при ініціалізації
console.log('📋 App configuration loaded');
console.log(`Environment: ${appConfig.environment}`);
console.log(`CLI Mode: ${appConfig.cliMode}`);
console.log(`Primary Language: ${appConfig.contentModeration.primaryLanguage}`);
console.log(`Features enabled: ${Object.entries(appConfig.features).filter(([_, enabled]) => enabled).map(([name]) => name).join(', ')}`);

// Валідуємо конфігурацію
const validation = validateConfig();
if (!validation.valid) {
  console.error('❌ Configuration validation failed:');
  validation.errors.forEach(error => console.error(`  - ${error}`));
  if (!appConfig.cliMode) {
    process.exit(1);
  }
} 