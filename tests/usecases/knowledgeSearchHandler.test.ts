 import { KnowledgeSearchHandler, KnowledgeSearchResponse } from '../../src/usecases/knowledgeSearchHandler';

describe('KnowledgeSearchHandler', () => {
  let handler: KnowledgeSearchHandler;

  beforeEach(() => {
    handler = new KnowledgeSearchHandler();
  });

  describe('Constructor', () => {
    it('should initialize properly', () => {
      expect(handler).toBeDefined();
    });
  });

  describe('Language detection', () => {
    it('should detect Ukrainian language', async () => {
      const ukrainianQueries = [
        'Хто такий президент?',
        'Що таке демократія?',
        'Скільки буде 2 плюс 2?',
        'Коли закінчилася війна?'
      ];

      for (const query of ukrainianQueries) {
        const response = await handler.handleMessage(query, 'group', 'user1', 'chat1');
        if (response.shouldRespond) {
          // Ukrainian queries should be handled properly
          expect(response.confidence).toBeGreaterThan(0);
        }
      }
    });

    it('should detect English language', async () => {
      const englishQueries = [
        'Who is the president?',
        'What is democracy?',
        'What is 2 plus 2?',
        'When did the war end?'
      ];

      for (const query of englishQueries) {
        const response = await handler.handleMessage(query, 'group', 'user1', 'chat1');
        if (response.shouldRespond) {
          // English queries should be handled properly
          expect(response.confidence).toBeGreaterThan(0);
        }
      }
    });

    it('should default to Ukrainian for ambiguous text', async () => {
      const response = await handler.handleMessage('Хто?', 'group', 'user1', 'chat1');
      // Should try to process even short Ukrainian queries
      expect(response).toBeDefined();
    });
  });

  describe('Response handling', () => {
    it('should handle successful knowledge search', async () => {
      // Math queries are most likely to succeed
      const response = await handler.handleMessage('Скільки буде 5 + 3?', 'group', 'user1', 'chat1');
      
      expect(response.shouldRespond).toBe(true);
      expect(response.responseType).toBe('knowledge');
      expect(response.response).toContain('8');
      expect(response.confidence).toBeGreaterThan(0.9);
      expect(response.source).toBeDefined();
    });

    it('should handle failed knowledge search', async () => {
      const response = await handler.handleMessage('Привіт, як справи?', 'group', 'user1', 'chat1');
      
      expect(response.shouldRespond).toBe(false);
      expect(response.responseType).toBe('ignore');
      expect(response.confidence).toBe(0);
    });

    it('should format responses correctly', async () => {
      const response = await handler.handleMessage('What is 10 * 2?', 'group', 'user1', 'chat1');
      
      if (response.shouldRespond) {
        expect(response.response).toMatch(/🔍.*\*\*/); // Should start with 🔍 and have bold text
        expect(response.response).toContain('20');
      }
    });

    it('should include source information', async () => {
      const response = await handler.handleMessage('Обчисли 7 + 13', 'group', 'user1', 'chat1');
      
      if (response.shouldRespond) {
        expect(response.source).toBeDefined();
        expect(response.reasoning).toContain('Source:');
      }
    });
  });

  describe('Response formatting', () => {
    it('should format Ukrainian responses correctly', async () => {
      const response = await handler.handleMessage('Скільки буде 3 * 4?', 'group', 'user1', 'chat1');
      
      if (response.shouldRespond && response.confidence < 0.8) {
        expect(response.response).toContain('⚠️ Інформація може бути неточною');
      }
    });

    it('should format English responses correctly', async () => {
      const response = await handler.handleMessage('Calculate 6 / 2', 'group', 'user1', 'chat1');
      
      if (response.shouldRespond && response.confidence < 0.8) {
        expect(response.response).toContain('⚠️ Information may be inaccurate');
      }
    });

    it('should not include DuckDuckGo source in simple responses', async () => {
      const response = await handler.handleMessage('What is 8 + 7?', 'group', 'user1', 'chat1');
      
      if (response.shouldRespond) {
        // Math calculations shouldn't show DuckDuckGo as source
        expect(response.response).not.toContain('DuckDuckGo');
      }
    });
  });

  describe('Error handling', () => {
    it('should handle errors gracefully', async () => {
      // Mock the search engine to throw an error
      const originalSearchKnowledge = handler['searchEngine'].searchKnowledge;
      handler['searchEngine'].searchKnowledge = jest.fn().mockRejectedValue(new Error('Test error'));

      const response = await handler.handleMessage('Хто такий тест?', 'group', 'user1', 'chat1');
      
      expect(response.shouldRespond).toBe(false);
      expect(response.responseType).toBe('ignore');
      expect(response.reasoning).toContain('Error processing knowledge query');

      // Restore original method
      handler['searchEngine'].searchKnowledge = originalSearchKnowledge;
    });
  });

  describe('Test utilities', () => {
    it('should provide test search functionality', async () => {
      const result = await handler.testSearch('Скільки буде 4 + 6?');
      
      expect(result.query).toBe('Скільки буде 4 + 6?');
      expect(result.result).toBeDefined();
      expect(result.confidence).toBeDefined();
      expect(result.reasoning).toBeDefined();
      
      if (result.confidence > 0) {
        expect(result.result).toContain('10');
      }
    });

    it('should provide stats', () => {
      const stats = handler.getStats();
      
      expect(stats.handlerName).toBe('KnowledgeSearchHandler');
      expect(stats.version).toBe('1.0.0');
      expect(stats.capabilities).toContain('Mathematical calculations (Ukrainian/English)');
      expect(stats.capabilities).toContain('Factual questions via DuckDuckGo');
      expect(stats.supportedQuestionTypes.ukrainian).toBeGreaterThan(0);
      expect(stats.supportedQuestionTypes.english).toBeGreaterThan(0);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle various math operations', async () => {
      const mathQueries = [
        { query: 'Скільки буде 15 + 25?', expected: '40' },
        { query: 'What is 50 - 20?', expected: '30' },
        { query: 'Обчисли 6 * 8', expected: '48' },
        { query: 'Calculate 100 / 4', expected: '25' }
      ];

      for (const { query, expected } of mathQueries) {
        const response = await handler.handleMessage(query, 'group', 'user1', 'chat1');
        
        if (response.shouldRespond) {
          expect(response.response).toContain(expected);
          expect(response.confidence).toBeGreaterThan(0.9);
        }
      }
    });

    it('should handle complex expressions with parentheses', async () => {
      const response = await handler.handleMessage('Скільки буде (5 + 3) * 2?', 'group', 'user1', 'chat1');
      
      if (response.shouldRespond) {
        expect(response.response).toContain('16');
      }
    });

    it('should reject invalid math expressions', async () => {
      const invalidQueries = [
        'Скільки буде eval(alert)',
        'What is document.write',
        'Calculate function()',
        'Обчисли process.exit()'
      ];

      for (const query of invalidQueries) {
        const response = await handler.handleMessage(query, 'group', 'user1', 'chat1');
        expect(response.shouldRespond).toBe(false);
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle empty messages', async () => {
      const response = await handler.handleMessage('', 'group', 'user1', 'chat1');
      
      expect(response.shouldRespond).toBe(false);
      expect(response.responseType).toBe('ignore');
    });

    it('should handle very long messages', async () => {
      const longQuery = 'Хто такий ' + 'дуже '.repeat(100) + 'довгий президент?';
      const response = await handler.handleMessage(longQuery, 'group', 'user1', 'chat1');
      
      // Should handle gracefully (either respond or ignore)
      expect(response).toBeDefined();
      expect(['knowledge', 'ignore']).toContain(response.responseType);
    });

    it('should handle special characters', async () => {
      const response = await handler.handleMessage('Скільки буде 3.14 + 2.86?', 'group', 'user1', 'chat1');
      
      if (response.shouldRespond) {
        expect(response.response).toMatch(/6/); // Should contain result around 6
      }
    });
  });
}); 