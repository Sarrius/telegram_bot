import { MessageHandler } from '../../src/usecases/handleMessage';
import { LearningEngine } from '../../src/domain/learningEngine';
import { ReactionSelector } from '../../src/usecases/reactionSelector';
import { FuzzyMatcher } from '../../src/config/vocabulary/fuzzy-matcher';
import { ukrainianVocabulary } from '../../src/config/vocabulary/ukrainian';

describe('Learning Workflow Integration', () => {
  let messageHandler: MessageHandler;

  beforeEach(() => {
    messageHandler = new MessageHandler();
  });

  describe('Complete Learning Cycle', () => {
    it('should learn user preferences through feedback cycles', async () => {
      const userId = 'integration-user-123';
      const learningCycles = [
        {
          message: 'Супер мотивація сьогодні!',
          expectedSentiment: 'motivational',
          feedback: '👍' // User likes sarcastic responses
        },
        {
          message: 'Все просто чудово та супер!',
          expectedSentiment: 'positive',
          feedback: '👍' // User continues to like sarcastic responses
        },
        {
          message: 'Неймовірна мотивація зашкалює!',
          expectedSentiment: 'motivational',
          feedback: '❤️' // User loves sarcastic responses
        }
      ];

      let confidenceProgression = [];

      // Execute learning cycles
      for (let i = 0; i < learningCycles.length; i++) {
        const cycle = learningCycles[i];
        
        const response = await messageHandler.handleMessage({
          text: cycle.message,
          userId,
          chatId: `learning-chat-${i}`, // Different chats to avoid cooldown
          isGroupChat: true
        });

        // Record response confidence
        confidenceProgression.push(response.confidence);

        // Simulate user feedback
        if (response.learningPatternId) {
          await messageHandler.recordUserFeedback(
            response.learningPatternId,
            userId,
            'reaction',
            cycle.feedback
          );
        }

        // Verify the bot is reacting to emotional content
        expect(response.shouldReact).toBe(true);
        expect(response.confidence).toBeGreaterThan(0);
      }

      // Test that the bot has learned the user's preferences
      const finalResponse = await messageHandler.handleMessage({
        text: 'Максимальна мотивація та успіх!',
        userId,
        chatId: 'final-test-chat',
        isGroupChat: true
      });

      expect(finalResponse.shouldReact).toBe(true);
      expect(finalResponse.reasoning).toContain('Sarcastic reaction');
      
      // Confidence should generally improve or stay high
      const avgEarlyConfidence = confidenceProgression.slice(0, 2).reduce((a, b) => a + b) / 2;
      const laterConfidence = confidenceProgression[confidenceProgression.length - 1];
      
      // Learning should maintain or improve confidence
      expect(laterConfidence).toBeGreaterThanOrEqual(avgEarlyConfidence * 0.8);
    });

    it('should adapt to negative feedback', async () => {
      const userId = 'negative-feedback-user-456';
      
      // User consistently dislikes sarcastic reactions
      const negativeCycles = [
        'Супер день сьогодні!',
        'Чудова мотивація!', 
        'Все просто супер!'
      ];

      for (let i = 0; i < negativeCycles.length; i++) {
        const response = await messageHandler.handleMessage({
          text: negativeCycles[i],
          userId,
          chatId: `negative-chat-${i}`,
          isGroupChat: true
        });

        if (response.learningPatternId) {
          // User ignores sarcastic reactions
          await messageHandler.recordUserFeedback(
            response.learningPatternId,
            userId,
            'ignore'
          );
        }
      }

      // Test adaptation to negative feedback
      const adaptedResponse = await messageHandler.handleMessage({
        text: 'Знову супер мотивація!',
        userId,
        chatId: 'adapted-chat',
        isGroupChat: true
      });

      // Should still respond but with adapted behavior
      expect(adaptedResponse).toBeDefined();
    });

    it('should handle different users with different preferences', async () => {
      const user1 = 'humor-loving-user';
      const user2 = 'serious-user';

      // User 1 loves sarcastic reactions
      for (let i = 0; i < 3; i++) {
        const response = await messageHandler.handleMessage({
          text: `Супер мотивація ${i}!`,
          userId: user1,
          chatId: `humor-chat-${i}`,
          isGroupChat: true
        });

        if (response.learningPatternId && response.shouldReact) {
          await messageHandler.recordUserFeedback(
            response.learningPatternId,
            user1,
            'reaction',
            '😂' // Loves humor
          );
        }
      }

      // User 2 prefers supportive reactions
      for (let i = 0; i < 3; i++) {
        const response = await messageHandler.handleMessage({
          text: `Мені сумно ${i}`,
          userId: user2,
          chatId: `serious-chat-${i}`,
          isGroupChat: true
        });

        if (response.learningPatternId && response.shouldReact) {
          await messageHandler.recordUserFeedback(
            response.learningPatternId,
            user2,
            'reaction',
            '❤️' // Appreciates support
          );
        }
      }

      // Test personalized responses
      const user1Response = await messageHandler.handleMessage({
        text: 'Все супер!',
        userId: user1,
        chatId: 'user1-test',
        isGroupChat: true
      });

      const user2Response = await messageHandler.handleMessage({
        text: 'Сумний настрій',
        userId: user2,
        chatId: 'user2-test',
        isGroupChat: true
      });

      // Both should get appropriate responses
      expect(user1Response).toBeDefined();
      expect(user2Response).toBeDefined();
    });
  });

  describe('Vocabulary Integration', () => {
    it('should correctly identify Ukrainian emotional content', async () => {
      const testCases = [
        {
          text: 'Неймовірна мотивація та натхнення!',
          expectedCategory: 'motivational'
        },
        {
          text: 'Дуже сумно та депресивно',
          expectedCategory: 'negative'
        },
        {
          text: 'Ти дурний та агресивний',
          expectedCategory: 'aggressive'
        },
        {
          text: 'Супер класно та чудово!',
          expectedCategory: 'positive'
        },
        {
          text: 'лол кек топчик',
          expectedCategory: 'slang'
        }
      ];

      for (const testCase of testCases) {
        const response = await messageHandler.handleMessage({
          text: testCase.text,
          userId: 'vocabulary-test-user',
          chatId: `vocab-${Math.random()}`,
          isGroupChat: true
        });

        if (response.shouldReact) {
          expect(response.confidence).toBeGreaterThan(0);
          expect(response.reasoning).toBeDefined();
        }
      }
    });

    it('should handle spelling mistakes and typos', async () => {
      const typoTests = [
        'мотивацыя', // typo for мотивація
        'успех',     // Russian instead of успіх
        'жахлыво',   // typo for жахливо
        'сымно'      // typo for сумно
      ];

      for (const typo of typoTests) {
        const response = await messageHandler.handleMessage({
          text: `Сьогодні ${typo}`,
          userId: 'typo-test-user',
          chatId: `typo-${Math.random()}`,
          isGroupChat: true
        });

        // Should still recognize and react to misspelled words
        if (response.shouldReact) {
          expect(response.confidence).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('Cooldown System Integration', () => {
    it('should respect cooldowns while maintaining learning', async () => {
      const chatId = 'cooldown-integration-chat';
      const userId = 'cooldown-user';

      // First message should get reaction
      const firstResponse = await messageHandler.handleMessage({
        text: 'Супер мотивація!',
        userId,
        chatId,
        isGroupChat: true
      });

      expect(firstResponse.shouldReact).toBe(true);

      // Record feedback
      if (firstResponse.learningPatternId) {
        await messageHandler.recordUserFeedback(
          firstResponse.learningPatternId,
          userId,
          'reaction',
          '👍'
        );
      }

      // Second message in same chat should be in cooldown
      const secondResponse = await messageHandler.handleMessage({
        text: 'Ще більше мотивації!',
        userId,
        chatId,
        isGroupChat: true
      });

      expect(secondResponse.shouldReact).toBe(false);
      expect(secondResponse.reasoning).toContain('cooldown');

      // But different chat should still work
      const differentChatResponse = await messageHandler.handleMessage({
        text: 'Супер настрій!',
        userId,
        chatId: 'different-chat',
        isGroupChat: true
      });

      expect(differentChatResponse.shouldReact).toBe(true);
    });
  });

  describe('Performance Under Load', () => {
    it('should handle multiple users learning simultaneously', async () => {
      const users = Array.from({ length: 20 }, (_, i) => `load-user-${i}`);
      const messages = [
        'Супер мотивація!',
        'Чудовий день!',
        'Сумний настрій',
        'Все погано',
        'Неймовірно круто!'
      ];

      const promises = users.map(async (userId, userIndex) => {
        const userResults = [];
        
        for (let msgIndex = 0; msgIndex < messages.length; msgIndex++) {
          const response = await messageHandler.handleMessage({
            text: messages[msgIndex],
            userId,
            chatId: `load-chat-${userId}-${msgIndex}`,
            isGroupChat: true
          });

          userResults.push(response);

          // Simulate some feedback
          if (response.learningPatternId && Math.random() > 0.5) {
            await messageHandler.recordUserFeedback(
              response.learningPatternId,
              userId,
              'reaction',
              '👍'
            );
          }
        }

        return userResults;
      });

      const startTime = Date.now();
      const allResults = await Promise.all(promises);
      const endTime = Date.now();

      // Verify all users got responses
      expect(allResults).toHaveLength(20);
      expect(allResults.every(userResults => 
        userResults.every(result => result !== undefined)
      )).toBe(true);

      // Should complete in reasonable time
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds

      // Check learning system stats
      const stats = messageHandler.getStats();
      expect(stats.reactions.learning.totalUsers).toBeGreaterThan(0);
      expect(stats.reactions.learning.totalAssociations).toBeGreaterThan(0);
    });
  });

  describe('Error Recovery', () => {
    it('should handle malformed input gracefully', async () => {
      const malformedInputs = [
        '', // empty
        '   ', // whitespace only
        '!@#$%^&*()', // special chars only
        'a'.repeat(10000), // very long
        '🔥🔥🔥🔥🔥', // emoji only
        null as any, // null
        undefined as any // undefined
      ];

      for (const input of malformedInputs) {
        await expect(messageHandler.handleMessage({
          text: input,
          userId: 'error-test-user',
          chatId: 'error-test-chat',
          isGroupChat: true
        })).resolves.toBeDefined();
      }
    });

    it('should maintain state consistency during errors', async () => {
      const userId = 'consistency-user';
      
      // Normal operation
      const normalResponse = await messageHandler.handleMessage({
        text: 'Супер мотивація!',
        userId,
        chatId: 'consistency-chat-1',
        isGroupChat: true
      });

      expect(normalResponse.shouldReact).toBe(true);

      // Error condition
      await messageHandler.handleMessage({
        text: '',
        userId,
        chatId: 'consistency-chat-2',
        isGroupChat: true
      });

      // Should continue working normally
      const recoveryResponse = await messageHandler.handleMessage({
        text: 'Чудовий день!',
        userId,
        chatId: 'consistency-chat-3',
        isGroupChat: true
      });

      expect(recoveryResponse).toBeDefined();
    });
  });

  describe('Statistics Tracking', () => {
    it('should accurately track learning statistics', async () => {
      const initialStats = messageHandler.getStats();

      // Process several messages with feedback
      for (let i = 0; i < 5; i++) {
        const response = await messageHandler.handleMessage({
          text: `Тестова мотивація ${i}!`,
          userId: `stats-user-${i}`,
          chatId: `stats-chat-${i}`,
          isGroupChat: true
        });

        if (response.learningPatternId) {
          await messageHandler.recordUserFeedback(
            response.learningPatternId,
            `stats-user-${i}`,
            'reaction',
            '👍'
          );
        }
      }

      const finalStats = messageHandler.getStats();

      // Should show increased learning activity
      expect(finalStats.reactions.learning.totalUsers).toBeGreaterThanOrEqual(
        initialStats.reactions.learning.totalUsers
      );
      
      expect(finalStats.reactions.learning.totalAssociations).toBeGreaterThanOrEqual(
        initialStats.reactions.learning.totalAssociations
      );

      // Vocabulary stats should remain consistent
      expect(finalStats.vocabulary.totalWords).toBe(initialStats.vocabulary.totalWords);
    });
  });
}); 