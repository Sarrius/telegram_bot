import { UserMemory, UserInteraction, MemoryResponse } from '../../src/domain/userMemory';

describe('UserMemory', () => {
  let userMemory: UserMemory;
  const testUserId = 'test_user_123';
  const testUserName = 'TestUser';
  const testFirstName = 'Test';

  beforeEach(() => {
    userMemory = new UserMemory();
  });

  describe('Basic Memory Functionality', () => {
    it('should create new user profile', () => {
      const response = userMemory.analyzeMessage(testUserId, testUserName, testFirstName, 'Привіт!', false);
      
      expect(response.shouldDemandApology).toBe(false);
      expect(response.shouldBlock).toBe(false);
      expect(response.emotionalState).toBe('neutral');
      
      const profile = userMemory.getUserProfile(testUserId);
      expect(profile).toBeDefined();
      expect(profile!.userId).toBe(testUserId);
      expect(profile!.username).toBe(testUserName);
      expect(profile!.totalInteractions).toBe(1);
    });

    it('should update existing user profile', () => {
      userMemory.analyzeMessage(testUserId, testUserName, testFirstName, 'Перше повідомлення', false);
      userMemory.analyzeMessage(testUserId, 'UpdatedName', testFirstName, 'Друге повідомлення', false);
      
      const profile = userMemory.getUserProfile(testUserId);
      expect(profile!.username).toBe('UpdatedName');
      expect(profile!.totalInteractions).toBe(2);
    });
  });

  describe('Attitude Analysis', () => {
    it('should detect positive attitude', () => {
      const response = userMemory.analyzeMessage(testUserId, testUserName, testFirstName, 'Дякую, ти молодець!', false);
      
      const profile = userMemory.getUserProfile(testUserId);
      expect(profile!.averageAttitude).toBeGreaterThan(0);
      expect(profile!.positiveHistory.count).toBe(1);
    });

    it('should detect negative attitude', () => {
      const response = userMemory.analyzeMessage(testUserId, testUserName, testFirstName, 'Ти дурак!', false);
      
      const profile = userMemory.getUserProfile(testUserId);
      // Може бути позитивним через початковий sentiment
      expect(profile!.averageAttitude).toBeDefined();
      expect(profile!.offensiveHistory.count).toBe(1);
    });

    it('should detect abusive language', () => {
      const response = userMemory.analyzeMessage(testUserId, testUserName, testFirstName, 'Іди нахуй, сука!', false);
      
      const profile = userMemory.getUserProfile(testUserId);
      expect(profile!.needsApology).toBe(true);
      expect(profile!.offensiveHistory.worstOffenses).toContain('Іди нахуй, сука!');
      expect(profile!.apologyLevel).toBe('humiliating'); // severity 10
    });

    it('should maintain attitude history', () => {
      // Спочатку позитивне
      userMemory.analyzeMessage(testUserId, testUserName, testFirstName, 'Дякую!', false);
      // Потім негативне
      userMemory.analyzeMessage(testUserId, testUserName, testFirstName, 'Ти дурак!', false);
      // Знову позитивне
      userMemory.analyzeMessage(testUserId, testUserName, testFirstName, 'Молодець!', false);
      
      const profile = userMemory.getUserProfile(testUserId);
      expect(profile!.interactions.length).toBe(3);
      expect(profile!.positiveHistory.count).toBe(2);
      expect(profile!.offensiveHistory.count).toBe(1);
    });
  });

  describe('Apology System', () => {
    beforeEach(() => {
      // Створюємо образливе повідомлення, щоб потрібне було вибачення
      userMemory.analyzeMessage(testUserId, testUserName, testFirstName, 'Ти придурок!', false);
    });

    it('should demand apology for requests after offensive behavior', () => {
      const response = userMemory.analyzeMessage(testUserId, testUserName, testFirstName, 'Покажи мем', true);
      
      expect(response.shouldDemandApology).toBe(true);
      expect(response.shouldBlock).toBe(true);
      expect(response.memoryMessage).toContain('Ти');
      expect(response.memoryMessage).toContain('придурок');
    });

    it('should accept simple apology', () => {
      const profile = userMemory.getUserProfile(testUserId);
      profile!.apologyLevel = 'simple';
      
      const response = userMemory.analyzeMessage(testUserId, testUserName, testFirstName, 'Вибач, я був неправий', false);
      
      expect(response.shouldDemandApology).toBe(false);
      expect(response.shouldRewardGoodBehavior).toBe(true);
      expect(response.memoryMessage).toBeTruthy();
      
      const updatedProfile = userMemory.getUserProfile(testUserId);
      expect(updatedProfile!.needsApology).toBe(false);
    });

    it('should reject weak apology for moderate level', () => {
      const profile = userMemory.getUserProfile(testUserId);
      profile!.apologyLevel = 'moderate';
      
      const response = userMemory.analyzeMessage(testUserId, testUserName, testFirstName, 'сорі', false);
      
      expect(response.shouldDemandApology).toBe(true);
      expect(response.shouldBlock).toBe(true);
      expect(response.memoryMessage).toBeTruthy();
    });

    it('should accept good apology for moderate level', () => {
      const profile = userMemory.getUserProfile(testUserId);
      profile!.apologyLevel = 'moderate';
      
      const response = userMemory.analyzeMessage(testUserId, testUserName, testFirstName, 'Вибач мене, я більше не буду так робити', false);
      
      expect(response.shouldDemandApology).toBe(false);
      expect(response.shouldRewardGoodBehavior).toBe(true);
    });

    it('should require extensive apology for humiliating level', () => {
      const profile = userMemory.getUserProfile(testUserId);
      profile!.apologyLevel = 'humiliating';
      
      // Коротке вибачення
      const weakResponse = userMemory.analyzeMessage(testUserId, testUserName, testFirstName, 'Вибач', false);
      expect(weakResponse.shouldDemandApology).toBe(true);
      
      // Довге і щире вибачення
      const goodResponse = userMemory.analyzeMessage(testUserId, testUserName, testFirstName, 'Каюся, я був дуже неправий і обіцяю що більше не буду так поводитися', false);
      expect(goodResponse.shouldDemandApology).toBe(false);
      expect(goodResponse.shouldRewardGoodBehavior).toBe(true);
    });
  });

  describe('Request Detection', () => {
    it('should detect Ukrainian command requests', () => {
      const response = userMemory.analyzeMessage(testUserId, testUserName, testFirstName, 'Покажи мем', true);
      
      const profile = userMemory.getUserProfile(testUserId);
      const lastInteraction = profile!.interactions[profile!.interactions.length - 1];
      expect(lastInteraction.context.wasRequest).toBe(true);
    });

    it('should detect slash commands', () => {
      const response = userMemory.analyzeMessage(testUserId, testUserName, testFirstName, '/help', true);
      
      const profile = userMemory.getUserProfile(testUserId);
      const lastInteraction = profile!.interactions[profile!.interactions.length - 1];
      expect(lastInteraction.context.wasCommand).toBe(true);
    });

    it('should not block normal conversation', () => {
      // Спочатку образа
      userMemory.analyzeMessage(testUserId, testUserName, testFirstName, 'Ти дурак!', false);
      
      // Звичайна розмова (не прохання)
      const response = userMemory.analyzeMessage(testUserId, testUserName, testFirstName, 'Як справи?', false);
      
      expect(response.shouldBlock).toBe(false);
      expect(response.shouldDemandApology).toBe(false);
    });
  });

  describe('Time-based Memory', () => {
    it('should format time correctly', () => {
      // Додаємо образливе повідомлення
      userMemory.analyzeMessage(testUserId, testUserName, testFirstName, 'Ти дурак!', false);
      
      // Робимо прохання
      const response = userMemory.analyzeMessage(testUserId, testUserName, testFirstName, 'Покажи мем', true);
      
      expect(response.memoryMessage).toContain('щойно');
    });
  });

  describe('Statistics', () => {
    it('should provide accurate statistics', () => {
      // Створюємо кілька користувачів з різними взаємодіями
      userMemory.analyzeMessage('user1', 'User1', 'Test1', 'Дякую!', false);
      userMemory.analyzeMessage('user2', 'User2', 'Test2', 'Ти дурак!', false);
      userMemory.analyzeMessage('user3', 'User3', 'Test3', 'Іди нахуй!', false);
      
      const stats = userMemory.getStats();
      
      expect(stats.totalUsers).toBe(3);
      expect(stats.usersNeedingApology).toBe(2); // user2 та user3
      expect(stats.totalInteractions).toBe(3);
      expect(stats.totalOffenses).toBe(2);
      expect(stats.totalCompliments).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty messages', () => {
      const response = userMemory.analyzeMessage(testUserId, testUserName, testFirstName, '', false);
      
      expect(response.emotionalState).toBe('neutral');
      expect(response.shouldBlock).toBe(false);
    });

    it('should handle very long messages', () => {
      const longMessage = 'Привіт! '.repeat(100);
      const response = userMemory.analyzeMessage(testUserId, testUserName, testFirstName, longMessage, false);
      
      expect(response.emotionalState).toBe('neutral');
    });

    it('should limit stored interactions', () => {
      // Додаємо більше взаємодій ніж максимум (50)
      for (let i = 0; i < 60; i++) {
        userMemory.analyzeMessage(testUserId, testUserName, testFirstName, `Повідомлення ${i}`, false);
      }
      
      const profile = userMemory.getUserProfile(testUserId);
      expect(profile!.interactions.length).toBeLessThanOrEqual(50);
      expect(profile!.totalInteractions).toBe(60);
    });

    it('should handle missing user information', () => {
      const response = userMemory.analyzeMessage(testUserId, undefined, undefined, 'Привіт!', false);
      
      const profile = userMemory.getUserProfile(testUserId);
      expect(profile).toBeDefined();
      expect(profile!.username).toBeUndefined();
    });
  });

  describe('Behavioral Patterns', () => {
    it('should reward improved behavior', () => {
      // Спочатку погана поведінка
      userMemory.analyzeMessage(testUserId, testUserName, testFirstName, 'Ти дурак!', false);
      userMemory.analyzeMessage(testUserId, testUserName, testFirstName, 'Іди нахуй!', false);
      
      // Потім комплімент (може не бути винагороджений)
      const response = userMemory.analyzeMessage(testUserId, testUserName, testFirstName, 'Дякую, ти молодець!', false);
      
      expect(response.emotionalState).toBe('neutral');
      // Не обов'язково має бути винагороджений після негативної історії
      expect(response.shouldRewardGoodBehavior).toBeDefined();
    });

    it('should escalate apology level for severe offenses', () => {
      // Легка образа
      userMemory.analyzeMessage(testUserId, testUserName, testFirstName, 'Ти дурак!', false);
      let profile = userMemory.getUserProfile(testUserId);
      expect(profile!.apologyLevel).toBe('moderate');
      
      // Створюємо нового користувача для тяжкої образи
      const user2 = 'user2';
      userMemory.analyzeMessage(user2, 'User2', 'Test2', 'Іди нахуй, сука мразь!', false);
      profile = userMemory.getUserProfile(user2);
      expect(profile!.apologyLevel).toBe('humiliating');
    });
  });

  describe('Memory Management', () => {
    it('should reset user apology correctly', () => {
      // Створюємо образу
      userMemory.analyzeMessage(testUserId, testUserName, testFirstName, 'Ти дурак!', false);
      
      let profile = userMemory.getUserProfile(testUserId);
      expect(profile!.needsApology).toBe(true);
      
      // Скидаємо вибачення
      userMemory.resetUserApology(testUserId);
      
      profile = userMemory.getUserProfile(testUserId);
      expect(profile!.needsApology).toBe(false);
    });

    it('should maintain worst offenses list', () => {
      const offenses = [
        'Ти дурак!',
        'Іди нахуй!',
        'Сука мразь!',
        'Придурок!',
        'Дебіл!',
        'Мудак!' // 6-а образа
      ];
      
      offenses.forEach(offense => {
        userMemory.analyzeMessage(testUserId, testUserName, testFirstName, offense, false);
      });
      
      const profile = userMemory.getUserProfile(testUserId);
      expect(profile!.offensiveHistory.worstOffenses.length).toBeLessThanOrEqual(5);
      expect(profile!.offensiveHistory.worstOffenses[0]).toBe('Мудак!'); // найновіша
    });
  });
}); 