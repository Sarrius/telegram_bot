"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FuzzyMatcher = void 0;
const fuse_js_1 = __importDefault(require("fuse.js"));
class FuzzyMatcher {
    constructor(vocabulary) {
        this.fuseInstances = new Map();
        this.exactMatches = new Map();
        this.buildMatchingDataStructures(vocabulary);
    }
    buildMatchingDataStructures(vocabulary) {
        // Build exact match lookup for fast exact matching
        for (const [category, entries] of Object.entries(vocabulary)) {
            for (const entry of entries) {
                // Add main word
                this.exactMatches.set(entry.word.toLowerCase(), { category, entry });
                // Add variations
                entry.variations.forEach(variation => {
                    this.exactMatches.set(variation.toLowerCase(), { category, entry });
                });
                // Add common typos
                entry.commonTypos.forEach(typo => {
                    this.exactMatches.set(typo.toLowerCase(), { category, entry });
                });
            }
            // Build Fuse.js instance for fuzzy matching
            const searchableItems = entries.flatMap(entry => [
                { word: entry.word, category, entry, type: 'main' },
                ...entry.variations.map(v => ({ word: v, category, entry, type: 'variation' })),
                ...entry.commonTypos.map(t => ({ word: t, category, entry, type: 'typo' }))
            ]);
            const fuse = new fuse_js_1.default(searchableItems, {
                keys: ['word'],
                threshold: 0.2, // Підвищено з 0.4 до 0.2 - більш строгий збіг (80% similarity required)
                distance: 100,
                minMatchCharLength: 3, // Підвищено з 2 до 3 - довші слова для збігу
                includeScore: true,
                findAllMatches: false
            });
            this.fuseInstances.set(category, fuse);
        }
    }
    /**
     * Find best matches for a word with spelling tolerance
     */
    findMatches(word, maxResults = 3) {
        const lowerWord = word.toLowerCase();
        const results = [];
        // 1. Try exact match first (fastest)
        const exactMatch = this.exactMatches.get(lowerWord);
        if (exactMatch) {
            results.push({
                word: exactMatch.entry.word,
                category: exactMatch.category,
                intensity: exactMatch.entry.intensity,
                confidence: 1.0,
                matchType: 'exact',
                originalWord: word
            });
            return results;
        }
        // 2. Try fuzzy matching across all categories
        const allMatches = [];
        for (const [category, fuse] of this.fuseInstances.entries()) {
            const matches = fuse.search(lowerWord, { limit: 2 });
            matches.forEach(match => {
                allMatches.push({
                    item: match.item,
                    score: match.score || 0,
                    category
                });
            });
        }
        // Sort by confidence (lower score = better match in Fuse.js)
        allMatches.sort((a, b) => a.score - b.score);
        // Convert to results
        allMatches.slice(0, maxResults).forEach(match => {
            const confidence = 1 - match.score; // Convert Fuse score to confidence
            let matchType = 'fuzzy';
            if (match.item.type === 'variation')
                matchType = 'variation';
            else if (match.item.type === 'typo')
                matchType = 'typo';
            results.push({
                word: match.item.entry.word,
                category: match.category,
                intensity: match.item.entry.intensity,
                confidence,
                matchType,
                originalWord: word
            });
        });
        return results;
    }
    /**
     * Check if text contains words from specific categories
     */
    findCategoriesInText(text, minConfidence = 0.85) {
        const words = this.extractWords(text);
        const categoriesFound = new Map();
        words.forEach(word => {
            const matches = this.findMatches(word, 1);
            matches.forEach(match => {
                if (match.confidence >= minConfidence) {
                    if (!categoriesFound.has(match.category)) {
                        categoriesFound.set(match.category, []);
                    }
                    categoriesFound.get(match.category).push(match);
                }
            });
        });
        return categoriesFound;
    }
    /**
     * Get dominant category with confidence scores
     */
    getDominantCategory(text) {
        const categories = this.findCategoriesInText(text, 0.85);
        if (categories.size === 0)
            return null;
        let bestCategory = '';
        let bestScore = 0;
        let bestMatches = [];
        for (const [category, matches] of categories.entries()) {
            // Calculate category score based on:
            // - Number of matches
            // - Average confidence
            // - Intensity weights
            const intensityWeight = { low: 1, medium: 2, high: 3 };
            const totalIntensity = matches.reduce((sum, match) => sum + intensityWeight[match.intensity], 0);
            const avgConfidence = matches.reduce((sum, match) => sum + match.confidence, 0) / matches.length;
            const categoryScore = matches.length * avgConfidence * totalIntensity;
            if (categoryScore > bestScore) {
                bestScore = categoryScore;
                bestCategory = category;
                bestMatches = matches;
            }
        }
        return {
            category: bestCategory,
            confidence: bestScore,
            matches: bestMatches,
            totalIntensity: bestMatches.reduce((sum, match) => sum + ({ low: 1, medium: 2, high: 3 })[match.intensity], 0)
        };
    }
    /**
     * Extract words from text, handling Ukrainian and English
     */
    extractWords(text) {
        // Split by whitespace and punctuation, keep words with Ukrainian/English chars
        return text
            .toLowerCase()
            .split(/[\s.,!?;:()\[\]{}""''«»„"]+/)
            .filter(word => word.length >= 2 && /[а-яіїєґa-z]/.test(word))
            .map(word => word.replace(/[^\wа-яіїєґ]/g, ''))
            .filter(word => word.length >= 2);
    }
    /**
     * Get statistics about vocabulary coverage
     */
    getStats() {
        const categoryCounts = {};
        let totalWords = 0;
        for (const [category] of this.fuseInstances.entries()) {
            // Count from exact matches instead (more reliable)
            const count = Array.from(this.exactMatches.entries())
                .filter(([_, data]) => data.category === category).length;
            categoryCounts[category] = count;
            totalWords += count;
        }
        return {
            totalWords,
            categoryCounts,
            avgWordsPerCategory: totalWords / Object.keys(categoryCounts).length || 0
        };
    }
}
exports.FuzzyMatcher = FuzzyMatcher;
