import { LearningEngine, BotReaction } from '../domain/learningEngine';
import { FuzzyMatcher, FuzzyMatchResult } from '../config/vocabulary/fuzzy-matcher';

export interface ReactionChoice {
  type: 'emoji' | 'reply' | 'sticker' | 'ignore';
  content: string;
  reasoning: string;
  confidence: number;
  learningPatternId?: string;
}

export interface ReactionContext {
  messageContent: string;
  sentiment: string;
  keywords: string[];
  intensity: 'low' | 'medium' | 'high';
  userId: string;
  chatId: string;
  userName?: string;
  isGroupChat: boolean;
}

export class ReactionSelector {
  private learningEngine: LearningEngine;
  private vocabularyMatcher: FuzzyMatcher;

  // Emoji mappings for different reaction types
  private sarcasticEmojis = {
    overly_positive: ['😂', '🙄', '😏', '🤭', '😅'],
    motivational: ['🤔', '😏', '🙃', '😂'],
    positive: ['😂', '🤪', '🙃', '😜']
  };

  private supportiveEmojis = {
    negative: ['🫂', '❤️', '💪', '🌟', '✨'],
    aggressive: ['😔', '🫂', '💙', '🕊️'],
    sad: ['🫂', '💙', '😌', '🌈']
  };

  private neutralEmojis = ['👍', '👌', '🤝', '😊', '🙂'];

  constructor(learningEngine: LearningEngine, vocabularyMatcher: FuzzyMatcher) {
    this.learningEngine = learningEngine;
    this.vocabularyMatcher = vocabularyMatcher;
  }

  /**
   * Select the best reaction based on learning and context
   */
  async selectReaction(context: ReactionContext): Promise<ReactionChoice> {
    console.log(`🎯 Selecting reaction for: "${context.messageContent}" (${context.sentiment})`);

    // Get learning-based recommendation
    const prediction = await this.learningEngine.predictBestReaction(
      context.messageContent,
      context.sentiment,
      context.keywords,
      context.userId,
      context.chatId
    );

    // Safety check for prediction
    if (!prediction || !prediction.recommendedType) {
      console.warn('⚠️ Learning engine returned invalid prediction, using fallback');
      return this.createNeutralReaction(context, 0.3);
    }

    console.log(`🧠 Learning prediction: ${prediction.recommendedType} (${(prediction.confidence * 100).toFixed(1)}% confidence)`);

    // Choose reaction based on prediction
    let reaction: ReactionChoice;

    switch (prediction.recommendedType) {
      case 'sarcastic':
        reaction = this.createSarcasticReaction(context, prediction.confidence);
        break;
      case 'supportive':
        reaction = this.createSupportiveReaction(context, prediction.confidence);
        break;
      case 'ignore':
        reaction = this.createIgnoreReaction(context, prediction.confidence);
        break;
      default:
        reaction = this.createNeutralReaction(context, prediction.confidence);
    }

    // Record this reaction for learning
    const botReaction: BotReaction = {
      type: reaction.type,
      content: reaction.content,
      reasoning: reaction.reasoning,
      confidence: reaction.confidence,
      timestamp: new Date()
    };

    const patternId = this.learningEngine.recordBotReaction(
      context.messageContent,
      context.sentiment,
      context.keywords,
      context.userId,
      context.chatId,
      botReaction
    );

    reaction.learningPatternId = patternId;

    console.log(`✅ Selected: ${reaction.type} "${reaction.content}" (${reaction.reasoning})`);
    return reaction;
  }

  /**
   * Create sarcastic reaction for overly positive messages
   */
  private createSarcasticReaction(context: ReactionContext, baseConfidence: number): ReactionChoice {
    const { sentiment, intensity } = context;
    
    // Choose emoji based on sentiment and intensity
    let emojiOptions: string[] = [];
    
    if (sentiment === 'overly_positive' || sentiment === 'motivational') {
      emojiOptions = this.sarcasticEmojis.overly_positive;
    } else if (sentiment === 'positive') {
      emojiOptions = this.sarcasticEmojis.positive;
    } else {
      emojiOptions = ['😏', '🤔', '🙃']; // default sarcastic
    }

    // Select emoji based on intensity
    let selectedEmoji: string;
    if (intensity === 'high') {
      selectedEmoji = emojiOptions[0] || '😂'; // Most sarcastic
    } else if (intensity === 'medium') {
      selectedEmoji = emojiOptions[1] || '😏'; // Moderately sarcastic
    } else {
      selectedEmoji = emojiOptions[2] || '🙃'; // Mildly sarcastic
    }

    return {
      type: 'emoji',
      content: selectedEmoji,
      reasoning: `Sarcastic reaction to ${sentiment} message (intensity: ${intensity})`,
      confidence: baseConfidence * this.getIntensityMultiplier(intensity),
      learningPatternId: undefined
    };
  }

  /**
   * Create supportive reaction for negative messages
   */
  private createSupportiveReaction(context: ReactionContext, baseConfidence: number): ReactionChoice {
    const { sentiment, intensity } = context;
    
    let emojiOptions: string[] = [];
    
    if (sentiment === 'negative' || sentiment === 'sad') {
      emojiOptions = this.supportiveEmojis.negative;
    } else if (sentiment === 'aggressive') {
      emojiOptions = this.supportiveEmojis.aggressive;
    } else {
      emojiOptions = ['💪', '✨', '👍']; // default supportive
    }

    // Select emoji based on intensity of the original negative message
    let selectedEmoji: string;
    if (intensity === 'high') {
      selectedEmoji = emojiOptions[0] || '🫂'; // Most supportive (hug)
    } else if (intensity === 'medium') {
      selectedEmoji = emojiOptions[1] || '💪'; // Encouraging
    } else {
      selectedEmoji = emojiOptions[2] || '👍'; // Simple support
    }

    return {
      type: 'emoji',
      content: selectedEmoji,
      reasoning: `Supportive reaction to ${sentiment} message (intensity: ${intensity})`,
      confidence: baseConfidence * this.getIntensityMultiplier(intensity),
      learningPatternId: undefined
    };
  }

  /**
   * Create neutral reaction
   */
  private createNeutralReaction(context: ReactionContext, baseConfidence: number): ReactionChoice {
    const randomEmoji = this.neutralEmojis[Math.floor(Math.random() * this.neutralEmojis.length)];
    
    return {
      type: 'emoji',
      content: randomEmoji,
      reasoning: `Neutral reaction to ${context.sentiment} message`,
      confidence: baseConfidence * 0.7, // Lower confidence for neutral
      learningPatternId: undefined
    };
  }

  /**
   * Create ignore reaction (no response)
   */
  private createIgnoreReaction(context: ReactionContext, baseConfidence: number): ReactionChoice {
    return {
      type: 'ignore',
      content: '',
      reasoning: `Ignoring ${context.sentiment} message (learned pattern suggests no reaction)`,
      confidence: baseConfidence,
      learningPatternId: undefined
    };
  }

  /**
   * Record user feedback when they react to bot's reaction
   */
  async recordUserFeedback(
    patternId: string,
    userId: string,
    feedbackType: 'reaction' | 'reply' | 'ignore',
    content?: string
  ) {
    this.learningEngine.recordUserFeedback(patternId, userId, feedbackType, content);
    
    console.log(`📝 Recorded feedback: ${feedbackType} from user ${userId} for pattern ${patternId}`);
  }

  /**
   * Get reaction statistics for debugging
   */
  getStats() {
    const learningStats = this.learningEngine.getStats();
    
    return {
      learning: learningStats,
      emojis: {
        sarcastic: Object.values(this.sarcasticEmojis).flat().length,
        supportive: Object.values(this.supportiveEmojis).flat().length,
        neutral: this.neutralEmojis.length
      }
    };
  }

  /**
   * Helper: Get intensity multiplier for confidence
   */
  private getIntensityMultiplier(intensity: 'low' | 'medium' | 'high'): number {
    switch (intensity) {
      case 'high': return 1.2;
      case 'medium': return 1.0;
      case 'low': return 0.8;
    }
  }

  /**
   * Helper: Extract keywords from fuzzy match results
   */
  private extractKeywords(matches: FuzzyMatchResult[]): string[] {
    return matches.map(match => match.word);
  }

  /**
   * Create contextual reply (for future gangster-style responses)
   */
  private createContextualReply(context: ReactionContext, replyType: 'gangster' | 'motivational'): ReactionChoice {
    // Placeholder for future implementation
    const templates = {
      gangster: [
        "Та що ти кажеш... 🤨",
        "Цікаво, цікаво... 🧐",
        "І хто це тут говорить? 😏"
      ],
      motivational: [
        "Все буде добре! 💪",
        "Тримайся! ✨",
        "Ти зможеш! 🌟"
      ]
    };

    const options = templates[replyType] || templates.motivational;
    const selectedReply = options[Math.floor(Math.random() * options.length)];

    return {
      type: 'reply',
      content: selectedReply,
      reasoning: `${replyType} reply to ${context.sentiment} message`,
      confidence: 0.6,
      learningPatternId: undefined
    };
  }
} 