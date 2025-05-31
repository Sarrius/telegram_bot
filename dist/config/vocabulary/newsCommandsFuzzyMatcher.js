"use strict";
/**
 * Утиліт для розпізнавання команд новин і погоди з толерантністю до помилок
 * Використовує fuzzy matching для українських команд
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsCommandsFuzzyMatcher = void 0;
class NewsCommandsFuzzyMatcher {
    constructor() {
        this.newsKeywords = [
            // Основні варіанти
            { word: 'новини', variations: ['новыни', 'новыны', 'новынi', 'нови'] },
            { word: 'що відбувається', variations: ['шо відбувається', 'що відбуваеться', 'шо відбуваеться', 'що діється'] },
            { word: 'що твориться', variations: ['шо твориться', 'що твориться', 'шо твориться', 'що діется'] },
            { word: 'що в світі', variations: ['шо в світі', 'що у світі', 'шо у світі', 'що в свіі'] },
            { word: 'останні події', variations: ['останніе подіі', 'остані подіі', 'остані події'] },
            { word: 'свіжі новини', variations: ['свіжы новини', 'свіжі новыни', 'свижі новини'] },
            { word: 'актуальні новини', variations: ['актуальны новини', 'актуальни новини', 'актуалні новини'] },
            { word: 'які новини', variations: ['які новыни', 'які новыны', 'яки новини'] },
            { word: 'що нового', variations: ['шо нового', 'що новенького', 'шо новенького'] }
        ];
        this.weatherKeywords = [
            // Погодні варіанти
            { word: 'погода', variations: ['погоду', 'погоды', 'паігода', 'погоді'] },
            { word: 'температура', variations: ['температуру', 'темпирература', 'температуру', 'темпиратура'] },
            { word: 'як на вулиці', variations: ['як навулиці', 'як на вулыці', 'шо на вулиці', 'як на дворі'] },
            { word: 'дощ', variations: ['дош', 'дощик', 'дошик', 'дощь'] },
            { word: 'сонце', variations: ['сонцо', 'сонечко', 'сонце', 'солнце'] },
            { word: 'яка погода', variations: ['яка паігода', 'якая погода', 'шо за погода'] },
            { word: 'чи буде дощ', variations: ['чи буде дош', 'чи дощ буде', 'чи дош буде'] },
            { word: 'як на вулиці', variations: ['як навулиці', 'шо на вулиці', 'як надворі'] }
        ];
        this.subscribeKeywords = [
            { word: 'підписатися', variations: ['підписатися', 'підпісатися', 'підписуватись', 'пітписатися', 'підпысатися', 'пыдписатися'] },
            { word: 'підписка', variations: ['підпіска', 'підпыска', 'підписочка', 'підписка на'] },
            { word: 'ранкові новини', variations: ['ранкові новыны', 'ранкови новини', 'рранкові новини'] },
            { word: 'щоденні новини', variations: ['щоденні новыны', 'щодені новини', 'щоденни новини'] },
            { word: 'хочу отримувати новини', variations: ['хочю отримувати новини', 'хочу отримувать новини'] },
            { word: 'хочу щоденні', variations: ['хочю щоденні', 'хочу щодені', 'хочь щоденні'] },
            { word: 'хочу підписатися', variations: ['хочу пітписатися', 'хочю підписатися', 'хочю пітписатися'] }
        ];
        this.unsubscribeKeywords = [
            { word: 'відписатися', variations: ['відпісатися', 'відписуватись', 'відпысатися'] },
            { word: 'відписка', variations: ['відпіска', 'відпыска', 'відписочка'] },
            { word: 'не хочу новини', variations: ['не хочю новини', 'не хочу новыны', 'нехочу новини', 'не хочю новини більше'] },
            { word: 'прибрати новини', variations: ['прыбрати новини', 'прибрать новини', 'забрати новини', 'прибрати ранкові', 'прыбрати ранкові'] },
            { word: 'відписатись', variations: ['відпісатись', 'відпысатись', 'відписатися'] }
        ];
        this.ukrainianCities = [
            { word: 'київ', variations: ['киев', 'кыив', 'кіїв', 'київ', 'києві', 'київу', 'киеві', 'киеву'] },
            { word: 'харків', variations: ['харьков', 'харкыв', 'харкьків', 'харкові', 'харкову', 'харькові', 'харькову'] },
            { word: 'одеса', variations: ['одесса', 'одесу', 'одеси', 'одеське', 'одесі', 'одессі'] },
            { word: 'дніпро', variations: ['днепр', 'дніпр', 'дніпру', 'дніпрі'] },
            { word: 'донецьк', variations: ['донецк', 'донецьку', 'донецку'] },
            { word: 'запоріжжя', variations: ['запорожье', 'запорожжя', 'запоріжя'] },
            { word: 'львів', variations: ['львов', 'львыв', 'львови', 'львову', 'львові'] },
            { word: 'кривий ріг', variations: ['кривой рог', 'кривы ріг', 'кривий рыг'] },
            { word: 'миколаїв', variations: ['николаев', 'миколаев', 'миколаїву'] },
            { word: 'маріуполь', variations: ['мариуполь', 'маріуполю', 'маріуполя'] },
            { word: 'луганськ', variations: ['луганск', 'луганьск', 'луганську'] },
            { word: 'вінниця', variations: ['винница', 'вінницю', 'вінниці'] },
            { word: 'херсон', variations: ['херсону', 'херсони', 'херсоне'] },
            { word: 'полтава', variations: ['полтаву', 'полтави', 'полтаві'] },
            { word: 'чернігів', variations: ['чернигов', 'чернігову', 'чернігови'] },
            { word: 'черкаси', variations: ['черкасы', 'черкасах', 'черкас'] }
        ];
    }
    /**
     * Розпізнає команду з толерантністю до помилок
     */
    recognizeCommand(text) {
        const lowerText = text.toLowerCase().trim();
        // Якщо текст занадто короткий, не розпізнаємо
        if (lowerText.length < 3) {
            return null;
        }
        // Додаткова перевірка - виключаємо тексти з очевидно нерелевантними словами
        const irrelevantPatterns = [
            /абракадабра|хухрымухры|гівнюк|випадковий|тестовий|безглуздий|фівапролм|хрінь|дурниця/
        ];
        if (irrelevantPatterns.some(pattern => pattern.test(lowerText))) {
            return null;
        }
        // Перевіряємо всі типи команд (підписка/відписка мають пріоритет)
        const subscribeMatch = this.findMatch(lowerText, this.subscribeKeywords, 'subscribe');
        const unsubscribeMatch = this.findMatch(lowerText, this.unsubscribeKeywords, 'unsubscribe');
        const weatherMatch = this.findMatch(lowerText, this.weatherKeywords, 'weather');
        const newsMatch = this.findMatch(lowerText, this.newsKeywords, 'news');
        // Знаходимо найкращий збіг (підписка/відписка мають пріоритет при однаковому confidence)
        const allMatches = [subscribeMatch, unsubscribeMatch, weatherMatch, newsMatch]
            .filter((match) => match !== null)
            .sort((a, b) => {
            // Підписка/відписка мають пріоритет навіть при трохи нижчому confidence
            const subscriptionTypes = ['subscribe', 'unsubscribe'];
            const aIsSubscription = subscriptionTypes.includes(a.type);
            const bIsSubscription = subscriptionTypes.includes(b.type);
            // Якщо один subscription, а інший ні - пріоритет subscription
            if (aIsSubscription && !bIsSubscription && a.confidence >= 0.75) {
                return -1;
            }
            if (bIsSubscription && !aIsSubscription && b.confidence >= 0.75) {
                return 1;
            }
            // Якщо confidence схожий, пріоритет: subscribe > unsubscribe > weather > news
            if (Math.abs(a.confidence - b.confidence) < 0.1) {
                const priority = { subscribe: 4, unsubscribe: 3, weather: 2, news: 1 };
                return priority[b.type] - priority[a.type];
            }
            return b.confidence - a.confidence;
        });
        // Підвищуємо поріг впевненості до 0.6
        if (allMatches.length > 0 && allMatches[0].confidence >= 0.6) {
            const bestMatch = allMatches[0];
            // Додаткова перевірка контексту для команд новин
            if (bestMatch.type === 'news' && !this.hasValidNewsContext(lowerText)) {
                // Якщо це не валідний контекст для новин, перевіряємо інші збіги
                const otherMatches = allMatches.filter(m => m.type !== 'news');
                if (otherMatches.length > 0 && otherMatches[0].confidence >= 0.6) {
                    const finalMatch = otherMatches[0];
                    if (finalMatch.type === 'weather') {
                        const city = this.extractCity(lowerText);
                        if (city) {
                            finalMatch.city = city;
                        }
                    }
                    return finalMatch;
                }
                return null;
            }
            // Додаткова перевірка - для команд підписки/відписки має бути відповідне ключове слово
            if (bestMatch.type === 'subscribe' || bestMatch.type === 'unsubscribe') {
                const hasRelevantKeyword = this.hasRelevantSubscriptionKeyword(lowerText, bestMatch.type);
                if (!hasRelevantKeyword) {
                    // Якщо немає релевантного ключового слова, перевіряємо інші збіги
                    const otherMatches = allMatches.filter(m => m.type !== bestMatch.type);
                    if (otherMatches.length > 0 && otherMatches[0].confidence >= 0.6) {
                        const finalMatch = otherMatches[0];
                        if (finalMatch.type === 'weather') {
                            const city = this.extractCity(lowerText);
                            if (city) {
                                finalMatch.city = city;
                            }
                        }
                        return finalMatch;
                    }
                    return null;
                }
            }
            // Якщо це погодна команда, спробуємо витягти місто
            if (bestMatch.type === 'weather') {
                const city = this.extractCity(lowerText);
                if (city) {
                    bestMatch.city = city;
                }
            }
            return bestMatch;
        }
        return null;
    }
    /**
     * Перевіряє чи є валідний контекст для команд новин
     */
    hasValidNewsContext(text) {
        // Валідні контекстні слова для новин
        const validContextWords = [
            'що', 'шо', 'які', 'яка', 'останні', 'свіжі', 'актуальні',
            'розкажи', 'покажи', 'хочу', 'цікаві', 'українські', 'світові',
            'дай', 'новини', 'новыны', 'новости' // Додаємо саме слово "новини"
        ];
        // Невалідні контексти - тільки найгірші випадки
        const invalidContextWords = [
            'абракадабра', 'хухрымухры', 'безглуздий', 'дурниця', 'фігня'
        ];
        const hasInvalidContext = invalidContextWords.some(word => text.includes(word));
        if (hasInvalidContext) {
            return false;
        }
        // Якщо просто є слово "новини" або його варіації - це вже валідний контекст
        if (text.includes('новини') || text.includes('новыни') || text.includes('новыны') || text.includes('новости')) {
            return true;
        }
        const hasValidContext = validContextWords.some(word => text.includes(word));
        return hasValidContext || this.isQuestion(text);
    }
    /**
     * Перевіряє чи містить текст релевантні ключові слова для команд підписки/відписки
     */
    hasRelevantSubscriptionKeyword(text, type) {
        if (type === 'subscribe') {
            const subscribeWords = ['підписат', 'пітписат', 'підпіска', 'підпис', 'хочу отримувати', 'хочу ранков', 'щоден', 'хочу підписат', 'хочу пітписат'];
            return subscribeWords.some(word => text.includes(word));
        }
        else {
            const unsubscribeWords = ['відписат', 'відпісат', 'відпис', 'не хочу новини', 'не хочу ранков', 'не хочю новини', 'прибрат', 'забрат', 'більше'];
            return unsubscribeWords.some(word => text.includes(word));
        }
    }
    /**
     * Знаходить збіг у списку ключових слів
     */
    findMatch(text, keywords, type) {
        let bestMatch = null;
        let bestConfidence = 0;
        // Спеціальна перевірка для "підпіска" щоб не плутати з "відписка"
        if (type === 'subscribe' && text.includes('підпіска')) {
            return {
                type,
                confidence: 1.05,
                originalText: text,
                matchedKeyword: 'підписка'
            };
        }
        // Виключаємо "підпіска" з unsubscribe щоб не плутати з "відписка"
        if (type === 'unsubscribe' && text.includes('підпіска')) {
            return null;
        }
        for (const keyword of keywords) {
            // Перевіряємо точний збіг - найвища пріоритетність
            if (text.includes(keyword.word)) {
                // Підвищена впевненість для підписки/відписки
                const confidence = (type === 'subscribe' || type === 'unsubscribe') ? 1.0 : 1.0;
                return {
                    type,
                    confidence,
                    originalText: text,
                    matchedKeyword: keyword.word
                };
            }
            // Перевіряємо варіації - висока пріоритетність
            for (const variation of keyword.variations) {
                if (text.includes(variation)) {
                    // Підвищена впевненість для підписки/відписки
                    let confidence = (type === 'subscribe' || type === 'unsubscribe') ? 0.98 : 0.95;
                    // Спеціальне підвищення для "підпіска" бо це точне слово підписки
                    if (type === 'subscribe' && keyword.word === 'підписка' && variation === 'підпіска') {
                        confidence = 1.05; // Трохи вище за точний збіг новин
                    }
                    if (confidence > bestConfidence) {
                        bestMatch = {
                            type,
                            confidence,
                            originalText: text,
                            matchedKeyword: keyword.word
                        };
                        bestConfidence = confidence;
                    }
                }
            }
            // Fuzzy matching тільки якщо ще не знайшли хороший збіг
            if (bestConfidence < 0.9) {
                // Fuzzy matching для основного слова
                if (keyword.word.length >= 4) { // Тільки для довших слів
                    const fuzzyMatch = this.fuzzyMatch(text, keyword.word);
                    // Спеціальне підвищення для підписки при наявності "підпіска"
                    let adjustedConfidence = fuzzyMatch.confidence;
                    if (type === 'subscribe' && keyword.word === 'підписка' && text.includes('підпіска')) {
                        adjustedConfidence = 1.0;
                    }
                    if (adjustedConfidence > bestConfidence && adjustedConfidence >= 0.8) { // Підвищений поріг
                        bestMatch = {
                            type,
                            confidence: adjustedConfidence,
                            originalText: text,
                            matchedKeyword: keyword.word
                        };
                        bestConfidence = adjustedConfidence;
                    }
                }
                // Fuzzy matching для варіацій тільки якщо потрібно
                if (bestConfidence < 0.85) {
                    for (const variation of keyword.variations) {
                        if (variation.length >= 4) { // Тільки для довших варіацій
                            const fuzzyMatch = this.fuzzyMatch(text, variation);
                            if (fuzzyMatch.confidence > bestConfidence && fuzzyMatch.confidence >= 0.8) {
                                bestMatch = {
                                    type,
                                    confidence: fuzzyMatch.confidence * 0.95, // Трохи нижча впевненість для варіацій
                                    originalText: text,
                                    matchedKeyword: keyword.word
                                };
                                bestConfidence = fuzzyMatch.confidence * 0.95;
                            }
                        }
                    }
                }
            }
        }
        return bestMatch;
    }
    /**
     * Витягує назву міста з тексту з толерантністю до помилок
     */
    extractCity(text) {
        let bestCity = null;
        let bestConfidence = 0;
        for (const cityData of this.ukrainianCities) {
            // Точний збіг
            if (text.includes(cityData.word)) {
                return cityData.word.charAt(0).toUpperCase() + cityData.word.slice(1);
            }
            // Перевіряємо варіації
            for (const variation of cityData.variations) {
                if (text.includes(variation)) {
                    return cityData.word.charAt(0).toUpperCase() + cityData.word.slice(1);
                }
            }
            // Fuzzy matching для міст тільки якщо слово достатньо довге
            if (cityData.word.length >= 4) {
                const fuzzyMatch = this.fuzzyMatch(text, cityData.word);
                if (fuzzyMatch.confidence > bestConfidence && fuzzyMatch.confidence >= 0.85) { // Високий поріг для міст
                    bestCity = cityData.word.charAt(0).toUpperCase() + cityData.word.slice(1);
                    bestConfidence = fuzzyMatch.confidence;
                }
            }
        }
        return bestCity;
    }
    /**
     * Нечітке порівняння з використанням відстані Левенштейна
     */
    fuzzyMatch(text, target) {
        // Ранній вихід для дуже коротких цільових слів
        if (target.length < 3) {
            return { confidence: 0, matched: false };
        }
        // Шукаємо найближче слово в тексті (максимум перших 10 слів для продуктивності)
        const words = text.split(/\s+/).slice(0, 10);
        let bestConfidence = 0;
        for (const word of words) {
            // Ранній вихід якщо слово занадто відрізняється за довжиною
            const lengthDiff = Math.abs(word.length - target.length);
            if (lengthDiff > target.length * 0.5) {
                continue;
            }
            const confidence = this.calculateSimilarity(word, target);
            if (confidence > bestConfidence) {
                bestConfidence = confidence;
                // Ранній вихід якщо знайшли дуже хороший збіг
                if (confidence >= 0.9) {
                    break;
                }
            }
        }
        return {
            confidence: bestConfidence,
            matched: bestConfidence >= 0.8 // Підвищений поріг
        };
    }
    /**
     * Розраховує подібність між двома словами (0-1)
     */
    calculateSimilarity(word1, word2) {
        if (word1 === word2)
            return 1.0;
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
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
        for (let i = 0; i <= str1.length; i++)
            matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++)
            matrix[j][0] = j;
        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(matrix[j][i - 1] + 1, // deletion
                matrix[j - 1][i] + 1, // insertion
                matrix[j - 1][i - 1] + indicator // substitution
                );
            }
        }
        return matrix[str2.length][str1.length];
    }
    /**
     * Перевіряє чи містить текст питальні слова
     */
    isQuestion(text) {
        const questionWords = ['що', 'шо', 'які', 'яка', 'яке', 'як', 'чи', 'коли', 'де', 'куди', 'звідки'];
        const lowerText = text.toLowerCase();
        // Перевіряємо наявність знака питання
        if (text.includes('?')) {
            return true;
        }
        // Перевіряємо наявність питальних слів на початку речення або після пробілу
        return questionWords.some(word => {
            const wordIndex = lowerText.indexOf(word);
            if (wordIndex === -1)
                return false;
            // Слово має бути на початку або після пробілу
            if (wordIndex === 0)
                return true;
            if (lowerText[wordIndex - 1] === ' ')
                return true;
            return false;
        });
    }
    /**
     * Отримує статистику розпізнавання
     */
    getRecognitionStats() {
        const totalKeywords = this.newsKeywords.length + this.weatherKeywords.length +
            this.subscribeKeywords.length + this.unsubscribeKeywords.length;
        const totalVariations = [...this.newsKeywords, ...this.weatherKeywords,
            ...this.subscribeKeywords, ...this.unsubscribeKeywords]
            .reduce((sum, keyword) => sum + keyword.variations.length, 0);
        return {
            totalKeywords,
            totalVariations,
            supportedCities: this.ukrainianCities.length
        };
    }
}
exports.NewsCommandsFuzzyMatcher = NewsCommandsFuzzyMatcher;
