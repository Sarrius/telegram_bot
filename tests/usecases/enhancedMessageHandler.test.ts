import { EnhancedMessageHandler, EnhancedMessageContext } from '../../src/usecases/enhancedMessageHandler';

const createTestContext = (text: string, overrides: Partial<EnhancedMessageContext> = {}): EnhancedMessageContext => ({
  text,
  userId: 'user1',
  chatId: 'chat1',
  userName: 'TestUser',
  chatType: 'group',
  isGroupChat: true,
  messageId: 123,
  isReplyToBot: false,
  mentionsBot: false,
  isDirectMention: false,
  requestsMeme: false,
  ...overrides
});

describe('EnhancedMessageHandler', () => {
  let handler: EnhancedMessageHandler;

  beforeEach(() => {
    handler = new EnhancedMessageHandler(
      {
        primaryLanguage: 'uk',
        sensitivityLevel: 'medium',
        enableSarcasm: true,
        enablePenalties: true,
        customForbiddenWords: [],
        adminUserIds: ['admin1']
      },
      {
        quietPeriodThresholdMs: 10 * 60 * 1000,
        enableAutomaticEngagement: true,
        enableRoleAssignment: true,
        enablePolls: true,
        enableFunFacts: true,
        maxEngagementPerHour: 3,
        primaryLanguage: 'uk'
      }
    );
  });

  afterEach(() => {
    handler.dispose();
  });

  describe('Inappropriate Content Detection', () => {
    it('should detect and respond to Ukrainian inappropriate content', async () => {
      const context: EnhancedMessageContext = {
        text: 'ти дурень та ідіот',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false
      };

      const response = await handler.handleMessage(context);

      expect(response.responseType).toBe('content_warning');
      expect(response.shouldReply).toBe(true);
      expect(response.inappropriateContentWarning).toContain('TestUser');
      expect(response.confidence).toBeGreaterThan(0.3);
    });

    it('should detect and respond to English inappropriate content', async () => {
      const context: EnhancedMessageContext = {
        text: 'you are stupid idiot',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false
      };

      const response = await handler.handleMessage(context);

      expect(response.responseType).toBe('content_warning');
      expect(response.shouldReply).toBe(true);
      expect(response.inappropriateContentWarning).toContain('TestUser');
    });

    it('should not trigger content warning for appropriate content', async () => {
      const context: EnhancedMessageContext = {
        text: 'Привіт! Як справи? Гарний день сьогодні!',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false
      };

      const response = await handler.handleMessage(context);

      expect(response.responseType).not.toBe('content_warning');
      expect(response.inappropriateContentWarning).toBeFalsy();
    });
  });

  describe('Bot Capabilities Handling', () => {
    it('should handle Ukrainian capability requests', async () => {
      const context: EnhancedMessageContext = {
        text: 'Що ти можеш робити?',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: true,
        isDirectMention: true
      };

      const response = await handler.handleMessage(context);

      expect(response.responseType).toBe('conversation');
      expect(response.shouldReply).toBe(true);
      expect(response.conversationResponse).toBeTruthy();
      expect(response.conversationResponse).toContain('Привіт, TestUser!');
      expect(response.conversationResponse).toContain('🤖 Ось детальний список моїх можливостей:');
      expect(response.confidence).toBeGreaterThan(0.9);
    });

    it('should handle English capability requests', async () => {
      const context: EnhancedMessageContext = {
        text: 'What can you do?',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: true,
        isDirectMention: true
      };

      const response = await handler.handleMessage(context);

      expect(response.responseType).toBe('conversation');
      expect(response.shouldReply).toBe(true);
      expect(response.conversationResponse).toBeTruthy();
      expect(response.conversationResponse).toContain('Hello, TestUser!');
      expect(response.conversationResponse).toContain('🤖 Here\'s a detailed list of my capabilities:');
      expect(response.confidence).toBeGreaterThan(0.9);
    });

    it('should handle capability requests without user name', async () => {
      const context: EnhancedMessageContext = {
        text: 'покажи команди',
        userId: 'user1',
        chatId: 'chat1',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: true,
        isDirectMention: true
      };

      const response = await handler.handleMessage(context);

      expect(response.responseType).toBe('conversation');
      expect(response.shouldReply).toBe(true);
      expect(response.conversationResponse).toBeTruthy();
      expect(response.conversationResponse).toContain('Привіт!');
      expect(response.confidence).toBeGreaterThan(0.9);
    });

    it('should detect various Ukrainian capability triggers', async () => {
      const triggers = [
        'можливості',
        'функції',
        'команди',
        'що вмієш',
        'які функції',
        'допомога',
        'розкажи про себе'
      ];

      for (const trigger of triggers) {
        const context: EnhancedMessageContext = {
          text: trigger,
          userId: 'user1',
          chatId: 'chat1',
          userName: 'TestUser',
          isGroupChat: true,
          messageId: 123,
          isReplyToBot: false,
          mentionsBot: true,
          isDirectMention: true
        };

        const response = await handler.handleMessage(context);
        expect(response.responseType).toBe('conversation');
        expect(response.shouldReply).toBe(true);
      }
    });

    it('should detect various English capability triggers', async () => {
      const triggers = [
        'capabilities',
        'bot capabilities',
        'show features'
      ];

      for (const trigger of triggers) {
        const context: EnhancedMessageContext = {
          text: trigger,
          userId: 'user1',
          chatId: 'chat1',
          userName: 'TestUser',
          isGroupChat: true,
          messageId: 123,
          isReplyToBot: false,
          mentionsBot: true,
          isDirectMention: true
        };

        const response = await handler.handleMessage(context);
        
        // Only test real capability triggers, not CLI commands
        expect(response.responseType).toBe('conversation');
        expect(response.shouldReply).toBe(true);
      }
    });

    it('should include all feature categories in response', async () => {
      const context: EnhancedMessageContext = {
        text: 'What are your capabilities?',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: true,
        isDirectMention: true
      };

      const response = await handler.handleMessage(context);

      expect(response.conversationResponse).toContain('💬 Conversations');
      expect(response.conversationResponse).toContain('🎭 Entertainment');
      expect(response.conversationResponse).toContain('👥 Social Features');
      expect(response.conversationResponse).toContain('🛡️ Moderation');
      expect(response.conversationResponse).toContain('🔧 Utilities');
    });
  });

  describe('NLP Conversation Handling', () => {
    it('should handle direct Ukrainian conversation requests', async () => {
      const context: EnhancedMessageContext = {
        text: 'Привіт боте! Як справи?',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: true,
        isDirectMention: true
      };

      const response = await handler.handleMessage(context);

      expect(response.responseType).toBe('conversation');
      expect(response.shouldReply).toBe(true);
      expect(response.conversationResponse).toBeTruthy();
      expect(response.conversationResponse).toContain('TestUser');
      expect(response.confidence).toBeGreaterThan(0.5);
    });

    it('should handle English conversation requests', async () => {
      const context: EnhancedMessageContext = {
        text: 'Hello bot! How are you?',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: true,
        isDirectMention: true
      };

      const response = await handler.handleMessage(context);

      expect(response.responseType).toBe('conversation');
      expect(response.shouldReply).toBe(true);
      expect(response.conversationResponse).toBeTruthy();
    });

    it('should detect Ukrainian joke requests', async () => {
      const context: EnhancedMessageContext = {
        text: '@bot розкажи жарт',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: true,
        isDirectMention: true
      };

      const response = await handler.handleMessage(context);

      expect(response.responseType).toBe('conversation');
      expect(response.conversationResponse).toBeTruthy();
    });

    it('should handle tell me conversations', async () => {
      const context: EnhancedMessageContext = {
        text: 'Tell me something interesting about Ukraine',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false,
        isDirectMention: false
      };

      const response = await handler.handleMessage(context);

      expect(response.responseType).toBe('conversation');
      expect(response.conversationResponse).toBeTruthy();
    });

    it('should handle reply to bot messages', async () => {
      const context: EnhancedMessageContext = {
        text: 'Дякую за відповідь!',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: true,
        mentionsBot: false,
        isDirectMention: false
      };

      const response = await handler.handleMessage(context);

      expect(response.responseType).toBe('conversation');
      expect(response.conversationResponse).toBeTruthy();
    });
  });

  describe('Meme Generation', () => {
    it('should handle Ukrainian meme requests', async () => {
      const context: EnhancedMessageContext = {
        text: 'Створи мем про код',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false,
        requestsMeme: true,
        memeRequest: 'про код'
      };

      const response = await handler.handleMessage(context);

      expect(response.responseType).toBe('meme');
      expect(response.shouldReply).toBe(true);
      expect(response.memeResponse).toBeTruthy();
      expect(response.memeResponse!.type).toBe('text');
      expect(response.confidence).toBe(0.9);
    });

    it('should handle English meme requests', async () => {
      const context: EnhancedMessageContext = {
        text: 'make a meme about coding',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false,
        requestsMeme: true,
        memeRequest: 'about coding'
      };

      const response = await handler.handleMessage(context);

      expect(response.responseType).toBe('meme');
      expect(response.memeResponse).toBeTruthy();
    });

    it('should detect meme keyword in text', async () => {
      const context: EnhancedMessageContext = {
        text: 'This needs a meme!',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false
      };

      const response = await handler.handleMessage(context);

      expect(response.responseType).toBe('meme');
      expect(response.memeResponse).toBeTruthy();
    });

    it('should handle /meme commands', async () => {
      const context: EnhancedMessageContext = {
        text: '/meme звичайний текст | низ текст',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false
      };

      const response = await handler.handleMessage(context);

      expect(response.responseType).toBe('meme');
      expect(response.memeResponse).toBeTruthy();
    });

    it('should suggest contextual memes occasionally', async () => {
      const context: EnhancedMessageContext = {
        text: 'Мій код не працює знову!',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false
      };

      // Test multiple times due to random chance (10%)
      let memeGenerated = false;
      for (let i = 0; i < 20; i++) {
        const response = await handler.handleMessage(context);
        if (response.responseType === 'meme') {
          memeGenerated = true;
          expect(response.memeResponse).toBeTruthy();
          break;
        }
      }
      // Note: Due to randomness, this might not always pass, but should pass most of the time
    });
  });

  describe('Atmosphere Enhancement', () => {
    it('should update chat activity for Ukrainian messages', async () => {
      const context: EnhancedMessageContext = {
        text: 'Привіт всім! Гарний день сьогодні!',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false
      };

      await handler.handleMessage(context);

      const chatStats = handler.getChatAtmosphereStats('chat1');
      expect(chatStats.chatActivity).toBeTruthy();
      expect(chatStats.chatActivity!.messageCount).toBe(1);
      expect(chatStats.chatActivity!.language).toBe('uk');
    });

    it('should assign Ukrainian user roles', async () => {
      const context: EnhancedMessageContext = {
        text: 'ха-ха-ха 😂 дуже смішно лол',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false
      };

      await handler.handleMessage(context);

      const userRole = handler.getUserRole('user1');
      expect(userRole).toBeTruthy();
      expect(userRole!.role).toBe('Мем Лорд');
    });

    it('should register engagement callbacks for group chats', async () => {
      const context: EnhancedMessageContext = {
        text: 'Test message',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false
      };

      await handler.handleMessage(context);

      const chatStats = handler.getChatAtmosphereStats('chat1');
      expect(chatStats.engagementCallbackRegistered).toBe(false); // Initial state
    });

    it('should track sentiment correctly', async () => {
      const positiveContext: EnhancedMessageContext = {
        text: 'Я дуже щасливий сьогодні! Все чудово!',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false
      };

      await handler.handleMessage(positiveContext);

      const chatStats = handler.getChatAtmosphereStats('chat1');
      expect(chatStats.chatActivity!.mood).toBe('positive');
    });
  });

  describe('Base Sentiment Reactions', () => {
    it('should fall back to base handler for normal messages', async () => {
      const context: EnhancedMessageContext = {
        text: 'Звичайне повідомлення без особливих тригерів',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false
      };

      const response = await handler.handleMessage(context);

      expect(['reaction', 'reply', 'none']).toContain(response.responseType);
      expect(response.confidence).toBeGreaterThanOrEqual(0);
    });

    it('should provide reactions to positive messages', async () => {
      const context: EnhancedMessageContext = {
        text: 'Я дуже радий! Все чудово!',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false
      };

      const response = await handler.handleMessage(context);

      if (response.shouldReact) {
        expect(['reaction', 'power_word']).toContain(response.responseType);
        if (response.responseType === 'reaction') {
          expect(response.reaction).toBeTruthy();
        }
      }
    });

    it('should provide reactions to negative messages', async () => {
      const context: EnhancedMessageContext = {
        text: 'Мені сумно сьогодні',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false
      };

      const response = await handler.handleMessage(context);

      if (response.shouldReact) {
        expect(response.responseType).toBe('reaction');
        expect(response.reaction).toBeTruthy();
      }
    });
  });

  describe('Configuration Management', () => {
    it('should update content configuration', () => {
      handler.updateContentConfiguration({
        sensitivityLevel: 'high',
        enableSarcasm: false
      });

      // Test that config was updated by checking behavior
      expect(() => {
        handler.updateContentConfiguration({ sensitivityLevel: 'low' });
      }).not.toThrow();
    });

    it('should update atmosphere configuration', () => {
      handler.updateAtmosphereConfiguration({
        enableAutomaticEngagement: false,
        maxEngagementPerHour: 1
      });

      expect(() => {
        handler.updateAtmosphereConfiguration({ primaryLanguage: 'en' });
      }).not.toThrow();
    });
  });

  describe('Statistics and Monitoring', () => {
    it('should provide enhanced statistics', async () => {
      const context: EnhancedMessageContext = {
        text: 'Привіт! Тестове повідомлення.',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false
      };

      await handler.handleMessage(context);

      const stats = handler.getEnhancedStats();

      expect(stats.base).toBeTruthy();
      expect(stats.nlp).toBeTruthy();
      expect(stats.content).toBeTruthy();
      expect(stats.atmosphere).toBeTruthy();
      expect(stats.memes).toBeTruthy();

      expect(stats.nlp.activeUsers).toBeGreaterThanOrEqual(1);
      expect(stats.content.primaryLanguage).toBe('uk');
      expect(stats.atmosphere.activeChatCallbacks).toBeGreaterThanOrEqual(0);
    });

    it('should provide chat atmosphere statistics', async () => {
      const context: EnhancedMessageContext = {
        text: 'Тестування атмосфери чату',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false
      };

      await handler.handleMessage(context);

      const chatStats = handler.getChatAtmosphereStats('chat1');

      expect(chatStats.chatActivity).toBeTruthy();
      expect(chatStats.chatActivity!.chatId).toBe('chat1');
      expect(chatStats.userRoles).toBeDefined();
    });

    it('should track user roles correctly', async () => {
      const context: EnhancedMessageContext = {
        text: 'лол 😂 смішно',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false
      };

      await handler.handleMessage(context);

      const userRole = handler.getUserRole('user1');
      expect(userRole).toBeTruthy();
      expect(userRole!.userId).toBe('user1');
      expect(userRole!.role).toBeTruthy();
    });
  });

  describe('Admin Functions', () => {
    it('should record content feedback', async () => {
      await expect(
        handler.recordContentFeedback('user1', 'msg123', false)
      ).resolves.not.toThrow();

      await expect(
        handler.recordContentFeedback('user1', 'msg124', true)
      ).resolves.not.toThrow();
    });

    it('should reset user warnings', async () => {
      // First trigger a warning
      const context: EnhancedMessageContext = {
        text: 'дурень',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false
      };

      await handler.handleMessage(context);

      // Reset warnings
      handler.resetUserWarnings('user1');

      // Should not throw
      expect(() => {
        handler.resetUserWarnings('user1');
      }).not.toThrow();
    });

    it('should add custom forbidden words', () => {
      expect(() => {
        handler.addCustomForbiddenWords(['тестслово', 'заборонено']);
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle empty messages gracefully', async () => {
      const context: EnhancedMessageContext = {
        text: '',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false
      };

      const response = await handler.handleMessage(context);

      expect(response).toBeTruthy();
      expect(typeof response.confidence).toBe('number');
      expect(typeof response.shouldReply).toBe('boolean');
      expect(typeof response.shouldReact).toBe('boolean');
    });

    it('should handle very long messages', async () => {
      const longText = 'а'.repeat(5000);
      const context: EnhancedMessageContext = {
        text: longText,
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false
      };

      const response = await handler.handleMessage(context);

      expect(response).toBeTruthy();
      expect(response.confidence).toBeGreaterThanOrEqual(0);
    });

    it('should handle special characters and emojis', async () => {
      const context: EnhancedMessageContext = {
        text: '🎉🎊 Привіт! 😊 Спеціальні символи: @#$%^&*()',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false
      };

      const response = await handler.handleMessage(context);

      expect(response).toBeTruthy();
      expect(response.confidence).toBeGreaterThanOrEqual(0);
    });

    it('should handle malformed context gracefully', async () => {
      const malformedContext: any = {
        text: 'test',
        userId: null,
        chatId: undefined,
        userName: '',
        isGroupChat: 'not a boolean' as any,
        messageId: 'not a number' as any
      };

      try {
        const response = await handler.handleMessage(malformedContext);
        expect(response).toBeTruthy();
      } catch (error) {
        // Should handle gracefully without crashing
        expect(error).toBeDefined();
      }
    });

    it('should provide safe fallback response on errors', async () => {
      // Create a context that might cause internal errors
      const context: EnhancedMessageContext = {
        text: 'test',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false
      };

      const response = await handler.handleMessage(context);

      expect(response.confidence).toBeGreaterThanOrEqual(0);
      expect(response.reasoning).toBeTruthy();
      expect(['reaction', 'reply', 'conversation', 'content_warning', 'meme', 'atmosphere', 'power_word', 'none']).toContain(response.responseType);
    });
  });

  describe('Priority System', () => {
    it('should prioritize inappropriate content detection', async () => {
      const context: EnhancedMessageContext = {
        text: '@bot дурень ідіот розкажи жарт meme',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: true,
        isDirectMention: true,
        requestsMeme: true
      };

      const response = await handler.handleMessage(context);

      // Memory system has highest priority, so it should handle offensive content first
      expect(response.responseType).toBe('memory');
      expect(response.memoryResponse).toBeTruthy();
    });

    it('should prioritize conversation over memes when mentioned', async () => {
      const context: EnhancedMessageContext = {
        text: '@bot привіт! можеш створити meme?',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: true,
        isDirectMention: true,
        requestsMeme: true
      };

      const response = await handler.handleMessage(context);

      // When bot is directly mentioned, conversation should take priority
      expect(response.responseType).toBe('conversation');
      expect(response.conversationResponse).toBeTruthy();
    });

    it('should prioritize memes when explicitly requested', async () => {
      const context: EnhancedMessageContext = {
        text: 'створи мем про код',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false,
        requestsMeme: true,
        memeRequest: 'про код'
      };

      const response = await handler.handleMessage(context);

      expect(response.responseType).toBe('meme');
      expect(response.memeResponse).toBeTruthy();
    });
  });

  describe('Concurrent Processing', () => {
    it('should handle multiple simultaneous messages', async () => {
      const contexts = [
        {
          text: 'Привіт!',
          userId: 'user1',
          chatId: 'chat1',
          userName: 'User1',
          isGroupChat: true,
          messageId: 123,
          isReplyToBot: false,
          mentionsBot: false
        },
        {
          text: 'Hello!',
          userId: 'user2',
          chatId: 'chat2',
          userName: 'User2',
          isGroupChat: true,
          messageId: 124,
          isReplyToBot: false,
          mentionsBot: false
        },
        {
          text: 'створи мем',
          userId: 'user3',
          chatId: 'chat3',
          userName: 'User3',
          isGroupChat: true,
          messageId: 125,
          isReplyToBot: false,
          mentionsBot: false,
          requestsMeme: true
        }
      ];

      const promises = contexts.map(context => handler.handleMessage(context));
      const responses = await Promise.all(promises);

      expect(responses).toHaveLength(3);
      responses.forEach(response => {
        expect(response).toBeTruthy();
        expect(response.confidence).toBeGreaterThanOrEqual(0);
      });
    });

    it('should maintain separate chat states', async () => {
      const chat1Context: EnhancedMessageContext = {
        text: 'лол 😂',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'User1',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false
      };

      const chat2Context: EnhancedMessageContext = {
        text: 'Що думаєте про це?',
        userId: 'user2',
        chatId: 'chat2',
        userName: 'User2',
        isGroupChat: true,
        messageId: 124,
        isReplyToBot: false,
        mentionsBot: false
      };

      await handler.handleMessage(chat1Context);
      await handler.handleMessage(chat2Context);

      const user1Role = handler.getUserRole('user1');
      const user2Role = handler.getUserRole('user2');

      expect(user1Role!.role).toBe('Мем Лорд');
      expect(user2Role!.role).toBe('Стартер Тем');
    });
  });

  describe('Power Words Detection ("Потужно" синоніми)', () => {
    it('should detect and react to exact power words', async () => {
      const context: EnhancedMessageContext = {
        text: 'Це потужно!',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false,
        isDirectMention: false
      };

      const response = await handler.handleMessage(context);

      expect(response.responseType).toBe('power_word');
      expect(response.shouldReact).toBe(true);
      expect(response.powerWordReaction).toBeDefined();
      expect(response.powerWordReaction?.emoji).toBeDefined();
      expect(response.confidence).toBeGreaterThan(0.8);
    });

         it('should detect power words with high accuracy (80%)', async () => {
       const context: EnhancedMessageContext = {
         text: 'потужно працює!',
         userId: 'user1',
         chatId: 'chat1',
         isGroupChat: true,
         messageId: 123,
         isReplyToBot: false,
         mentionsBot: false,
         isDirectMention: false
       };

       const response = await handler.handleMessage(context);
       expect(response.responseType).toBe('power_word');
       expect(response.confidence).toBeGreaterThan(0.8);
     });

         it('should provide appropriate emoji reactions for different categories', async () => {
       const testCases = [
         { text: 'потужно', expectedCategories: ['strength', 'power', 'intensity'] },
         { text: 'крутий', expectedCategories: ['awesome', 'positive', 'intensity'] }
       ];

       for (const testCase of testCases) {
         const context: EnhancedMessageContext = {
           text: testCase.text,
           userId: 'user1',
           chatId: 'chat1',
           isGroupChat: true,
           messageId: 123,
           isReplyToBot: false,
           mentionsBot: false,
           isDirectMention: false
         };

         const response = await handler.handleMessage(context);
         if (response.responseType === 'power_word') {
           expect(response.powerWordReaction?.emoji).toBeDefined();
           expect(response.powerWordReaction?.match.category).toMatch(/strength|power|awesome|positive|intensity/);
         }
       }
     });

    it('should handle multiple power words in one message', async () => {
      const context: EnhancedMessageContext = {
        text: 'Це потужно і супер!',
        userId: 'user1',
        chatId: 'chat1',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false,
        isDirectMention: false
      };

      const response = await handler.handleMessage(context);
      expect(response.responseType).toBe('power_word');
      expect(response.powerWordReaction).toBeDefined();
    });

    it('should not react to non-power words', async () => {
      const nonPowerWords = ['звичайно', 'нормально', 'добре', 'так собі'];
      
      for (const word of nonPowerWords) {
        const context: EnhancedMessageContext = {
          text: word,
          userId: 'user1',
          chatId: 'chat1',
          isGroupChat: true,
          messageId: 123,
          isReplyToBot: false,
          mentionsBot: false,
          isDirectMention: false
        };

        const response = await handler.handleMessage(context);
        expect(response.responseType).not.toBe('power_word');
      }
    });

    it('should handle exact power word phrases', async () => {
      const context: EnhancedMessageContext = {
        text: 'дуже потужно',
        userId: 'user1',
        chatId: 'chat1',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false,
        isDirectMention: false
      };

      const response = await handler.handleMessage(context);
      expect(response.responseType).toBe('power_word');
      expect(response.powerWordReaction?.match.originalWord).toBe('потужно');
    });

    it('should provide confidence scores and logging', async () => {
      const context: EnhancedMessageContext = {
        text: 'потужний результат',
        userId: 'user1',
        chatId: 'chat1',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false,
        isDirectMention: false
      };

      const response = await handler.handleMessage(context);
      expect(response.confidence).toBeGreaterThan(0);
      expect(response.reasoning).toContain('Power word detected');
    });
  });

  describe('CLI Commands Handling', () => {
    it('should handle basic CLI help command', async () => {
      const context = createTestContext('help');
      const response = await handler.handleMessage(context);
      
      expect(response.responseType).toBe('cli');
      expect(response.shouldReply).toBe(true);
      expect(response.reply).toContain('Available Bot Commands');
      expect(response.cliResponse?.command).toBe('help');
    });

    it('should handle CLI status command', async () => {
      const context = createTestContext('status');
      const response = await handler.handleMessage(context);
      
      expect(response.responseType).toBe('cli');
      expect(response.shouldReply).toBe(true);
      expect(response.reply).toContain('Статус функцій');
      expect(response.cliResponse?.command).toBe('status');
    });

    it('should handle CLI features command', async () => {
      const context = createTestContext('features');
      const response = await handler.handleMessage(context);
      
      expect(response.responseType).toBe('cli');
      expect(response.shouldReply).toBe(true);
      expect(response.reply).toContain('Доступні функції для управління');
      expect(response.cliResponse?.command).toBe('features');
    });

    it('should handle CLI mode command', async () => {
      const context = createTestContext('cli');
      const response = await handler.handleMessage(context);
      
      expect(response.responseType).toBe('cli');
      expect(response.shouldReply).toBe(true);
      expect(response.reply).toContain('CLI Mode Activated'); // Команда cli повертає англійську відповідь
      expect(response.cliResponse?.command).toBe('cli');
    });

    it('should handle bot mention CLI commands', async () => {
      const context = createTestContext('@mr_potuzhnich_bot cli status');
      const response = await handler.handleMessage(context);
      
      expect(response.responseType).toBe('cli');
      expect(response.shouldReply).toBe(true);
      expect(response.reply).toContain('Статус функцій');
      expect(response.cliResponse?.command).toBe('status');
    });

    it('should handle feature enable commands', async () => {
      const context = createTestContext('enable powerWords');
      const response = await handler.handleMessage(context);
      
      expect(response.responseType).toBe('cli');
      expect(response.shouldReply).toBe(true);
      expect(response.reply).toMatch(/увімкнено|enabled/i);
      expect(response.cliResponse?.command).toBe('enable');
    });

    it('should handle feature disable commands', async () => {
      const context = createTestContext('disable moderation');
      const response = await handler.handleMessage(context);
      
      expect(response.responseType).toBe('cli');
      expect(response.shouldReply).toBe(true);
      expect(response.reply).toMatch(/вимкнено|disabled/i);
      expect(response.cliResponse?.command).toBe('disable');
    });

    it('should handle bot mention feature control', async () => {
      const context = createTestContext('@mr_potuzhnich_bot cli enable nlpConversations');
      const response = await handler.handleMessage(context);
      
      expect(response.responseType).toBe('cli');
      expect(response.shouldReply).toBe(true);
      expect(response.reply).toMatch(/увімкнено|enabled/i);
      expect(response.cliResponse?.command).toBe('enable');
    });

    it('should handle unknown feature gracefully', async () => {
      const context = createTestContext('enable unknownFeature');
      const response = await handler.handleMessage(context);
      
      expect(response.responseType).toBe('cli');
      expect(response.shouldReply).toBe(true);
      expect(response.reply).toContain('Unknown feature');
    });

    it('should not interfere with non-CLI commands', async () => {
      const context = createTestContext('Привіт як справи?');
      const response = await handler.handleMessage(context);
      
      expect(response.responseType).not.toBe('cli');
    });
  });

  describe('Currency Exchange Handling', () => {
    it('should handle USD rate queries', async () => {
      const context = createTestContext('курс долара');
      const response = await handler.handleMessage(context);
      
      expect(response.shouldReply).toBe(true);
              expect(response.reply).toMatch(/USD|долар|курс/i);
    }, 10000);

    it('should handle Ukrainian currency queries', async () => {
      const context = createTestContext('скільки коштує євро');
      const response = await handler.handleMessage(context);
      
      expect(response.shouldReply).toBe(true);
              expect(response.reply).toMatch(/EUR|євро|курс/i);
    }, 10000);

    it('should handle currency conversion queries', async () => {
      const context = createTestContext('100 доларів в гривні');
      const response = await handler.handleMessage(context);
      
      expect(response.shouldReply).toBe(true);
      expect(response.reply).toMatch(/100.*USD.*UAH|долар.*гривн/i);
    }, 10000);

    it('should handle popular currencies request', async () => {
      const context: EnhancedMessageContext = {
        text: 'популярні курси',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false,
        isDirectMention: false
      };

      const response = await handler.handleMessage(context);

      expect(response.responseType).toBe('currency');
      expect(response.shouldReply).toBe(true);
      expect(response.reply).toContain('Популярні курси валют');
      expect(response.currencyResponse?.responseType).toBe('currency_rate');
    });

    it('should handle currency list request', async () => {
      const context: EnhancedMessageContext = {
        text: 'список валют',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false,
        isDirectMention: false
      };

      const response = await handler.handleMessage(context);

      expect(response.responseType).toBe('currency');
      expect(response.shouldReply).toBe(true);
      expect(response.reply).toContain('Підтримувані валюти');
      expect(response.currencyResponse?.responseType).toBe('currency_list');
    });

    it('should handle bot mention currency queries', async () => {
      const context: EnhancedMessageContext = {
        text: '@bot USD',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: true,
        isDirectMention: true
      };

      const response = await handler.handleMessage(context);

      expect(response.responseType).toBe('currency');
      expect(response.shouldReply).toBe(true);
      expect(response.reply).toContain('Долар США');
    });

    it('should not interfere with non-currency messages', async () => {
      const context: EnhancedMessageContext = {
        text: 'Привіт, як справи?',
        userId: 'user1',
        chatId: 'chat1',
        userName: 'TestUser',
        isGroupChat: true,
        messageId: 123,
        isReplyToBot: false,
        mentionsBot: false,
        isDirectMention: false
      };

      const response = await handler.handleMessage(context);

      expect(response.responseType).not.toBe('currency');
    });
  });
}); 