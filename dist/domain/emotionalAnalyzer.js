"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmotionalAnalyzer = void 0;
class EmotionalAnalyzer {
    constructor(fuzzyMatcher, customThresholds = {}) {
        this.lastReactionTime = new Map(); // chatId -> timestamp
        this.fuzzyMatcher = fuzzyMatcher;
        this.thresholds = {
            minimumIntensity: 0.5, // Вища поріг - реагуємо лише на сильні емоції
            minimumClarity: 0.6, // Вища поріг - емоція має бути чіткою 
            minimumConfidence: 0.65, // Вища поріг - впевненість має бути високою
            neutralZone: 0.35, // Ширша нейтральна зона - менше реакцій
            reactionCooldown: 60000, // 60 секунд між реакціями (було 30)
            ...customThresholds
        };
    }
    /**
     * Analyze emotional profile of message and decide if bot should react
     */
    analyzeEmotionalProfile(messageContent, sentiment, keywords, chatId, userId) {
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
        const profile = {
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
    calculateIntensity(dominantCategory, messageContent) {
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
    calculateClarity(categories, dominantCategory) {
        const totalCategories = categories.size;
        const dominantMatches = dominantCategory.matches.length;
        const totalMatches = Array.from(categories.values())
            .reduce((sum, matches) => sum + matches.length, 0);
        if (totalMatches === 0)
            return 0;
        // Higher clarity if emotion is concentrated in one category
        const dominance = dominantMatches / totalMatches;
        // Lower clarity if many competing emotions
        const categoryPenalty = Math.max(0, (totalCategories - 1) * 0.15);
        // Clarity score
        let clarity = dominance - categoryPenalty;
        // Boost for very confident matches
        const avgConfidence = dominantCategory.matches
            .reduce((sum, match) => sum + match.confidence, 0) / dominantMatches;
        if (avgConfidence > 0.8) {
            clarity *= 1.2;
        }
        return Math.max(0, Math.min(clarity, 1.0));
    }
    /**
     * Calculate overall confidence in emotional analysis
     */
    calculateConfidence(dominantCategory, intensity, clarity) {
        // Base confidence from fuzzy matching
        const matchConfidence = dominantCategory.confidence;
        // Weighted combination
        const confidence = (matchConfidence * 0.4 + // 40% from word matching confidence
            intensity * 0.3 + // 30% from emotional intensity
            clarity * 0.3 // 30% from emotional clarity
        );
        return Math.min(confidence, 1.0);
    }
    /**
     * Detect intensity markers in text (caps, punctuation, repetition)
     */
    detectIntensityMarkers(text) {
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
    isInCooldown(chatId) {
        const lastReaction = this.lastReactionTime.get(chatId);
        if (!lastReaction)
            return false;
        return (Date.now() - lastReaction) < this.thresholds.reactionCooldown;
    }
    /**
     * Determine if bot should react based on all factors
     */
    shouldReactToMessage(intensity, clarity, confidence, isInCooldown) {
        // Never react if in cooldown
        if (isInCooldown)
            return false;
        // Never react if in neutral zone
        if (intensity < this.thresholds.neutralZone)
            return false;
        // Check all thresholds
        return (intensity >= this.thresholds.minimumIntensity &&
            clarity >= this.thresholds.minimumClarity &&
            confidence >= this.thresholds.minimumConfidence);
    }
    /**
     * Generate human-readable reasoning for decision
     */
    generateReasoning(intensity, clarity, confidence, isInCooldown, shouldReact) {
        if (isInCooldown) {
            return `⏰ In cooldown period (${this.thresholds.reactionCooldown / 1000}s between reactions)`;
        }
        if (intensity < this.thresholds.neutralZone) {
            return `😐 Message is emotionally neutral (intensity: ${(intensity * 100).toFixed(1)}%, threshold: ${(this.thresholds.neutralZone * 100).toFixed(1)}%)`;
        }
        if (!shouldReact) {
            const reasons = [];
            if (intensity < this.thresholds.minimumIntensity) {
                reasons.push(`low intensity (${(intensity * 100).toFixed(1)}% < ${(this.thresholds.minimumIntensity * 100).toFixed(1)}%)`);
            }
            if (clarity < this.thresholds.minimumClarity) {
                reasons.push(`unclear emotion (${(clarity * 100).toFixed(1)}% < ${(this.thresholds.minimumClarity * 100).toFixed(1)}%)`);
            }
            if (confidence < this.thresholds.minimumConfidence) {
                reasons.push(`low confidence (${(confidence * 100).toFixed(1)}% < ${(this.thresholds.minimumConfidence * 100).toFixed(1)}%)`);
            }
            return `🤔 Not reacting: ${reasons.join(', ')}`;
        }
        return `✅ Strong emotional signal detected (intensity: ${(intensity * 100).toFixed(1)}%, clarity: ${(clarity * 100).toFixed(1)}%, confidence: ${(confidence * 100).toFixed(1)}%)`;
    }
    /**
     * Create neutral profile for non-emotional messages
     */
    createNeutralProfile(messageContent, reason) {
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
    updateThresholds(newThresholds) {
        this.thresholds = { ...this.thresholds, ...newThresholds };
    }
    /**
     * Get current threshold settings
     */
    getThresholds() {
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
exports.EmotionalAnalyzer = EmotionalAnalyzer;
