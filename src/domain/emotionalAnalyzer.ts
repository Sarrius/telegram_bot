import { FuzzyMatcher, FuzzyMatchResult } from '../config/vocabulary/fuzzy-matcher';

export interface EmotionalProfile {
  intensity: number;           // 0-1 scale
  clarity: number;            // How clear the emotion is (0-1)
  dominantEmotion: string;    // Primary emotional category
  emotionalWords: string[];   // Words that triggered emotion detection
  confidenceScore: number;    // Overall confidence in analysis
  shouldReact: boolean;       // Whether bot should react to this message
  reasoning: string;          // Why this decision was made
}

export interface EmotionalThresholds {
  minimumIntensity: number;      // 0.3 = minimum to trigger reaction
  minimumClarity: number;        // 0.4 = minimum emotional clarity
  minimumConfidence: number;     // 0.5 = minimum confidence to react
  neutralZone: number;          // 0.2 = anything below is considered neutral
  reactionCooldown: number;     // Milliseconds between reactions
}

export class EmotionalAnalyzer {
  private fuzzyMatcher: FuzzyMatcher;
  private thresholds: EmotionalThresholds;
  private lastReactionTime: Map<string, number> = new Map(); // chatId -> timestamp

  constructor(fuzzyMatcher: FuzzyMatcher, customThresholds: Partial<EmotionalThresholds> = {}) {
    this.fuzzyMatcher = fuzzyMatcher;
    this.thresholds = {
      minimumIntensity: 0.15,     // Lower threshold - was 0.25
      minimumClarity: 0.2,        // Lower threshold - was 0.3  
      minimumConfidence: 0.25,    // Lower threshold - was 0.4
      neutralZone: 0.1,           // Smaller neutral zone - was 0.15
      reactionCooldown: 30000,    // 30 seconds between reactions
      ...customThresholds
    };
  }

  /**
   * Analyze emotional profile of message and decide if bot should react
   */
  analyzeEmotionalProfile(
    messageContent: string, 
    sentiment: string,
    keywords: string[],
    chatId: string,
    userId: string
  ): EmotionalProfile {
    // Find emotional words and their intensities
    const categories = this.fuzzyMatcher.findCategoriesInText(messageContent);
    const dominantCategory = this.fuzzyMatcher.getDominantCategory(messageContent);
    
    if (!dominantCategory) {
      return this.createNeutralProfile(messageContent, 'No emotional content detected');
    }

    // Calculate emotional intensity
    const intensity = this.calculateIntensity(dominantCategory, messageContent);
    
    // Calculate emotional clarity (how distinct the emotion is)
    const clarity = this.calculateClarity(categories, dominantCategory);
    
    // Calculate confidence score
    const confidence = this.calculateConfidence(dominantCategory, intensity, clarity);
    
    // Check cooldown
    const isInCooldown = this.isInCooldown(chatId);
    
    // Determine if should react
    const shouldReact = this.shouldReactToMessage(intensity, clarity, confidence, isInCooldown);
    
    // Generate reasoning
    const reasoning = this.generateReasoning(intensity, clarity, confidence, isInCooldown, shouldReact);

    const profile: EmotionalProfile = {
      intensity,
      clarity,
      dominantEmotion: dominantCategory.category,
      emotionalWords: dominantCategory.matches.map(m => m.word),
      confidenceScore: confidence,
      shouldReact,
      reasoning
    };

    // Update cooldown if we decided to react
    if (shouldReact) {
      this.lastReactionTime.set(chatId, Date.now());
    }

    return profile;
  }

  /**
   * Calculate emotional intensity based on word strength and frequency
   */
  private calculateIntensity(dominantCategory: any, messageContent: string): number {
    let totalIntensity = dominantCategory.totalIntensity;
    const wordCount = dominantCategory.matches.length;
    const messageLength = messageContent.split(/\s+/).length;
    
    // Base intensity from words
    let intensity = Math.min(totalIntensity / 10, 1.0); // Normalize to 0-1
    
    // Boost for multiple emotional words
    if (wordCount > 1) {
      intensity *= (1 + (wordCount - 1) * 0.2); // +20% per additional word
    }
    
    // Boost for emotional density (emotional words / total words)
    const density = wordCount / Math.max(messageLength, 1);
    if (density > 0.3) { // More than 30% emotional words
      intensity *= 1.3;
    }
    
    // Check for intensity markers (caps, exclamation marks, repetition)
    const intensityMarkers = this.detectIntensityMarkers(messageContent);
    intensity *= intensityMarkers;
    
    return Math.min(intensity, 1.0);
  }

  /**
   * Calculate emotional clarity (how distinct and unambiguous the emotion is)
   */
  private calculateClarity(categories: Map<string, FuzzyMatchResult[]>, dominantCategory: any): number {
    const totalCategories = categories.size;
    const dominantMatches = dominantCategory.matches.length;
    const totalMatches = Array.from(categories.values())
      .reduce((sum, matches) => sum + matches.length, 0);
    
    if (totalMatches === 0) return 0;
    
    // Higher clarity if emotion is concentrated in one category
    const dominance = dominantMatches / totalMatches;
    
    // Lower clarity if many competing emotions
    const categoryPenalty = Math.max(0, (totalCategories - 1) * 0.15);
    
    // Clarity score
    let clarity = dominance - categoryPenalty;
    
    // Boost for very confident matches
    const avgConfidence = dominantCategory.matches
      .reduce((sum: number, match: any) => sum + match.confidence, 0) / dominantMatches;
    
    if (avgConfidence > 0.8) {
      clarity *= 1.2;
    }
    
    return Math.max(0, Math.min(clarity, 1.0));
  }

  /**
   * Calculate overall confidence in emotional analysis
   */
  private calculateConfidence(dominantCategory: any, intensity: number, clarity: number): number {
    // Base confidence from fuzzy matching
    const matchConfidence = dominantCategory.confidence;
    
    // Weighted combination
    const confidence = (
      matchConfidence * 0.4 +    // 40% from word matching confidence
      intensity * 0.3 +          // 30% from emotional intensity
      clarity * 0.3              // 30% from emotional clarity
    );
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Detect intensity markers in text (caps, punctuation, repetition)
   */
  private detectIntensityMarkers(text: string): number {
    let multiplier = 1.0;
    
    // Check for ALL CAPS
    const capsRatio = (text.match(/[А-ЯЁІЇЄҐA-Z]/g) || []).length / text.length;
    if (capsRatio > 0.3) {
      multiplier *= 1.3; // +30% for shouting
    }
    
    // Check for exclamation marks
    const exclamations = (text.match(/!/g) || []).length;
    if (exclamations > 0) {
      multiplier *= (1 + exclamations * 0.1); // +10% per exclamation
    }
    
    // Check for repeated characters (cooool, wooow)
    const repeatedChars = text.match(/(.)\1{2,}/g);
    if (repeatedChars && repeatedChars.length > 0) {
      multiplier *= 1.2; // +20% for character repetition
    }
    
    // Check for multiple question marks (???)
    const questionMarks = (text.match(/\?/g) || []).length;
    if (questionMarks > 1) {
      multiplier *= 1.15; // +15% for emphasis
    }
    
    return Math.min(multiplier, 2.0); // Cap at 200%
  }

  /**
   * Check if chat is in cooldown period
   */
  private isInCooldown(chatId: string): boolean {
    const lastReaction = this.lastReactionTime.get(chatId);
    if (!lastReaction) return false;
    
    return (Date.now() - lastReaction) < this.thresholds.reactionCooldown;
  }

  /**
   * Determine if bot should react based on all factors
   */
  private shouldReactToMessage(
    intensity: number, 
    clarity: number, 
    confidence: number, 
    isInCooldown: boolean
  ): boolean {
    // Never react if in cooldown
    if (isInCooldown) return false;
    
    // Never react if in neutral zone
    if (intensity < this.thresholds.neutralZone) return false;
    
    // Check all thresholds
    return (
      intensity >= this.thresholds.minimumIntensity &&
      clarity >= this.thresholds.minimumClarity &&
      confidence >= this.thresholds.minimumConfidence
    );
  }

  /**
   * Generate human-readable reasoning for decision
   */
  private generateReasoning(
    intensity: number,
    clarity: number, 
    confidence: number,
    isInCooldown: boolean,
    shouldReact: boolean
  ): string {
    if (isInCooldown) {
      return `⏰ In cooldown period (${this.thresholds.reactionCooldown/1000}s between reactions)`;
    }
    
    if (intensity < this.thresholds.neutralZone) {
      return `😐 Message is emotionally neutral (intensity: ${(intensity*100).toFixed(1)}%, threshold: ${(this.thresholds.neutralZone*100).toFixed(1)}%)`;
    }
    
    if (!shouldReact) {
      const reasons = [];
      if (intensity < this.thresholds.minimumIntensity) {
        reasons.push(`low intensity (${(intensity*100).toFixed(1)}% < ${(this.thresholds.minimumIntensity*100).toFixed(1)}%)`);
      }
      if (clarity < this.thresholds.minimumClarity) {
        reasons.push(`unclear emotion (${(clarity*100).toFixed(1)}% < ${(this.thresholds.minimumClarity*100).toFixed(1)}%)`);
      }
      if (confidence < this.thresholds.minimumConfidence) {
        reasons.push(`low confidence (${(confidence*100).toFixed(1)}% < ${(this.thresholds.minimumConfidence*100).toFixed(1)}%)`);
      }
      return `🤔 Not reacting: ${reasons.join(', ')}`;
    }
    
    return `✅ Strong emotional signal detected (intensity: ${(intensity*100).toFixed(1)}%, clarity: ${(clarity*100).toFixed(1)}%, confidence: ${(confidence*100).toFixed(1)}%)`;
  }

  /**
   * Create neutral profile for non-emotional messages
   */
  private createNeutralProfile(messageContent: string, reason: string): EmotionalProfile {
    return {
      intensity: 0,
      clarity: 0,
      dominantEmotion: 'neutral',
      emotionalWords: [],
      confidenceScore: 0,
      shouldReact: false,
      reasoning: reason
    };
  }

  /**
   * Update thresholds (for learning/adaptation)
   */
  updateThresholds(newThresholds: Partial<EmotionalThresholds>) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  /**
   * Get current threshold settings
   */
  getThresholds(): EmotionalThresholds {
    return { ...this.thresholds };
  }

  /**
   * Get statistics about emotional analysis
   */
  getStats() {
    return {
      thresholds: this.thresholds,
      activeCooldowns: this.lastReactionTime.size,
      cooldownSettings: {
        durationMs: this.thresholds.reactionCooldown,
        durationSeconds: this.thresholds.reactionCooldown / 1000
      }
    };
  }

  /**
   * Clear cooldowns (for testing or manual override)
   */
  clearCooldowns() {
    this.lastReactionTime.clear();
  }
} 