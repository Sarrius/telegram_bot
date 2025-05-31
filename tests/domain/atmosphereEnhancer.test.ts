import { AtmosphereEnhancer, AtmosphereConfig, ChatActivity, UserRole, EngagementAction } from '../../src/domain/atmosphereEnhancer';

describe('AtmosphereEnhancer', () => {
  let enhancer: AtmosphereEnhancer;

  beforeEach(() => {
    enhancer = new AtmosphereEnhancer({
      quietPeriodThresholdMs: 10 * 60 * 1000, // 10 minutes
      enableAutomaticEngagement: true,
      enableRoleAssignment: true,
      enablePolls: true,
      enableFunFacts: true,
      maxEngagementPerHour: 3,
      primaryLanguage: 'uk'
    });
  });

  afterEach(() => {
    enhancer.dispose();
  });

  describe('Language Detection', () => {
    it('should detect Ukrainian language correctly', () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'Привіт! Як справи?', 'positive');
      
      const stats = enhancer.getChatStats('chat1');
      expect(stats).toBeTruthy();
      expect(stats!.language).toBe('uk');
    });

    it('should detect Ukrainian by special characters', () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'Це тестове повідомлення з іїєґ', 'neutral');
      
      const stats = enhancer.getChatStats('chat1');
      expect(stats!.language).toBe('uk');
    });

    it('should detect English as fallback', () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'Hello there!', 'positive');
      
      const stats = enhancer.getChatStats('chat1');
      expect(stats!.language).toBe('en');
    });

    it('should detect Ukrainian words in text', () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'що це таке?', 'neutral');
      
      const stats = enhancer.getChatStats('chat1');
      expect(stats!.language).toBe('uk');
    });
  });

  describe('Chat Activity Tracking', () => {
    it('should create new chat activity', () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'First message', 'positive');
      
      const stats = enhancer.getChatStats('chat1');
      
      expect(stats).toBeTruthy();
      expect(stats!.chatId).toBe('chat1');
      expect(stats!.messageCount).toBe(1);
      expect(stats!.activeUsers.has('user1')).toBe(true);
      expect(stats!.mood).toBe('positive');
    });

    it('should update existing chat activity', () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'First message', 'positive');
      enhancer.updateChatActivity('chat1', 'user2', 'TestUser2', 'Second message', 'neutral');
      
      const stats = enhancer.getChatStats('chat1');
      
      expect(stats!.messageCount).toBe(2);
      expect(stats!.activeUsers.size).toBe(2);
      expect(stats!.activeUsers.has('user1')).toBe(true);
      expect(stats!.activeUsers.has('user2')).toBe(true);
    });

    it('should track recent topics from Ukrainian messages', () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'Я люблю їжу та музику', 'positive');
      
      const stats = enhancer.getChatStats('chat1');
      
      expect(stats!.recentTopics).toContain('food');
      expect(stats!.recentTopics).toContain('music');
    });

    it('should track recent topics from English messages', () => {
      const englishEnhancer = new AtmosphereEnhancer({ primaryLanguage: 'en' });
      englishEnhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'I love food and music', 'positive');
      
      const stats = englishEnhancer.getChatStats('chat1');
      
      expect(stats!.recentTopics).toContain('food');
      expect(stats!.recentTopics).toContain('music');
      
      englishEnhancer.dispose();
    });

    it('should limit recent topics to maximum length', () => {
      const topics = ['їжа', 'музика', 'фільм', 'робота', 'погода', 'подорож', 'спорт', 'гра', 'книга', 'мистецтво', 'наука'];
      
      topics.forEach((topic, index) => {
        enhancer.updateChatActivity('chat1', 'user1', 'TestUser', `Говоримо про ${topic}`, 'positive');
      });
      
      const stats = enhancer.getChatStats('chat1');
      expect(stats!.recentTopics.length).toBeLessThanOrEqual(10);
    });

    it('should update chat mood based on sentiment', () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'Positive message', 'positive');
      let stats = enhancer.getChatStats('chat1');
      expect(stats!.mood).toBe('positive');

      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'Negative message', 'negative');
      stats = enhancer.getChatStats('chat1');
      expect(stats!.mood).toBe('negative');

      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'Neutral message', 'neutral');
      stats = enhancer.getChatStats('chat1');
      expect(stats!.mood).toBe('neutral');
    });

    it('should calculate engagement score', () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'Message', 'positive');
      enhancer.updateChatActivity('chat1', 'user2', 'TestUser2', 'Message', 'positive');
      enhancer.updateChatActivity('chat1', 'user3', 'TestUser3', 'Message', 'positive');
      
      const stats = enhancer.getChatStats('chat1');
      expect(stats!.engagementScore).toBeGreaterThan(0);
      expect(stats!.engagementScore).toBeLessThanOrEqual(1);
    });
  });

  describe('User Role Assignment', () => {
    it('should assign Ukrainian role based on message content', () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'ха-ха-ха 😂 дуже смішно лол', 'positive');
      
      const role = enhancer.getUserRole('user1');
      
      expect(role).toBeTruthy();
      expect(role!.role).toBe('Мем Лорд');
      expect(role!.userId).toBe('user1');
      expect(role!.messageCount).toBe(1);
      expect(role!.characteristics.length).toBeGreaterThan(0);
    });

    it('should assign English role based on message content', () => {
      const englishEnhancer = new AtmosphereEnhancer({ primaryLanguage: 'en' });
      englishEnhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'haha lol funny 😂', 'positive');
      
      const role = englishEnhancer.getUserRole('user1');
      
      expect(role).toBeTruthy();
      expect(role!.role).toBe('Meme Lord');
      
      englishEnhancer.dispose();
    });

    it('should assign energy booster role for enthusiastic Ukrainian messages', () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'Це так круто! Вау!', 'positive');
      
      const role = enhancer.getUserRole('user1');
      
      expect(role!.role).toBe('Енерджайзер');
    });

    it('should assign topic starter role for questions in Ukrainian', () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'Що ви думаєте про нові технології в сучасному світі?', 'neutral');
      
      const role = enhancer.getUserRole('user1');
      
      expect(role!.role).toBe('Стартер Тем');
    });

    it('should assign foodie role for food-related Ukrainian messages', () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'Обожнюю українську їжу', 'positive');
      
      const role = enhancer.getUserRole('user1');
      
      expect(role!.role).toBe('Фуді Дослідник');
    });

    it('should increment message count for existing user roles', () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'лол 😂', 'positive');
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'ще один жарт', 'positive');
      
      const role = enhancer.getUserRole('user1');
      
      expect(role!.messageCount).toBe(2);
    });

    it('should provide all user roles', () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser1', 'лол 😂', 'positive');
      enhancer.updateChatActivity('chat1', 'user2', 'TestUser2', 'Круто!', 'positive');
      enhancer.updateChatActivity('chat1', 'user3', 'TestUser3', 'Що думаєте?', 'neutral');
      
      const allRoles = enhancer.getAllUserRoles();
      
      expect(allRoles.length).toBe(3);
      expect(allRoles.map(r => r.userId)).toContain('user1');
      expect(allRoles.map(r => r.userId)).toContain('user2');
      expect(allRoles.map(r => r.userId)).toContain('user3');
    });
  });

  describe('Engagement Action Generation', () => {
    it('should not generate engagement for recent activity', async () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'Recent message', 'positive');
      
      const action = await enhancer.generateEngagementAction('chat1');
      
      expect(action).toBeNull(); // Too recent activity
    });

    it('should generate Ukrainian engagement for low activity chat', async () => {
      // Mock the chat to have low engagement score and old last message
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'Old message', 'neutral');
      
      // Manually set old timestamp to simulate quiet period
      const stats = enhancer.getChatStats('chat1');
      if (stats) {
        stats.lastMessageTime = Date.now() - (15 * 60 * 1000); // 15 minutes ago
        stats.engagementScore = 0.2; // Low engagement
      }
      
      const action = await enhancer.generateEngagementAction('chat1');
      
      if (action) {
        expect(action.language).toBe('uk');
        expect(['joke', 'fact', 'game'].includes(action.type)).toBe(true);
        expect(action.content).toBeTruthy();
        expect(action.priority).toBeGreaterThan(0);
      }
    });

    it('should generate appropriate engagement for negative mood', async () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'Sad message', 'negative');
      
      const stats = enhancer.getChatStats('chat1');
      if (stats) {
        stats.lastMessageTime = Date.now() - (15 * 60 * 1000);
        stats.mood = 'negative';
      }
      
      const action = await enhancer.generateEngagementAction('chat1');
      
      if (action) {
        expect(['fact', 'topic_suggestion'].includes(action.type)).toBe(true);
        expect(action.priority).toBeGreaterThanOrEqual(8);
      }
    });

    it('should respect maximum engagement per hour', async () => {
      const config = enhancer.getConfig();
      enhancer.updateConfig({ ...config, maxEngagementPerHour: 1 });
      
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'Test message', 'neutral');
      
      const stats = enhancer.getChatStats('chat1');
      if (stats) {
        stats.lastMessageTime = Date.now() - (15 * 60 * 1000);
      }
      
      // First engagement should work
      const action1 = await enhancer.generateEngagementAction('chat1');
      
      if (action1) {
        // Second engagement should be null due to rate limiting
        const action2 = await enhancer.generateEngagementAction('chat1');
        expect(action2).toBeNull();
      }
    });

    it('should not engage when automatic engagement is disabled', async () => {
      enhancer.updateConfig({ enableAutomaticEngagement: false });
      
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'Test message', 'neutral');
      
      const stats = enhancer.getChatStats('chat1');
      if (stats) {
        stats.lastMessageTime = Date.now() - (15 * 60 * 1000);
      }
      
      const action = await enhancer.generateEngagementAction('chat1');
      expect(action).toBeNull();
    });
  });

  describe('Configuration Management', () => {
    it('should update configuration', () => {
      const newConfig = {
        quietPeriodThresholdMs: 5 * 60 * 1000,
        enableAutomaticEngagement: false,
        enableRoleAssignment: false,
        primaryLanguage: 'en' as const
      };
      
      enhancer.updateConfig(newConfig);
      
      const config = enhancer.getConfig();
      expect(config.quietPeriodThresholdMs).toBe(5 * 60 * 1000);
      expect(config.enableAutomaticEngagement).toBe(false);
      expect(config.enableRoleAssignment).toBe(false);
      expect(config.primaryLanguage).toBe('en');
    });

    it('should return current configuration', () => {
      const config = enhancer.getConfig();
      
      expect(config).toBeTruthy();
      expect(config.primaryLanguage).toBe('uk');
      expect(config.enableAutomaticEngagement).toBe(true);
      expect(config.enableRoleAssignment).toBe(true);
    });
  });

  describe('Topic Extraction', () => {
    it('should extract Ukrainian food topics', () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'Люблю українську їжу та готувати вареники', 'positive');
      
      const stats = enhancer.getChatStats('chat1');
      expect(stats!.recentTopics).toContain('food');
    });

    it('should extract Ukrainian music topics', () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'Слухаю українську музику та пісні', 'positive');
      
      const stats = enhancer.getChatStats('chat1');
      expect(stats!.recentTopics).toContain('music');
    });

    it('should extract Ukrainian movie topics', () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'Дивлюся українські фільми в кінотеатрі', 'positive');
      
      const stats = enhancer.getChatStats('chat1');
      expect(stats!.recentTopics).toContain('movies');
    });

    it('should extract Ukrainian work topics', () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'На роботі багато проектів та зустрічей', 'neutral');
      
      const stats = enhancer.getChatStats('chat1');
      expect(stats!.recentTopics).toContain('work');
    });

    it('should extract Ukrainian weather topics', () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'Сьогодні гарна погода, сонячно', 'positive');
      
      const stats = enhancer.getChatStats('chat1');
      expect(stats!.recentTopics).toContain('weather');
    });

    it('should extract Ukrainian travel topics', () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'Планую подорож в іншу країну', 'positive');
      
      const stats = enhancer.getChatStats('chat1');
      expect(stats!.recentTopics).toContain('travel');
    });

    it('should extract Ukrainian sports topics', () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'Дивився матч з футболу, наша команда виграла', 'positive');
      
      const stats = enhancer.getChatStats('chat1');
      expect(stats!.recentTopics).toContain('sports');
    });

    it('should extract multiple topics from one message', () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'Після роботи піду в ресторан дивитися футбол', 'positive');
      
      const stats = enhancer.getChatStats('chat1');
      expect(stats!.recentTopics.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Engagement Score Calculation', () => {
    it('should increase score with more active users', () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser1', 'Message 1', 'positive');
      const score1 = enhancer.getChatStats('chat1')!.engagementScore;
      
      enhancer.updateChatActivity('chat1', 'user2', 'TestUser2', 'Message 2', 'positive');
      const score2 = enhancer.getChatStats('chat1')!.engagementScore;
      
      enhancer.updateChatActivity('chat1', 'user3', 'TestUser3', 'Message 3', 'positive');
      const score3 = enhancer.getChatStats('chat1')!.engagementScore;
      
      expect(score2).toBeGreaterThan(score1);
      expect(score3).toBeGreaterThan(score2);
    });

    it('should give higher score for positive mood', () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'Positive message', 'positive');
      const positiveScore = enhancer.getChatStats('chat1')!.engagementScore;
      
      enhancer.updateChatActivity('chat2', 'user1', 'TestUser', 'Negative message', 'negative');
      const negativeScore = enhancer.getChatStats('chat2')!.engagementScore;
      
      enhancer.updateChatActivity('chat3', 'user1', 'TestUser', 'Neutral message', 'neutral');
      const neutralScore = enhancer.getChatStats('chat3')!.engagementScore;
      
      expect(positiveScore).toBeGreaterThan(neutralScore);
      expect(neutralScore).toBeGreaterThan(negativeScore);
    });

    it('should cap engagement score at 1.0', () => {
      // Add many active users with positive sentiment
      for (let i = 0; i < 10; i++) {
        enhancer.updateChatActivity('chat1', `user${i}`, `TestUser${i}`, 'Positive message', 'positive');
      }
      
      const stats = enhancer.getChatStats('chat1');
      expect(stats!.engagementScore).toBeLessThanOrEqual(1.0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty messages', () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', '', 'neutral');
      
      const stats = enhancer.getChatStats('chat1');
      expect(stats).toBeTruthy();
      expect(stats!.messageCount).toBe(1);
    });

    it('should handle very long messages', () => {
      const longMessage = 'a'.repeat(1000);
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', longMessage, 'neutral');
      
      const stats = enhancer.getChatStats('chat1');
      expect(stats).toBeTruthy();
    });

    it('should handle special characters and emojis', () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', '🎉🎊 Привіт! 😊 Як справи? 🌟', 'positive');
      
      const stats = enhancer.getChatStats('chat1');
      expect(stats!.language).toBe('uk');
    });

    it('should handle concurrent updates', () => {
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(new Promise(resolve => {
          enhancer.updateChatActivity('chat1', `user${i}`, `TestUser${i}`, `Message ${i}`, 'positive');
          resolve(true);
        }));
      }
      
      return Promise.all(promises).then(() => {
        const stats = enhancer.getChatStats('chat1');
        expect(stats!.activeUsers.size).toBe(10);
      });
    });

    it('should handle null chat stats gracefully', async () => {
      const action = await enhancer.generateEngagementAction('nonexistent-chat');
      expect(action).toBeNull();
    });

    it('should handle missing user role gracefully', () => {
      const role = enhancer.getUserRole('nonexistent-user');
      expect(role).toBeNull();
    });

    it('should properly dispose resources', () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'Message', 'positive');
      
      enhancer.dispose();
      
      const stats = enhancer.getChatStats('chat1');
      expect(stats).toBeNull();
      
      const roles = enhancer.getAllUserRoles();
      expect(roles).toHaveLength(0);
    });
  });

  describe('Language-Specific Content', () => {
    it('should provide Ukrainian jokes when requested', async () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'Розкажи жарт', 'positive');
      
      const stats = enhancer.getChatStats('chat1');
      if (stats) {
        stats.lastMessageTime = Date.now() - (15 * 60 * 1000);
        stats.engagementScore = 0.2;
      }
      
      const action = await enhancer.generateEngagementAction('chat1');
      
      if (action && action.type === 'joke') {
        expect(action.language).toBe('uk');
        expect(action.content).toBeTruthy();
      }
    });

    it('should provide Ukrainian fun facts', async () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'Цікавий факт', 'neutral');
      
      const stats = enhancer.getChatStats('chat1');
      if (stats) {
        stats.lastMessageTime = Date.now() - (15 * 60 * 1000);
        stats.engagementScore = 0.2;
      }
      
      const action = await enhancer.generateEngagementAction('chat1');
      
      if (action && action.type === 'fact') {
        expect(action.language).toBe('uk');
        expect(action.content).toBeTruthy();
      }
    });

    it('should assign roles with Ukrainian characteristics', () => {
      enhancer.updateChatActivity('chat1', 'user1', 'TestUser', 'лол 😂', 'positive');
      
      const role = enhancer.getUserRole('user1');
      
      expect(role!.role).toBe('Мем Лорд');
      expect(role!.characteristics).toContain('постить смішний контент');
    });
  });
}); 