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
    { pattern: /^help$/i, language: 'en' as const },
    { pattern: /^\/help$/i, language: 'en' as const },
    { pattern: /^commands$/i, language: 'en' as const },
    { pattern: /show\s+commands/i, language: 'en' as const },
    { pattern: /list\s+commands/i, language: 'en' as const },
    { pattern: /what\s+commands/i, language: 'en' as const },
    { pattern: /available\s+commands/i, language: 'en' as const },
    { pattern: /@bot\s+cli\s+help/i, language: 'en' as const },
    { pattern: /@bot\s+help/i, language: 'en' as const }
  ];

  private readonly statusPatterns = [
    { pattern: /^status$/i, language: 'en' as const },
    { pattern: /^\/status$/i, language: 'en' as const },
    { pattern: /@bot\s+status/i, language: 'en' as const },
    { pattern: /@bot\s+cli\s+status/i, language: 'en' as const }
  ];

  private readonly featurePatterns = [
    { pattern: /^features$/i, language: 'en' as const },
    { pattern: /@bot\s+features/i, language: 'en' as const }
  ];

  constructor() {
    console.log('🎛️ CLI Command Detector initialized');
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

  private detectFeatureControl(text: string): CLICommandMatch {
    const patterns = [
      { pattern: /enable\s+(\w+)/i, command: 'enable', language: 'en' as const },
      { pattern: /turn\s+on\s+(\w+)/i, command: 'enable', language: 'en' as const },
      { pattern: /disable\s+(\w+)/i, command: 'disable', language: 'en' as const },
      { pattern: /turn\s+off\s+(\w+)/i, command: 'disable', language: 'en' as const },
      { pattern: /toggle\s+(\w+)/i, command: 'toggle', language: 'en' as const },
      { pattern: /@bot\s+enable\s+(\w+)/i, command: 'enable', language: 'en' as const },
      { pattern: /@bot\s+disable\s+(\w+)/i, command: 'disable', language: 'en' as const },
      { pattern: /@bot\s+toggle\s+(\w+)/i, command: 'toggle', language: 'en' as const }
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
      'бот', 'які', 'що'
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
      supportedCommands: ['help', 'status', 'features', 'enable', 'disable', 'toggle'],
      languages: ['uk', 'en'],
      triggerTypes: ['direct', 'slash', 'mention', 'natural']
    };
  }
} 