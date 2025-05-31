import { ReactionSelector, ReactionContext } from '../../src/usecases/reactionSelector';
import { LearningEngine, BotReaction } from '../../src/domain/learningEngine';
import { FuzzyMatcher } from '../../src/config/vocabulary/fuzzy-matcher';
import { ukrainianVocabulary } from '../../src/config/vocabulary/ukrainian';

// Mock LearningEngine for controlled testing
jest.mock('../../src/domain/learningEngine');

describe('ReactionSelector', () => {
  let reactionSelector: ReactionSelector;
  let mockLearningEngine: jest.Mocked<LearningEngine>;
  let fuzzyMatcher: FuzzyMatcher;

  const createTestContext = (overrides: Partial<ReactionContext> = {}): ReactionContext => ({
    messageContent: 'Супер мотивація!',
    sentiment: 'overly_positive',
    keywords: ['супер', 'мотивація'],
    intensity: 'high',
    userId: 'user123',
    chatId: 'chat456',
    userName: 'TestUser',
    isGroupChat: true,
    ...overrides
  });

  beforeEach(() => {
    // Create real fuzzy matcher
    fuzzyMatcher = new FuzzyMatcher(ukrainianVocabulary);
    
    // Mock learning engine
    mockLearningEngine = {
      predictBestReaction: jest.fn(),
      recordBotReaction: jest.fn(),
      recordUserFeedback: jest.fn(),
      getStats: jest.fn()
    } as any;

    reactionSelector = new ReactionSelector(mockLearningEngine, fuzzyMatcher);
  });

  describe('selectReaction', () => {

    it('should select sarcastic reaction for overly positive content', async () => {
      // Mock learning engine to recommend sarcastic reaction
      mockLearningEngine.predictBestReaction.mockResolvedValue({
        recommendedType: 'sarcastic',
        confidence: 0.8,
        reasoning: 'User prefers sarcastic reactions',
        alternatives: []
      });

      mockLearningEngine.recordBotReaction.mockReturnValue('pattern-123');

      const context = createTestContext();
      const result = await reactionSelector.selectReaction(context);

      expect(result.type).toBe('emoji');
      expect(['😂', '🙄', '😏', '🤭', '😅']).toContain(result.content);
      expect(result.reasoning).toContain('Sarcastic reaction');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.learningPatternId).toBe('pattern-123');
    });

    it('should select supportive reaction for negative content', async () => {
      mockLearningEngine.predictBestReaction.mockResolvedValue({
        recommendedType: 'supportive',
        confidence: 0.9,
        reasoning: 'User needs support',
        alternatives: []
      });

      mockLearningEngine.recordBotReaction.mockReturnValue('pattern-456');

      const context = createTestContext({
        messageContent: 'Мені дуже сумно',
        sentiment: 'negative',
        keywords: ['сумно'],
        intensity: 'high'
      });

      const result = await reactionSelector.selectReaction(context);

      expect(result.type).toBe('emoji');
      expect(['🫂', '❤️', '💪', '🌟', '✨']).toContain(result.content);
      expect(result.reasoning).toContain('Supportive reaction');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should ignore message when recommended', async () => {
      mockLearningEngine.predictBestReaction.mockResolvedValue({
        recommendedType: 'ignore',
        confidence: 0.7,
        reasoning: 'User ignores these messages',
        alternatives: []
      });

      mockLearningEngine.recordBotReaction.mockReturnValue('pattern-789');

      const context = createTestContext();
      const result = await reactionSelector.selectReaction(context);

      expect(result.type).toBe('ignore');
      expect(result.content).toBe('');
      expect(result.reasoning).toContain('Ignoring');
    });

    it('should select neutral reaction as fallback', async () => {
      mockLearningEngine.predictBestReaction.mockResolvedValue({
        recommendedType: 'neutral',
        confidence: 0.3,
        reasoning: 'No strong pattern found',
        alternatives: []
      });

      mockLearningEngine.recordBotReaction.mockReturnValue('pattern-999');

      const context = createTestContext({
        sentiment: 'neutral',
        intensity: 'low'
      });

      const result = await reactionSelector.selectReaction(context);

      expect(result.type).toBe('emoji');
      expect(['👍', '👌', '🤝', '😊', '🙂']).toContain(result.content);
      expect(result.reasoning).toContain('Neutral reaction');
    });

    it('should adjust confidence based on intensity', async () => {
      mockLearningEngine.predictBestReaction.mockResolvedValue({
        recommendedType: 'sarcastic',
        confidence: 0.8,
        reasoning: 'Test',
        alternatives: []
      });

      mockLearningEngine.recordBotReaction.mockReturnValue('pattern-high');

      // Test high intensity
      const highContext = createTestContext({ intensity: 'high' });
      const highResult = await reactionSelector.selectReaction(highContext);

      // Test low intensity
      const lowContext = createTestContext({ intensity: 'low' });
      const lowResult = await reactionSelector.selectReaction(lowContext);

      expect(highResult.confidence).toBeGreaterThan(lowResult.confidence);
    });

    it('should record bot reaction for learning', async () => {
      mockLearningEngine.predictBestReaction.mockResolvedValue({
        recommendedType: 'sarcastic',
        confidence: 0.8,
        reasoning: 'Test reaction',
        alternatives: []
      });

      mockLearningEngine.recordBotReaction.mockReturnValue('learning-pattern-123');

      const context = createTestContext();
      await reactionSelector.selectReaction(context);

      expect(mockLearningEngine.recordBotReaction).toHaveBeenCalledWith(
        context.messageContent,
        context.sentiment,
        context.keywords,
        context.userId,
        context.chatId,
        expect.objectContaining({
          type: 'emoji',
          content: expect.any(String),
          reasoning: expect.any(String),
          confidence: expect.any(Number),
          timestamp: expect.any(Date)
        })
      );
    });
  });

  describe('Emoji Selection Logic', () => {
    it('should select most sarcastic emoji for high intensity overly positive', async () => {
      mockLearningEngine.predictBestReaction.mockResolvedValue({
        recommendedType: 'sarcastic',
        confidence: 0.8,
        reasoning: 'High intensity sarcasm',
        alternatives: []
      });

      mockLearningEngine.recordBotReaction.mockReturnValue('pattern-1');

      const context: ReactionContext = {
        messageContent: 'Я НАЙКРАЩИЙ У ВСЬОМУ СВІТІ!!!',
        sentiment: 'overly_positive',
        keywords: ['найкращий'],
        intensity: 'high',
        userId: 'user123',
        chatId: 'chat456',
        isGroupChat: true
      };

      const result = await reactionSelector.selectReaction(context);

      expect(result.content).toBe('😂'); // First (most sarcastic) emoji for high intensity
    });

    it('should select mild sarcastic emoji for low intensity', async () => {
      mockLearningEngine.predictBestReaction.mockResolvedValue({
        recommendedType: 'sarcastic',
        confidence: 0.8,
        reasoning: 'Mild sarcasm',
        alternatives: []
      });

      mockLearningEngine.recordBotReaction.mockReturnValue('pattern-2');

      const context: ReactionContext = {
        messageContent: 'добре',
        sentiment: 'overly_positive',
        keywords: ['добре'],
        intensity: 'low',
        userId: 'user123',
        chatId: 'chat456',
        isGroupChat: true
      };

      const result = await reactionSelector.selectReaction(context);

      expect(result.content).toBe('🙃'); // Third (mildest) emoji for low intensity
    });

    it('should select most supportive emoji for high intensity negative', async () => {
      mockLearningEngine.predictBestReaction.mockResolvedValue({
        recommendedType: 'supportive',
        confidence: 0.9,
        reasoning: 'Strong support needed',
        alternatives: []
      });

      mockLearningEngine.recordBotReaction.mockReturnValue('pattern-3');

      const context: ReactionContext = {
        messageContent: 'Мені жахливо погано, не можу більше',
        sentiment: 'negative',
        keywords: ['жахливо', 'погано'],
        intensity: 'high',
        userId: 'user123',
        chatId: 'chat456',
        isGroupChat: true
      };

      const result = await reactionSelector.selectReaction(context);

      expect(result.content).toBe('🫂'); // Most supportive (hug) for high intensity
    });
  });

  describe('recordUserFeedback', () => {
    it('should record positive user feedback', async () => {
      const patternId = 'test-pattern-123';
      const userId = 'user456';

      await reactionSelector.recordUserFeedback(patternId, userId, 'reaction', '👍');

      expect(mockLearningEngine.recordUserFeedback).toHaveBeenCalledWith(
        patternId,
        userId,
        'reaction',
        '👍'
      );
    });

    it('should record negative user feedback', async () => {
      const patternId = 'test-pattern-456';
      const userId = 'user789';

      await reactionSelector.recordUserFeedback(patternId, userId, 'ignore');

      expect(mockLearningEngine.recordUserFeedback).toHaveBeenCalledWith(
        patternId,
        userId,
        'ignore',
        undefined
      );
    });

    it('should record reply feedback', async () => {
      const patternId = 'test-pattern-789';
      const userId = 'user999';
      const replyContent = 'дякую за підтримку';

      await reactionSelector.recordUserFeedback(patternId, userId, 'reply', replyContent);

      expect(mockLearningEngine.recordUserFeedback).toHaveBeenCalledWith(
        patternId,
        userId,
        'reply',
        replyContent
      );
    });
  });

  describe('getStats', () => {
    it('should return comprehensive statistics', () => {
      mockLearningEngine.getStats.mockReturnValue({
        totalAssociations: 50,
        totalUsers: 10,
        recentPatterns: 25,
        avgConfidence: 0.75
      });

      const stats = reactionSelector.getStats();

      expect(stats).toHaveProperty('learning');
      expect(stats).toHaveProperty('emojis');
      
      expect(stats.learning.totalAssociations).toBe(50);
      expect(stats.learning.totalUsers).toBe(10);
      
      expect(stats.emojis.sarcastic).toBeGreaterThan(0);
      expect(stats.emojis.supportive).toBeGreaterThan(0);
      expect(stats.emojis.neutral).toBeGreaterThan(0);
    });
  });

  describe('Integration with Real Learning Engine', () => {
    let realReactionSelector: ReactionSelector;
    let realLearningEngine: LearningEngine;

    beforeEach(() => {
      // Get the actual (non-mocked) LearningEngine
      const { LearningEngine: ActualLearningEngine } = jest.requireActual('../../src/domain/learningEngine');
      realLearningEngine = new ActualLearningEngine();
      realReactionSelector = new ReactionSelector(realLearningEngine, fuzzyMatcher);
    });

    it('should work with real learning engine for new user', async () => {
      const context: ReactionContext = {
        messageContent: 'Супер мотивація сьогодні!',
        sentiment: 'overly_positive',
        keywords: ['супер', 'мотивація'],
        intensity: 'high',
        userId: 'new-user-123',
        chatId: 'chat-789',
        isGroupChat: true
      };

      const result = await realReactionSelector.selectReaction(context);

      expect(result).toBeDefined();
      expect(result.type).toBe('emoji');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.learningPatternId).toBeDefined();
    });

    it('should learn from user feedback', async () => {
      const context: ReactionContext = {
        messageContent: 'Все просто чудово!',
        sentiment: 'overly_positive',
        keywords: ['чудово'],
        intensity: 'medium',
        userId: 'learning-user-456',
        chatId: 'chat-123',
        isGroupChat: true
      };

      // First reaction
      const firstResult = await realReactionSelector.selectReaction(context);
      
      // User gives positive feedback
      await realReactionSelector.recordUserFeedback(
        firstResult.learningPatternId!,
        'learning-user-456',
        'reaction',
        '👍'
      );

      // Second similar reaction should have higher confidence
      const secondResult = await realReactionSelector.selectReaction({
        ...context,
        messageContent: 'Все супер чудово!'
      });

      expect(secondResult.confidence).toBeGreaterThanOrEqual(firstResult.confidence);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined learning pattern ID gracefully', async () => {
      await expect(
        reactionSelector.recordUserFeedback('undefined-pattern', 'user123', 'reaction', '👍')
      ).resolves.not.toThrow();
    });

    it('should handle empty keywords array', async () => {
      mockLearningEngine.predictBestReaction.mockResolvedValue({
        recommendedType: 'neutral',
        confidence: 0.3,
        reasoning: 'Empty keywords',
        alternatives: []
      });

      mockLearningEngine.recordBotReaction.mockReturnValue('empty-keywords');



      const context = createTestContext({
        keywords: [],
        sentiment: 'neutral'
      });

      const result = await reactionSelector.selectReaction(context);

      expect(result).toBeDefined();
      expect(result.type).toBe('emoji');
    });

    it('should handle very long message content', async () => {
      mockLearningEngine.predictBestReaction.mockResolvedValue({
        recommendedType: 'neutral',
        confidence: 0.5,
        reasoning: 'Long message',
        alternatives: []
      });

      mockLearningEngine.recordBotReaction.mockReturnValue('long-message');

      const longMessage = 'супер '.repeat(500);
      const context = createTestContext({
        messageContent: longMessage
      });

      const result = await reactionSelector.selectReaction(context);

      expect(result).toBeDefined();
      expect(mockLearningEngine.recordBotReaction).toHaveBeenCalledWith(
        longMessage,
        expect.any(String),
        expect.any(Array),
        expect.any(String),
        expect.any(String),
        expect.any(Object)
      );
    });

    it('should handle unknown sentiment gracefully', async () => {
      mockLearningEngine.predictBestReaction.mockResolvedValue({
        recommendedType: 'neutral',
        confidence: 0.2,
        reasoning: 'Unknown sentiment',
        alternatives: []
      });

      mockLearningEngine.recordBotReaction.mockReturnValue('unknown-sentiment');

      const context = createTestContext({
        sentiment: 'unknown-sentiment-type' as any
      });

      const result = await reactionSelector.selectReaction(context);

      expect(result).toBeDefined();
      expect(result.type).toBe('emoji');
    });
  });

  describe('Contextual Reply Feature', () => {
    it('should handle reply type reactions', async () => {
      mockLearningEngine.predictBestReaction.mockResolvedValue({
        recommendedType: 'supportive',
        confidence: 0.8,
        reasoning: 'Reply needed',
        alternatives: []
      });

      mockLearningEngine.recordBotReaction.mockReturnValue('reply-pattern');

      // Manually test the private method by extending the class
      const context = createTestContext({
        messageContent: 'Потрібна допомога',
        sentiment: 'negative'
      });

      const result = await reactionSelector.selectReaction(context);

      // Should still select emoji for now (reply feature is placeholder)
      expect(result.type).toBe('emoji');
      expect(result.learningPatternId).toBe('reply-pattern');
    });
  });
}); 