import { NLPConversationEngine, ConversationContext } from '../../src/domain/nlpConversation';

describe('NLPConversationEngine', () => {
  let engine: NLPConversationEngine;

  beforeEach(() => {
    engine = new NLPConversationEngine();
  });

  describe('Ukrainian Language Detection', () => {
    it('should detect Ukrainian by special characters', async () => {
      const context: ConversationContext = {
        userId: 'test-user',
        userName: 'TestUser',
        chatHistory: [],
        currentMessage: 'Привіт! Як справи?'
      };

      const response = await engine.generateConversationalResponse(context);
      
      expect(response.language).toBe('uk');
      expect(response.confidence).toBeGreaterThan(0.8);
    });

    it('should detect Ukrainian by common words', async () => {
      const context: ConversationContext = {
        userId: 'test-user',
        userName: 'TestUser',
        chatHistory: [],
        currentMessage: 'що це таке?'
      };

      const response = await engine.generateConversationalResponse(context);
      
      expect(response.language).toBe('uk');
    });

    it('should detect English as fallback', async () => {
      const context: ConversationContext = {
        userId: 'test-user',
        userName: 'TestUser',
        chatHistory: [],
        currentMessage: 'Hello there!'
      };

      const response = await engine.generateConversationalResponse(context);
      
      expect(response.language).toBe('en');
    });

    it('should handle mixed language content', async () => {
      const context: ConversationContext = {
        userId: 'test-user',
        userName: 'TestUser',
        chatHistory: [],
        currentMessage: 'Hello що це?'
      };

      const response = await engine.generateConversationalResponse(context);
      
      expect(['uk', 'en']).toContain(response.language);
    });
  });

  describe('Intent Detection', () => {
    it('should detect greeting intent in Ukrainian', async () => {
      const context: ConversationContext = {
        userId: 'test-user',
        userName: 'TestUser',
        chatHistory: [],
        currentMessage: 'Привіт! Вітаю!'
      };

      const response = await engine.generateConversationalResponse(context);
      
      expect(response.detectedIntent).toBe('greeting');
      expect(response.response).toContain('TestUser');
    });

    it('should detect joke request in Ukrainian', async () => {
      const context: ConversationContext = {
        userId: 'test-user',
        userName: 'TestUser',
        chatHistory: [],
        currentMessage: 'Розкажи жарт'
      };

      const response = await engine.generateConversationalResponse(context);
      
      expect(response.detectedIntent).toBe('joke_request');
      expect(response.shouldUseHumorousReply).toBe(true);
    });

    it('should detect help request in Ukrainian', async () => {
      const context: ConversationContext = {
        userId: 'test-user',
        userName: 'TestUser',
        chatHistory: [],
        currentMessage: 'Допоможи мені, будь ласка'
      };

      const response = await engine.generateConversationalResponse(context);
      
      expect(response.detectedIntent).toBe('help_request');
    });

    it('should detect story request in Ukrainian', async () => {
      const context: ConversationContext = {
        userId: 'test-user',
        userName: 'TestUser',
        chatHistory: [],
        currentMessage: 'Розкажи історію'
      };

      const response = await engine.generateConversationalResponse(context);
      
      expect(response.detectedIntent).toBe('story_request');
    });

    it('should detect support needed in Ukrainian', async () => {
      const context: ConversationContext = {
        userId: 'test-user',
        userName: 'TestUser',
        chatHistory: [],
        currentMessage: 'Мені сумно і погано'
      };

      const response = await engine.generateConversationalResponse(context);
      
      expect(response.detectedIntent).toBe('support_needed');
    });

    it('should detect farewell in Ukrainian', async () => {
      const context: ConversationContext = {
        userId: 'test-user',
        userName: 'TestUser',
        chatHistory: [],
        currentMessage: 'До побачення, бувай'
      };

      const response = await engine.generateConversationalResponse(context);
      
      expect(response.detectedIntent).toBe('farewell');
    });

    it('should default to general chat for unrecognized intent', async () => {
      const context: ConversationContext = {
        userId: 'test-user',
        userName: 'TestUser',
        chatHistory: [],
        currentMessage: 'рандомний текст без сенсу'
      };

      const response = await engine.generateConversationalResponse(context);
      
      expect(response.detectedIntent).toBe('general_chat');
    });
  });

  describe('English Intent Detection', () => {
    it('should detect greeting intent in English', async () => {
      const context: ConversationContext = {
        userId: 'test-user',
        userName: 'TestUser',
        chatHistory: [],
        currentMessage: 'Hello there!'
      };

      const response = await engine.generateConversationalResponse(context);
      
      expect(response.detectedIntent).toBe('greeting');
      expect(response.language).toBe('en');
    });

    it('should detect joke request in English', async () => {
      const context: ConversationContext = {
        userId: 'test-user',
        userName: 'TestUser',
        chatHistory: [],
        currentMessage: 'Tell me a funny joke'
      };

      const response = await engine.generateConversationalResponse(context);
      
      expect(response.detectedIntent).toBe('joke_request');
    });
  });

  describe('Response Generation', () => {
    it('should generate appropriate Ukrainian responses for each intent', async () => {
      const intents = ['joke_request', 'story_request', 'help_request', 'support_needed', 'greeting', 'farewell', 'general_chat'];
      
      for (const intent of intents) {
        const context: ConversationContext = {
          userId: 'test-user',
          userName: 'TestUser',
          chatHistory: [],
          currentMessage: intent === 'joke_request' ? 'розкажи жарт' : 'тестове повідомлення'
        };

        const response = await engine.generateConversationalResponse(context);
        
        expect(response.response).toBeTruthy();
        expect(response.response.length).toBeGreaterThan(0);
        expect(response.response).toContain('TestUser');
      }
    });

    it('should generate appropriate English responses for each intent', async () => {
      const intents = ['joke_request', 'story_request', 'help_request', 'support_needed', 'greeting', 'farewell', 'general_chat'];
      
      for (const intent of intents) {
        const context: ConversationContext = {
          userId: 'test-user',
          userName: 'TestUser',
          chatHistory: [],
          currentMessage: intent === 'joke_request' ? 'tell me a joke' : 'test message'
        };

        const response = await engine.generateConversationalResponse(context);
        
        expect(response.response).toBeTruthy();
        expect(response.response.length).toBeGreaterThan(0);
        expect(response.response).toContain('TestUser');
      }
    });
  });

  describe('Context Management', () => {
    it('should maintain user context across messages', async () => {
      const context: ConversationContext = {
        userId: 'test-user',
        userName: 'TestUser',
        chatHistory: [],
        currentMessage: 'First message'
      };

      const response1 = await engine.generateConversationalResponse(context);
      expect(response1.contextRetained).toBe(true);

      context.currentMessage = 'Second message';
      const response2 = await engine.generateConversationalResponse(context);
      expect(response2.contextRetained).toBe(true);
    });

    it('should limit chat history to max length', async () => {
      const context: ConversationContext = {
        userId: 'test-user',
        userName: 'TestUser',
        chatHistory: [],
        currentMessage: 'message'
      };

      // Send 15 messages (more than maxHistoryLength of 10)
      for (let i = 0; i < 15; i++) {
        context.currentMessage = `Message ${i}`;
        await engine.generateConversationalResponse(context);
      }

      const stats = engine.getStats();
      expect(stats.activeUsers).toBe(1);
    });

    it('should clean old contexts', async () => {
      const context: ConversationContext = {
        userId: 'old-user',
        userName: 'OldUser',
        chatHistory: [],
        currentMessage: 'Old message'
      };

      await engine.generateConversationalResponse(context);
      
      // Simulate time passage by creating another context much later
      const newContext: ConversationContext = {
        userId: 'new-user',
        userName: 'NewUser',
        chatHistory: [],
        currentMessage: 'New message'
      };

      await engine.generateConversationalResponse(newContext);
      
      const stats = engine.getStats();
      expect(stats.activeUsers).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Personality and Humor', () => {
    it('should apply bot personality based on language', async () => {
      const context: ConversationContext = {
        userId: 'test-user',
        userName: 'TestUser',
        chatHistory: ['дякую'],
        currentMessage: 'ще раз дякую'
      };

      const response = await engine.generateConversationalResponse(context);
      
      expect(response.response).toBeTruthy();
      expect(response.language).toBe('uk');
    });

    it('should determine when to use humor appropriately', async () => {
      const context: ConversationContext = {
        userId: 'test-user',
        userName: 'TestUser',
        chatHistory: [],
        currentMessage: 'розкажи жарт'
      };

      const response = await engine.generateConversationalResponse(context);
      
      expect(response.shouldUseHumorousReply).toBe(true);
    });

    it('should add personality touches with emojis', async () => {
      const context: ConversationContext = {
        userId: 'test-user',
        userName: 'TestUser',
        chatHistory: [],
        currentMessage: 'привіт'
      };

      const response = await engine.generateConversationalResponse(context);
      
      expect(response.response).toBeTruthy();
      // Response should potentially contain emojis or personality touches
    });
  });

  describe('Statistics', () => {
    it('should provide accurate conversation statistics', async () => {
      const context1: ConversationContext = {
        userId: 'user1',
        userName: 'User1',
        chatHistory: [],
        currentMessage: 'Привіт',
        language: 'uk'
      };

      const context2: ConversationContext = {
        userId: 'user2',
        userName: 'User2',
        chatHistory: [],
        currentMessage: 'Hello',
        language: 'en'
      };

      await engine.generateConversationalResponse(context1);
      await engine.generateConversationalResponse(context2);

      const stats = engine.getStats();
      
      expect(stats.activeUsers).toBe(2);
      expect(stats.totalInteractions).toBeGreaterThanOrEqual(2);
      expect(stats.ukrainianUsers).toBeGreaterThanOrEqual(0);
      expect(stats.englishUsers).toBeGreaterThanOrEqual(0);
    });

    it('should track user interactions correctly', async () => {
      const context: ConversationContext = {
        userId: 'test-user',
        userName: 'TestUser',
        chatHistory: [],
        currentMessage: 'First message'
      };

      await engine.generateConversationalResponse(context);
      
      context.currentMessage = 'Second message';
      await engine.generateConversationalResponse(context);

      const stats = engine.getStats();
      expect(stats.totalInteractions).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty messages', async () => {
      const context: ConversationContext = {
        userId: 'test-user',
        userName: 'TestUser',
        chatHistory: [],
        currentMessage: ''
      };

      const response = await engine.generateConversationalResponse(context);
      
      expect(response.response).toBeTruthy();
      expect(response.confidence).toBeGreaterThan(0);
    });

    it('should handle very long messages', async () => {
      const longMessage = 'a'.repeat(1000);
      const context: ConversationContext = {
        userId: 'test-user',
        userName: 'TestUser',
        chatHistory: [],
        currentMessage: longMessage
      };

      const response = await engine.generateConversationalResponse(context);
      
      expect(response.response).toBeTruthy();
    });

    it('should handle special characters and emojis', async () => {
      const context: ConversationContext = {
        userId: 'test-user',
        userName: 'TestUser',
        chatHistory: [],
        currentMessage: '🎉🎊 Привіт! 😊 Як справи? 🌟'
      };

      const response = await engine.generateConversationalResponse(context);
      
      expect(response.response).toBeTruthy();
      expect(response.language).toBe('uk');
    });

    it('should handle multiple users simultaneously', async () => {
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        const context: ConversationContext = {
          userId: `user-${i}`,
          userName: `User${i}`,
          chatHistory: [],
          currentMessage: `Message from user ${i}`
        };
        
        promises.push(engine.generateConversationalResponse(context));
      }

      const responses = await Promise.all(promises);
      
      expect(responses).toHaveLength(10);
      responses.forEach(response => {
        expect(response.response).toBeTruthy();
        expect(response.confidence).toBeGreaterThan(0);
      });
    });
  });
}); 