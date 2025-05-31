import { KnowledgeSearchEngine, SearchResult, SearchQuery } from '../domain/knowledgeSearchEngine';

export interface KnowledgeSearchResponse {
  shouldRespond: boolean;
  responseType: 'knowledge' | 'ignore';
  response: string;
  confidence: number;
  reasoning: string;
  source?: string;
}

export class KnowledgeSearchHandler {
  private searchEngine: KnowledgeSearchEngine;

  constructor() {
    this.searchEngine = new KnowledgeSearchEngine();
    console.log('🔍 Knowledge Search Handler initialized');
  }

  public async handleMessage(
    text: string,
    chatType: string,
    userId: string,
    chatId: string
  ): Promise<KnowledgeSearchResponse> {
    try {
      // Визначаємо мову
      const language = this.detectLanguage(text);
      
      // Створюємо запит
      const query: SearchQuery = {
        text: text.trim(),
        userId,
        chatId,
        language
      };

      console.log(`🔍 Processing knowledge query: "${text}"`);

      // Шукаємо відповідь
      const result = await this.searchEngine.searchKnowledge(query);
      
      if (result) {
        return {
          shouldRespond: true,
          responseType: 'knowledge',
          response: this.formatResponse(result),
          confidence: result.confidence,
          reasoning: `Knowledge search successful. Source: ${result.source}, Confidence: ${Math.round(result.confidence * 100)}%`,
          source: result.source
        };
      }

      return {
        shouldRespond: false,
        responseType: 'ignore',
        response: '',
        confidence: 0,
        reasoning: 'Not a knowledge query or no answer found'
      };

    } catch (error) {
      console.error('❌ Knowledge search handler error:', error);
      return {
        shouldRespond: false,
        responseType: 'ignore',
        response: '',
        confidence: 0,
        reasoning: `Error processing knowledge query: ${error}`
      };
    }
  }

  private detectLanguage(text: string): 'uk' | 'en' {
    const ukrainianPatterns = [
      /хто\s+так/i, /що\s+так/i, /коли/i, /де\s+/i, /як\s+/i,
      /навіщо/i, /чому/i, /скільки/i, /обчисли/i, /розрахуй/i
    ];

    const englishPatterns = [
      /who\s+is/i, /what\s+is/i, /when\s+/i, /where\s+/i, 
      /how\s+/i, /why\s+/i, /calculate/i
    ];

    const hasUkrainian = ukrainianPatterns.some(pattern => pattern.test(text));
    const hasEnglish = englishPatterns.some(pattern => pattern.test(text));

    // Пріоритет українській мові
    if (hasUkrainian) return 'uk';
    if (hasEnglish) return 'en';

    // За замовчуванням українська
    return 'uk';
  }

  private formatResponse(result: SearchResult): string {
    const sourceText = result.language === 'uk' ? 'Джерело' : 'Source';
    const confidenceText = result.language === 'uk' ? 'Впевненість' : 'Confidence';
    
    let response = `🔍 **${result.answer}**`;
    
    if (result.source && result.source !== 'DuckDuckGo') {
      response += `\n\n📖 ${sourceText}: ${result.source}`;
    }

    if (result.confidence < 0.8) {
      const warningText = result.language === 'uk' 
        ? '⚠️ Інформація може бути неточною'
        : '⚠️ Information may be inaccurate';
      response += `\n${warningText}`;
    }

    return response;
  }

  public getStats() {
    const engineStats = this.searchEngine.getStats();
    return {
      ...engineStats,
      handlerName: 'KnowledgeSearchHandler',
      version: '1.0.0',
      capabilities: [
        'Mathematical calculations (Ukrainian/English)',
        'Factual questions via DuckDuckGo',
        'Wikipedia-style answers',
        'Instant definitions and facts',
        'Multi-language support'
      ]
    };
  }

  // Тестовий метод для CLI
  public async testSearch(query: string): Promise<any> {
    const result = await this.handleMessage(query, 'private', 'test', 'test');
    return {
      query,
      result: result.shouldRespond ? result.response : 'No answer found',
      confidence: result.confidence,
      reasoning: result.reasoning
    };
  }
} 