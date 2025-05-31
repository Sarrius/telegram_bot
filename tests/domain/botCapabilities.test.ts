import { BotCapabilities, BotCapability } from '../../src/domain/botCapabilities';

describe('BotCapabilities', () => {
  let botCapabilities: BotCapabilities;

  beforeEach(() => {
    botCapabilities = new BotCapabilities();
  });

  describe('detectCapabilityRequest', () => {
    it('should detect Ukrainian capability requests', () => {
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
        expect(botCapabilities.detectCapabilityRequest(request)).toBe(true);
        expect(botCapabilities.detectCapabilityRequest(request.toUpperCase())).toBe(true);
      });
    });

    it('should detect English capability requests', () => {
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
        expect(botCapabilities.detectCapabilityRequest(request)).toBe(true);
        expect(botCapabilities.detectCapabilityRequest(request.toUpperCase())).toBe(true);
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
        expect(botCapabilities.detectCapabilityRequest(message)).toBe(false);
      });
    });

    it('should detect partial matches in longer sentences', () => {
      expect(botCapabilities.detectCapabilityRequest('Привіт! Що ти можеш робити?')).toBe(true);
      expect(botCapabilities.detectCapabilityRequest('Hello there, what are your capabilities?')).toBe(true);
      expect(botCapabilities.detectCapabilityRequest('Можеш показати свої функції?')).toBe(true);
    });
  });

  describe('generateCapabilitiesResponse', () => {
    it('should generate Ukrainian response by default', () => {
      const response = botCapabilities.generateCapabilitiesResponse();
      
      expect(response).toContain('Привіт!');
      expect(response).toContain('🤖 Ось що я можу робити:');
      expect(response).toContain('💬 Розмови');
      expect(response).toContain('🎭 Розваги');
      expect(response).toContain('🇺🇦');
    });

    it('should generate Ukrainian response with user name', () => {
      const response = botCapabilities.generateCapabilitiesResponse('uk', 'Тарас');
      
      expect(response).toContain('Привіт, Тарас!');
      expect(response).toContain('🤖 Ось що я можу робити:');
    });

    it('should generate English response when requested', () => {
      const response = botCapabilities.generateCapabilitiesResponse('en');
      
      expect(response).toContain('Hello!');
      expect(response).toContain('🤖 Here\'s what I can do:');
      expect(response).toContain('💬 Conversations');
      expect(response).toContain('🎭 Entertainment');
      expect(response).toContain('🇺🇦');
    });

    it('should generate English response with user name', () => {
      const response = botCapabilities.generateCapabilitiesResponse('en', 'John');
      
      expect(response).toContain('Hello, John!');
      expect(response).toContain('🤖 Here\'s what I can do:');
    });

    it('should include all capability categories', () => {
      const response = botCapabilities.generateCapabilitiesResponse('uk');
      
      expect(response).toContain('💬 Розмови');
      expect(response).toContain('🎭 Розваги');
      expect(response).toContain('👥 Соціальні функції');
      expect(response).toContain('🛡️ Модерація');
      expect(response).toContain('🔧 Утиліти');
    });

    it('should include examples for each capability', () => {
      const response = botCapabilities.generateCapabilitiesResponse('uk');
      
      expect(response).toContain('Приклади:');
      expect(response).toContain('@bot Привіт! Як справи?');
      expect(response).toContain('Розкажи жарт');
      expect(response).toContain('/meme топ текст | низ текст');
    });

    it('should include footer with instructions', () => {
      const ukrainianResponse = botCapabilities.generateCapabilitiesResponse('uk');
      const englishResponse = botCapabilities.generateCapabilitiesResponse('en');
      
      expect(ukrainianResponse).toContain('💡 _Просто напишіть мені або згадайте @bot');
      expect(englishResponse).toContain('💡 _Just message me or mention @bot');
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
      
      expect(capabilities).toHaveLength(10);
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

      expect(totalCapabilities).toBe(10); // Should match total number of capabilities
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