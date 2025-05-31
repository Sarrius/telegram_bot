export interface SearchResult {
  question: string;
  answer: string;
  source: string;
  confidence: number;
  language: 'uk' | 'en';
}

export interface SearchQuery {
  text: string;
  userId: string;
  chatId: string;
  language: 'uk' | 'en';
}

export class KnowledgeSearchEngine {
  private readonly mathPatterns = [
    /скільки\s+буде\s+(.+)/i,
    /обчисли\s+(.+)/i,
    /розрахуй\s+(.+)/i,
    /what\s+is\s+(\d+[\+\-\*\/\^%].+)/i,
    /calculate\s+(.+)/i
  ];

  private readonly questionPatterns = {
    uk: [
      /хто\s+такий\s+(.+)/i,
      /хто\s+така\s+(.+)/i,
      /що\s+таке\s+(.+)/i,
      /коли\s+(.+)/i,
      /де\s+(.+)/i,
      /як\s+(.+)/i,
      /навіщо\s+(.+)/i,
      /чому\s+(.+)/i,
      /скільки\s+(.+)/i
    ],
    en: [
      /who\s+is\s+(.+)/i,
      /what\s+is\s+(.+)/i,
      /when\s+(.+)/i,
      /where\s+(.+)/i,
      /how\s+(.+)/i,
      /why\s+(.+)/i
    ]
  };

  constructor() {
    console.log('🔍 Knowledge Search Engine initialized');
  }

  public async searchKnowledge(query: SearchQuery): Promise<SearchResult | null> {
    try {
      console.log(`🔍 Processing knowledge query: "${query.text}"`);

      // 1. Перевіряємо чи це запит знань
      if (!this.isKnowledgeQuery(query.text)) {
        return null;
      }

      // 2. Спробуємо математику спочатку
      const mathResult = await this.tryMathCalculation(query);
      if (mathResult) {
        return mathResult;
      }

      // 3. Загальний пошук знань
      const searchResult = await this.performWebSearch(query);
      return searchResult;

    } catch (error) {
      console.error('❌ Knowledge search error:', error);
      return null;
    }
  }

  private isKnowledgeQuery(text: string): boolean {
    const allPatterns = [
      ...this.mathPatterns,
      ...this.questionPatterns.uk,
      ...this.questionPatterns.en
    ];

    return allPatterns.some(pattern => pattern.test(text));
  }

  private async tryMathCalculation(query: SearchQuery): Promise<SearchResult | null> {
    try {
      // Витягуємо математичний вираз
      let expression = '';
      for (const pattern of this.mathPatterns) {
        const match = query.text.match(pattern);
        if (match && match[1]) {
          expression = match[1].trim();
          break;
        }
      }

      if (!expression) return null;

      // Безпечна оцінка простих математичних виразів
      const result = this.evaluateMathExpression(expression);
      if (result !== null) {
        const answer = query.language === 'uk' 
          ? `${expression} = ${result}`
          : `${expression} = ${result}`;

        return {
          question: query.text,
          answer: answer,
          source: 'Математичний калькулятор',
          confidence: 0.95,
          language: query.language
        };
      }
    } catch (error) {
      console.error('❌ Math calculation error:', error);
    }

    return null;
  }

  private evaluateMathExpression(expr: string): number | null {
    try {
      // Очищуємо вираз від небезпечних символів
      const cleanExpr = expr.replace(/[^0-9+\-*/().\s]/g, '');
      
      // Простий калькулятор для базових операцій
      if (/^[\d+\-*/().\s]+$/.test(cleanExpr)) {
        return Function(`"use strict"; return (${cleanExpr})`)();
      }
    } catch (error) {
      console.error('❌ Math evaluation error:', error);
    }
    return null;
  }

  private async performWebSearch(query: SearchQuery): Promise<SearchResult | null> {
    try {
      // 1. Спробуємо DuckDuckGo Instant Answer
      const duckDuckResult = await this.searchDuckDuckGo(query);
      if (duckDuckResult) {
        return duckDuckResult;
      }

      // 2. Fallback на веб пошук (якщо є API ключі)
      const webResult = await this.searchWeb(query);
      return webResult;

    } catch (error) {
      console.error('❌ Web search error:', error);
      return null;
    }
  }

  private async searchDuckDuckGo(query: SearchQuery): Promise<SearchResult | null> {
    try {
      const encodedQuery = encodeURIComponent(query.text);
      const url = `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_redirect=1`;
      
      const response = await fetch(url);
      const data = await response.json();

      // Перевіряємо Instant Answer
      if (data.AbstractText) {
        return {
          question: query.text,
          answer: data.AbstractText,
          source: data.AbstractSource || 'DuckDuckGo',
          confidence: 0.85,
          language: query.language
        };
      }

      // Перевіряємо Answer (для фактів)
      if (data.Answer) {
        return {
          question: query.text,
          answer: data.Answer,
          source: 'DuckDuckGo',
          confidence: 0.90,
          language: query.language
        };
      }

      // Перевіряємо Definition
      if (data.Definition) {
        return {
          question: query.text,
          answer: data.Definition,
          source: data.DefinitionSource || 'DuckDuckGo',
          confidence: 0.80,
          language: query.language
        };
      }

    } catch (error) {
      console.error('❌ DuckDuckGo search error:', error);
    }

    return null;
  }

  private async searchWeb(query: SearchQuery): Promise<SearchResult | null> {
    // Заглушка для майбутнього веб пошуку через Google/Bing API
    // Поки повертаємо null, але можна додати пізніше
    return null;
  }

  public getStats() {
    return {
      supportedQuestionTypes: {
        ukrainian: this.questionPatterns.uk.length,
        english: this.questionPatterns.en.length
      },
      mathPatterns: this.mathPatterns.length,
      features: [
        'Mathematical calculations',
        'DuckDuckGo instant answers',
        'Factual questions',
        'Ukrainian/English support'
      ]
    };
  }
} 