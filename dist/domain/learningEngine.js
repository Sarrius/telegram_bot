"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningEngine = void 0;
class LearningEngine {
    constructor() {
        this.associations = new Map();
        this.userProfiles = new Map();
        this.recentPatterns = [];
        this.maxRecentPatterns = 100;
        this.learningRate = 0.1;
        this.confidenceThreshold = 0.6;
        this.loadFromStorage();
    }
    /**
     * Analyze message and predict best reaction type based on learned patterns
     */
    async predictBestReaction(content, sentiment, keywords, userId, chatId) {
        // Get user profile for personalization
        const userProfile = this.getUserProfile(userId);
        // Ensure user profile is created and tracked
        if (!this.userProfiles.has(userId)) {
            this.userProfiles.set(userId, userProfile);
        }
        // Find similar patterns
        const patternHash = this.generatePatternHash(sentiment, keywords);
        const association = this.associations.get(patternHash);
        if (!association || association.confidence < this.confidenceThreshold) {
            // No strong pattern found - use fallback logic
            return this.getFallbackReaction(sentiment, userProfile);
        }
        // Calculate success rates for each reaction type
        const reactionScores = new Map();
        for (const [reaction, successCount] of association.successfulReactions) {
            const failCount = association.failedReactions.get(reaction) || 0;
            const totalAttempts = successCount + failCount;
            if (totalAttempts > 0) {
                const successRate = successCount / totalAttempts;
                const personalizedScore = this.personalizeScore(reaction, successRate, userProfile);
                reactionScores.set(reaction, personalizedScore);
            }
        }
        // Sort by score and return best option
        const sortedReactions = Array.from(reactionScores.entries())
            .sort(([, a], [, b]) => b - a);
        if (sortedReactions.length === 0) {
            return this.getFallbackReaction(sentiment, userProfile);
        }
        const [bestReaction, bestScore] = sortedReactions[0];
        return {
            recommendedType: bestReaction,
            confidence: Math.min(bestScore * association.confidence, 1.0),
            reasoning: `Learned from ${association.sampleSize} similar patterns. Success rate: ${(bestScore * 100).toFixed(1)}%`,
            alternatives: sortedReactions.slice(1, 3).map(([type, score]) => ({
                type,
                confidence: Math.min(score * association.confidence, 1.0)
            }))
        };
    }
    /**
     * Record bot reaction and wait for user feedback
     */
    recordBotReaction(messageContent, sentiment, keywords, userId, chatId, botReaction) {
        const pattern = {
            id: this.generateId(),
            content: messageContent,
            contentHash: this.generateContentHash(messageContent),
            sentiment,
            keywords,
            userId,
            chatId,
            timestamp: new Date(),
            botReaction,
            userFeedback: []
        };
        this.recentPatterns.push(pattern);
        // Keep only recent patterns in memory
        if (this.recentPatterns.length > this.maxRecentPatterns) {
            this.recentPatterns.shift();
        }
        console.log(`🔍 Debug: Generated pattern ID: ${pattern.id}`);
        return pattern.id;
    }
    /**
     * Record user feedback to bot's reaction
     */
    recordUserFeedback(patternId, userId, feedbackType, content) {
        const pattern = this.recentPatterns.find(p => p.id === patternId);
        if (!pattern)
            return;
        const feedback = {
            userId,
            type: feedbackType,
            content,
            sentiment: this.analyzeFeedbackSentiment(feedbackType, content),
            timestamp: new Date(),
            isPositiveFeedback: this.isPositiveFeedback(feedbackType, content)
        };
        pattern.userFeedback?.push(feedback);
        // Update learning associations
        this.updateLearning(pattern, feedback);
        // Update user profile
        this.updateUserProfile(userId, pattern, feedback);
    }
    /**
     * Learn from message pattern and feedback
     */
    updateLearning(pattern, feedback) {
        if (!pattern.botReaction)
            return;
        const patternHash = this.generatePatternHash(pattern.sentiment, pattern.keywords);
        let association = this.associations.get(patternHash);
        if (!association) {
            association = {
                patternHash,
                keywords: pattern.keywords,
                sentiment: pattern.sentiment,
                successfulReactions: new Map(),
                failedReactions: new Map(),
                confidence: 0.1,
                lastUpdated: new Date(),
                sampleSize: 0
            };
            this.associations.set(patternHash, association);
        }
        const reactionType = this.categorizeReaction(pattern.botReaction);
        if (feedback.isPositiveFeedback) {
            const current = association.successfulReactions.get(reactionType) || 0;
            association.successfulReactions.set(reactionType, current + 1);
        }
        else {
            const current = association.failedReactions.get(reactionType) || 0;
            association.failedReactions.set(reactionType, current + 1);
        }
        association.sampleSize++;
        association.lastUpdated = new Date();
        // Update confidence based on sample size and success rate
        const totalSuccess = Array.from(association.successfulReactions.values())
            .reduce((sum, count) => sum + count, 0);
        const totalFailed = Array.from(association.failedReactions.values())
            .reduce((sum, count) => sum + count, 0);
        const totalAttempts = totalSuccess + totalFailed;
        if (totalAttempts > 0) {
            const successRate = totalSuccess / totalAttempts;
            // Higher confidence with more samples and higher success rate
            association.confidence = Math.min(0.1 + (successRate * 0.7) + (Math.min(totalAttempts, 20) / 20 * 0.2), 1.0);
        }
        this.saveToStorage();
    }
    /**
     * Update user profile based on their reactions
     */
    updateUserProfile(userId, pattern, feedback) {
        let profile = this.userProfiles.get(userId);
        if (!profile) {
            profile = {
                userId,
                preferences: {
                    likesHumor: 0.5,
                    likesSupport: 0.5,
                    likesSarcasm: 0.5,
                    reactsToPositive: 0.5,
                    reactsToNegative: 0.5
                },
                reactionHistory: [],
                lastSeen: new Date(),
                messageCount: 0
            };
            this.userProfiles.set(userId, profile);
        }
        profile.lastSeen = new Date();
        profile.messageCount++;
        profile.reactionHistory.push(pattern);
        // Keep only recent history
        if (profile.reactionHistory.length > 50) {
            profile.reactionHistory.shift();
        }
        // Update preferences based on feedback
        if (pattern.botReaction) {
            const reactionType = this.categorizeReaction(pattern.botReaction);
            const adjustment = feedback.isPositiveFeedback ? this.learningRate : -this.learningRate;
            switch (reactionType) {
                case 'sarcastic':
                    profile.preferences.likesSarcasm = Math.max(0, Math.min(1, profile.preferences.likesSarcasm + adjustment));
                    break;
                case 'supportive':
                    profile.preferences.likesSupport = Math.max(0, Math.min(1, profile.preferences.likesSupport + adjustment));
                    break;
            }
            // Update reaction tendencies
            if (pattern.sentiment === 'overly_positive' || pattern.sentiment === 'positive') {
                profile.preferences.reactsToPositive = Math.max(0, Math.min(1, profile.preferences.reactsToPositive + (feedback.isPositiveFeedback ? adjustment : -adjustment)));
            }
            if (pattern.sentiment === 'negative' || pattern.sentiment === 'aggressive') {
                profile.preferences.reactsToNegative = Math.max(0, Math.min(1, profile.preferences.reactsToNegative + (feedback.isPositiveFeedback ? adjustment : -adjustment)));
            }
        }
    }
    // Helper methods
    getUserProfile(userId) {
        return this.userProfiles.get(userId) || {
            userId,
            preferences: {
                likesHumor: 0.5,
                likesSupport: 0.5,
                likesSarcasm: 0.5,
                reactsToPositive: 0.5,
                reactsToNegative: 0.5
            },
            reactionHistory: [],
            lastSeen: new Date(),
            messageCount: 0
        };
    }
    generatePatternHash(sentiment, keywords) {
        const sortedKeywords = keywords.slice().sort().join(',');
        return `${sentiment}:${sortedKeywords}`;
    }
    generateContentHash(content) {
        // Simple hash function for content similarity
        return content.toLowerCase()
            .replace(/[^\wа-яіїєґ\s]/g, '')
            .split(/\s+/)
            .sort()
            .join(' ');
    }
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
    categorizeReaction(botReaction) {
        // Categorize bot reactions for learning
        if (botReaction.type === 'emoji') {
            if (['😂', '🙄', '😏', '🤔'].includes(botReaction.content))
                return 'sarcastic';
            if (['❤️', '🫂', '💪', '👍'].includes(botReaction.content))
                return 'supportive';
        }
        if (botReaction.type === 'reply') {
            if (botReaction.reasoning.includes('sarcastic'))
                return 'sarcastic';
            if (botReaction.reasoning.includes('supportive'))
                return 'supportive';
        }
        return 'neutral';
    }
    isPositiveFeedback(feedbackType, content) {
        if (feedbackType === 'ignore')
            return false;
        if (feedbackType === 'reaction' && content) {
            // Positive emoji reactions
            return ['👍', '❤️', '😂', '🔥', '💪', '✨', '👏'].includes(content);
        }
        if (feedbackType === 'reply' && content) {
            // Simple sentiment analysis of reply - could use vocabulary here
            const positive = ['дякую', 'спасибо', 'класно', 'супер', 'круто', 'топ', 'лол', 'ахаха'];
            return positive.some(word => content.toLowerCase().includes(word));
        }
        return true; // Default to positive for other reactions
    }
    analyzeFeedbackSentiment(feedbackType, content) {
        if (feedbackType === 'ignore')
            return 'neutral';
        if (this.isPositiveFeedback(feedbackType, content))
            return 'positive';
        return 'negative';
    }
    personalizeScore(reactionType, baseScore, userProfile) {
        let personalizedScore = baseScore;
        switch (reactionType) {
            case 'sarcastic':
                personalizedScore *= (0.5 + userProfile.preferences.likesSarcasm * 0.5);
                break;
            case 'supportive':
                personalizedScore *= (0.5 + userProfile.preferences.likesSupport * 0.5);
                break;
        }
        return personalizedScore;
    }
    getFallbackReaction(sentiment, userProfile) {
        // Default logic when no learned patterns exist
        switch (sentiment) {
            case 'overly_positive':
            case 'motivational':
                // For overly positive/motivational content, default to sarcastic
                return {
                    recommendedType: 'sarcastic',
                    confidence: 0.4,
                    reasoning: 'Using default logic (no learned patterns)',
                    alternatives: []
                };
            case 'negative':
            case 'aggressive':
                return {
                    recommendedType: 'supportive',
                    confidence: 0.4,
                    reasoning: 'Using default logic (no learned patterns)',
                    alternatives: []
                };
            case 'positive':
                // For regular positive, lean towards sarcasm if user likes it
                return {
                    recommendedType: userProfile.preferences.likesSarcasm > 0.4 ? 'sarcastic' : 'neutral',
                    confidence: 0.25,
                    reasoning: 'Using default logic (no learned patterns)',
                    alternatives: []
                };
            default:
                return {
                    recommendedType: 'neutral',
                    confidence: 0.2,
                    reasoning: 'Using default logic (no learned patterns)',
                    alternatives: []
                };
        }
    }
    // Storage methods (would be implemented with actual persistence)
    loadFromStorage() {
        // TODO: Load from file/database
        console.log('🧠 Learning Engine: Loading from storage...');
    }
    saveToStorage() {
        // TODO: Save to file/database
        console.log('🧠 Learning Engine: Saving to storage...');
    }
    // Debug/analytics methods
    getStats() {
        return {
            totalAssociations: this.associations.size,
            totalUsers: this.userProfiles.size,
            recentPatterns: this.recentPatterns.length,
            avgConfidence: Array.from(this.associations.values())
                .reduce((sum, a) => sum + a.confidence, 0) / this.associations.size || 0
        };
    }
}
exports.LearningEngine = LearningEngine;
