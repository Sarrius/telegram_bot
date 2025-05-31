"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfanityFilter = void 0;
class ProfanityFilter {
    constructor() {
        this.ukrainianWords = new Set();
        this.russianWords = new Set();
        this.commonVariations = new Map();
        this.initializeDictionaries();
        this.setupVariations();
    }
    initializeDictionaries() {
        // Ukrainian profanity words
        const ukrainianProfanity = [
            // Core Ukrainian profanity
            'бля', 'блядей', 'блядина', 'блядота', 'блядство', 'блядська', 'блядь', 'блядів', 'блять',
            'пизд', 'пизда', 'пиздато', 'пиздець', 'пизди', 'пиздолиз', 'пиздолизить', 'пиздолизня',
            'пізда', 'піздата', 'піздати', 'піздато', 'піздаті', 'піздец', 'піздець', 'піздиш',
            'піздолиз', 'піздолизня', 'піздота', 'піздотой', 'піздотою', 'піздти', 'пізду',
            'піздує', 'піздуємо', 'піздуєте', 'піздюк', 'піздюки', 'піздюків',
            'хуй', 'хуйло', 'хуйлопан', 'хуйовий', 'хуйово', 'хуйом', 'хуя', 'хуями',
            'хуєвий', 'хуєм', 'хуєсос', 'хуєсосити', 'хуєсосний', 'хуї', 'хуїв',
            'нахуй', 'нахуя', 'похуй', 'похую', 'похуям',
            'їбав', 'їбала', 'їбали', 'їбальний', 'їбальник', 'їбана', 'їбанат', 'їбанута',
            'їбанути', 'їбанутий', 'їбанько', 'їбати', 'їбатись', 'їбатися', 'їбе', 'їбеш',
            'сук', 'сука', 'суки', 'сукою', 'сучара', 'сучий', 'сучка', 'сучок',
            'єбобо', 'єбучий', 'хер', 'херовий', 'херово', 'хером', 'хєр'
        ];
        // Russian profanity words  
        const russianProfanity = [
            // Core Russian profanity
            'бздёнок', 'блядки', 'блядовать', 'блядство', 'блядь', 'бугор',
            'гандон', 'говно', 'говнюк', 'дерьмо', 'долбоёб', 'дрочить',
            'ебало', 'ебальник', 'ебать', 'ебло', 'ебнуть', 'жопа', 'жополиз',
            'заебись', 'залупа', 'залупать', 'засать', 'засранец', 'заёбать',
            'манда', 'мандавошка', 'муда', 'мудак', 'мудило', 'мудозвон',
            'наебать', 'наебениться', 'наебнуться', 'нахуячиться',
            'пизда', 'пиздануть', 'пиздато', 'пиздатый', 'пиздеть', 'пиздец', 'пиздюк',
            'проебать', 'пропездолочь', 'просрать', 'разъёба', 'разъёбывать',
            'сволочь', 'секс', 'сиськи', 'спиздить', 'срать', 'ссать', 'стерва',
            'траxать', 'трахаться', 'ублюдок', 'убой', 'уёбище',
            'хуеплет', 'хуило', 'хуиня', 'хуй', 'хуйнуть', 'хуёво', 'хуёвый',
            'черножопый', 'шалава', 'ёбарь', 'mudak', 'pizda', 'blyad'
        ];
        // Add words to sets
        ukrainianProfanity.forEach(word => this.ukrainianWords.add(word.toLowerCase()));
        russianProfanity.forEach(word => this.russianWords.add(word.toLowerCase()));
    }
    setupVariations() {
        // Common letter substitutions used to bypass filters
        this.commonVariations.set('variations', [
            // Cyrrilic to Latin substitutions
            'а->a', 'е->e', 'о->o', 'р->p', 'у->y', 'х->x', 'с->c',
            // Number/symbol substitutions  
            'а->@', 'о->0', 'і->1', 'и->1', 'е->3', 'б->6', 'г->9',
            // Intentional misspellings
            'х->хх', 'у->уу', 'и->ии'
        ]);
    }
    analyzeMessage(text) {
        const normalizedText = this.normalizeText(text);
        const words = this.extractWords(normalizedText);
        const matches = [];
        // Check each word for profanity
        for (const word of words) {
            const match = this.checkWord(word.text, word.startIndex);
            if (match) {
                matches.push(match);
            }
        }
        return this.generateAnalysis(matches, text);
    }
    normalizeText(text) {
        // Remove extra whitespace and normalize
        return text.toLowerCase()
            .replace(/\s+/g, ' ')
            .trim();
    }
    extractWords(text) {
        const words = [];
        const regex = /[а-яёa-z]+/gi;
        let match;
        while ((match = regex.exec(text)) !== null) {
            words.push({
                text: match[0].toLowerCase(),
                startIndex: match.index
            });
        }
        return words;
    }
    checkWord(word, startIndex) {
        // Direct match check
        if (this.ukrainianWords.has(word)) {
            return {
                word,
                startIndex,
                endIndex: startIndex + word.length,
                severity: this.getSeverity(word),
                language: 'ua'
            };
        }
        if (this.russianWords.has(word)) {
            return {
                word,
                startIndex,
                endIndex: startIndex + word.length,
                severity: this.getSeverity(word),
                language: 'ru'
            };
        }
        // Check for variations and obfuscated versions
        const deobfuscated = this.deobfuscateWord(word);
        if (deobfuscated !== word) {
            return this.checkWord(deobfuscated, startIndex);
        }
        // Check for partial matches (root words)
        const rootMatch = this.checkRootWord(word);
        if (rootMatch) {
            return {
                word,
                startIndex,
                endIndex: startIndex + word.length,
                severity: rootMatch.severity,
                language: rootMatch.language
            };
        }
        return null;
    }
    deobfuscateWord(word) {
        let deobfuscated = word;
        // Replace common substitutions
        const substitutions = {
            '@': 'а', '0': 'о', '1': 'і', '3': 'е', '6': 'б', '9': 'г',
            'a': 'а', 'e': 'е', 'o': 'о', 'p': 'р', 'y': 'у', 'x': 'х', 'c': 'с'
        };
        for (const [symbol, letter] of Object.entries(substitutions)) {
            deobfuscated = deobfuscated.replace(new RegExp(symbol, 'g'), letter);
        }
        return deobfuscated;
    }
    checkRootWord(word) {
        // Check if word contains profanity roots
        const profanityRoots = [
            { root: 'пизд', severity: 'severe', language: 'ua' },
            { root: 'хуй', severity: 'severe', language: 'ua' },
            { root: 'блят', severity: 'moderate', language: 'ua' },
            { root: 'їбан', severity: 'severe', language: 'ua' },
            { root: 'мудак', severity: 'moderate', language: 'ru' },
            { root: 'ебал', severity: 'severe', language: 'ru' },
            { root: 'сука', severity: 'mild', language: 'mixed' }
        ];
        for (const { root, severity, language } of profanityRoots) {
            if (word.includes(root) && word.length >= root.length + 1) {
                return { severity, language };
            }
        }
        return null;
    }
    getSeverity(word) {
        // Define severity levels based on word types
        const severeWords = ['пізда', 'пизда', 'хуй', 'хуї', 'їбан', 'ебал', 'ебать'];
        const moderateWords = ['блять', 'блят', 'мудак', 'говно', 'дерьмо'];
        if (severeWords.some(severe => word.includes(severe.slice(0, 4)))) {
            return 'severe';
        }
        if (moderateWords.some(moderate => word.includes(moderate.slice(0, 3)))) {
            return 'moderate';
        }
        return 'mild';
    }
    generateAnalysis(matches, originalText) {
        if (matches.length === 0) {
            return {
                hasProfanity: false,
                matches: [],
                severityLevel: 'clean',
                language: 'unknown',
                confidence: 1.0,
                recommendedAction: 'ignore'
            };
        }
        // Determine overall severity
        const severityLevel = this.getOverallSeverity(matches);
        // Determine dominant language
        const language = this.getDominantLanguage(matches);
        // Calculate confidence based on number and clarity of matches
        const confidence = this.calculateConfidence(matches, originalText);
        // Recommend action based on severity
        const recommendedAction = this.getRecommendedAction(severityLevel, matches.length);
        return {
            hasProfanity: true,
            matches,
            severityLevel,
            language,
            confidence,
            recommendedAction
        };
    }
    getOverallSeverity(matches) {
        if (matches.some(m => m.severity === 'severe'))
            return 'severe';
        if (matches.some(m => m.severity === 'moderate'))
            return 'moderate';
        return 'mild';
    }
    getDominantLanguage(matches) {
        const uaCount = matches.filter(m => m.language === 'ua').length;
        const ruCount = matches.filter(m => m.language === 'ru').length;
        const mixedCount = matches.filter(m => m.language === 'mixed').length;
        if (uaCount > ruCount && uaCount > mixedCount)
            return 'ua';
        if (ruCount > uaCount && ruCount > mixedCount)
            return 'ru';
        if (mixedCount > 0 || (uaCount === ruCount && uaCount > 0))
            return 'mixed';
        return 'unknown';
    }
    calculateConfidence(matches, text) {
        if (matches.length === 0)
            return 0;
        // Base confidence on directness of matches
        let confidence = 0.7; // Base confidence
        // Boost confidence for multiple matches
        confidence += Math.min(matches.length * 0.1, 0.3);
        // Boost confidence for severe words
        if (matches.some(m => m.severity === 'severe'))
            confidence += 0.2;
        return Math.min(confidence, 1.0);
    }
    getRecommendedAction(severity, matchCount) {
        if (severity === 'severe' || matchCount >= 3)
            return 'strict';
        if (severity === 'moderate' || matchCount >= 2)
            return 'moderate';
        if (severity === 'mild')
            return 'warn';
        return 'ignore';
    }
    // Public utility methods
    getStats() {
        return {
            ukrainianWordsCount: this.ukrainianWords.size,
            russianWordsCount: this.russianWords.size,
            totalWordsCount: this.ukrainianWords.size + this.russianWords.size
        };
    }
    addCustomWord(word, language) {
        const normalizedWord = word.toLowerCase();
        if (language === 'ua') {
            this.ukrainianWords.add(normalizedWord);
        }
        else {
            this.russianWords.add(normalizedWord);
        }
    }
    removeWord(word, language) {
        const normalizedWord = word.toLowerCase();
        if (language === 'ua') {
            this.ukrainianWords.delete(normalizedWord);
        }
        else {
            this.russianWords.delete(normalizedWord);
        }
    }
}
exports.ProfanityFilter = ProfanityFilter;
