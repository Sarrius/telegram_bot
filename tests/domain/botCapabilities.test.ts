import { BotCapabilities, BotCapability } from '../../src/domain/botCapabilities';
import { CapabilityFuzzyMatcher } from '../../src/config/vocabulary/capabilityFuzzyMatcher';

// Мокаємо CapabilityFuzzyMatcher
jest.mock('../../src/config/vocabulary/capabilityFuzzyMatcher');

describe('BotCapabilities', () => {
  let botCapabilities: BotCapabilities;

  beforeEach(() => {
    botCapabilities = new BotCapabilities();
  });

  describe('detectCapabilityRequest', () => {
    let mockFuzzyMatcher: jest.Mocked<CapabilityFuzzyMatcher>;

    beforeEach(() => {
      mockFuzzyMatcher = {
        detectCapabilityRequest: jest.fn()
      } as any;
      
      // @ts-ignore - доступ до приватного поля для тестування
      botCapabilities.fuzzyMatcher = mockFuzzyMatcher;
    });

    it('should detect Ukrainian capability requests with fuzzy matching', () => {
      const ukrainianRequests = [
        'що ти можеш',
        'що можеш робити',
        'можливості',
        'функції',
        'команди',
        'що вмієш',
        'які функції',
        'що робиш',
        'твої можливості',
        'список команд',
        'допомога',
        'що ти вмієш робити',
        'розкажи про себе',
        'що ти умієш',
        'покажи команди'
      ];

      ukrainianRequests.forEach(request => {
        mockFuzzyMatcher.detectCapabilityRequest.mockReturnValueOnce({
          isCapabilityRequest: true,
          confidence: 1.0,
          language: 'uk',
          matchedTrigger: request
        });

        const result = botCapabilities.detectCapabilityRequest(request);
        expect(result.isRequest).toBe(true);
        expect(result.language).toBe('uk');
        expect(result.confidence).toBe(1.0);
      });
    });

    it('should detect Ukrainian capability requests with typos', () => {
      const requestsWithTypos = [
        { text: 'шо ти можеш', original: 'що ти можеш' },
        { text: 'можливосці', original: 'можливості' },
        { text: 'фукнції', original: 'функції' },
        { text: 'комманды', original: 'команди' }
      ];

      requestsWithTypos.forEach(({ text, original }) => {
        mockFuzzyMatcher.detectCapabilityRequest.mockReturnValueOnce({
          isCapabilityRequest: true,
          confidence: 0.85,
          language: 'uk',
          matchedTrigger: original
        });

        const result = botCapabilities.detectCapabilityRequest(text);
        expect(result.isRequest).toBe(true);
        expect(result.language).toBe('uk');
        expect(result.confidence).toBe(0.85);
        expect(result.matchedTrigger).toBe(original);
      });
    });

    it('should detect English capability requests with fuzzy matching', () => {
      const englishRequests = [
        'what can you do',
        'capabilities',
        'features',
        'commands',
        'help',
        'what do you do',
        'your features',
        'bot capabilities',
        'list commands',
        'show features',
        'what are your functions',
        'bot help'
      ];

      englishRequests.forEach(request => {
        mockFuzzyMatcher.detectCapabilityRequest.mockReturnValueOnce({
          isCapabilityRequest: true,
          confidence: 1.0,
          language: 'en',
          matchedTrigger: request
        });

        const result = botCapabilities.detectCapabilityRequest(request);
        expect(result.isRequest).toBe(true);
        expect(result.language).toBe('en');
        expect(result.confidence).toBe(1.0);
      });
    });

    it('should detect English capability requests with typos', () => {
      const requestsWithTypos = [
        { text: 'wat can you do', original: 'what can you do' },
        { text: 'capabilites', original: 'capabilities' },
        { text: 'featers', original: 'features' },
        { text: 'halp', original: 'help' }
      ];

      requestsWithTypos.forEach(({ text, original }) => {
        mockFuzzyMatcher.detectCapabilityRequest.mockReturnValueOnce({
          isCapabilityRequest: true,
          confidence: 0.8,
          language: 'en',
          matchedTrigger: original
        });

        const result = botCapabilities.detectCapabilityRequest(text);
        expect(result.isRequest).toBe(true);
        expect(result.language).toBe('en');
        expect(result.confidence).toBe(0.8);
        expect(result.matchedTrigger).toBe(original);
      });
    });

    it('should not detect regular messages as capability requests', () => {
      const regularMessages = [
        'Привіт, як справи?',
        'Hello, how are you?',
        'Розкажи жарт',
        'Tell me a joke',
        'Що нового?',
        'How was your day?',
        'Дякую за допомогу'
      ];

      regularMessages.forEach(message => {
        mockFuzzyMatcher.detectCapabilityRequest.mockReturnValueOnce({
          isCapabilityRequest: false,
          confidence: 0.1,
          language: 'uk'
        });

        const result = botCapabilities.detectCapabilityRequest(message);
        expect(result.isRequest).toBe(false);
      });
    });

    it('should fallback to old method when fuzzy matching fails', () => {
      mockFuzzyMatcher.detectCapabilityRequest.mockReturnValueOnce({
        isCapabilityRequest: false,
        confidence: 0.3,
        language: 'uk'
      });

      // Тест fallback логіки з старими тригерами
      const result = botCapabilities.detectCapabilityRequest('що ти можеш');
      expect(result.isRequest).toBe(true);
      expect(result.confidence).toBe(1.0);
      expect(result.language).toBe('uk');
    });

    it('should handle fuzzy matcher errors gracefully', () => {
      mockFuzzyMatcher.detectCapabilityRequest.mockImplementationOnce(() => {
        throw new Error('Fuzzy matcher error');
      });

      // Має fallback до старого методу
      const result = botCapabilities.detectCapabilityRequest('що ти можеш');
      expect(result.isRequest).toBe(true);
      expect(result.language).toBe('uk');
    });

    it('should detect partial matches in longer sentences', () => {
      const contextualRequests = [
        'Привіт! Що ти можеш робити?',
        'Hello there, what are your capabilities?',
        'Можеш показати свої функції?'
      ];

      contextualRequests.forEach(request => {
        mockFuzzyMatcher.detectCapabilityRequest.mockReturnValueOnce({
          isCapabilityRequest: true,
          confidence: 0.9,
          language: request.includes('Hello') ? 'en' : 'uk',
          matchedTrigger: request.includes('Hello') ? 'capabilities' : 'що ти можеш'
        });

        const result = botCapabilities.detectCapabilityRequest(request);
        expect(result.isRequest).toBe(true);
        expect(result.confidence).toBe(0.9);
      });
    });

    it('should prioritize higher confidence matches', () => {
      mockFuzzyMatcher.detectCapabilityRequest.mockReturnValueOnce({
        isCapabilityRequest: true,
        confidence: 0.95,
        language: 'uk',
        matchedTrigger: 'що ти можеш'
      });

      const result = botCapabilities.detectCapabilityRequest('шо ти можеш робити');
      expect(result.isRequest).toBe(true);
      expect(result.confidence).toBe(0.95);
      expect(result.language).toBe('uk');
    });
  });

  describe('generateCapabilitiesResponse', () => {
    it('should generate Ukrainian response by default', () => {
      const response = botCapabilities.generateCapabilitiesResponse();
      
      expect(response).toContain('Привіт!');
      expect(response).toContain('🤖 **Що я вмію:**');
      expect(response).toContain('💬 **Спілкування**');
      expect(response).toContain('🎭 **Розваги**');
      expect(response).toContain('🇺🇦');
    });

    it('should generate Ukrainian response with user name', () => {
      const response = botCapabilities.generateCapabilitiesResponse('uk', 'Тарас');
      
      expect(response).toContain('Привіт, Тарас!');
      expect(response).toContain('🤖 **Що я вмію:**');
    });

    it('should generate English response when requested', () => {
      const response = botCapabilities.generateCapabilitiesResponse('en');
      
      expect(response).toContain('Hello!');
      expect(response).toContain('🤖 **What I can do:**');
      expect(response).toContain('💬 **Conversations**');
      expect(response).toContain('🎭 **Entertainment**');
      expect(response).toContain('🇺🇦');
    });

    it('should generate English response with user name', () => {
      const response = botCapabilities.generateCapabilitiesResponse('en', 'John');
      
      expect(response).toContain('Hello, John!');
      expect(response).toContain('🤖 **What I can do:**');
    });

    it('should include all capability categories', () => {
      const response = botCapabilities.generateCapabilitiesResponse('uk');
      
      expect(response).toContain('💬 **Спілкування**');
      expect(response).toContain('🎭 **Розваги**');
      expect(response).toContain('👥 **Соціальне**');
      expect(response).toContain('🛡️ **Модерація**');
      expect(response).toContain('🔧 **Корисне**');
    });

    it('should include examples for each capability', () => {
      const response = botCapabilities.generateCapabilitiesResponse('uk');
      
      expect(response).toContain('📱 **Як викликати:**');
      expect(response).toContain('@bot + ваше питання');
      expect(response).toContain('/meme текст | текст');
    });

    it('should include footer with instructions', () => {
      const ukrainianResponse = botCapabilities.generateCapabilitiesResponse('uk');
      const englishResponse = botCapabilities.generateCapabilitiesResponse('en');
      
      expect(ukrainianResponse).toContain('💡 _Просто пишіть - я розумію!_');
      expect(englishResponse).toContain('💡 _Just start typing - I understand!_');
    });
  });

  describe('getCapabilityById', () => {
    it('should return capability by ID', () => {
      const capability = botCapabilities.getCapabilityById('ukrainian_conversation');
      
      expect(capability).toBeDefined();
      expect(capability?.id).toBe('ukrainian_conversation');
      expect(capability?.nameUk).toBe('Українські розмови');
      expect(capability?.category).toBe('conversation');
    });

    it('should return undefined for non-existent ID', () => {
      const capability = botCapabilities.getCapabilityById('non_existent');
      expect(capability).toBeUndefined();
    });

    it('should return all expected capabilities', () => {
      const expectedIds = [
        'ukrainian_conversation',
        'jokes_and_stories', 
        'meme_generation',
        'sentiment_reactions',
        'content_moderation',
        'user_roles',
        'atmosphere_enhancement',
        'learning_adaptation',
        'multilingual_support',
        'help_and_support'
      ];

      expectedIds.forEach(id => {
        const capability = botCapabilities.getCapabilityById(id);
        expect(capability).toBeDefined();
        expect(capability?.id).toBe(id);
      });
    });
  });

  describe('getAllCapabilities', () => {
    it('should return all capabilities', () => {
      const capabilities = botCapabilities.getAllCapabilities();
      
      expect(capabilities).toHaveLength(14);
      expect(capabilities[0]).toHaveProperty('id');
      expect(capabilities[0]).toHaveProperty('name');
      expect(capabilities[0]).toHaveProperty('nameUk');
      expect(capabilities[0]).toHaveProperty('description');
      expect(capabilities[0]).toHaveProperty('descriptionUk');
      expect(capabilities[0]).toHaveProperty('examples');
      expect(capabilities[0]).toHaveProperty('examplesUk');
      expect(capabilities[0]).toHaveProperty('category');
    });

    it('should return a copy of capabilities array', () => {
      const capabilities1 = botCapabilities.getAllCapabilities();
      const capabilities2 = botCapabilities.getAllCapabilities();
      
      expect(capabilities1).not.toBe(capabilities2); // Different references
      expect(capabilities1).toEqual(capabilities2); // Same content
    });
  });

  describe('getCapabilitiesByCategory', () => {
    it('should return capabilities by conversation category', () => {
      const conversationCapabilities = botCapabilities.getCapabilitiesByCategory('conversation');
      
      expect(conversationCapabilities).toHaveLength(1);
      expect(conversationCapabilities[0].category).toBe('conversation');
      expect(conversationCapabilities[0].id).toBe('ukrainian_conversation');
    });

    it('should return capabilities by entertainment category', () => {
      const entertainmentCapabilities = botCapabilities.getCapabilitiesByCategory('entertainment');
      
      expect(entertainmentCapabilities.length).toBeGreaterThan(0);
      entertainmentCapabilities.forEach(cap => {
        expect(cap.category).toBe('entertainment');
      });
    });

    it('should return capabilities by social category', () => {
      const socialCapabilities = botCapabilities.getCapabilitiesByCategory('social');
      
      expect(socialCapabilities.length).toBeGreaterThan(0);
      socialCapabilities.forEach(cap => {
        expect(cap.category).toBe('social');
      });
    });

    it('should return capabilities by moderation category', () => {
      const moderationCapabilities = botCapabilities.getCapabilitiesByCategory('moderation');
      
      expect(moderationCapabilities.length).toBeGreaterThan(0);
      moderationCapabilities.forEach(cap => {
        expect(cap.category).toBe('moderation');
      });
    });

    it('should return capabilities by utility category', () => {
      const utilityCapabilities = botCapabilities.getCapabilitiesByCategory('utility');
      
      expect(utilityCapabilities.length).toBeGreaterThan(0);
      utilityCapabilities.forEach(cap => {
        expect(cap.category).toBe('utility');
      });
    });

    it('should return empty array for non-existent category', () => {
      const nonExistentCapabilities = botCapabilities.getCapabilitiesByCategory('non_existent');
      expect(nonExistentCapabilities).toEqual([]);
    });

    it('should cover all categories', () => {
      const allCategories = ['conversation', 'entertainment', 'social', 'moderation', 'utility'];
      let totalCapabilities = 0;

      allCategories.forEach(category => {
        const categoryCapabilities = botCapabilities.getCapabilitiesByCategory(category);
        expect(categoryCapabilities.length).toBeGreaterThan(0);
        totalCapabilities += categoryCapabilities.length;
      });

      expect(totalCapabilities).toBe(14); // Should match total number of capabilities
    });
  });

  describe('capability data integrity', () => {
    it('should have valid capability structure for all capabilities', () => {
      const capabilities = botCapabilities.getAllCapabilities();

      capabilities.forEach(capability => {
        expect(capability.id).toBeTruthy();
        expect(capability.name).toBeTruthy();
        expect(capability.nameUk).toBeTruthy();
        expect(capability.description).toBeTruthy();
        expect(capability.descriptionUk).toBeTruthy();
        expect(Array.isArray(capability.examples)).toBe(true);
        expect(Array.isArray(capability.examplesUk)).toBe(true);
        expect(['conversation', 'entertainment', 'moderation', 'utility', 'social']).toContain(capability.category);
      });
    });

    it('should have unique capability IDs', () => {
      const capabilities = botCapabilities.getAllCapabilities();
      const ids = capabilities.map(cap => cap.id);
      const uniqueIds = [...new Set(ids)];
      
      expect(ids.length).toBe(uniqueIds.length);
    });

    it('should have both Ukrainian and English content for all capabilities', () => {
      const capabilities = botCapabilities.getAllCapabilities();

      capabilities.forEach(capability => {
        expect(capability.name).not.toBe(capability.nameUk);
        expect(capability.description).not.toBe(capability.descriptionUk);
        expect(capability.examples.length).toBeGreaterThan(0);
        expect(capability.examplesUk.length).toBeGreaterThan(0);
      });
    });
  });
}); 