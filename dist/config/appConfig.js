"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
exports.updateConfig = updateConfig;
exports.validateConfig = validateConfig;
exports.getModuleConfig = getModuleConfig;
exports.getSafeConfig = getSafeConfig;
// Централізована конфігурація для всього додатку
const dotenv_1 = __importDefault(require("dotenv"));
// Завантажуємо змінні середовища
dotenv_1.default.config();
// Функція для отримання конфігурації з змінних середовища
function getConfigFromEnv() {
    return {
        environment: process.env.NODE_ENV || 'development',
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
            sensitivityLevel: process.env.CONTENT_SENSITIVITY || 'medium',
            customForbiddenWords: process.env.CUSTOM_FORBIDDEN_WORDS?.split(',') || [],
            enableSarcasm: process.env.ENABLE_SARCASM !== 'false',
            enablePenalties: process.env.ENABLE_PENALTIES !== 'false',
            adminUserIds: process.env.ADMIN_USER_IDS?.split(',') || [],
            primaryLanguage: process.env.PRIMARY_LANGUAGE || 'uk'
        },
        atmosphere: {
            quietPeriodThresholdMs: parseInt(process.env.QUIET_PERIOD_MS || '600000', 10), // 10 хвилин
            enableAutomaticEngagement: process.env.ENABLE_AUTO_ENGAGEMENT !== 'false',
            enableRoleAssignment: process.env.ENABLE_ROLE_ASSIGNMENT !== 'false',
            enablePolls: process.env.ENABLE_POLLS !== 'false',
            enableFunFacts: process.env.ENABLE_FUN_FACTS !== 'false',
            maxEngagementPerHour: parseInt(process.env.MAX_ENGAGEMENT_PER_HOUR || '3', 10),
            primaryLanguage: process.env.PRIMARY_LANGUAGE || 'uk'
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
            level: process.env.LOG_LEVEL || 'info',
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
exports.appConfig = getConfigFromEnv();
// Функція для оновлення конфігурації
function updateConfig(newConfig) {
    Object.assign(exports.appConfig, newConfig);
}
// Функція для валідації конфігурації
function validateConfig() {
    const errors = [];
    // Обов'язкові поля
    if (!exports.appConfig.telegram.token && !exports.appConfig.cliMode) {
        errors.push('BOT_TOKEN is required when not in CLI mode');
    }
    if (exports.appConfig.port < 1 || exports.appConfig.port > 65535) {
        errors.push('PORT must be between 1 and 65535');
    }
    if (exports.appConfig.telegram.pollingInterval < 1000) {
        errors.push('POLLING_INTERVAL must be at least 1000ms');
    }
    if (exports.appConfig.telegram.retryAttempts < 0 || exports.appConfig.telegram.retryAttempts > 10) {
        errors.push('RETRY_ATTEMPTS must be between 0 and 10');
    }
    // Валідація модераційних налаштувань
    if (!['low', 'medium', 'high'].includes(exports.appConfig.contentModeration.sensitivityLevel)) {
        errors.push('CONTENT_SENSITIVITY must be low, medium, or high');
    }
    if (!['uk', 'en'].includes(exports.appConfig.contentModeration.primaryLanguage)) {
        errors.push('PRIMARY_LANGUAGE must be uk or en');
    }
    // Валідація атмосферних налаштувань
    if (exports.appConfig.atmosphere.quietPeriodThresholdMs < 60000) {
        errors.push('QUIET_PERIOD_MS must be at least 60000ms (1 minute)');
    }
    if (exports.appConfig.atmosphere.maxEngagementPerHour < 0 || exports.appConfig.atmosphere.maxEngagementPerHour > 10) {
        errors.push('MAX_ENGAGEMENT_PER_HOUR must be between 0 and 10');
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
// Функція для отримання конфігурації для певного модуля
function getModuleConfig(module) {
    return exports.appConfig[module];
}
// Функція для виводу конфігурації (безпечно, без секретів)
function getSafeConfig() {
    const safeConfig = { ...exports.appConfig };
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
console.log(`Environment: ${exports.appConfig.environment}`);
console.log(`CLI Mode: ${exports.appConfig.cliMode}`);
console.log(`Primary Language: ${exports.appConfig.contentModeration.primaryLanguage}`);
console.log(`Features enabled: ${Object.entries(exports.appConfig.features).filter(([_, enabled]) => enabled).map(([name]) => name).join(', ')}`);
// Валідуємо конфігурацію
const validation = validateConfig();
if (!validation.valid) {
    console.error('❌ Configuration validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    if (!exports.appConfig.cliMode) {
        process.exit(1);
    }
}
