// Mapper для синхронізації назв функцій між appConfig та FeatureManager

export interface FeatureMapping {
  appConfigName: string;
  featureManagerName: string;
  description: string;
  emoji: string;
}

export const FEATURE_MAPPINGS: FeatureMapping[] = [
  {
    appConfigName: 'nlpConversations',
    featureManagerName: 'nlp',
    description: 'NLP розмови та розуміння контексту',
    emoji: '💬'
  },
  {
    appConfigName: 'contentModeration',
    featureManagerName: 'moderation',
    description: 'Модерація контенту та нецензурщини',
    emoji: '🛡️'
  },
  {
    appConfigName: 'atmosphereEnhancement',
    featureManagerName: 'atmosphere',
    description: 'Підвищення атмосфери у чатах',
    emoji: '🌟'
  },
  {
    appConfigName: 'memeGeneration',
    featureManagerName: 'memes',
    description: 'Генерація мемів',
    emoji: '🎭'
  },
  {
    appConfigName: 'sentimentReactions',
    featureManagerName: 'powerWords',
    description: 'Реакції на потужні слова та емоції',
    emoji: '⚡'
  },
  {
    appConfigName: 'userMemory',
    featureManagerName: 'memory',
    description: 'Система пам\'яті користувачів',
    emoji: '🧠'
  },
  {
    appConfigName: 'profanityFilter',
    featureManagerName: 'profanityFilter',
    description: 'Фільтрація нецензурної лексики',
    emoji: '🚫'
  },
  {
    appConfigName: 'newsWeatherMonitoring',
    featureManagerName: 'news',
    description: 'Моніторинг новин',
    emoji: '📰'
  },
  {
    appConfigName: 'learningSystem',
    featureManagerName: 'weather',
    description: 'Інформація про погоду',
    emoji: '🌤️'
  }
];

// Спеціальні функції тільки в FeatureManager
export const FEATURE_MANAGER_ONLY: FeatureMapping[] = [
  {
    appConfigName: '',
    featureManagerName: 'knowledgeSearch',
    description: 'Інтелектуальний пошук і відповіді на питання',
    emoji: '🔍'
  }
];

export class FeatureMapper {
  private appToFeatureMap: Map<string, string> = new Map();
  private featureToAppMap: Map<string, string> = new Map();
  private allFeatures: Map<string, FeatureMapping> = new Map();

  constructor() {
    this.initializeMappings();
  }

  private initializeMappings(): void {
    // Основні мапінги
    FEATURE_MAPPINGS.forEach(mapping => {
      this.appToFeatureMap.set(mapping.appConfigName, mapping.featureManagerName);
      this.featureToAppMap.set(mapping.featureManagerName, mapping.appConfigName);
      this.allFeatures.set(mapping.featureManagerName, mapping);
    });

    // Функції тільки в FeatureManager
    FEATURE_MANAGER_ONLY.forEach(mapping => {
      this.allFeatures.set(mapping.featureManagerName, mapping);
    });
  }

  public mapAppConfigToFeatureManager(appConfigName: string): string | null {
    return this.appToFeatureMap.get(appConfigName) || null;
  }

  public mapFeatureManagerToAppConfig(featureManagerName: string): string | null {
    return this.featureToAppMap.get(featureManagerName) || null;
  }

  public getAllFeatureManagerNames(): string[] {
    return Array.from(this.allFeatures.keys());
  }

  public getFeatureInfo(featureManagerName: string): FeatureMapping | null {
    return this.allFeatures.get(featureManagerName) || null;
  }

  public findFeatureByAlias(input: string): string | null {
    const lowerInput = input.toLowerCase();
    
    // Пряме співпадіння з feature manager назвою
    if (this.allFeatures.has(lowerInput)) {
      return lowerInput;
    }

    // Співпадіння з appConfig назвою
    const mapped = this.mapAppConfigToFeatureManager(lowerInput);
    if (mapped) {
      return mapped;
    }

    // Часткове співпадіння або аліаси
    const aliases: Record<string, string[]> = {
      'nlp': ['conversations', 'chat', 'розмови'],
      'moderation': ['модерація', 'contentmoderation', 'content'],
      'atmosphere': ['атмосфера', 'atmosphereenhancement'],
      'memes': ['меми', 'memegeneration'],
      'powerWords': ['powerwords', 'sentiment', 'sentimentreactions', 'реакції'],
      'memory': ['пам\'ять', 'usermemory'],
      'profanityFilter': ['profanity', 'нецензурщина', 'фільтр'],
      'news': ['новини', 'newsweathermonitoring'],
      'weather': ['погода', 'learningsystem'],
      'knowledgeSearch': ['knowledge', 'search', 'пошук', 'знання']
    };

    for (const [feature, aliasArray] of Object.entries(aliases)) {
      if (aliasArray.some(alias => alias.toLowerCase() === lowerInput)) {
        return feature;
      }
    }

    // Fuzzy matching
    for (const feature of this.getAllFeatureManagerNames()) {
      if (feature.toLowerCase().includes(lowerInput) || lowerInput.includes(feature.toLowerCase())) {
        return feature;
      }
    }

    return null;
  }

  public getFormattedFeaturesList(): string {
    let result = '🎛️ **Доступні функції:**\n\n';
    
    this.allFeatures.forEach((mapping, featureName) => {
      const appConfigName = mapping.appConfigName || 'тільки в FeatureManager';
      result += `${mapping.emoji} **${featureName}** (${appConfigName})\n`;
      result += `   ${mapping.description}\n\n`;
    });

    result += '💡 **Підказка:** Можна використовувати як коротку назву (nlp), так і повну (nlpConversations)\n';
    
    return result;
  }

  public getStats() {
    return {
      totalMappings: FEATURE_MAPPINGS.length,
      featureManagerOnly: FEATURE_MANAGER_ONLY.length,
      totalFeatures: this.allFeatures.size,
      mappedFeatures: this.appToFeatureMap.size,
      availableAliases: this.getAllFeatureManagerNames()
    };
  }
}

// Singleton instance
export const featureMapper = new FeatureMapper(); 