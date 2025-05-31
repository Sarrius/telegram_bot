import { analyzeMessage } from '../domain/messageAnalyzer';
import { LearningEngine } from '../domain/learningEngine';
import { ReactionSelector, ReactionContext, ReactionChoice } from './reactionSelector';
import { FuzzyMatcher } from '../config/vocabulary/fuzzy-matcher';
import { EmotionalAnalyzer, EmotionalProfile } from '../domain/emotionalAnalyzer';
import { ukrainianVocabulary } from '../config/vocabulary/ukrainian';
import { emojiReactions, mentionReplies } from '../config/emoji.config';

export interface MessageContext {
  text: string;
  userId: string;
  chatId: string;
  userName?: string;
  isGroupChat?: boolean;
  messageId?: number;
  isReplyToBot?: boolean;
  mentionsBot?: boolean;
}

export interface BotResponse {
  shouldReact: boolean;
  reaction?: string;
  shouldReply: boolean;
  reply?: string;
  confidence: number;
  reasoning: string;
  learningPatternId?: string;
  emotionalProfile?: EmotionalProfile;  // Added emotional analysis details
}

export class MessageHandler {
  private learningEngine: LearningEngine;
  private vocabularyMatcher: FuzzyMatcher;
  private reactionSelector: ReactionSelector;
  private emotionalAnalyzer: EmotionalAnalyzer;
  private reactionCooldown: Map<string, number> = new Map(); // chatId -> lastReactionTime
  private readonly cooldownMs = 30000; // 30 seconds between reactions

  constructor() {
    this.learningEngine = new LearningEngine();
    this.vocabularyMatcher = new FuzzyMatcher(ukrainianVocabulary);
    this.reactionSelector = new ReactionSelector(this.learningEngine, this.vocabularyMatcher);
    this.emotionalAnalyzer = new EmotionalAnalyzer(this.vocabularyMatcher);
  }

  /**
   * Main message handling logic with emotional intelligence and learning integration
   */
  async handleMessage(context: MessageContext): Promise<BotResponse> {
    console.log(`📨 Processing message: "${context.text}" from user ${context.userId}`);

    // Safety check for null/undefined text
    if (!context.text || typeof context.text !== 'string') {
      return {
        shouldReact: false,
        shouldReply: false,
        confidence: 0,
        reasoning: 'No valid text content to analyze',
        emotionalProfile: undefined
      };
    }

    // Analyze message sentiment and extract keywords for emotional analysis
    const analysis = analyzeMessage(context.text);
    const dominantCategory = this.vocabularyMatcher.getDominantCategory(context.text);
    
    // Use EmotionalAnalyzer to determine if we should react
    const emotionalProfile = this.emotionalAnalyzer.analyzeEmotionalProfile(
      context.text,
      dominantCategory?.category || 'neutral',
      dominantCategory?.matches.map(m => m.word) || [],
      context.chatId,
      context.userId
    );

    console.log(`🧠 Emotional Analysis: ${emotionalProfile.dominantEmotion} (intensity: ${(emotionalProfile.intensity * 100).toFixed(1)}%, confidence: ${(emotionalProfile.confidenceScore * 100).toFixed(1)}%)`);
    console.log(`🎯 Decision: ${emotionalProfile.shouldReact ? 'Will react' : 'Will not react'} - ${emotionalProfile.reasoning}`);

    // If emotional analyzer says don't react, respect that decision
    if (!emotionalProfile.shouldReact) {
      return {
        shouldReact: false,
        shouldReply: false,
        confidence: emotionalProfile.confidenceScore,
        reasoning: emotionalProfile.reasoning,
        emotionalProfile
      };
    }

    // Create reaction context for learning system
    const reactionContext: ReactionContext = {
      messageContent: context.text,
      sentiment: emotionalProfile.dominantEmotion,
      keywords: emotionalProfile.emotionalWords,
      intensity: this.mapIntensityToString(emotionalProfile.intensity),
      userId: context.userId,
      chatId: context.chatId,
      userName: context.userName,
      isGroupChat: context.isGroupChat || false
    };

    // Get intelligent reaction recommendation
    const reactionChoice = await this.reactionSelector.selectReaction(reactionContext);

    // Handle different reaction types
    let response: BotResponse;

    if (reactionChoice.type === 'ignore') {
      response = {
        shouldReact: false,
        shouldReply: false,
        confidence: reactionChoice.confidence,
        reasoning: reactionChoice.reasoning,
        learningPatternId: reactionChoice.learningPatternId,
        emotionalProfile
      };
    } else if (reactionChoice.type === 'emoji') {
      response = {
        shouldReact: true,
        reaction: reactionChoice.content,
        shouldReply: false,
        confidence: reactionChoice.confidence,
        reasoning: reactionChoice.reasoning,
        learningPatternId: reactionChoice.learningPatternId,
        emotionalProfile
      };
    } else if (reactionChoice.type === 'reply') {
      response = {
        shouldReact: false,
        shouldReply: true,
        reply: reactionChoice.content,
        confidence: reactionChoice.confidence,
        reasoning: reactionChoice.reasoning,
        learningPatternId: reactionChoice.learningPatternId,
        emotionalProfile
      };
    } else {
      // Fallback to old logic
      response = this.getFallbackResponse(analysis, context, emotionalProfile);
    }

    console.log(`🎯 Decision: ${response.shouldReact ? 'React' : 'No reaction'} ${response.shouldReply ? 'Reply' : 'No reply'} (${(response.confidence * 100).toFixed(1)}%)`);
    return response;
  }

  /**
   * Record user feedback when they react to bot's messages
   */
  async recordUserFeedback(
    learningPatternId: string,
    userId: string,
    feedbackType: 'reaction' | 'reply' | 'ignore',
    content?: string
  ) {
    await this.reactionSelector.recordUserFeedback(learningPatternId, userId, feedbackType, content);
  }

  /**
   * Legacy methods for backward compatibility
   */
  getReaction(text: string): string {
    const key = analyzeMessage(text);
    const emojis = emojiReactions[key] || emojiReactions['default'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  }

  getReply(text: string): string {
    const key = analyzeMessage(text);
    const replies = mentionReplies[key] || mentionReplies['default'];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  /**
   * Get statistics for debugging and monitoring
   */
  getStats() {
    return {
      vocabulary: this.vocabularyMatcher.getStats(),
      reactions: this.reactionSelector.getStats(),
      emotional: this.emotionalAnalyzer.getStats(),
      cooldowns: {
        active: this.reactionCooldown.size,
        cooldownMs: this.cooldownMs
      }
    };
  }

  /**
   * Update emotional analysis thresholds (for learning/adaptation)
   */
  updateEmotionalThresholds(newThresholds: Partial<import('../domain/emotionalAnalyzer').EmotionalThresholds>) {
    this.emotionalAnalyzer.updateThresholds(newThresholds);
  }

  /**
   * Clear all cooldowns (for testing or manual override)
   */
  clearCooldowns() {
    this.reactionCooldown.clear();
    this.emotionalAnalyzer.clearCooldowns();
  }

  // Private helper methods

  private isInCooldown(chatId: string): boolean {
    const lastReaction = this.reactionCooldown.get(chatId);
    if (!lastReaction) return false;
    
    return Date.now() - lastReaction < this.cooldownMs;
  }

  private setCooldown(chatId: string) {
    this.reactionCooldown.set(chatId, Date.now());
    
    // Clean up old cooldowns
    setTimeout(() => {
      this.reactionCooldown.delete(chatId);
    }, this.cooldownMs);
  }

  private calculateIntensity(dominantCategory: { 
    category: string; 
    confidence: number; 
    matches: any[]; 
    totalIntensity: number; 
  }): 'low' | 'medium' | 'high' {
    // Calculate based on number of matches and their intensities
    const avgIntensity = dominantCategory.totalIntensity / dominantCategory.matches.length;
    
    if (avgIntensity >= 2.5) return 'high';    // high intensity words
    if (avgIntensity >= 1.5) return 'medium';  // medium intensity words
    return 'low';                              // low intensity words
  }

  private mapIntensityToString(intensity: number): 'low' | 'medium' | 'high' {
    // Convert emotional analyzer's 0-1 intensity scale to string categories
    if (intensity >= 0.7) return 'high';
    if (intensity >= 0.4) return 'medium';
    return 'low';
  }

  private getFallbackResponse(analysis: string, context: MessageContext, emotionalProfile?: EmotionalProfile): BotResponse {
    // Fallback to old emoji logic if learning system fails
    const shouldReact = Math.random() > 0.7; // 30% chance
    
    if (shouldReact) {
      return {
        shouldReact: true,
        reaction: this.getReaction(context.text),
        shouldReply: false,
        confidence: 0.3,
        reasoning: 'Fallback to legacy emoji selection',
        emotionalProfile
      };
    }

    return {
      shouldReact: false,
      shouldReply: false,
      confidence: 0.1,
      reasoning: 'Fallback: no reaction'
    };
  }
}

// Export instances for backward compatibility
const messageHandler = new MessageHandler();

export function getReaction(text: string): string {
  return messageHandler.getReaction(text);
}

export function getReply(text: string): string {
  return messageHandler.getReply(text);
}

export { messageHandler }; 