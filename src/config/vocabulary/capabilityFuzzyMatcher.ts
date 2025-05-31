/**
 * Утиліт для розпізнавання запитів про можливості бота з толерантністю до помилок
 */

export class CapabilityFuzzyMatcher {
  private ukrainianTriggers = [
    // Прямі запити про можливості
    { word: 'що ти можеш', variations: ['шо ти можеш', 'що ти мозеш', 'шо ти мозеш', 'що можеш'] },
    { word: 'можливості', variations: ['можливосці', 'можлівості', 'можливостi'] },
    { word: 'функції', variations: ['функціі', 'функцыи', 'функцій', 'фукнції'] },
    { word: 'команди', variations: ['комманды', 'команди', 'команди'] },
    { word: 'що вмієш', variations: ['шо вмієш', 'що вміеш', 'шо вміеш', 'що умієш'] },
    { word: 'допомога', variations: ['допомогу', 'допомогы', 'дапомога'] },
    
    // Неформальні варіанти
    { word: 'що за бот', variations: ['шо за бот', 'що то за бот', 'шо то за бот'] },
    { word: 'хто ти', variations: ['хто ти такий', 'хто єси', 'хто ти взагалі'] },
    { word: 'покажи що можеш', variations: ['покажи шо можеш', 'покажи що можеш', 'показуй що можеш'] },
    
    // Молодіжний сленг
    { word: 'шо можеш', variations: ['шо мозеш', 'шо можиш', 'шо можешь'] },
    { word: 'які фічі', variations: ['яки фічі', 'які фічи', 'які фичі'] },
    { word: 'скілзи', variations: ['скілси', 'скілзы', 'скилзи', 'скіли'] },
    { word: 'шо шариш', variations: ['шо шарыш', 'що шариш', 'що шарыш'] },
    
    // Інструкції
    { word: 'як тебе використовувати', variations: ['як тебе вікористовувати', 'як тебе користувати', 'як працювати з тобою'] },
    { word: 'інструкція', variations: ['інструкціі', 'інструкція', 'інструкціии'] },
    { word: 'мануал', variations: ['мануал', 'мануелл', 'мануель'] },
    
    // Запити про навички
    { word: 'які твої навички', variations: ['які навички', 'які навыки', 'які навычки'] },
    { word: 'що входить в твої функції', variations: ['шо входить в твої функції', 'що входить в функції'] },
    
    // Знайомство
    { word: 'розкажи про себе', variations: ['розкажы про себе', 'розскажи про себе', 'представся'] },
    { word: 'опиши себе', variations: ['опыши себе', 'опішы себе', 'опиши сєбє'] }
  ];

  private englishTriggers = [
    // Direct capability requests
    { word: 'what can you do', variations: ['what you can do', 'what u can do', 'wat can you do'] },
    { word: 'capabilities', variations: ['capabilites', 'capabilityes', 'capabilitis'] },
    { word: 'features', variations: ['featers', 'featuers', 'featurez'] },
    { word: 'commands', variations: ['comands', 'commends', 'comandz'] },
    { word: 'help', variations: ['halp', 'hepl', 'hellp'] },
    
    // Variations with "can"
    { word: 'what can you help with', variations: ['what you can help with', 'what can u help with'] },
    { word: 'what are you capable of', variations: ['wat are you capable of', 'what r u capable of'] },
    
    // Informal variants
    { word: 'what are you', variations: ['wat are you', 'what r u', 'wat r u'] },
    { word: 'who are you', variations: ['who r u', 'who u', 'whos are you'] },
    { word: 'show me what you got', variations: ['show me wat you got', 'show wat you got'] },
    
    // Slang and casual
    { word: 'whatcha got', variations: ['watcha got', 'what ya got', 'whatha got'] },
    { word: 'what\'s your deal', variations: ['whats your deal', 'wat\'s your deal'] },
    { word: 'show me your stuff', variations: ['show your stuff', 'show me ur stuff'] }
  ];

  /**
   * Розпізнає запит про можливості з толерантністю до помилок
   */
  detectCapabilityRequest(message: string): { 
    isCapabilityRequest: boolean;
    confidence: number;
    language: 'uk' | 'en';
    matchedTrigger?: string;
  } {
    const lowerMessage = message.toLowerCase().trim();
    
    // Ранній вихід для дуже коротких повідомлень
    if (lowerMessage.length < 4) {
      return {
        isCapabilityRequest: false,
        confidence: 0,
        language: 'uk'
      };
    }

    // Додаткова перевірка - виключаємо очевидно нерелевантні повідомлення
    const irrelevantPatterns = [
      /^(привіт|hello|hi|дякую|thanks|goodbye|до побачення)$/,
      /^(як справи|how are you|добре|fine|ok|окей)$/,
      /^(жарт|joke|мем|meme)$/,  // Тільки якщо це єдине слово
      /дякую за|thanks for/,  // Подяки
      /новини|news|погода|weather|temperature|дощ|сонце/,
      /абракадабра|хухрымухры|тестовий|безглуздий|nonsense|garbage|bred|хрін/,
      /^.{1,3}$/  // Тільки дуже короткі повідомлення (1-3 символи)
    ];
    
    if (irrelevantPatterns.some(pattern => pattern.test(lowerMessage))) {
      return {
        isCapabilityRequest: false,
        confidence: 0,
        language: 'uk'
      };
    }
    
    // Перевіряємо українські тригери
    const ukrainianMatch = this.findBestMatch(lowerMessage, this.ukrainianTriggers);
    
    // Перевіряємо англійські тригери
    const englishMatch = this.findBestMatch(lowerMessage, this.englishTriggers);
    
    // Підвищуємо поріг до 0.7 для кращої функціональності
    const threshold = 0.7;
    
    // Вибираємо найкращий збіг (українська завжди має пріоритет)
    if (ukrainianMatch.confidence >= threshold) {
      // Додаткова перевірка контексту
      if (this.hasValidCapabilityContext(lowerMessage)) {
        return {
          isCapabilityRequest: true,
          confidence: ukrainianMatch.confidence,
          language: 'uk',
          matchedTrigger: ukrainianMatch.matchedTrigger
        };
      }
    }
    
    if (englishMatch.confidence >= threshold) {
      // Додаткова перевірка контексту
      if (this.hasValidCapabilityContext(lowerMessage)) {
        return {
          isCapabilityRequest: true,
          confidence: englishMatch.confidence,
          language: 'en',
          matchedTrigger: englishMatch.matchedTrigger
        };
      }
    }
    
    return {
      isCapabilityRequest: false,
      confidence: Math.max(ukrainianMatch.confidence, englishMatch.confidence),
      language: ukrainianMatch.confidence >= englishMatch.confidence ? 'uk' : 'en'
    };
  }

  /**
   * Перевіряє чи є валідний контекст для запитів можливостей
   */
  private hasValidCapabilityContext(text: string): boolean {
    // Валідні контекстні слова - розширюємо список
    const validContextWords = [
      'що', 'шо', 'які', 'яка', 'як', 'можеш', 'можливості', 'функції', 'команди',
      'what', 'how', 'can', 'do', 'capabilities', 'features', 'help', 'умієш',
      'покажи', 'розкажи', 'допомога', 'інструкці', 'список', 'list', 'show', 'tell',
      'хто', 'who', 'скілзи', 'навички', 'мануал', 'опиши', 'себе', 'you', 'are'
    ];
    
          // Якщо містить базові слова можливостей - це вже достатньо
      const capabilityWords = ['можливості', 'функції', 'команди', 'capabilities', 'features', 'help', 'скілзи', 'навички', 'commands'];
      if (capabilityWords.some(word => text.includes(word))) {
        return true;
      }
    
    // Якщо знайшли збіг з високою впевненістю, ймовірно це валідний capability request
    return validContextWords.some(word => text.includes(word));
  }

  /**
   * Знаходить найкращий збіг серед тригерів
   */
  private findBestMatch(
    text: string, 
    triggers: Array<{ word: string; variations: string[] }>
  ): { confidence: number; matchedTrigger?: string } {
    let bestConfidence = 0;
    let bestTrigger: string | undefined;

    for (const trigger of triggers) {
      // Перевіряємо точний збіг з основним словом
      if (text.includes(trigger.word)) {
        return { confidence: 1.0, matchedTrigger: trigger.word };
      }

      // Перевіряємо варіації
      for (const variation of trigger.variations) {
        if (text.includes(variation)) {
          const confidence = 0.9;
          if (confidence > bestConfidence) {
            bestConfidence = confidence;
            bestTrigger = trigger.word;
          }
        }
      }

      // Fuzzy matching для основного слова
      const fuzzyMatch = this.fuzzyMatchPhrase(text, trigger.word);
      if (fuzzyMatch.confidence > bestConfidence && fuzzyMatch.confidence >= 0.7) {
        bestConfidence = fuzzyMatch.confidence;
        bestTrigger = trigger.word;
      }

      // Fuzzy matching для варіацій
      for (const variation of trigger.variations) {
        const fuzzyMatch = this.fuzzyMatchPhrase(text, variation);
        if (fuzzyMatch.confidence > bestConfidence && fuzzyMatch.confidence >= 0.7) {
          bestConfidence = fuzzyMatch.confidence * 0.9; // Трохи нижча впевненість для варіацій
          bestTrigger = trigger.word;
        }
      }
    }

    return { confidence: bestConfidence, matchedTrigger: bestTrigger };
  }

  /**
   * Нечітке порівняння фрази з текстом
   */
  private fuzzyMatchPhrase(text: string, phrase: string): { confidence: number; matched: boolean } {
    const words = phrase.split(' ');
    const textWords = text.split(/\s+/).slice(0, 15); // Обмежуємо для продуктивності
    
    // Ранній вихід для занадто коротких фраз
    if (words.length === 0 || textWords.length === 0) {
      return { confidence: 0, matched: false };
    }
    
    let totalScore = 0;
    let matchedWords = 0;
    const minWordLength = 3; // Мінімальна довжина слова для обробки

    for (const word of words) {
      if (word.length < minWordLength) {
        continue; // Пропускаємо дуже короткі слова
      }
      
      let bestWordScore = 0;
      
      for (const textWord of textWords) {
        if (textWord.length < minWordLength) {
          continue;
        }
        
        // Ранній вихід якщо слова дуже відрізняються за довжиною
        const lengthDiff = Math.abs(textWord.length - word.length);
        if (lengthDiff > Math.max(word.length, textWord.length) * 0.5) {
          continue;
        }
        
        const similarity = this.calculateSimilarity(textWord, word);
        if (similarity > bestWordScore) {
          bestWordScore = similarity;
          // Ранній вихід для точного збігу
          if (similarity >= 0.95) {
            break;
          }
        }
      }
      
      if (bestWordScore >= 0.75) { // Підвищений поріг для слів
        matchedWords++;
        totalScore += bestWordScore;
      }
    }

    if (matchedWords === 0) {
      return { confidence: 0, matched: false };
    }

    // Розраховуємо впевненість на основі відсотка збігу слів та середньої якості збігу
    const relevantWords = words.filter(w => w.length >= minWordLength).length;
    if (relevantWords === 0) {
      return { confidence: 0, matched: false };
    }
    
    const wordMatchRatio = matchedWords / relevantWords;
    const avgQuality = totalScore / matchedWords;
    const confidence = wordMatchRatio * avgQuality;

    return {
      confidence,
      matched: confidence >= 0.8 && wordMatchRatio >= 0.6 // Підвищені пороги
    };
  }

  /**
   * Розраховує подібність між двома словами (0-1)
   */
  private calculateSimilarity(word1: string, word2: string): number {
    if (word1 === word2) return 1.0;
    
    // Ранній вихід для дуже різних за довжиною слів
    const maxLength = Math.max(word1.length, word2.length);
    const minLength = Math.min(word1.length, word2.length);
    if (maxLength === 0) return 1.0;
    if (minLength / maxLength < 0.4) return 0; // Занадто різні за довжиною
    
    // Обмежуємо довжину для продуктивності
    const maxProcessLength = 20;
    const str1 = word1.length > maxProcessLength ? word1.substring(0, maxProcessLength) : word1;
    const str2 = word2.length > maxProcessLength ? word2.substring(0, maxProcessLength) : word2;
    
    const distance = this.levenshteinDistance(str1, str2);
    const actualMaxLength = Math.max(str1.length, str2.length);
    return (actualMaxLength - distance) / actualMaxLength;
  }

  /**
   * Обчислює відстань Левенштейна між двома рядками (оптимізована версія)
   */
  private levenshteinDistance(str1: string, str2: string): number {
    // Ранній вихід для однакових рядків
    if (str1 === str2) return 0;
    
    // Ранній вихід для порожніх рядків
    if (str1.length === 0) return str2.length;
    if (str2.length === 0) return str1.length;
    
    // Обмежуємо обчислення для дуже довгих рядків
    if (str1.length > 15 || str2.length > 15) {
      // Для довгих рядків використовуємо спрощений алгоритм
      const commonPrefix = this.getCommonPrefixLength(str1, str2);
      const commonSuffix = this.getCommonSuffixLength(str1, str2);
      const totalCommon = commonPrefix + commonSuffix;
      const maxLength = Math.max(str1.length, str2.length);
      return maxLength - totalCommon;
    }

    // Стандартний алгоритм Левенштейна для коротших рядків
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator   // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Знаходить довжину спільного префіксу
   */
  private getCommonPrefixLength(str1: string, str2: string): number {
    let i = 0;
    const minLength = Math.min(str1.length, str2.length);
    while (i < minLength && str1[i] === str2[i]) {
      i++;
    }
    return i;
  }

  /**
   * Знаходить довжину спільного суфіксу
   */
  private getCommonSuffixLength(str1: string, str2: string): number {
    let i = 0;
    const minLength = Math.min(str1.length, str2.length);
    while (i < minLength && str1[str1.length - 1 - i] === str2[str2.length - 1 - i]) {
      i++;
    }
    return i;
  }

  /**
   * Отримує статистику розпізнавання
   */
  getStats(): {
    ukrainianTriggers: number;
    ukrainianVariations: number;
    englishTriggers: number;
    englishVariations: number;
    totalTriggers: number;
  } {
    const ukrainianVariations = this.ukrainianTriggers.reduce((sum, trigger) => sum + trigger.variations.length, 0);
    const englishVariations = this.englishTriggers.reduce((sum, trigger) => sum + trigger.variations.length, 0);
    
    return {
      ukrainianTriggers: this.ukrainianTriggers.length,
      ukrainianVariations,
      englishTriggers: this.englishTriggers.length,
      englishVariations,
      totalTriggers: this.ukrainianTriggers.length + this.englishTriggers.length
    };
  }
} 