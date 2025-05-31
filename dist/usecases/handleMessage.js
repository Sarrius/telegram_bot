"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageHandler = exports.MessageHandler = void 0;
exports.getReaction = getReaction;
exports.getReply = getReply;
const messageAnalyzer_1 = require("../domain/messageAnalyzer");
const learningEngine_1 = require("../domain/learningEngine");
const reactionSelector_1 = require("./reactionSelector");
const fuzzy_matcher_1 = require("../config/vocabulary/fuzzy-matcher");
const emotionalAnalyzer_1 = require("../domain/emotionalAnalyzer");
const ukrainian_1 = require("../config/vocabulary/ukrainian");
const emoji_config_1 = require("../config/emoji.config");
class MessageHandler {
    constructor() {
        this.reactionCooldown = new Map(); // chatId -> lastReactionTime
        this.cooldownMs = 30000; // 30 seconds between reactions
        this.learningEngine = new learningEngine_1.LearningEngine();
        this.vocabularyMatcher = new fuzzy_matcher_1.FuzzyMatcher(ukrainian_1.ukrainianVocabulary);
        this.reactionSelector = new reactionSelector_1.ReactionSelector(this.learningEngine, this.vocabularyMatcher);
        this.emotionalAnalyzer = new emotionalAnalyzer_1.EmotionalAnalyzer(this.vocabularyMatcher);
    }
    /**
     * Main message handling logic with emotional intelligence and learning integration
     */
    async handleMessage(context) {
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
        const analysis = (0, messageAnalyzer_1.analyzeMessage)(context.text);
        const dominantCategory = this.vocabularyMatcher.getDominantCategory(context.text);
        // Use EmotionalAnalyzer to determine if we should react
        const emotionalProfile = this.emotionalAnalyzer.analyzeEmotionalProfile(context.text, dominantCategory?.category || 'neutral', dominantCategory?.matches.map(m => m.word) || [], context.chatId, context.userId);
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
        const reactionContext = {
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
        let response;
        if (reactionChoice.type === 'ignore') {
            response = {
                shouldReact: false,
                shouldReply: false,
                confidence: reactionChoice.confidence,
                reasoning: reactionChoice.reasoning,
                learningPatternId: reactionChoice.learningPatternId,
                emotionalProfile
            };
        }
        else if (reactionChoice.type === 'emoji') {
            response = {
                shouldReact: true,
                reaction: reactionChoice.content,
                shouldReply: false,
                confidence: reactionChoice.confidence,
                reasoning: reactionChoice.reasoning,
                learningPatternId: reactionChoice.learningPatternId,
                emotionalProfile
            };
        }
        else if (reactionChoice.type === 'reply') {
            response = {
                shouldReact: false,
                shouldReply: true,
                reply: reactionChoice.content,
                confidence: reactionChoice.confidence,
                reasoning: reactionChoice.reasoning,
                learningPatternId: reactionChoice.learningPatternId,
                emotionalProfile
            };
        }
        else {
            // Fallback to old logic
            response = this.getFallbackResponse(analysis, context, emotionalProfile);
        }
        console.log(`🎯 Decision: ${response.shouldReact ? 'React' : 'No reaction'} ${response.shouldReply ? 'Reply' : 'No reply'} (${(response.confidence * 100).toFixed(1)}%)`);
        return response;
    }
    /**
     * Record user feedback when they react to bot's messages
     */
    async recordUserFeedback(learningPatternId, userId, feedbackType, content) {
        await this.reactionSelector.recordUserFeedback(learningPatternId, userId, feedbackType, content);
    }
    /**
     * Legacy methods for backward compatibility
     */
    getReaction(text) {
        const key = (0, messageAnalyzer_1.analyzeMessage)(text);
        const emojis = emoji_config_1.emojiReactions[key] || emoji_config_1.emojiReactions['default'];
        return emojis[Math.floor(Math.random() * emojis.length)];
    }
    getReply(text) {
        const key = (0, messageAnalyzer_1.analyzeMessage)(text);
        const replies = emoji_config_1.mentionReplies[key] || emoji_config_1.mentionReplies['default'];
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
    updateEmotionalThresholds(newThresholds) {
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
    isInCooldown(chatId) {
        const lastReaction = this.reactionCooldown.get(chatId);
        if (!lastReaction)
            return false;
        return Date.now() - lastReaction < this.cooldownMs;
    }
    setCooldown(chatId) {
        this.reactionCooldown.set(chatId, Date.now());
        // Clean up old cooldowns
        setTimeout(() => {
            this.reactionCooldown.delete(chatId);
        }, this.cooldownMs);
    }
    calculateIntensity(dominantCategory) {
        // Calculate based on number of matches and their intensities
        const avgIntensity = dominantCategory.totalIntensity / dominantCategory.matches.length;
        if (avgIntensity >= 2.5)
            return 'high'; // high intensity words
        if (avgIntensity >= 1.5)
            return 'medium'; // medium intensity words
        return 'low'; // low intensity words
    }
    mapIntensityToString(intensity) {
        // Convert emotional analyzer's 0-1 intensity scale to string categories
        if (intensity >= 0.7)
            return 'high';
        if (intensity >= 0.4)
            return 'medium';
        return 'low';
    }
    getFallbackResponse(analysis, context, emotionalProfile) {
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
exports.MessageHandler = MessageHandler;
// Export instances for backward compatibility
const messageHandler = new MessageHandler();
exports.messageHandler = messageHandler;
function getReaction(text) {
    return messageHandler.getReaction(text);
}
function getReply(text) {
    return messageHandler.getReply(text);
}
