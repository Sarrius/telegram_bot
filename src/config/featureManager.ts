// Feature Manager для управління функціями бота
export interface FeatureState {
  powerWords: boolean;
  moderation: boolean;
  news: boolean;
  weather: boolean;
  memes: boolean;
  memory: boolean;
  nlp: boolean;
  atmosphere: boolean;
  profanityFilter: boolean;
  knowledgeSearch: boolean;
}

export interface FeatureConfig {
  features: FeatureState;
  timestamp: number;
}

export class FeatureManager {
  private static instance: FeatureManager;
  private features: FeatureState = {
    powerWords: true,        // Моніторинг "потужно" залишається
    moderation: false,       // Автоматична модерація вимкнена
    news: true,              // Новини при прямому запиті
    weather: true,           // Погода при прямому запиті
    memes: true,             // Меми при прямому запиті
    memory: false,           // Автоматичне запам'ятовування вимкнене
    nlp: false,              // Автоматичні розмови вимкнені
    atmosphere: false,       // Автоматичне відстеження атмосфери вимкнене
    profanityFilter: false,  // Автоматична фільтрація вимкнена
    knowledgeSearch: true    // Пошук при прямому запиті
  };
  
  private constructor() {
    this.loadConfig();
  }

  public static getInstance(): FeatureManager {
    if (!FeatureManager.instance) {
      FeatureManager.instance = new FeatureManager();
    }
    return FeatureManager.instance;
  }

  public enableFeature(feature: keyof FeatureState): string {
    if (!(feature in this.features)) {
      return `❌ Невідома функція: ${feature}`;
    }
    
    this.features[feature] = true;
    this.saveConfig();
    return `✅ Функцію "${feature}" увімкнено`;
  }

  public disableFeature(feature: keyof FeatureState): string {
    if (!(feature in this.features)) {
      return `❌ Невідома функція: ${feature}`;
    }
    
    this.features[feature] = false;
    this.saveConfig();
    return `🔴 Функцію "${feature}" вимкнено`;
  }

  public toggleFeature(feature: keyof FeatureState): string {
    if (!(feature in this.features)) {
      return `❌ Невідома функція: ${feature}`;
    }
    
    this.features[feature] = !this.features[feature];
    this.saveConfig();
    const status = this.features[feature] ? 'увімкнено' : 'вимкнено';
    const emoji = this.features[feature] ? '✅' : '🔴';
    return `${emoji} Функцію "${feature}" ${status}`;
  }

  public isEnabled(feature: keyof FeatureState): boolean {
    return this.features[feature] || false;
  }

  public getFeatureStatus(): string {
    const statusLines = Object.entries(this.features).map(([name, enabled]) => {
      const emoji = enabled ? '✅' : '🔴';
      const status = enabled ? 'увімкнено' : 'вимкнено';
      return `  ${name.padEnd(15)} ${emoji} ${status}`;
    });

    return `🎛️ **Статус функцій:**\n${statusLines.join('\n')}`;
  }

  public getAllFeatures(): FeatureState {
    return { ...this.features };
  }

  public enableAll(): string {
    Object.keys(this.features).forEach(feature => {
      this.features[feature as keyof FeatureState] = true;
    });
    this.saveConfig();
    return '✅ Всі функції увімкнено';
  }

  public disableAll(): string {
    Object.keys(this.features).forEach(feature => {
      this.features[feature as keyof FeatureState] = false;
    });
    this.saveConfig();
    return '🔴 Всі функції вимкнено';
  }

  public resetToDefaults(): string {
    this.features = {
      powerWords: true,        // Моніторинг "потужно" залишається
      moderation: false,       // Автоматична модерація вимкнена
      news: true,              // Новини при прямому запиті
      weather: true,           // Погода при прямому запиті
      memes: true,             // Меми при прямому запиті
      memory: false,           // Автоматичне запам'ятовування вимкнене
      nlp: false,              // Автоматичні розмови вимкнені
      atmosphere: false,       // Автоматичне відстеження атмосфери вимкнене
      profanityFilter: false,  // Автоматична фільтрація вимкнена
      knowledgeSearch: true    // Пошук при прямому запиті
    };
    this.saveConfig();
    return '🔄 Конфігурацію скинуто до стандартних налаштувань (моніторинг чату вимкнений, пряме звернення працює)';
  }

  public setTestConfiguration(): string {
    this.features = {
      powerWords: true,        // Увімкнено для тестів
      moderation: true,        // Увімкнено для тестів
      news: true,              // Увімкнено для тестів
      weather: true,           // Увімкнено для тестів
      memes: true,             // Увімкнено для тестів
      memory: true,            // Увімкнено для тестів
      nlp: true,               // Увімкнено для тестів
      atmosphere: true,        // Увімкнено для тестів
      profanityFilter: true,   // Увімкнено для тестів
      knowledgeSearch: true    // Увімкнено для тестів
    };
    this.saveConfig();
    return '🧪 Конфігурацію встановлено для тестування (всі функції увімкнені)';
  }

  private saveConfig(): void {
    try {
      const config: FeatureConfig = {
        features: this.features,
        timestamp: Date.now()
      };
      
      // Зберігаємо в змінних середовища (runtime)
      Object.entries(this.features).forEach(([name, enabled]) => {
        process.env[`FEATURE_${name.toUpperCase()}`] = enabled.toString();
      });
      
      console.log('✅ Конфігурацію функцій збережено');
    } catch (error) {
      console.error('❌ Помилка збереження конфігурації:', error);
    }
  }

  private loadConfig(): void {
    try {
      // Завантажуємо з змінних середовища
      Object.keys(this.features).forEach(feature => {
        const envVar = `FEATURE_${feature.toUpperCase()}`;
        const envValue = process.env[envVar];
        if (envValue !== undefined) {
          this.features[feature as keyof FeatureState] = envValue === 'true';
        }
      });
      
      console.log('✅ Конфігурацію функцій завантажено');
    } catch (error) {
      console.error('❌ Помилка завантаження конфігурації:', error);
    }
  }

  public getAvailableFeatures(): string[] {
    return Object.keys(this.features);
  }

  public getFeatureHelp(): string {
    return `
🎛️ **Доступні функції для управління:**

⚡ **powerWords**      - Реакції на потужні слова ("потужно", "супер", тощо)
🛡️ **moderation**     - Модерація контенту та нецензурщини  
📰 **news**           - Моніторинг та отримання новин
🌤️ **weather**        - Інформація про погоду
🎭 **memes**          - Генерація мемів
🧠 **memory**         - Система пам'яті користувачів
💬 **nlp**            - NLP розмови та розуміння контексту
🌟 **atmosphere**     - Підвищення атмосфери у чатах
🚫 **profanityFilter** - Фільтрація нецензурної лексики
🔍 **knowledgeSearch** - Інтелектуальний пошук і відповіді на питання

📋 **Команди управління:**
  enable <функція>     - увімкнути функцію
  disable <функція>    - вимкнути функцію  
  toggle <функція>     - перемкнути функцію
  status               - показати статус всіх функцій
  enable-all           - увімкнути всі функції
  disable-all          - вимкнути всі функції
  reset                - скинути до стандартних налаштувань

💡 **Приклади:**
  enable powerWords    - увімкнути реакції на потужні слова
  disable moderation   - вимкнути модерацію
  toggle memes         - перемкнути генерацію мемів
  status               - показати поточний статус
`;
  }
} 