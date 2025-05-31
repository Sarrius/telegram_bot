export interface CLICommandMatch {
  isCommand: boolean;
  command: string;
  args: string[];
  confidence: number;
  language: 'uk' | 'en';
  trigger: string;
}

export class CLICommandDetector {
  private readonly helpPatterns = [
    // Тільки точні CLI команди
    { pattern: /^help$/i, language: 'en' as const },
    { pattern: /^\/help$/i, language: 'en' as const },
    { pattern: /^cli\s+help$/i, language: 'en' as const },
    { pattern: /^\/cli\s+help$/i, language: 'en' as const },
    
    // З ботом - тільки з явним CLI
    { pattern: /@bot\s+cli\s+help$/i, language: 'en' as const },
    { pattern: /@\w+_bot\s+cli\s+help$/i, language: 'en' as const },
    { pattern: /@bot\s+\/cli\s+help$/i, language: 'en' as const },
    { pattern: /@\w+_bot\s+\/cli\s+help$/i, language: 'en' as const }
  ];

  private readonly statusPatterns = [
    // Тільки точні CLI команди
    { pattern: /^status$/i, language: 'en' as const },
    { pattern: /^\/status$/i, language: 'en' as const },
    { pattern: /^cli\s+status$/i, language: 'en' as const },
    { pattern: /^\/cli\s+status$/i, language: 'en' as const },
    
    // З ботом - тільки з явним CLI
    { pattern: /@bot\s+cli\s+status$/i, language: 'en' as const },
    { pattern: /@\w+_bot\s+cli\s+status$/i, language: 'en' as const },
    { pattern: /@bot\s+\/cli\s+status$/i, language: 'en' as const },
    { pattern: /@\w+_bot\s+\/cli\s+status$/i, language: 'en' as const }
  ];

  private readonly featurePatterns = [
    // Тільки точні CLI команди
    { pattern: /^features$/i, language: 'en' as const },
    { pattern: /^\/features$/i, language: 'en' as const },
    { pattern: /^cli\s+features$/i, language: 'en' as const },
    { pattern: /^\/cli\s+features$/i, language: 'en' as const },
    
    // З ботом - тільки з явним CLI
    { pattern: /@bot\s+cli\s+features$/i, language: 'en' as const },
    { pattern: /@\w+_bot\s+cli\s+features$/i, language: 'en' as const },
    { pattern: /@bot\s+\/cli\s+features$/i, language: 'en' as const },
    { pattern: /@\w+_bot\s+\/cli\s+features$/i, language: 'en' as const }
  ];

  private readonly cliModePatterns = [
    // Вхід в CLI режим
    { pattern: /^\/cli$/i, language: 'en' as const },
    { pattern: /^cli$/i, language: 'en' as const },
    { pattern: /^cli\s+mode$/i, language: 'en' as const },
    { pattern: /@bot\s+\/cli$/i, language: 'en' as const },
    { pattern: /@\w+_bot\s+\/cli$/i, language: 'en' as const },
    { pattern: /@bot\s+cli$/i, language: 'en' as const },
    { pattern: /@\w+_bot\s+cli$/i, language: 'en' as const }
  ];

  // === Валютні команди ===
  private readonly currencyPatterns = [
    { pattern: /^currency(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^exchange(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^\/currency(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^\/exchange(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^cli\s+currency(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^cli\s+exchange(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^курс(\s+(.+))?$/i, language: 'uk' as const },
    { pattern: /^валюта(\s+(.+))?$/i, language: 'uk' as const },
    { pattern: /@bot\s+cli\s+currency(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /@bot\s+cli\s+курс(\s+(.+))?$/i, language: 'uk' as const },
    { pattern: /@\w+_bot\s+cli\s+currency(\s+(.+))?$/i, language: 'en' as const }
  ];

  // === Новини та погода ===
  private readonly newsPatterns = [
    { pattern: /^news(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^\/news(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^cli\s+news(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^новини(\s+(.+))?$/i, language: 'uk' as const },
    { pattern: /^\/новини(\s+(.+))?$/i, language: 'uk' as const },
    { pattern: /@bot\s+cli\s+news(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /@bot\s+cli\s+новини(\s+(.+))?$/i, language: 'uk' as const }
  ];

  private readonly weatherPatterns = [
    { pattern: /^weather(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^\/weather(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^cli\s+weather(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^погода(\s+(.+))?$/i, language: 'uk' as const },
    { pattern: /^\/погода(\s+(.+))?$/i, language: 'uk' as const },
    { pattern: /@bot\s+cli\s+weather(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /@bot\s+cli\s+погода(\s+(.+))?$/i, language: 'uk' as const }
  ];

  // === Пошук знань ===
  private readonly searchPatterns = [
    { pattern: /^search(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^find(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^\/search(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^\/find(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^cli\s+search(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^cli\s+find(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^знайти(\s+(.+))?$/i, language: 'uk' as const },
    { pattern: /^пошук(\s+(.+))?$/i, language: 'uk' as const },
    { pattern: /^\/знайти(\s+(.+))?$/i, language: 'uk' as const },
    { pattern: /^\/пошук(\s+(.+))?$/i, language: 'uk' as const },
    { pattern: /@bot\s+cli\s+search(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /@bot\s+cli\s+пошук(\s+(.+))?$/i, language: 'uk' as const }
  ];

  // === Меми ===
  private readonly memePatterns = [
    { pattern: /^meme(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^\/meme(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^cli\s+meme(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^мем(\s+(.+))?$/i, language: 'uk' as const },
    { pattern: /^\/мем(\s+(.+))?$/i, language: 'uk' as const },
    { pattern: /@bot\s+cli\s+meme(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /@bot\s+cli\s+мем(\s+(.+))?$/i, language: 'uk' as const }
  ];

  // === Статистика ===
  private readonly statsPatterns = [
    { pattern: /^stats(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^statistics(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^\/stats(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^\/statistics(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^cli\s+stats(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^cli\s+statistics(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^статистика(\s+(.+))?$/i, language: 'uk' as const },
    { pattern: /^\/статистика(\s+(.+))?$/i, language: 'uk' as const },
    { pattern: /@bot\s+cli\s+stats(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /@bot\s+cli\s+статистика(\s+(.+))?$/i, language: 'uk' as const }
  ];

  // === Пам'ять ===
  private readonly memoryPatterns = [
    { pattern: /^memory(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^\/memory(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^cli\s+memory(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^пам'ять(\s+(.+))?$/i, language: 'uk' as const },
    { pattern: /^\/пам'ять(\s+(.+))?$/i, language: 'uk' as const },
    { pattern: /@bot\s+cli\s+memory(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /@bot\s+cli\s+пам'ять(\s+(.+))?$/i, language: 'uk' as const }
  ];

  // === Тестування ===
  private readonly testPatterns = [
    { pattern: /^test(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^\/test(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^cli\s+test(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^тест(\s+(.+))?$/i, language: 'uk' as const },
    { pattern: /^\/тест(\s+(.+))?$/i, language: 'uk' as const },
    { pattern: /@bot\s+cli\s+test(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /@bot\s+cli\s+тест(\s+(.+))?$/i, language: 'uk' as const }
  ];

  // === Діагностика ===
  private readonly diagnosticPatterns = [
    { pattern: /^diagnostic(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^diagnostics(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^\/diagnostic(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^\/diagnostics(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^cli\s+diagnostic(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^cli\s+diagnostics(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /^діагностика(\s+(.+))?$/i, language: 'uk' as const },
    { pattern: /^\/діагностика(\s+(.+))?$/i, language: 'uk' as const },
    { pattern: /@bot\s+cli\s+diagnostic(\s+(.+))?$/i, language: 'en' as const },
    { pattern: /@bot\s+cli\s+діагностика(\s+(.+))?$/i, language: 'uk' as const }
  ];

  constructor() {
    console.log('🎛️ Enhanced CLI Command Detector initialized with full command support');
  }

  public detectCommand(text: string): CLICommandMatch {
    const trimmedText = text.trim();
    
    // Перевіряємо help команди
    for (const { pattern, language } of this.helpPatterns) {
      if (pattern.test(trimmedText)) {
        return {
          isCommand: true,
          command: 'help',
          args: [],
          confidence: 0.95,
          language,
          trigger: pattern.source
        };
      }
    }

    // Перевіряємо status команди
    for (const { pattern, language } of this.statusPatterns) {
      if (pattern.test(trimmedText)) {
        return {
          isCommand: true,
          command: 'status',
          args: [],
          confidence: 0.90,
          language,
          trigger: pattern.source
        };
      }
    }

    // Перевіряємо features команди
    for (const { pattern, language } of this.featurePatterns) {
      if (pattern.test(trimmedText)) {
        return {
          isCommand: true,
          command: 'features',
          args: [],
          confidence: 0.85,
          language,
          trigger: pattern.source
        };
      }
    }

    // Перевіряємо CLI режим
    for (const { pattern, language } of this.cliModePatterns) {
      if (pattern.test(trimmedText)) {
        return {
          isCommand: true,
          command: 'cli',
          args: [],
          confidence: 0.90,
          language,
          trigger: pattern.source
        };
      }
    }

    // === Нові команди ===

    // Валютні команди
    const currencyMatch = this.detectPatternMatch(trimmedText, this.currencyPatterns, 'currency');
    if (currencyMatch.isCommand) return currencyMatch;

    // Новини
    const newsMatch = this.detectPatternMatch(trimmedText, this.newsPatterns, 'news');
    if (newsMatch.isCommand) return newsMatch;

    // Погода
    const weatherMatch = this.detectPatternMatch(trimmedText, this.weatherPatterns, 'weather');
    if (weatherMatch.isCommand) return weatherMatch;

    // Пошук знань
    const searchMatch = this.detectPatternMatch(trimmedText, this.searchPatterns, 'search');
    if (searchMatch.isCommand) return searchMatch;

    // Меми
    const memeMatch = this.detectPatternMatch(trimmedText, this.memePatterns, 'meme');
    if (memeMatch.isCommand) return memeMatch;

    // Статистика
    const statsMatch = this.detectPatternMatch(trimmedText, this.statsPatterns, 'stats');
    if (statsMatch.isCommand) return statsMatch;

    // Пам'ять
    const memoryMatch = this.detectPatternMatch(trimmedText, this.memoryPatterns, 'memory');
    if (memoryMatch.isCommand) return memoryMatch;

    // Тестування
    const testMatch = this.detectPatternMatch(trimmedText, this.testPatterns, 'test');
    if (testMatch.isCommand) return testMatch;

    // Діагностика
    const diagnosticMatch = this.detectPatternMatch(trimmedText, this.diagnosticPatterns, 'diagnostic');
    if (diagnosticMatch.isCommand) return diagnosticMatch;

    // Перевіряємо enable/disable команди
    const featureControlMatch = this.detectFeatureControl(trimmedText);
    if (featureControlMatch.isCommand) {
      return featureControlMatch;
    }

    return {
      isCommand: false,
      command: '',
      args: [],
      confidence: 0,
      language: 'uk',
      trigger: ''
    };
  }

  private detectPatternMatch(
    text: string, 
    patterns: Array<{ pattern: RegExp; language: 'uk' | 'en' }>, 
    commandName: string
  ): CLICommandMatch {
    for (const { pattern, language } of patterns) {
      const match = text.match(pattern);
      if (match) {
        // Витягуємо аргументи з групи захоплення
        const argsString = match[2] || match[1] || '';
        const args = argsString.trim() ? argsString.trim().split(/\s+/) : [];
        
        return {
          isCommand: true,
          command: commandName,
          args,
          confidence: 0.85,
          language,
          trigger: pattern.source
        };
      }
    }

    return {
      isCommand: false,
      command: '',
      args: [],
      confidence: 0,
      language: 'uk',
      trigger: ''
    };
  }

  private detectFeatureControl(text: string): CLICommandMatch {
    const patterns = [
      // Прямі CLI команди
      { pattern: /^enable\s+(\w+)$/i, command: 'enable', language: 'en' as const },
      { pattern: /^disable\s+(\w+)$/i, command: 'disable', language: 'en' as const },
      { pattern: /^toggle\s+(\w+)$/i, command: 'toggle', language: 'en' as const },
      
      // З слеш командами
      { pattern: /^\/enable\s+(\w+)$/i, command: 'enable', language: 'en' as const },
      { pattern: /^\/disable\s+(\w+)$/i, command: 'disable', language: 'en' as const },
      { pattern: /^\/toggle\s+(\w+)$/i, command: 'toggle', language: 'en' as const },
      
      // З CLI префіксом
      { pattern: /^cli\s+enable\s+(\w+)$/i, command: 'enable', language: 'en' as const },
      { pattern: /^cli\s+disable\s+(\w+)$/i, command: 'disable', language: 'en' as const },
      { pattern: /^cli\s+toggle\s+(\w+)$/i, command: 'toggle', language: 'en' as const },
      
      // Українські варіанти
      { pattern: /^увімкни\s+(\w+)$/i, command: 'enable', language: 'uk' as const },
      { pattern: /^вимкни\s+(\w+)$/i, command: 'disable', language: 'uk' as const },
      { pattern: /^перемкни\s+(\w+)$/i, command: 'toggle', language: 'uk' as const },
      
      // З ботом - тільки з явним CLI
      { pattern: /@bot\s+cli\s+enable\s+(\w+)$/i, command: 'enable', language: 'en' as const },
      { pattern: /@bot\s+cli\s+disable\s+(\w+)$/i, command: 'disable', language: 'en' as const },
      { pattern: /@bot\s+cli\s+toggle\s+(\w+)$/i, command: 'toggle', language: 'en' as const },
      
      { pattern: /@\w+_bot\s+cli\s+enable\s+(\w+)$/i, command: 'enable', language: 'en' as const },
      { pattern: /@\w+_bot\s+cli\s+disable\s+(\w+)$/i, command: 'disable', language: 'en' as const },
      { pattern: /@\w+_bot\s+cli\s+toggle\s+(\w+)$/i, command: 'toggle', language: 'en' as const }
    ];

    for (const { pattern, command, language } of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return {
          isCommand: true,
          command,
          args: [match[1]],
          confidence: 0.85,
          language,
          trigger: pattern.source
        };
      }
    }

    return {
      isCommand: false,
      command: '',
      args: [],
      confidence: 0,
      language: 'uk',
      trigger: ''
    };
  }

  private detectLanguage(text: string): 'uk' | 'en' {
    const ukrainianIndicators = [
      'команди', 'допомога', 'довідка', 'статус', 'функції',
      'увімкни', 'вимкни', 'перемкни', 'показати', 'список',
      'бот', 'які', 'що', 'валюта', 'курс', 'новини', 'погода',
      'пошук', 'знайти', 'мем', 'статистика', 'пам\'ять', 'тест', 'діагностика'
    ];

    const lowerText = text.toLowerCase();
    const hasUkrainian = ukrainianIndicators.some(word => lowerText.includes(word));
    
    return hasUkrainian ? 'uk' : 'en';
  }

  public getStats() {
    return {
      helpPatterns: this.helpPatterns.length,
      statusPatterns: this.statusPatterns.length,
      featurePatterns: this.featurePatterns.length,
      currencyPatterns: this.currencyPatterns.length,
      newsPatterns: this.newsPatterns.length,
      weatherPatterns: this.weatherPatterns.length,
      searchPatterns: this.searchPatterns.length,
      memePatterns: this.memePatterns.length,
      statsPatterns: this.statsPatterns.length,
      memoryPatterns: this.memoryPatterns.length,
      testPatterns: this.testPatterns.length,
      diagnosticPatterns: this.diagnosticPatterns.length,
      supportedCommands: [
        'help', 'status', 'features', 'enable', 'disable', 'toggle',
        'currency', 'exchange', 'news', 'weather', 'search', 'find',
        'meme', 'stats', 'statistics', 'memory', 'test', 'diagnostic',
        // Ukrainian commands
        'курс', 'валюта', 'новини', 'погода', 'знайти', 'пошук',
        'мем', 'статистика', 'пам\'ять', 'тест', 'діагностика',
        'увімкни', 'вимкни', 'перемкни'
      ],
      languages: ['uk', 'en'],
      triggerTypes: ['direct', 'slash', 'mention', 'natural'],
      totalPatterns: this.helpPatterns.length + this.statusPatterns.length + 
                    this.featurePatterns.length + this.currencyPatterns.length +
                    this.newsPatterns.length + this.weatherPatterns.length +
                    this.searchPatterns.length + this.memePatterns.length +
                    this.statsPatterns.length + this.memoryPatterns.length +
                    this.testPatterns.length + this.diagnosticPatterns.length
    };
  }
} 