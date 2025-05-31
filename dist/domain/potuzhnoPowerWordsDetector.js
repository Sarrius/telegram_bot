"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PotuzhnoPowerWordsDetector = void 0;
class PotuzhnoPowerWordsDetector {
    constructor() {
        this.CONFIDENCE_THRESHOLD = 0.8; // 80% точність для більшої точності
        // Розширений словник синонімів "потужно" з варіаціями та помилками
        this.powerWordsVocabulary = {
            power: [
                {
                    word: "потужно",
                    variations: ["потужність", "потужний", "потужняк", "потужненько", "потужніший", "потужна", "потужне"],
                    commonTypos: ["потыжно", "потужньо", "патужно", "потужка"],
                    intensity: "high"
                },
                {
                    word: "могутній",
                    variations: ["могутньо", "могутність", "могутністю", "наймогутніший", "могутня", "могутнє"],
                    commonTypos: ["могутный", "магутний", "могутныи", "можутній", "могучий"],
                    intensity: "high"
                },
                {
                    word: "сильний",
                    variations: ["сильно", "сила", "силач", "найсильніший", "пересильний", "сильна", "сильне"],
                    commonTypos: ["сільный", "сыльный", "сілий", "силний", "силнй"],
                    intensity: "high"
                },
                {
                    word: "міцний",
                    variations: ["міцно", "міцність", "наміцніший", "міцна", "міцне"],
                    commonTypos: ["міцный", "мицний", "міцний", "мыцный", "міцнй"],
                    intensity: "medium"
                },
                {
                    word: "дужий",
                    variations: ["дужче", "дуже", "найдужчий", "передужий", "дужа", "дуже"],
                    commonTypos: ["дужий", "дужый", "душий", "дуужий", "дужій"],
                    intensity: "high"
                },
                {
                    word: "крутий",
                    variations: ["круто", "крутіше", "найкрутіший", "крута", "круте"],
                    commonTypos: ["крутый", "крутій", "крытый", "крутй", "крутыи"],
                    intensity: "high"
                },
                {
                    word: "супер",
                    variations: ["суперовий", "суперно", "суперський", "супер'я"],
                    commonTypos: ["супир", "сыпер", "суперь", "супр", "супэр"],
                    intensity: "high"
                },
                {
                    word: "мега",
                    variations: ["мегакрутий", "мегачудовий", "мегаклас"],
                    commonTypos: ["мега", "мега", "мегу", "мэга", "меги"],
                    intensity: "high"
                },
                {
                    word: "ультра",
                    variations: ["ультрамодний", "ультракрутий"],
                    commonTypos: ["ультро", "ултра", "ультря", "ультру"],
                    intensity: "high"
                },
                {
                    word: "топ",
                    variations: ["топовий", "топчик", "топово", "топ-клас"],
                    commonTypos: ["топ", "тап", "топь", "топпп", "тооп"],
                    intensity: "high"
                },
                {
                    word: "класний",
                    variations: ["класно", "класс", "класові", "найкласніший"],
                    commonTypos: ["классный", "кланый", "клавший", "класний", "класнй"],
                    intensity: "medium"
                },
                {
                    word: "офігенний",
                    variations: ["офігенно", "офіг", "офігеть", "офігенська", "офігенна"],
                    commonTypos: ["афигенный", "офигенный", "афігенний", "офыгенный"],
                    intensity: "high"
                },
                {
                    word: "бомбезний",
                    variations: ["бомбезно", "бомба", "бомбовий"],
                    commonTypos: ["бомбезны", "бамбезний", "бомбэзный", "бомбизний"],
                    intensity: "high"
                },
                {
                    word: "неймовірний",
                    variations: ["неймовірно", "неймовірність", "неймовірна"],
                    commonTypos: ["неимоверный", "неймавірный", "неймовірный", "неїмовірний"],
                    intensity: "high"
                },
                {
                    word: "фантастичний",
                    variations: ["фантастично", "фантастика", "фантастична"],
                    commonTypos: ["фантастический", "фантастычный", "фантостичний"],
                    intensity: "high"
                }
            ],
            energy: [
                {
                    word: "енергійний",
                    variations: ["енергійно", "енергія", "енергетичний"],
                    commonTypos: ["энергийный", "енергийный", "енергійны", "енергіїний"],
                    intensity: "medium"
                },
                {
                    word: "динамічний",
                    variations: ["динамічно", "динаміка", "динамічна"],
                    commonTypos: ["динамический", "динамычный", "динамічны"],
                    intensity: "medium"
                },
                {
                    word: "вогняний",
                    variations: ["вогняно", "вогонь", "вогняна", "полум'яний"],
                    commonTypos: ["вогняны", "вогнаний", "вагняный", "вогн'яний"],
                    intensity: "high"
                },
                {
                    word: "блискавичний",
                    variations: ["блискавично", "блискавка", "блискавична"],
                    commonTypos: ["блискавычный", "блыскавычный", "блискавичны"],
                    intensity: "high"
                }
            ]
        };
        // Ініціалізація без зовнішніх залежностей
    }
    /**
     * Виявляє "потужно" слова в тексті з толерантністю до помилок
     */
    detectPowerWords(text) {
        const words = this.extractWords(text);
        const matches = [];
        words.forEach(word => {
            if (word.length < 3)
                return; // Ігноруємо занадто короткі слова
            let foundMatch = false;
            // Перевіряємо кожну категорію в словнику
            for (const [categoryName, entries] of Object.entries(this.powerWordsVocabulary)) {
                if (foundMatch)
                    break; // Якщо вже знайшли збіг, припиняємо пошук
                for (const entry of entries) {
                    const match = this.findBestMatch(word, entry);
                    if (match && match.confidence >= this.CONFIDENCE_THRESHOLD) {
                        matches.push({
                            originalWord: word,
                            matchedWord: match.matchedWord,
                            confidence: match.confidence,
                            category: this.mapToCategory(match.matchedWord),
                            intensity: entry.intensity,
                            shouldReact: true
                        });
                        foundMatch = true;
                        break; // Знайшли збіг, переходимо до наступного слова
                    }
                }
            }
        });
        return matches;
    }
    /**
     * Перевіряє чи містить текст "потужно" слова
     */
    hasPowerWords(text) {
        const matches = this.detectPowerWords(text);
        return matches.length > 0;
    }
    /**
     * Отримує найкращий збіг "потужно" слова
     */
    getBestPowerWordMatch(text) {
        const matches = this.detectPowerWords(text);
        if (matches.length === 0)
            return null;
        // Сортуємо за впевненістю та інтенсивністю
        return matches.sort((a, b) => {
            const intensityWeight = { low: 1, medium: 2, high: 3 };
            const scoreA = a.confidence * intensityWeight[a.intensity];
            const scoreB = b.confidence * intensityWeight[b.intensity];
            return scoreB - scoreA;
        })[0];
    }
    /**
     * Отримує статистику виявлених слів
     */
    getDetectionStats(text) {
        const matches = this.detectPowerWords(text);
        if (matches.length === 0) {
            return {
                totalMatches: 0,
                averageConfidence: 0,
                highIntensityMatches: 0,
                shouldReact: false
            };
        }
        const totalConfidence = matches.reduce((sum, match) => sum + match.confidence, 0);
        const highIntensityMatches = matches.filter(match => match.intensity === 'high').length;
        return {
            totalMatches: matches.length,
            averageConfidence: totalConfidence / matches.length,
            highIntensityMatches,
            shouldReact: matches.some(match => match.shouldReact)
        };
    }
    /**
     * Спеціальний метод для тестування з різними рівнями помилок
     */
    testWithTypos(correctWord, typoVersions) {
        return typoVersions.map(typo => {
            const matches = this.detectPowerWords(typo);
            const match = matches.find(m => m.matchedWord === correctWord);
            return {
                typo,
                detected: !!match,
                confidence: match?.confidence || 0
            };
        });
    }
    /**
     * Знаходить найкращий збіг для слова в межах одного entry
     */
    findBestMatch(word, entry) {
        const lowerWord = word.toLowerCase();
        // 1. Точний збіг з основним словом
        if (lowerWord === entry.word.toLowerCase()) {
            return { matchedWord: entry.word, confidence: 1.0 };
        }
        // 2. Точний збіг з варіаціями
        for (const variation of entry.variations) {
            if (lowerWord === variation.toLowerCase()) {
                return { matchedWord: entry.word, confidence: 0.95 };
            }
        }
        // 3. Точний збіг з опечатками
        for (const typo of entry.commonTypos) {
            if (lowerWord === typo.toLowerCase()) {
                return { matchedWord: entry.word, confidence: 0.9 };
            }
        }
        // 4. Часткове включення (для складних форм)
        if (lowerWord.includes(entry.word.toLowerCase()) || entry.word.toLowerCase().includes(lowerWord)) {
            const similarity = this.calculateSimilarity(lowerWord, entry.word.toLowerCase());
            if (similarity >= 0.8) {
                return { matchedWord: entry.word, confidence: similarity };
            }
        }
        return null;
    }
    /**
     * Обчислює схожість між двома словами (простий алгоритм)
     */
    calculateSimilarity(word1, word2) {
        const maxLength = Math.max(word1.length, word2.length);
        if (maxLength === 0)
            return 1.0;
        const distance = this.levenshteinDistance(word1, word2);
        return (maxLength - distance) / maxLength;
    }
    /**
     * Обчислює відстань Левенштейна між двома рядками
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                }
                else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1, // insertion
                    matrix[i - 1][j] + 1 // deletion
                    );
                }
            }
        }
        return matrix[str2.length][str1.length];
    }
    extractWords(text) {
        // Видаляємо емодзі та спецсимволи, залишаємо тільки слова
        return text
            .toLowerCase()
            .replace(/[^\p{L}\p{N}\s]/gu, ' ')
            .split(/\s+/)
            .filter(word => word.length >= 2);
    }
    mapToCategory(word) {
        const powerWords = ['потужно', 'могутній', 'супер', 'мега', 'ультра', 'топ'];
        const strengthWords = ['сильний', 'міцний', 'дужий'];
        const energyWords = ['енергійний', 'динамічний', 'вогняний', 'блискавичний'];
        const intensityWords = ['крутий', 'класний', 'офігенний', 'бомбезний', 'неймовірний', 'фантастичний'];
        if (powerWords.some(pw => word.includes(pw) || pw.includes(word)))
            return 'power';
        if (strengthWords.some(sw => word.includes(sw) || sw.includes(word)))
            return 'strength';
        if (energyWords.some(ew => word.includes(ew) || ew.includes(word)))
            return 'energy';
        if (intensityWords.some(iw => word.includes(iw) || iw.includes(word)))
            return 'intensity';
        return 'power'; // Default
    }
    /**
     * Отримує емодзі для реакції на основі категорії та інтенсивності
     */
    getReactionEmoji(match) {
        const emojiMap = {
            power: {
                high: '⚡',
                medium: '💪',
                low: '👍'
            },
            strength: {
                high: '💪',
                medium: '🔥',
                low: '👍'
            },
            energy: {
                high: '🚀',
                medium: '⚡',
                low: '✨'
            },
            intensity: {
                high: '🔥',
                medium: '😎',
                low: '👌'
            }
        };
        return emojiMap[match.category][match.intensity];
    }
    /**
     * Отримує мотиваційну відповідь на "потужно" слово
     */
    getMotivationalResponse(match) {
        const responses = {
            power: [
                `⚡ ${match.matchedWord.toUpperCase()}! Відчуваю енергію!`,
                `🚀 Так тримати! ${match.matchedWord} - це про нас!`,
                `💪 ${match.matchedWord}ність зашкалює!`
            ],
            strength: [
                `💪 Ця сила неперебориста!`,
                `🔥 ${match.matchedWord.toUpperCase()} як сталь!`,
                `⚡ Неймовірна міць!`
            ],
            energy: [
                `🚀 Енергія просто космічна!`,
                `⚡ ${match.matchedWord} рух вперед!`,
                `🔥 Ця енергія заразна!`
            ],
            intensity: [
                `🔥 ${match.matchedWord.toUpperCase()}! Інтенсивність на максимум!`,
                `😎 ${match.matchedWord} стиль життя!`,
                `💯 На всі ${match.matchedWord}!`
            ]
        };
        const categoryResponses = responses[match.category];
        return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
    }
}
exports.PotuzhnoPowerWordsDetector = PotuzhnoPowerWordsDetector;
