export interface PowerWordMatch {
  originalWord: string;
  matchedWord: string;
  confidence: number;
  category: 'power' | 'strength' | 'energy' | 'intensity';
  intensity: 'low' | 'medium' | 'high';
  shouldReact: boolean;
}

export class PotuzhnoPowerWordsDetector {
  private readonly CONFIDENCE_THRESHOLD = 0.8; // 80% точність для більшої точності
  
  // Розширений словник синонімів "потужно" з варіаціями та помилками
  private readonly powerWordsVocabulary = {
    power: [
      {
        word: "потужно",
        variations: ["потужність", "потужний", "потужняк", "потужненько", "потужніший", "потужна", "потужне"],
        commonTypos: ["потыжно", "потужньо", "патужно", "потужка"],
        intensity: "high" as const
      },
      {
        word: "могутній",
        variations: ["могутньо", "могутність", "могутністю", "наймогутніший", "могутня", "могутнє"],
        commonTypos: ["могутный", "магутний", "могутныи", "можутній", "могучий"],
        intensity: "high" as const
      },
      {
        word: "сильний",
        variations: ["сильно", "сила", "силач", "найсильніший", "пересильний", "сильна", "сильне"],
        commonTypos: ["сільный", "сыльный", "сілий", "силний", "силнй"],
        intensity: "high" as const
      },
      {
        word: "міцний",
        variations: ["міцно", "міцність", "наміцніший", "міцна", "міцне"],
        commonTypos: ["міцный", "мицний", "міцний", "мыцный", "міцнй"],
        intensity: "medium" as const
      },
      {
        word: "дужий",
        variations: ["дужче", "дуже", "найдужчий", "передужий", "дужа", "дуже"],
        commonTypos: ["дужий", "дужый", "душий", "дуужий", "дужій"],
        intensity: "high" as const
      },
      {
        word: "крутий",
        variations: ["круто", "крутіше", "найкрутіший", "крута", "круте"],
        commonTypos: ["крутый", "крутій", "крытый", "крутй", "крутыи"],
        intensity: "high" as const
      },
      {
        word: "супер",
        variations: ["суперовий", "суперно", "суперський", "супер'я"],
        commonTypos: ["супир", "сыпер", "суперь", "супр", "супэр"],
        intensity: "high" as const
      },
      {
        word: "мега",
        variations: ["мегакрутий", "мегачудовий", "мегаклас"],
        commonTypos: ["мега", "мега", "мегу", "мэга", "меги"],
        intensity: "high" as const
      },
      {
        word: "ультра",
        variations: ["ультрамодний", "ультракрутий"],
        commonTypos: ["ультро", "ултра", "ультря", "ультру"],
        intensity: "high" as const
      },
      {
        word: "топ",
        variations: ["топовий", "топчик", "топово", "топ-клас"],
        commonTypos: ["топ", "тап", "топь", "топпп", "тооп"],
        intensity: "high" as const
      },
      {
        word: "класний",
        variations: ["класно", "класс", "класові", "найкласніший"],
        commonTypos: ["классный", "кланый", "клавший", "класний", "класнй"],
        intensity: "medium" as const
      },
      {
        word: "офігенний",
        variations: ["офігенно", "офіг", "офігеть", "офігенська", "офігенна"],
        commonTypos: ["афигенный", "офигенный", "афігенний", "офыгенный"],
        intensity: "high" as const
      },
      {
        word: "бомбезний",
        variations: ["бомбезно", "бомба", "бомбовий"],
        commonTypos: ["бомбезны", "бамбезний", "бомбэзный", "бомбизний"],
        intensity: "high" as const
      },
      {
        word: "неймовірний",
        variations: ["неймовірно", "неймовірність", "неймовірна"],
        commonTypos: ["неимоверный", "неймавірный", "неймовірный", "неїмовірний"],
        intensity: "high" as const
      },
      {
        word: "фантастичний",
        variations: ["фантастично", "фантастика", "фантастична"],
        commonTypos: ["фантастический", "фантастычный", "фантостичний"],
        intensity: "high" as const
      }
    ],
    energy: [
      {
        word: "енергійний",
        variations: ["енергійно", "енергія", "енергетичний"],
        commonTypos: ["энергийный", "енергийный", "енергійны", "енергіїний"],
        intensity: "medium" as const
      },
      {
        word: "динамічний",
        variations: ["динамічно", "динаміка", "динамічна"],
        commonTypos: ["динамический", "динамычный", "динамічны"],
        intensity: "medium" as const
      },
      {
        word: "вогняний",
        variations: ["вогняно", "вогонь", "вогняна", "полум'яний"],
        commonTypos: ["вогняны", "вогнаний", "вагняный", "вогн'яний"],
        intensity: "high" as const
      },
      {
        word: "блискавичний",
        variations: ["блискавично", "блискавка", "блискавична"],
        commonTypos: ["блискавычный", "блыскавычный", "блискавичны"],
        intensity: "high" as const
      }
    ]
  };

  constructor() {
    // Ініціалізація без зовнішніх залежностей
  }

  /**
   * Виявляє "потужно" слова в тексті з толерантністю до помилок
   */
  detectPowerWords(text: string): PowerWordMatch[] {
    const words = this.extractWords(text);
    const matches: PowerWordMatch[] = [];

    words.forEach(word => {
      if (word.length < 3) return; // Ігноруємо занадто короткі слова

      let foundMatch = false;
      // Перевіряємо кожну категорію в словнику
      for (const [categoryName, entries] of Object.entries(this.powerWordsVocabulary)) {
        if (foundMatch) break; // Якщо вже знайшли збіг, припиняємо пошук
        
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
  hasPowerWords(text: string): boolean {
    const matches = this.detectPowerWords(text);
    return matches.length > 0;
  }

  /**
   * Отримує найкращий збіг "потужно" слова
   */
  getBestPowerWordMatch(text: string): PowerWordMatch | null {
    const matches = this.detectPowerWords(text);
    
    if (matches.length === 0) return null;

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
  getDetectionStats(text: string): {
    totalMatches: number;
    averageConfidence: number;
    highIntensityMatches: number;
    shouldReact: boolean;
  } {
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
  testWithTypos(correctWord: string, typoVersions: string[]): Array<{
    typo: string;
    detected: boolean;
    confidence: number;
  }> {
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
  private findBestMatch(word: string, entry: any): { matchedWord: string; confidence: number } | null {
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
  private calculateSimilarity(word1: string, word2: string): number {
    const maxLength = Math.max(word1.length, word2.length);
    if (maxLength === 0) return 1.0;
    
    const distance = this.levenshteinDistance(word1, word2);
    return (maxLength - distance) / maxLength;
  }

  /**
   * Обчислює відстань Левенштейна між двома рядками
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
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
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private extractWords(text: string): string[] {
    // Видаляємо емодзі та спецсимволи, залишаємо тільки слова
    return text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter(word => word.length >= 2);
  }

  private mapToCategory(word: string): 'power' | 'strength' | 'energy' | 'intensity' {
    const powerWords = ['потужно', 'могутній', 'супер', 'мега', 'ультра', 'топ'];
    const strengthWords = ['сильний', 'міцний', 'дужий'];
    const energyWords = ['енергійний', 'динамічний', 'вогняний', 'блискавичний'];
    const intensityWords = ['крутий', 'класний', 'офігенний', 'бомбезний', 'неймовірний', 'фантастичний'];

    if (powerWords.some(pw => word.includes(pw) || pw.includes(word))) return 'power';
    if (strengthWords.some(sw => word.includes(sw) || sw.includes(word))) return 'strength';
    if (energyWords.some(ew => word.includes(ew) || ew.includes(word))) return 'energy';
    if (intensityWords.some(iw => word.includes(iw) || iw.includes(word))) return 'intensity';
    
    return 'power'; // Default
  }

  /**
   * Отримує емодзі для реакції на основі категорії та інтенсивності
   */
  getReactionEmoji(match: PowerWordMatch): string {
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
  getMotivationalResponse(match: PowerWordMatch): string {
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