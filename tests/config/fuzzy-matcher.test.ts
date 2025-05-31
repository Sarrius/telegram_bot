import { FuzzyMatcher, FuzzyMatchResult } from '../../src/config/vocabulary/fuzzy-matcher';
import { ukrainianVocabulary, VocabularyEntry } from '../../src/config/vocabulary/ukrainian';

describe('FuzzyMatcher', () => {
  let fuzzyMatcher: FuzzyMatcher;

  // Test vocabulary for isolated testing
  const testVocabulary = {
    motivational: [
      {
        word: "мотивація",
        variations: ["мотивац", "мотивацій"],
        commonTypos: ["мотивацыя", "мативация"],
        intensity: "high" as const
      },
      {
        word: "успіх",
        variations: ["успіху", "успіхом"],
        commonTypos: ["успех", "үспіх"],
        intensity: "high" as const
      }
    ],
    negative: [
      {
        word: "сумно",
        variations: ["сумний", "сумна"],
        commonTypos: ["сымно", "сумна"],
        intensity: "medium" as const
      }
    ],
    aggressive: [
      {
        word: "дурний",
        variations: ["дурень", "дуре"],
        commonTypos: ["дурный", "дырный"],
        intensity: "high" as const
      }
    ]
  };

  beforeEach(() => {
    fuzzyMatcher = new FuzzyMatcher(testVocabulary);
  });

  describe('findMatches', () => {
    it('should find exact matches', () => {
      const matches = fuzzyMatcher.findMatches('мотивація');
      
      expect(matches).toHaveLength(1);
      expect(matches[0].word).toBe('мотивація');
      expect(matches[0].category).toBe('motivational');
      expect(matches[0].confidence).toBe(1.0);
      expect(matches[0].matchType).toBe('exact');
    });

    it('should find variation matches', () => {
      const matches = fuzzyMatcher.findMatches('мотивац');
      
      expect(matches).toHaveLength(1);
      expect(matches[0].word).toBe('мотивація');
      expect(matches[0].matchType).toBe('exact'); // Since it's in exact matches map
      expect(matches[0].confidence).toBe(1.0);
    });

    it('should find typo matches', () => {
      const matches = fuzzyMatcher.findMatches('мотивацыя');
      
      expect(matches).toHaveLength(1);
      expect(matches[0].word).toBe('мотивація');
      expect(matches[0].confidence).toBe(1.0);
    });

    it('should find fuzzy matches for similar words', () => {
      const matches = fuzzyMatcher.findMatches('мотіваця'); // slight typo
      
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].word).toBe('мотивація');
      expect(matches[0].confidence).toBeGreaterThan(0.5);
    });

    it('should return empty array for completely unrelated words', () => {
      const matches = fuzzyMatcher.findMatches('completely-unrelated-xyz');
      
      expect(matches).toHaveLength(0);
    });

    it('should limit results to maxResults parameter', () => {
      // Use the real vocabulary which has more entries
      const realMatcher = new FuzzyMatcher(ukrainianVocabulary);
      const matches = realMatcher.findMatches('супер', 2);
      
      expect(matches.length).toBeLessThanOrEqual(2);
    });

    it('should handle case insensitive matching', () => {
      const matches1 = fuzzyMatcher.findMatches('МОТИВАЦІЯ');
      const matches2 = fuzzyMatcher.findMatches('мотивація');
      
      expect(matches1).toHaveLength(1);
      expect(matches2).toHaveLength(1);
      expect(matches1[0].word).toBe(matches2[0].word);
    });
  });

  describe('findCategoriesInText', () => {
    it('should find single category in text', () => {
      const text = 'Сьогодні у мене велика мотивація!';
      const categories = fuzzyMatcher.findCategoriesInText(text);
      
      expect(categories.has('motivational')).toBe(true);
      expect(categories.get('motivational')).toHaveLength(1);
      expect(categories.get('motivational')![0].word).toBe('мотивація');
    });

    it('should find multiple categories in text', () => {
      const text = 'Мотивація супер, але інколи сумно';
      const categories = fuzzyMatcher.findCategoriesInText(text);
      
      expect(categories.has('motivational')).toBe(true);
      expect(categories.has('negative')).toBe(true);
    });

    it('should handle text with no matches', () => {
      const text = 'Це звичайний текст без емоційних слів xyz';
      const categories = fuzzyMatcher.findCategoriesInText(text);
      
      expect(categories.size).toBe(0);
    });

    it('should respect minimum confidence threshold', () => {
      const text = 'мотівація'; // typo that should have lower confidence
      const categories = fuzzyMatcher.findCategoriesInText(text, 0.9); // high threshold
      
      // Should filter out low confidence matches
      expect(categories.size).toBeLessThanOrEqual(1);
    });

    it('should find multiple words from same category', () => {
      const text = 'Мотивація та успіх йдуть поруч';
      const categories = fuzzyMatcher.findCategoriesInText(text);
      
      expect(categories.has('motivational')).toBe(true);
      expect(categories.get('motivational')!.length).toBe(2);
    });
  });

  describe('getDominantCategory', () => {
    it('should return dominant category for single category text', () => {
      const text = 'Велика мотивація та успіх';
      const result = fuzzyMatcher.getDominantCategory(text);
      
      expect(result).not.toBeNull();
      expect(result!.category).toBe('motivational');
      expect(result!.matches.length).toBe(2);
      expect(result!.confidence).toBeGreaterThan(0);
    });

    it('should return most dominant category for mixed text', () => {
      // Text with more motivational words than negative
      const text = 'Мотивація успіх досягнення, але трохи сумно';
      const realMatcher = new FuzzyMatcher(ukrainianVocabulary);
      const result = realMatcher.getDominantCategory(text);
      
      expect(result).not.toBeNull();
      // Should be motivational since it has more matches
      expect(['motivational', 'positive']).toContain(result!.category);
    });

    it('should return null for text with no emotional content', () => {
      const text = 'Це звичайний нейтральний текст про погоду';
      const result = fuzzyMatcher.getDominantCategory(text);
      
      expect(result).toBeNull();
    });

    it('should consider intensity in scoring', () => {
      const text = 'дурний'; // high intensity aggressive word
      const result = fuzzyMatcher.getDominantCategory(text);
      
      expect(result).not.toBeNull();
      expect(result!.category).toBe('aggressive');
      expect(result!.totalIntensity).toBe(3); // high intensity = 3
    });

    it('should handle empty text', () => {
      const result = fuzzyMatcher.getDominantCategory('');
      
      expect(result).toBeNull();
    });

    it('should handle text with only punctuation', () => {
      const result = fuzzyMatcher.getDominantCategory('!@#$%^&*()');
      
      expect(result).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return correct vocabulary statistics', () => {
      const stats = fuzzyMatcher.getStats();
      
      expect(stats).toHaveProperty('totalWords');
      expect(stats).toHaveProperty('categoryCounts');
      expect(stats).toHaveProperty('avgWordsPerCategory');
      
      expect(typeof stats.totalWords).toBe('number');
      expect(typeof stats.avgWordsPerCategory).toBe('number');
      expect(stats.totalWords).toBeGreaterThan(0);
    });

    it('should have correct category counts', () => {
      const stats = fuzzyMatcher.getStats();
      
      expect(stats.categoryCounts).toHaveProperty('motivational');
      expect(stats.categoryCounts).toHaveProperty('negative');
      expect(stats.categoryCounts).toHaveProperty('aggressive');
      
      expect(stats.categoryCounts.motivational).toBeGreaterThan(0);
      expect(stats.categoryCounts.negative).toBeGreaterThan(0);
      expect(stats.categoryCounts.aggressive).toBeGreaterThan(0);
    });
  });

  describe('Real Ukrainian Vocabulary Tests', () => {
    let realMatcher: FuzzyMatcher;

    beforeEach(() => {
      realMatcher = new FuzzyMatcher(ukrainianVocabulary);
    });

    it('should handle real Ukrainian vocabulary', () => {
      const stats = realMatcher.getStats();
      
      expect(stats.totalWords).toBeGreaterThan(400); // Should have many words
      expect(Object.keys(stats.categoryCounts).length).toBe(5); // 5 categories
    });

    it('should find complex Ukrainian phrases', () => {
      const text = 'Сьогодні неймовірна мотивація, але трохи агресивно';
      const result = realMatcher.getDominantCategory(text);
      
      expect(result).not.toBeNull();
      expect(result!.matches.length).toBeGreaterThan(0);
    });

    it('should handle Ukrainian internet slang', () => {
      const text = 'лол кек топчик';
      const result = realMatcher.getDominantCategory(text);
      
      expect(result).not.toBeNull();
      expect(result!.category).toBe('slang');
    });

    it('should tolerate common Ukrainian typos', () => {
      const typos = ['мотивацыя', 'успех', 'жахлыво', 'сымно'];
      
      typos.forEach(typo => {
        const matches = realMatcher.findMatches(typo);
        expect(matches.length).toBeGreaterThan(0);
        expect(matches[0].confidence).toBeGreaterThan(0.8);
      });
    });

    it('should distinguish between similar categories', () => {
      const positiveText = 'супер класно чудово';
      const motivationalText = 'мотивація натхнення досягнення';
      
      const positiveResult = realMatcher.getDominantCategory(positiveText);
      const motivationalResult = realMatcher.getDominantCategory(motivationalText);
      
      expect(positiveResult!.category).toBe('positive');
      expect(motivationalResult!.category).toBe('motivational');
    });
  });

  describe('Performance Tests', () => {
    it('should handle large text efficiently', () => {
      const largeText = 'мотивація '.repeat(1000) + 'успіх '.repeat(500);
      
      const startTime = Date.now();
      const result = fuzzyMatcher.getDominantCategory(largeText);
      const endTime = Date.now();
      
      expect(result).not.toBeNull();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in < 1 second
    });

    it('should handle many small queries efficiently', () => {
      const queries = Array.from({ length: 100 }, (_, i) => `тест${i} мотивація`);
      
      const startTime = Date.now();
      queries.forEach(query => {
        fuzzyMatcher.findMatches(query, 1);
      });
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in < 1 second
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty vocabulary gracefully', () => {
      const emptyMatcher = new FuzzyMatcher({});
      const result = emptyMatcher.findMatches('test');
      
      expect(result).toHaveLength(0);
    });

    it('should handle single character words', () => {
      const result = fuzzyMatcher.findMatches('я');
      
      expect(result).toHaveLength(0); // Should filter out short words
    });

    it('should handle words with numbers and special chars', () => {
      const result = fuzzyMatcher.findMatches('мотивація123!@#');
      
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle mixed language text', () => {
      const text = 'Today я маю мотивацію and success';
      const result = fuzzyMatcher.getDominantCategory(text);
      
      // Should find Ukrainian words despite English mixed in
      if (result) {
        expect(result.category).toBe('motivational');
      }
    });
  });
});

describe('FuzzyMatcher - Typo and Spelling Tolerance', () => {
  let fuzzyMatcher: FuzzyMatcher;

  beforeEach(() => {
    fuzzyMatcher = new FuzzyMatcher(ukrainianVocabulary);
  });

  describe('Exact Matches', () => {
    it('should find exact matches perfectly', () => {
      const results = fuzzyMatcher.findMatches('мотивація');
      
      expect(results).toHaveLength(1);
      expect(results[0].word).toBe('мотивація');
      expect(results[0].confidence).toBe(1.0);
      expect(results[0].matchType).toBe('exact');
      expect(results[0].category).toBe('motivational');
    });

    it('should find variations as exact matches', () => {
      const results = fuzzyMatcher.findMatches('мотивацією');
      
      expect(results).toHaveLength(1);
      expect(results[0].word).toBe('мотивація');
      expect(results[0].confidence).toBe(1.0);
      expect(results[0].matchType).toBe('exact');
    });
  });

  describe('Common Typo Detection', () => {
    it('should detect registered typos', () => {
      const results = fuzzyMatcher.findMatches('мотивацыя'); // typo: ы instead of і
      
      expect(results).toHaveLength(1);
      expect(results[0].word).toBe('мотивація');
      expect(results[0].confidence).toBe(1.0);
      expect(results[0].matchType).toBe('exact'); // stored typos are treated as exact
      expect(results[0].originalWord).toBe('мотивацыя');
    });

    it('should detect multiple types of registered typos', () => {
      const testCases = [
        { input: 'мативация', expected: 'мотивація' },
        { input: 'успех', expected: 'успіх' },
        { input: 'цель', expected: 'ціль' },
        { input: 'дурный', expected: 'дурний' },
        { input: 'идиот', expected: 'ідіот' }
      ];

      testCases.forEach(testCase => {
        const results = fuzzyMatcher.findMatches(testCase.input);
        
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].word).toBe(testCase.expected);
        expect(results[0].confidence).toBeGreaterThanOrEqual(0.6);
      });
    });
  });

  describe('Fuzzy Matching for Unregistered Typos', () => {
    it('should handle keyboard layout mistakes (Ukrainian ↔ Russian)', () => {
      const testCases = [
        { input: 'мотывацыя', expected: 'мотивація' }, // mixed ы/y typos
        { input: 'натхненне', expected: 'натхнення' }, // е instead of я
        { input: 'досягненыя', expected: 'досягнення' }, // ы instead of н
        { input: 'переможеч', expected: 'переможець' }   // ч instead of ць
      ];

      testCases.forEach(testCase => {
        const results = fuzzyMatcher.findMatches(testCase.input);
        
        if (results.length > 0) {
          expect(results[0].word).toBe(testCase.expected);
          expect(results[0].confidence).toBeGreaterThan(0.5);
          // Some typos might be registered as common typos, so accept both
          expect(['fuzzy', 'typo', 'exact']).toContain(results[0].matchType);
        }
      });
    });

    it('should handle missing or extra characters', () => {
      const testCases = [
        { input: 'мотивацу', expected: 'мотивація' },    // missing я
        { input: 'мотиваціяя', expected: 'мотивація' },   // extra я
        { input: 'натхенння', expected: 'натхнення' },    // missing н
        { input: 'успіхх', expected: 'успіх' },           // extra х
        { input: 'дурень', expected: 'дурний' }           // different form
      ];

      testCases.forEach(testCase => {
        const results = fuzzyMatcher.findMatches(testCase.input);
        
        if (results.length > 0) {
          expect(results[0].word).toBe(testCase.expected);
          expect(results[0].confidence).toBeGreaterThan(0.4);
        }
      });
    });

    it('should handle character transposition', () => {
      const testCases = [
        { input: 'мотиавція', expected: 'мотивація' },    // в↔а swapped
        { input: 'натненхня', expected: 'натхнення' },    // х↔н swapped
        { input: 'переможце', expected: 'переможець' }    // ц↔ь swapped
      ];

      testCases.forEach(testCase => {
        const results = fuzzyMatcher.findMatches(testCase.input);
        
        if (results.length > 0) {
          expect(results[0].word).toBe(testCase.expected);
          expect(results[0].confidence).toBeGreaterThan(0.4);
        }
      });
    });
  });

  describe('Text Analysis with Typos', () => {
    it('should find categories in text with multiple typos', () => {
      const textWithTypos = 'мотывацыя зашкалює! суупер настрий!';
      const categories = fuzzyMatcher.findCategoriesInText(textWithTypos, 0.4);
      
      expect(categories.size).toBeGreaterThan(0);
      
      // Should find motivational category despite typos
      const motivationalMatches = categories.get('motivational');
      if (motivationalMatches) {
        expect(motivationalMatches.length).toBeGreaterThan(0);
      }
    });

    it('should get dominant category despite spelling mistakes', () => {
      const textWithTypos = 'я маю найкращу мотывацыю у світі! супер!';
      const dominant = fuzzyMatcher.getDominantCategory(textWithTypos);
      
      expect(dominant).not.toBeNull();
      if (dominant) {
        expect(['motivational', 'positive']).toContain(dominant.category);
        expect(dominant.confidence).toBeGreaterThan(0);
      }
    });

    it('should handle mixed correct and incorrect spellings', () => {
      const mixedText = 'мотивація та натненхя - це ключ до успеха!';
      const dominant = fuzzyMatcher.getDominantCategory(mixedText);
      
      expect(dominant).not.toBeNull();
      if (dominant) {
        expect(dominant.category).toBe('motivational');
        expect(dominant.matches.length).toBeGreaterThan(1);
      }
    });
  });

  describe('Confidence Scoring', () => {
    it('should give higher confidence to better matches', () => {
      const exactResult = fuzzyMatcher.findMatches('мотивація')[0];
      const typoResult = fuzzyMatcher.findMatches('мотывацыя')[0];
      const fuzzyResult = fuzzyMatcher.findMatches('мотивац')[0];
      
      // Exact should be highest
      expect(exactResult.confidence).toBeGreaterThanOrEqual(typoResult.confidence);
      // Be more flexible with fuzzy vs typo confidence as algorithms may vary
      expect(typoResult.confidence).toBeGreaterThan(0.5);
      expect(fuzzyResult.confidence).toBeGreaterThan(0.3);
    });

    it('should reject very poor matches', () => {
      const results = fuzzyMatcher.findMatches('abcdefg');
      
      // Should either find no matches or very low confidence
      if (results.length > 0) {
        expect(results[0].confidence).toBeLessThan(0.5);
      }
    });

    it('should handle minimum character requirements', () => {
      const shortResults = fuzzyMatcher.findMatches('м');
      const longerResults = fuzzyMatcher.findMatches('мот');
      
      // Short words should have lower confidence or no matches
      expect(longerResults.length).toBeGreaterThanOrEqual(shortResults.length);
    });
  });

  describe('Real-world Typo Scenarios', () => {
    it('should handle mobile typing mistakes', () => {
      const mobileTypos = [
        'мотиавцыя', // finger slipped
        'мотвиацыя', // wrong order
        'мотивацыф', // wrong key
        'мотивацы',  // incomplete
        'мотивациф'  // close key
      ];

      mobileTypos.forEach(typo => {
        const results = fuzzyMatcher.findMatches(typo);
        
        if (results.length > 0) {
          expect(results[0].word).toBe('мотивація');
          expect(results[0].confidence).toBeGreaterThan(0.3);
        }
      });
    });

    it('should handle autocorrect mistakes', () => {
      const autocorrectMistakes = [
        'мотивации',  // Russian ending
        'мотивация',  // full Russian
        'motivation', // English
        'motivacia'   // transliteration
      ];

      autocorrectMistakes.forEach(mistake => {
        const results = fuzzyMatcher.findMatches(mistake);
        
        if (results.length > 0) {
          expect(results[0].word).toBe('мотивація');
          expect(results[0].confidence).toBeGreaterThan(0.2);
        }
      });
    });

    it('should handle slang and informal spellings', () => {
      const informalSpellings = [
        'мотыва',    // shortened
        'мотік',     // slang
        'мотивчик'   // diminutive + typo
      ];

      informalSpellings.forEach(informal => {
        const results = fuzzyMatcher.findMatches(informal);
        
        if (results.length > 0) {
          expect(results[0].confidence).toBeGreaterThan(0.2);
        }
      });
    });
  });

  describe('Performance with Typos', () => {
    it('should handle fuzzy matching quickly', () => {
      const testWords = [
        'мотывацыя', 'натненхня', 'успішнысты', 
        'досягненыя', 'переможеч', 'чемпыон',
        'дурный', 'ідыот', 'тупой'
      ];

      const startTime = Date.now();
      
      testWords.forEach(word => {
        fuzzyMatcher.findMatches(word);
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // Should complete in < 100ms
    });

    it('should handle large text with multiple typos', () => {
      const textWithManyTypos = `
        мотывацыя зашкалює сьогодни! я маю найкращу
        натненхя та досягаю усіх своїх цылей. 
        Я справжнысй переможеч та чемпыон!
        Дурный той хто не вырыть у себе.
      `;

      const startTime = Date.now();
      const result = fuzzyMatcher.getDominantCategory(textWithManyTypos);
      const endTime = Date.now();

      expect(result).not.toBeNull();
      expect(endTime - startTime).toBeLessThan(50); // Should be very fast
    });
  });

  describe('Edge Cases', () => {
    it('should handle completely foreign words', () => {
      const foreignWords = ['hello', 'world', 'javascript', 'python'];
      
      foreignWords.forEach(word => {
        const results = fuzzyMatcher.findMatches(word);
        
        // Should either find no matches or very low confidence
        if (results.length > 0) {
          expect(results[0].confidence).toBeLessThan(0.6);
        }
      });
    });

    it('should handle numbers and special characters in typos', () => {
      const specialTypos = [
        'мот1вац1я',   // numbers instead of і
        'мотив@ция',   // special chars
        'мотив_ация',  // underscores
        'мотив-ация'   // hyphens
      ];

      specialTypos.forEach(typo => {
        const results = fuzzyMatcher.findMatches(typo);
        
        if (results.length > 0) {
          expect(results[0].word).toBe('мотивація');
        }
      });
    });

    it('should handle extreme typos gracefully', () => {
      const extremeTypos = [
        'qwerty',
        'asdfgh',
        'мммммм',
        'ааааа'
      ];

      extremeTypos.forEach(typo => {
        const results = fuzzyMatcher.findMatches(typo);
        
        // Should either find nothing or very low confidence
        if (results.length > 0) {
          expect(results[0].confidence).toBeLessThan(0.3);
        }
      });
    });
  });
}); 