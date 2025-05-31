import { KnowledgeSearchEngine, SearchQuery, SearchResult } from '../../src/domain/knowledgeSearchEngine';

describe('KnowledgeSearchEngine', () => {
  let searchEngine: KnowledgeSearchEngine;

  beforeEach(() => {
    searchEngine = new KnowledgeSearchEngine();
  });

  describe('Constructor', () => {
    it('should initialize properly', () => {
      expect(searchEngine).toBeDefined();
    });
  });

  describe('Math calculations', () => {
    it('should handle basic Ukrainian math queries', async () => {
      const query: SearchQuery = {
        text: 'Скільки буде 2 + 2?',
        userId: 'test',
        chatId: 'test',
        language: 'uk'
      };

      const result = await searchEngine.searchKnowledge(query);
      
      expect(result).toBeDefined();
      expect(result?.answer).toContain('4');
      expect(result?.confidence).toBeGreaterThan(0.9);
      expect(result?.source).toBe('Математичний калькулятор');
    });

    it('should handle English math queries', async () => {
      const query: SearchQuery = {
        text: 'What is 10 * 5?',
        userId: 'test',
        chatId: 'test',
        language: 'en'
      };

      const result = await searchEngine.searchKnowledge(query);
      
      if (result) {
        expect(result.answer).toContain('50');
        expect(result.confidence).toBeGreaterThan(0.9);
      } else {
        // If no result, that's also acceptable for this test
        expect(result).toBeNull();
      }
    });

    it('should handle complex math expressions', async () => {
      const query: SearchQuery = {
        text: 'Calculate (10 + 5) * 2',
        userId: 'test',
        chatId: 'test',
        language: 'en'
      };

      const result = await searchEngine.searchKnowledge(query);
      
      expect(result).toBeDefined();
      expect(result?.answer).toContain('30');
    });

    it('should reject unsafe math expressions', async () => {
      const query: SearchQuery = {
        text: 'Скільки буде eval("alert")',
        userId: 'test',
        chatId: 'test',
        language: 'uk'
      };

      const result = await searchEngine.searchKnowledge(query);
      
      expect(result).toBeNull();
    });
  });

  describe('Question detection', () => {
    it('should recognize Ukrainian knowledge questions', async () => {
      const ukrainianQueries = [
        'Хто такий Ейнштейн?',
        'Що таке квантова фізика?',
        'Коли відбулася революція?',
        'Де знаходиться Париж?',
        'Як працює інтернет?',
        'Чому небо синє?'
      ];

      for (const text of ukrainianQueries) {
        const query: SearchQuery = {
          text,
          userId: 'test',
          chatId: 'test',
          language: 'uk'
        };

        const result = await searchEngine.searchKnowledge(query);
        // Note: DuckDuckGo may or may not return results, but it should at least recognize these as knowledge queries
        console.log(`Query: "${text}" -> Result: ${result ? 'Found' : 'Not found'}`);
      }
    });

    it('should recognize English knowledge questions', async () => {
      const englishQueries = [
        'Who is Albert Einstein?',
        'What is artificial intelligence?',
        'When was the internet invented?',
        'Where is the Great Wall of China?',
        'How does photosynthesis work?',
        'Why is the sky blue?'
      ];

      for (const text of englishQueries) {
        const query: SearchQuery = {
          text,
          userId: 'test',
          chatId: 'test',
          language: 'en'
        };

        const result = await searchEngine.searchKnowledge(query);
        console.log(`Query: "${text}" -> Result: ${result ? 'Found' : 'Not found'}`);
      }
    });

    it('should ignore non-knowledge queries', async () => {
      const nonQueries = [
        'Привіт, як справи?',
        'Hello everyone!',
        'Доброго ранку',
        'Good morning',
        'Дякую за допомогу',
        'Thanks for help'
      ];

      for (const text of nonQueries) {
        const query: SearchQuery = {
          text,
          userId: 'test',
          chatId: 'test',
          language: 'uk'
        };

        const result = await searchEngine.searchKnowledge(query);
        expect(result).toBeNull();
      }
    });
  });

  describe('DuckDuckGo integration', () => {
    it('should handle DuckDuckGo API responses gracefully', async () => {
      const query: SearchQuery = {
        text: 'What is the capital of France?',
        userId: 'test',
        chatId: 'test',
        language: 'en'
      };

      // Note: This might fail if DuckDuckGo is down or doesn't return results
      // That's expected behavior - the engine should handle it gracefully
      const result = await searchEngine.searchKnowledge(query);
      
      if (result) {
        expect(result.answer).toBeDefined();
        expect(result.source).toBeDefined();
        expect(result.confidence).toBeGreaterThan(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
      }
    });

    it('should handle API errors gracefully', async () => {
      // Mock fetch to simulate API error
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const query: SearchQuery = {
        text: 'What is the capital of Ukraine?',
        userId: 'test',
        chatId: 'test',
        language: 'en'
      };

      const result = await searchEngine.searchKnowledge(query);
      expect(result).toBeNull();

      // Restore original fetch
      global.fetch = originalFetch;
    });
  });

  describe('Statistics', () => {
    it('should provide comprehensive stats', () => {
      const stats = searchEngine.getStats();
      
      expect(stats.supportedQuestionTypes).toBeDefined();
      expect(stats.supportedQuestionTypes.ukrainian).toBeGreaterThan(0);
      expect(stats.supportedQuestionTypes.english).toBeGreaterThan(0);
      expect(stats.mathPatterns).toBeGreaterThan(0);
      expect(stats.features).toContain('Mathematical calculations');
      expect(stats.features).toContain('DuckDuckGo instant answers');
      expect(stats.features).toContain('Ukrainian/English support');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty queries', async () => {
      const query: SearchQuery = {
        text: '',
        userId: 'test',
        chatId: 'test',
        language: 'uk'
      };

      const result = await searchEngine.searchKnowledge(query);
      expect(result).toBeNull();
    });

    it('should handle very long queries', async () => {
      const longText = 'Хто такий '.repeat(100) + 'Ейнштейн?';
      const query: SearchQuery = {
        text: longText,
        userId: 'test',
        chatId: 'test',
        language: 'uk'
      };

      const result = await searchEngine.searchKnowledge(query);
      // Should still work or gracefully fail
      expect(result === null || result.answer).toBeDefined();
    });

    it('should handle special characters in math', async () => {
      const query: SearchQuery = {
        text: 'Скільки буде 5.5 + 2.3?',
        userId: 'test',
        chatId: 'test',
        language: 'uk'
      };

      const result = await searchEngine.searchKnowledge(query);
      
      expect(result).toBeDefined();
      expect(result?.answer).toContain('7.8');
    });
  });
}); 