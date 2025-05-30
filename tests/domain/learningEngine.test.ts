import { LearningEngine, BotReaction, UserFeedback, MessagePattern } from '../../src/domain/learningEngine';
import { createMockUser, createMockMessage } from '../setup';

describe('LearningEngine', () => {
  let learningEngine: LearningEngine;

  beforeEach(() => {
    learningEngine = new LearningEngine();
  });

  describe('predictBestReaction', () => {
    it('should provide fallback reaction for new patterns', async () => {
      const result = await learningEngine.predictBestReaction(
        'Все супер мотивація!',
        'overly_positive',
        ['супер', 'мотивація'],
        'user123',
        'chat456'
      );

      expect(result.recommendedType).toBe('sarcastic');
      expect(result.confidence).toBeLessThan(0.5);
      expect(result.reasoning).toContain('default logic');
    });

    it('should recommend supportive reaction for negative sentiment', async () => {
      const result = await learningEngine.predictBestReaction(
        'Мені сумно сьогодні',
        'negative',
        ['сумно'],
        'user123',
        'chat456'
      );

      expect(result.recommendedType).toBe('supportive');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should personalize recommendations based on user preferences', async () => {
      // First, train the engine with user preferences
      const botReaction: BotReaction = {
        type: 'emoji',
        content: '😂',
        reasoning: 'sarcastic reaction',
        confidence: 0.8,
        timestamp: new Date()
      };

      const patternId = learningEngine.recordBotReaction(
        'Супер день!',
        'overly_positive',
        ['супер'],
        'user123',
        'chat456',
        botReaction
      );

      // User likes sarcastic reactions
      learningEngine.recordUserFeedback(patternId, 'user123', 'reaction', '👍');

      // Now test if it remembers this preference
      const result = await learningEngine.predictBestReaction(
        'Все чудово!',
        'overly_positive',
        ['чудово'],
        'user123',
        'chat456'
      );

      expect(result.recommendedType).toBe('sarcastic');
    });
  });

  describe('recordBotReaction', () => {
    it('should create a new message pattern with bot reaction', () => {
      const botReaction: BotReaction = {
        type: 'emoji',
        content: '😂',
        reasoning: 'sarcastic reaction to overly positive message',
        confidence: 0.7,
        timestamp: new Date()
      };

      const patternId = learningEngine.recordBotReaction(
        'Я найкращий у світі!',
        'overly_positive',
        ['найкращий'],
        'user123',
        'chat456',
        botReaction
      );

      expect(patternId).toBeDefined();
      expect(typeof patternId).toBe('string');
    });

    it('should maintain maximum pattern count', () => {
      const botReaction: BotReaction = {
        type: 'emoji',
        content: '👍',
        reasoning: 'test reaction',
        confidence: 0.5,
        timestamp: new Date()
      };

      // Add more than the maximum patterns (101 patterns, max is 100)
      for (let i = 0; i < 101; i++) {
        learningEngine.recordBotReaction(
          `Test message ${i}`,
          'neutral',
          ['test'],
          'user123',
          'chat456',
          botReaction
        );
      }

      const stats = learningEngine.getStats();
      expect(stats.recentPatterns).toBeLessThanOrEqual(100);
    });
  });

  describe('recordUserFeedback', () => {
    let patternId: string;

    beforeEach(() => {
      const botReaction: BotReaction = {
        type: 'emoji',
        content: '😂',
        reasoning: 'sarcastic reaction',
        confidence: 0.8,
        timestamp: new Date()
      };

      patternId = learningEngine.recordBotReaction(
        'Супер мотивація!',
        'overly_positive',
        ['супер', 'мотивація'],
        'user123',
        'chat456',
        botReaction
      );
    });

    it('should record positive feedback and update learning', () => {
      learningEngine.recordUserFeedback(patternId, 'user123', 'reaction', '👍');
      
      const stats = learningEngine.getStats();
      expect(stats.totalAssociations).toBeGreaterThan(0);
    });

    it('should record negative feedback and adjust learning', () => {
      learningEngine.recordUserFeedback(patternId, 'user123', 'reaction', '👎');
      
      const stats = learningEngine.getStats();
      expect(stats.totalAssociations).toBeGreaterThan(0);
    });

    it('should ignore feedback for unknown patterns', () => {
      const initialStats = learningEngine.getStats();
      
      learningEngine.recordUserFeedback('unknown-pattern', 'user123', 'reaction', '👍');
      
      const finalStats = learningEngine.getStats();
      expect(finalStats.totalAssociations).toBe(initialStats.totalAssociations);
    });

    it('should update user preferences over time', async () => {
      // Record multiple positive feedbacks for sarcastic reactions
      for (let i = 0; i < 5; i++) {
        const botReaction: BotReaction = {
          type: 'emoji',
          content: '😂',
          reasoning: 'sarcastic reaction',
          confidence: 0.8,
          timestamp: new Date()
        };

        const id = learningEngine.recordBotReaction(
          `Супер повідомлення ${i}!`,
          'overly_positive',
          ['супер'],
          'user123',
          'chat456',
          botReaction
        );

        learningEngine.recordUserFeedback(id, 'user123', 'reaction', '👍');
      }

             // User should now prefer sarcastic reactions
       const result = await learningEngine.predictBestReaction(
         'Все чудово!',
         'overly_positive',
         ['чудово'],
         'user123',
         'chat456'
       );

       expect(result.recommendedType).toBe('sarcastic');
    });
  });

  describe('Learning Association Updates', () => {
    it('should increase confidence with more positive samples', async () => {
      const botReaction: BotReaction = {
        type: 'emoji',
        content: '😂',
        reasoning: 'sarcastic reaction',
        confidence: 0.8,
        timestamp: new Date()
      };

      // Record multiple successful sarcastic reactions
      for (let i = 0; i < 10; i++) {
        const patternId = learningEngine.recordBotReaction(
          'Супер день!',
          'overly_positive',
          ['супер'],
          'user123',
          'chat456',
          botReaction
        );

        learningEngine.recordUserFeedback(patternId, 'user123', 'reaction', '👍');
      }

             const result = await learningEngine.predictBestReaction(
         'Супер настрій!',
         'overly_positive',
         ['супер'],
         'user123',
         'chat456'
       );

       expect(result.confidence).toBeGreaterThan(0.5);
       expect(result.reasoning).toContain('similar patterns');
    });

    it('should decrease confidence with negative feedback', async () => {
      const botReaction: BotReaction = {
        type: 'emoji',
        content: '😂',
        reasoning: 'sarcastic reaction',
        confidence: 0.8,
        timestamp: new Date()
      };

      // Record multiple failed sarcastic reactions
      for (let i = 0; i < 5; i++) {
        const patternId = learningEngine.recordBotReaction(
          'Супер день!',
          'overly_positive',
          ['супер'],
          'user123',
          'chat456',
          botReaction
        );

        learningEngine.recordUserFeedback(patternId, 'user123', 'ignore');
      }

             const result = await learningEngine.predictBestReaction(
         'Супер настрій!',
         'overly_positive',
         ['супер'],
         'user123',
         'chat456'
       );

       expect(result.confidence).toBeLessThan(0.5);
    });
  });

  describe('User Profile Management', () => {
    it('should create new user profile on first interaction', async () => {
      await learningEngine.predictBestReaction(
        'Привіт!',
        'neutral',
        ['привіт'],
        'newuser456',
        'chat456'
      );

      const stats = learningEngine.getStats();
      expect(stats.totalUsers).toBeGreaterThan(0);
    });

    it('should maintain separate profiles for different users', () => {
      const botReaction: BotReaction = {
        type: 'emoji',
        content: '😂',
        reasoning: 'sarcastic reaction',
        confidence: 0.8,
        timestamp: new Date()
      };

      // User1 likes sarcasm
      const pattern1 = learningEngine.recordBotReaction(
        'Супер!',
        'overly_positive',
        ['супер'],
        'user1',
        'chat456',
        botReaction
      );
      learningEngine.recordUserFeedback(pattern1, 'user1', 'reaction', '👍');

      // User2 doesn't like sarcasm
      const pattern2 = learningEngine.recordBotReaction(
        'Супер!',
        'overly_positive',
        ['супер'],
        'user2',
        'chat456',
        botReaction
      );
      learningEngine.recordUserFeedback(pattern2, 'user2', 'ignore');

      // Should maintain different preferences
      const stats = learningEngine.getStats();
      expect(stats.totalUsers).toBe(2);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      const stats = learningEngine.getStats();

      expect(stats).toHaveProperty('totalAssociations');
      expect(stats).toHaveProperty('totalUsers');
      expect(stats).toHaveProperty('recentPatterns');
      expect(stats).toHaveProperty('avgConfidence');

      expect(typeof stats.totalAssociations).toBe('number');
      expect(typeof stats.totalUsers).toBe('number');
      expect(typeof stats.recentPatterns).toBe('number');
      expect(typeof stats.avgConfidence).toBe('number');
    });

    it('should handle empty statistics gracefully', () => {
      const stats = learningEngine.getStats();

      expect(stats.totalAssociations).toBe(0);
      expect(stats.totalUsers).toBe(0);
      expect(stats.recentPatterns).toBe(0);
      expect(stats.avgConfidence).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty keywords array', async () => {
      const result = await learningEngine.predictBestReaction(
        'Test',
        'neutral',
        [],
        'user123',
        'chat456'
      );

      expect(result).toBeDefined();
      expect(result.recommendedType).toBe('neutral');
    });

    it('should handle very long messages', async () => {
      const longMessage = 'a'.repeat(1000);
      
      const result = await learningEngine.predictBestReaction(
        longMessage,
        'neutral',
        ['a'],
        'user123',
        'chat456'
      );

      expect(result).toBeDefined();
    });

    it('should handle special characters in content', () => {
      const botReaction: BotReaction = {
        type: 'emoji',
        content: '😂',
        reasoning: 'test',
        confidence: 0.5,
        timestamp: new Date()
      };

      const patternId = learningEngine.recordBotReaction(
        'Тест 123 !@#$%^&*()',
        'neutral',
        ['тест'],
        'user123',
        'chat456',
        botReaction
      );

      expect(patternId).toBeDefined();
    });
  });
}); 