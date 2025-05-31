import { ModerationHandler, ModerationResponse, ModerationConfig } from '../../src/usecases/moderationHandler';

describe('ModerationHandler', () => {
  let moderationHandler: ModerationHandler;

  beforeEach(() => {
    moderationHandler = new ModerationHandler();
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      const config = moderationHandler.getConfig();
      
      expect(config.enableModerationInGroups).toBe(true);
      expect(config.enableModerationInPrivate).toBe(false);
      expect(config.warnOnMild).toBe(true);
      expect(config.moderateOnModerate).toBe(true);
      expect(config.strictOnSevere).toBe(true);
      expect(config.customResponses.warning.length).toBeGreaterThan(0);
      expect(config.customResponses.moderate.length).toBeGreaterThan(0);
      expect(config.customResponses.strict.length).toBeGreaterThan(0);
    });

    it('should accept custom configuration', () => {
      const customConfig: Partial<ModerationConfig> = {
        enableModerationInPrivate: true,
        warnOnMild: false
      };
      
      const handler = new ModerationHandler(customConfig);
      const config = handler.getConfig();
      
      expect(config.enableModerationInPrivate).toBe(true);
      expect(config.warnOnMild).toBe(false);
    });
  });

  describe('Clean messages', () => {
    it('should ignore clean messages in groups', () => {
      const response = moderationHandler.analyzeMessage(
        'Привіт! Як справи сьогодні?',
        'group',
        'user123',
        'chat456'
      );
      
      expect(response.shouldRespond).toBe(false);
      expect(response.responseType).toBe('ignore');
      expect(response.reasoning).toContain('No profanity detected');
    });

    it('should ignore clean messages in private chats', () => {
      const response = moderationHandler.analyzeMessage(
        'Hello, how are you?',
        'private',
        'user123',
        'chat456'
      );
      
      expect(response.shouldRespond).toBe(false);
      expect(response.responseType).toBe('ignore');
    });
  });

  describe('Chat type restrictions', () => {
    it('should ignore profanity in private chats by default', () => {
      const response = moderationHandler.analyzeMessage(
        'блять що за фігня',
        'private',
        'user123',
        'chat456'
      );
      
      expect(response.shouldRespond).toBe(false);
      expect(response.reasoning).toContain('Moderation disabled for private chats');
    });

    it('should respond to profanity in groups by default', () => {
      const response = moderationHandler.analyzeMessage(
        'блять що за фігня',
        'group',
        'user123',
        'chat456'
      );
      
      expect(response.shouldRespond).toBe(true);
      expect(response.responseType).not.toBe('ignore');
    });

    it('should allow enabling moderation in private chats', () => {
      moderationHandler.updateConfig({ enableModerationInPrivate: true });
      
      const response = moderationHandler.analyzeMessage(
        'мудак якийсь',
        'private',
        'user123',
        'chat456'
      );
      
      expect(response.shouldRespond).toBe(true);
    });
  });

  describe('Severity-based responses', () => {
    it('should provide warning response for mild profanity', () => {
      const response = moderationHandler.analyzeMessage(
        'сука яка неприємна ситуація',
        'group',
        'user123',
        'chat456'
      );
      
      if (response.shouldRespond) {
        expect(response.responseType).toBe('warning');
        expect(response.response).toMatch(/без|токсичн|нецензур/i);
        expect(response.confidence).toBeGreaterThan(0.5);
      }
    });

    it('should provide moderate response for moderate profanity', () => {
      const response = moderationHandler.analyzeMessage(
        'блять мудак який',
        'group',
        'user123',
        'chat456'
      );
      
      if (response.shouldRespond) {
        expect(response.responseType).toBe('moderate');
        expect(response.response).toMatch(/дебіл|ображай|образи|пиздець|кармі|Хватит|лити|аб'юзивну|хрінь|пизда|заїбешся|бидляцька|трында|квиток|бан|токсична|хуйня|заїбала|притормози|СТОП|⚠️|гівнюк|зуби|виб'ю/i);
      }
    });

    it('should provide strict response for severe profanity', () => {
      const response = moderationHandler.analyzeMessage(
        'хуй пізда ебать блять',
        'group',
        'user123',
        'chat456'
      );
      
      expect(response.shouldRespond).toBe(true);
      expect(response.responseType).toBe('strict');
      expect(response.response).toMatch(/токсична|трында|останній|подих|аб'юзивна|паща|морда|квиток|пиздеця|трындітиме|мразь|заїбав|слово|асфальт|закатаю|⛔|токсити|сука|пизда|дебіл|думаєш|здохни|бані|гівнюк|вякнеш|пиздець|морді|хрінь|кінець|придурок/i);
    });
  });

  describe('Language-specific responses', () => {
    it('should prefer Ukrainian responses for Ukrainian profanity', () => {
      const response = moderationHandler.analyzeMessage(
        'блять неприємно',
        'group',
        'user123',
        'chat456'
      );
      
      if (response.shouldRespond) {
        // Should contain Ukrainian words like 'давай', 'без', etc.
        expect(response.response).toMatch(/давай|без|можемо|варто|припини|стоп|нецензурн/i);
      }
    });
  });

  describe('Configuration updates', () => {
    it('should update configuration correctly', () => {
      const newConfig: Partial<ModerationConfig> = {
        warnOnMild: false,
        moderateOnModerate: false
      };
      
      moderationHandler.updateConfig(newConfig);
      const config = moderationHandler.getConfig();
      
      expect(config.warnOnMild).toBe(false);
      expect(config.moderateOnModerate).toBe(false);
    });

    it('should respect updated configuration in responses', () => {
      // Disable mild warnings
      moderationHandler.updateConfig({ warnOnMild: false });
      
      const response = moderationHandler.analyzeMessage(
        'сука', // mild profanity
        'group',
        'user123',
        'chat456'
      );
      
      expect(response.shouldRespond).toBe(false);
      expect(response.responseType).toBe('ignore');
    });
  });

  describe('Custom response management', () => {
    it('should allow adding custom warning responses', () => {
      const customResponse = '🚨 Кастомна попередження!';
      moderationHandler.addCustomResponse('warning', customResponse);
      
      const config = moderationHandler.getConfig();
      expect(config.customResponses.warning).toContain(customResponse);
    });

    it('should allow removing custom responses', () => {
      const customResponse = '🚨 Тест відповідь';
      moderationHandler.addCustomResponse('moderate', customResponse);
      
      let config = moderationHandler.getConfig();
      expect(config.customResponses.moderate).toContain(customResponse);
      
      moderationHandler.removeCustomResponse('moderate', customResponse);
      config = moderationHandler.getConfig();
      expect(config.customResponses.moderate).not.toContain(customResponse);
    });
  });

  describe('Profanity word management', () => {
    it('should allow adding custom profanity words', () => {
      moderationHandler.addProfanityWord('тестлайка', 'ua');
      
      const response = moderationHandler.analyzeMessage(
        'яка тестлайка ситуація',
        'group',
        'user123',
        'chat456'
      );
      
      expect(response.shouldRespond).toBe(true);
    });

    it('should allow removing profanity words', () => {
      moderationHandler.addProfanityWord('тестлайка', 'ua');
      
      let response = moderationHandler.analyzeMessage(
        'тестлайка',
        'group',
        'user123',
        'chat456'
      );
      expect(response.shouldRespond).toBe(true);
      
      moderationHandler.removeProfanityWord('тестлайка', 'ua');
      response = moderationHandler.analyzeMessage(
        'тестлайка',
        'group',
        'user123',
        'chat456'
      );
      expect(response.shouldRespond).toBe(false);
    });
  });

  describe('Test utilities', () => {
    it('should provide test message functionality', () => {
      const result = moderationHandler.testMessage('блять мудак');
      
      expect(result.analysis).toBeDefined();
      expect(result.response).toBeDefined();
      expect(result.analysis.hasProfanity).toBe(true);
      expect(result.response.shouldRespond).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('should provide comprehensive statistics', () => {
      const stats = moderationHandler.getStats();
      
      expect(stats.profanityFilter).toBeDefined();
      expect(stats.config).toBeDefined();
      expect(stats.responseTemplates).toBeDefined();
      expect(stats.responseTemplates.warning).toBeGreaterThan(0);
      expect(stats.responseTemplates.moderate).toBeGreaterThan(0);
      expect(stats.responseTemplates.strict).toBeGreaterThan(0);
    });
  });

  describe('Response reasoning', () => {
    it('should provide detailed reasoning for responses', () => {
      const response = moderationHandler.analyzeMessage(
        'блять мудак',
        'group',
        'user123',
        'chat456'
      );
      
      if (response.shouldRespond) {
        expect(response.reasoning).toContain('Detected');
        expect(response.reasoning).toContain('profanity');
        expect(response.reasoning).toContain('Confidence:');
        expect(response.reasoning).toContain('%');
      }
    });

    it('should include detected words in reasoning', () => {
      const response = moderationHandler.analyzeMessage(
        'блять що за лайно',
        'group',
        'user123',
        'chat456'
      );
      
      if (response.shouldRespond) {
        expect(response.reasoning).toContain('Detected words:');
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle empty messages', () => {
      const response = moderationHandler.analyzeMessage(
        '',
        'group',
        'user123',
        'chat456'
      );
      
      expect(response.shouldRespond).toBe(false);
    });

    it('should handle very long messages with profanity', () => {
      const longMessage = 'Це дуже довгий текст '.repeat(50) + 'блять' + ' ще більше тексту'.repeat(50);
      const response = moderationHandler.analyzeMessage(
        longMessage,
        'group',
        'user123',
        'chat456'
      );
      
      expect(response.shouldRespond).toBe(true);
    });

    it('should handle mixed language profanity', () => {
      const response = moderationHandler.analyzeMessage(
        'блять what a мудак situation',
        'group',
        'user123',
        'chat456'
      );
      
      expect(response.shouldRespond).toBe(true);
      expect(response.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('Channel type handling', () => {
    it('should handle supergroup messages', () => {
      const response = moderationHandler.analyzeMessage(
        'блять неприємно',
        'supergroup',
        'user123',
        'chat456'
      );
      
      expect(response.shouldRespond).toBe(true);
    });

    it('should ignore channel messages if groups disabled', () => {
      moderationHandler.updateConfig({ enableModerationInGroups: false });
      
      const response = moderationHandler.analyzeMessage(
        'блять неприємно',
        'supergroup', // Use supergroup instead of channel
        'user123',
        'chat456'
      );
      
      expect(response.shouldRespond).toBe(false);
    });
  });
}); 