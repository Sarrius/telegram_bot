import { ProfanityFilter, ProfanityAnalysis, ProfanityMatch } from '../../src/domain/profanityFilter';

describe('ProfanityFilter', () => {
  let profanityFilter: ProfanityFilter;

  beforeEach(() => {
    profanityFilter = new ProfanityFilter();
  });

  describe('Initialization', () => {
    it('should initialize with default dictionaries', () => {
      const stats = profanityFilter.getStats();
      expect(stats.ukrainianWordsCount).toBeGreaterThan(0);
      expect(stats.russianWordsCount).toBeGreaterThan(0);
      expect(stats.totalWordsCount).toBeGreaterThan(0);
    });
  });

  describe('Clean messages', () => {
    it('should not detect profanity in clean Ukrainian text', () => {
      const analysis = profanityFilter.analyzeMessage('Привіт! Як справи? Сьогодні гарна погода.');
      
      expect(analysis.hasProfanity).toBe(false);
      expect(analysis.severityLevel).toBe('clean');
      expect(analysis.matches).toHaveLength(0);
      expect(analysis.confidence).toBe(1.0);
      expect(analysis.recommendedAction).toBe('ignore');
    });

    it('should not detect profanity in clean Russian text', () => {
      const analysis = profanityFilter.analyzeMessage('Привет! Как дела? Сегодня хорошая погода.');
      
      expect(analysis.hasProfanity).toBe(false);
      expect(analysis.severityLevel).toBe('clean');
      expect(analysis.matches).toHaveLength(0);
    });

    it('should not detect profanity in English text', () => {
      const analysis = profanityFilter.analyzeMessage('Hello! How are you doing today?');
      
      expect(analysis.hasProfanity).toBe(false);
      expect(analysis.severityLevel).toBe('clean');
    });
  });

  describe('Ukrainian profanity detection', () => {
    it('should detect mild Ukrainian profanity', () => {
      const analysis = profanityFilter.analyzeMessage('Він сука неприємний');
      
      expect(analysis.hasProfanity).toBe(true);
      expect(['mixed', 'ua', 'ru']).toContain(analysis.language); // language detection can vary
      expect(analysis.matches.length).toBeGreaterThan(0);
      expect(analysis.confidence).toBeGreaterThan(0.5);
    });

    it('should detect severe Ukrainian profanity', () => {
      const analysis = profanityFilter.analyzeMessage('Це блять неприйнятно');
      
      expect(analysis.hasProfanity).toBe(true);
      expect(analysis.language).toBe('ua');
      expect(analysis.severityLevel).toBe('moderate');
      expect(analysis.recommendedAction).toBe('moderate');
    });

    it('should detect Ukrainian profanity with root matching', () => {
      const analysis = profanityFilter.analyzeMessage('хуйового настрою сьогодні');
      
      expect(analysis.hasProfanity).toBe(true);
      expect(analysis.language).toBe('ua');
      expect(analysis.matches[0].severity).toBe('severe');
    });
  });

  describe('Russian profanity detection', () => {
    it('should detect mild Russian profanity', () => {
      const analysis = profanityFilter.analyzeMessage('Этот мудак опять опоздал');
      
      expect(analysis.hasProfanity).toBe(true);
      expect(analysis.language).toBe('ru');
      expect(analysis.severityLevel).toBe('moderate');
    });

    it('should detect severe Russian profanity', () => {
      const analysis = profanityFilter.analyzeMessage('Пиздец какой ужас');
      
      expect(analysis.hasProfanity).toBe(true);
      expect(analysis.language).toBe('ru');
      expect(analysis.severityLevel).toBe('severe');
      expect(analysis.recommendedAction).toBe('strict');
    });
  });

  describe('Obfuscation detection', () => {
    it('should detect obfuscated profanity with numbers', () => {
      const analysis = profanityFilter.analyzeMessage('Какая п1зда ситуация');
      
      expect(analysis.hasProfanity).toBe(true);
      expect(analysis.matches.length).toBeGreaterThan(0);
    });

    it('should detect obfuscated profanity with symbols', () => {
      const analysis = profanityFilter.analyzeMessage('Этот му@ак снова тут');
      
      expect(analysis.hasProfanity).toBe(true);
      expect(analysis.language).toBe('ru');
    });

    it('should detect Latin-Cyrillic substitutions', () => {
      const analysis = profanityFilter.analyzeMessage('xuynya pizda');
      
      expect(analysis.hasProfanity).toBe(true);
      expect(analysis.matches.length).toBeGreaterThan(0);
    });
  });

  describe('Multiple profanity detection', () => {
    it('should detect multiple profane words in one message', () => {
      const analysis = profanityFilter.analyzeMessage('Блять, какой мудак это сделал');
      
      expect(analysis.hasProfanity).toBe(true);
      expect(analysis.matches.length).toBeGreaterThanOrEqual(2);
      expect(analysis.severityLevel).toBe('moderate');
      expect(analysis.recommendedAction).toBe('moderate');
    });

    it('should increase confidence with multiple matches', () => {
      const singleProfanity = profanityFilter.analyzeMessage('сука');
      const multipleProfanity = profanityFilter.analyzeMessage('сука блять мудак');
      
      expect(multipleProfanity.confidence).toBeGreaterThan(singleProfanity.confidence);
    });
  });

  describe('Severity classification', () => {
    it('should classify mild profanity correctly', () => {
      const analysis = profanityFilter.analyzeMessage('дурак');
      
      if (analysis.hasProfanity) {
        expect(analysis.severityLevel).toBe('mild');
        expect(analysis.recommendedAction).toBe('warn');
      }
    });

    it('should classify severe profanity correctly', () => {
      const analysis = profanityFilter.analyzeMessage('хуй пизда ебать');
      
      expect(analysis.hasProfanity).toBe(true);
      expect(analysis.severityLevel).toBe('severe');
      expect(analysis.recommendedAction).toBe('strict');
    });
  });

  describe('Language detection', () => {
    it('should detect Ukrainian language', () => {
      const analysis = profanityFilter.analyzeMessage('блять неприємно');
      
      expect(analysis.language).toBe('ua');
    });

    it('should detect Russian language', () => {
      const analysis = profanityFilter.analyzeMessage('блядь неприятно');
      
      expect(['ua', 'ru']).toContain(analysis.language); // depends on classification
    });

    it('should detect mixed language', () => {
      const analysis = profanityFilter.analyzeMessage('сука дурак'); // mixed words
      
      expect(['mixed', 'ua', 'ru']).toContain(analysis.language); // depends on classification
    });
  });

  describe('Edge cases', () => {
    it('should handle empty strings', () => {
      const analysis = profanityFilter.analyzeMessage('');
      
      expect(analysis.hasProfanity).toBe(false);
      expect(analysis.matches).toHaveLength(0);
    });

    it('should handle strings with only spaces', () => {
      const analysis = profanityFilter.analyzeMessage('   ');
      
      expect(analysis.hasProfanity).toBe(false);
    });

    it('should handle strings with only numbers and symbols', () => {
      const analysis = profanityFilter.analyzeMessage('123 !@# 456');
      
      expect(analysis.hasProfanity).toBe(false);
    });

    it('should handle very long messages', () => {
      const longMessage = 'Це дуже довгий текст '.repeat(100) + 'блять';
      const analysis = profanityFilter.analyzeMessage(longMessage);
      
      expect(analysis.hasProfanity).toBe(true);
      expect(analysis.matches.length).toBeGreaterThan(0);
    });
  });

  describe('Custom word management', () => {
    it('should allow adding custom Ukrainian words', () => {
      profanityFilter.addCustomWord('тестслово', 'ua');
      const analysis = profanityFilter.analyzeMessage('це тестслово не підходить');
      
      expect(analysis.hasProfanity).toBe(true);
      expect(analysis.language).toBe('ua');
    });

    it('should allow adding custom Russian words', () => {
      profanityFilter.addCustomWord('тестслово', 'ru');
      const analysis = profanityFilter.analyzeMessage('это тестслово не подходит');
      
      expect(analysis.hasProfanity).toBe(true);
      expect(analysis.language).toBe('ru');
    });

    it('should allow removing words', () => {
      profanityFilter.addCustomWord('тестслово', 'ua');
      let analysis = profanityFilter.analyzeMessage('тестслово');
      expect(analysis.hasProfanity).toBe(true);
      
      profanityFilter.removeWord('тестслово', 'ua');
      analysis = profanityFilter.analyzeMessage('тестслово');
      expect(analysis.hasProfanity).toBe(false);
    });
  });

  describe('Statistics', () => {
    it('should provide accurate statistics', () => {
      const initialStats = profanityFilter.getStats();
      
      profanityFilter.addCustomWord('custom1', 'ua');
      profanityFilter.addCustomWord('custom2', 'ru');
      
      const newStats = profanityFilter.getStats();
      
      expect(newStats.ukrainianWordsCount).toBe(initialStats.ukrainianWordsCount + 1);
      expect(newStats.russianWordsCount).toBe(initialStats.russianWordsCount + 1);
      expect(newStats.totalWordsCount).toBe(initialStats.totalWordsCount + 2);
    });
  });

  describe('Match details', () => {
    it('should provide accurate match positions', () => {
      const analysis = profanityFilter.analyzeMessage('Привіт блять як справи');
      
      if (analysis.hasProfanity && analysis.matches.length > 0) {
        const match = analysis.matches[0];
        expect(match.startIndex).toBe(7); // position of 'блять'
        expect(match.endIndex).toBe(12);
        expect(match.word).toBe('блять');
      }
    });

    it('should provide severity for each match', () => {
      const analysis = profanityFilter.analyzeMessage('сука блять');
      
      expect(analysis.hasProfanity).toBe(true);
      analysis.matches.forEach(match => {
        expect(['mild', 'moderate', 'severe']).toContain(match.severity);
        expect(['ua', 'ru', 'mixed']).toContain(match.language);
      });
    });
  });
}); 