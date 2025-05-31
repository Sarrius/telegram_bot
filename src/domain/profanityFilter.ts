export interface ProfanityMatch {
  word: string;
  startIndex: number;
  endIndex: number;
  severity: 'mild' | 'moderate' | 'severe';
  language: 'ua' | 'ru' | 'mixed';
}

export interface ProfanityAnalysis {
  hasProfanity: boolean;
  matches: ProfanityMatch[];
  severityLevel: 'clean' | 'mild' | 'moderate' | 'severe';
  language: 'ua' | 'ru' | 'mixed' | 'unknown';
  confidence: number; // 0-1 scale
  recommendedAction: 'ignore' | 'warn' | 'moderate' | 'strict';
}

export class ProfanityFilter {
  private ukrainianWords: Set<string>;
  private russianWords: Set<string>;
  private commonVariations: Map<string, string[]>;

  constructor() {
    this.ukrainianWords = new Set();
    this.russianWords = new Set();
    this.commonVariations = new Map();
    this.initializeDictionaries();
    this.setupVariations();
  }

  private initializeDictionaries() {
    // Ukrainian profanity words
    const ukrainianProfanity = [
      // Core Ukrainian profanity
      'бля', 'блядей', 'блядина', 'блядота', 'блядство', 'блядська', 'блядь', 'блядів', 'блять',
      'пизд', 'пизда', 'пиздато', 'пиздець', 'пизди', 'пиздолиз', 'пиздолизить', 'пиздолизня',
      'пізда', 'піздата', 'піздати', 'піздато', 'піздаті', 'піздец', 'піздець', 'піздиш',
      'піздолиз', 'піздолизня', 'піздота', 'піздотой', 'піздотою', 'піздти', 'пізду',
      'піздує', 'піздуємо', 'піздуєте', 'піздюк', 'піздюки', 'піздюків',
      'хуй', 'хуйло', 'хуйлопан', 'хуйовий', 'хуйово', 'хуйом', 'хуя', 'хуями',
      'хуєвий', 'хуєм', 'хуєсос', 'хуєсосити', 'хуєсосний', 'хуї', 'хуїв',
      'нахуй', 'нахуя', 'похуй', 'похую', 'похуям',
      'їбав', 'їбала', 'їбали', 'їбальний', 'їбальник', 'їбана', 'їбанат', 'їбанута',
      'їбанути', 'їбанутий', 'їбанько', 'їбати', 'їбатись', 'їбатися', 'їбе', 'їбеш',
      'сук', 'сука', 'суки', 'сукою', 'сучара', 'сучий', 'сучка', 'сучок',
      'єбобо', 'єбучий', 'хер', 'херовий', 'херово', 'хером', 'хєр'
    ];

    // Russian profanity words  
    const russianProfanity = [
      // Core Russian profanity
      'бздёнок', 'блядки', 'блядовать', 'блядство', 'блядь', 'бугор',
      'гандон', 'говно', 'говнюк', 'дерьмо', 'долбоёб', 'дрочить',
      'ебало', 'ебальник', 'ебать', 'ебло', 'ебнуть', 'жопа', 'жополиз',
      'заебись', 'залупа', 'залупать', 'засать', 'засранец', 'заёбать',
      'манда', 'мандавошка', 'муда', 'мудак', 'мудило', 'мудозвон',
      'наебать', 'наебениться', 'наебнуться', 'нахуячиться',
      'пизда', 'пиздануть', 'пиздато', 'пиздатый', 'пиздеть', 'пиздец', 'пиздюк',
      'проебать', 'пропездолочь', 'просрать', 'разъёба', 'разъёбывать',
      'сволочь', 'секс', 'сиськи', 'спиздить', 'срать', 'ссать', 'стерва',
      'траxать', 'трахаться', 'ублюдок', 'убой', 'уёбище',
      'хуеплет', 'хуило', 'хуиня', 'хуй', 'хуйнуть', 'хуёво', 'хуёвый',
      'черножопый', 'шалава', 'ёбарь', 'mudak', 'pizda', 'blyad'
    ];

    // Add words to sets
    ukrainianProfanity.forEach(word => this.ukrainianWords.add(word.toLowerCase()));
    russianProfanity.forEach(word => this.russianWords.add(word.toLowerCase()));
  }

  private setupVariations() {
    // Common letter substitutions used to bypass filters
    this.commonVariations.set('variations', [
      // Cyrrilic to Latin substitutions
      'а->a', 'е->e', 'о->o', 'р->p', 'у->y', 'х->x', 'с->c',
      // Number/symbol substitutions  
      'а->@', 'о->0', 'і->1', 'и->1', 'е->3', 'б->6', 'г->9',
      // Intentional misspellings
      'х->хх', 'у->уу', 'и->ии'
    ]);
  }

  analyzeMessage(text: string): ProfanityAnalysis {
    const normalizedText = this.normalizeText(text);
    const words = this.extractWords(normalizedText);
    const matches: ProfanityMatch[] = [];

    // Check each word for profanity
    for (const word of words) {
      const match = this.checkWord(word.text, word.startIndex);
      if (match) {
        matches.push(match);
      }
    }

    return this.generateAnalysis(matches, text);
  }

  private normalizeText(text: string): string {
    // Remove extra whitespace and normalize
    return text.toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractWords(text: string): Array<{text: string, startIndex: number}> {
    const words: Array<{text: string, startIndex: number}> = [];
    const regex = /[а-яёa-z]+/gi;
    let match;

    while ((match = regex.exec(text)) !== null) {
      words.push({
        text: match[0].toLowerCase(),
        startIndex: match.index
      });
    }

    return words;
  }

  private checkWord(word: string, startIndex: number): ProfanityMatch | null {
    // Direct match check
    if (this.ukrainianWords.has(word)) {
      return {
        word,
        startIndex,
        endIndex: startIndex + word.length,
        severity: this.getSeverity(word),
        language: 'ua'
      };
    }

    if (this.russianWords.has(word)) {
      return {
        word,
        startIndex,
        endIndex: startIndex + word.length,
        severity: this.getSeverity(word),
        language: 'ru'
      };
    }

    // Check for variations and obfuscated versions
    const deobfuscated = this.deobfuscateWord(word);
    if (deobfuscated !== word) {
      return this.checkWord(deobfuscated, startIndex);
    }

    // Check for partial matches (root words)
    const rootMatch = this.checkRootWord(word);
    if (rootMatch) {
      return {
        word,
        startIndex,
        endIndex: startIndex + word.length,
        severity: rootMatch.severity,
        language: rootMatch.language
      };
    }

    return null;
  }

  private deobfuscateWord(word: string): string {
    let deobfuscated = word;
    
    // Replace common substitutions
    const substitutions = {
      '@': 'а', '0': 'о', '1': 'і', '3': 'е', '6': 'б', '9': 'г',
      'a': 'а', 'e': 'е', 'o': 'о', 'p': 'р', 'y': 'у', 'x': 'х', 'c': 'с'
    };

    for (const [symbol, letter] of Object.entries(substitutions)) {
      deobfuscated = deobfuscated.replace(new RegExp(symbol, 'g'), letter);
    }

    return deobfuscated;
  }

  private checkRootWord(word: string): {severity: ProfanityMatch['severity'], language: ProfanityMatch['language']} | null {
    // Check if word contains profanity roots
    const profanityRoots = [
      { root: 'пизд', severity: 'severe' as const, language: 'ua' as const },
      { root: 'хуй', severity: 'severe' as const, language: 'ua' as const },
      { root: 'блят', severity: 'moderate' as const, language: 'ua' as const },
      { root: 'їбан', severity: 'severe' as const, language: 'ua' as const },
      { root: 'мудак', severity: 'moderate' as const, language: 'ru' as const },
      { root: 'ебал', severity: 'severe' as const, language: 'ru' as const },
      { root: 'сука', severity: 'mild' as const, language: 'mixed' as const }
    ];

    for (const {root, severity, language} of profanityRoots) {
      if (word.includes(root) && word.length >= root.length + 1) {
        return { severity, language };
      }
    }

    return null;
  }

  private getSeverity(word: string): ProfanityMatch['severity'] {
    // Define severity levels based on word types
    const severeWords = ['пізда', 'пизда', 'хуй', 'хуї', 'їбан', 'ебал', 'ебать'];
    const moderateWords = ['блять', 'блят', 'мудак', 'говно', 'дерьмо'];
    
    if (severeWords.some(severe => word.includes(severe.slice(0, 4)))) {
      return 'severe';
    }
    
    if (moderateWords.some(moderate => word.includes(moderate.slice(0, 3)))) {
      return 'moderate';
    }
    
    return 'mild';
  }

  private generateAnalysis(matches: ProfanityMatch[], originalText: string): ProfanityAnalysis {
    if (matches.length === 0) {
      return {
        hasProfanity: false,
        matches: [],
        severityLevel: 'clean',
        language: 'unknown',
        confidence: 1.0,
        recommendedAction: 'ignore'
      };
    }

    // Determine overall severity
    const severityLevel = this.getOverallSeverity(matches);
    
    // Determine dominant language
    const language = this.getDominantLanguage(matches);
    
    // Calculate confidence based on number and clarity of matches
    const confidence = this.calculateConfidence(matches, originalText);
    
    // Recommend action based on severity
    const recommendedAction = this.getRecommendedAction(severityLevel, matches.length);

    return {
      hasProfanity: true,
      matches,
      severityLevel,
      language,
      confidence,
      recommendedAction
    };
  }

  private getOverallSeverity(matches: ProfanityMatch[]): ProfanityAnalysis['severityLevel'] {
    if (matches.some(m => m.severity === 'severe')) return 'severe';
    if (matches.some(m => m.severity === 'moderate')) return 'moderate';
    return 'mild';
  }

  private getDominantLanguage(matches: ProfanityMatch[]): ProfanityAnalysis['language'] {
    const uaCount = matches.filter(m => m.language === 'ua').length;
    const ruCount = matches.filter(m => m.language === 'ru').length;
    const mixedCount = matches.filter(m => m.language === 'mixed').length;

    if (uaCount > ruCount && uaCount > mixedCount) return 'ua';
    if (ruCount > uaCount && ruCount > mixedCount) return 'ru';
    if (mixedCount > 0 || (uaCount === ruCount && uaCount > 0)) return 'mixed';
    return 'unknown';
  }

  private calculateConfidence(matches: ProfanityMatch[], text: string): number {
    if (matches.length === 0) return 0;
    
    // Base confidence on directness of matches
    let confidence = 0.7; // Base confidence
    
    // Boost confidence for multiple matches
    confidence += Math.min(matches.length * 0.1, 0.3);
    
    // Boost confidence for severe words
    if (matches.some(m => m.severity === 'severe')) confidence += 0.2;
    
    return Math.min(confidence, 1.0);
  }

  private getRecommendedAction(severity: ProfanityAnalysis['severityLevel'], matchCount: number): ProfanityAnalysis['recommendedAction'] {
    if (severity === 'severe' || matchCount >= 3) return 'strict';
    if (severity === 'moderate' || matchCount >= 2) return 'moderate';
    if (severity === 'mild') return 'warn';
    return 'ignore';
  }

  // Public utility methods
  getStats() {
    return {
      ukrainianWordsCount: this.ukrainianWords.size,
      russianWordsCount: this.russianWords.size,
      totalWordsCount: this.ukrainianWords.size + this.russianWords.size
    };
  }

  addCustomWord(word: string, language: 'ua' | 'ru') {
    const normalizedWord = word.toLowerCase();
    if (language === 'ua') {
      this.ukrainianWords.add(normalizedWord);
    } else {
      this.russianWords.add(normalizedWord);
    }
  }

  removeWord(word: string, language: 'ua' | 'ru') {
    const normalizedWord = word.toLowerCase();
    if (language === 'ua') {
      this.ukrainianWords.delete(normalizedWord);
    } else {
      this.russianWords.delete(normalizedWord);
    }
  }
} 