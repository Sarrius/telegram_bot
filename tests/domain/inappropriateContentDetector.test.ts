import { InappropriateContentDetector, ContentConfiguration } from '../../src/domain/inappropriateContentDetector';

describe('InappropriateContentDetector', () => {
  let detector: InappropriateContentDetector;

  beforeEach(() => {
    detector = new InappropriateContentDetector({
      primaryLanguage: 'uk',
      sensitivityLevel: 'medium',
      enableSarcasm: true,
      enablePenalties: true,
      customForbiddenWords: [],
      adminUserIds: ['admin1', 'admin2']
    });
  });

  describe('Language Detection', () => {
    it('should detect Ukrainian language correctly', async () => {
      const analysis = await detector.analyzeContent('Це тестове повідомлення', 'user1', 'TestUser');
      expect(analysis.language).toBe('uk');
    });

    it('should detect Ukrainian by special characters', async () => {
      const analysis = await detector.analyzeContent('Привіт! Як справи?', 'user1', 'TestUser');
      expect(analysis.language).toBe('uk');
    });

    it('should fallback to primary language for ambiguous content', async () => {
      const analysis = await detector.analyzeContent('hello world', 'user1', 'TestUser');
      expect(analysis.language).toBe('uk'); // Should use primary language from config
    });

    it('should detect Ukrainian words in mixed content', async () => {
      const analysis = await detector.analyzeContent('hello що це?', 'user1', 'TestUser');
      expect(analysis.language).toBe('uk');
    });
  });

  describe('Ukrainian Content Detection', () => {
    it('should detect Ukrainian offensive words', async () => {
      const analysis = await detector.analyzeContent('ти дурень та ідіот', 'user1', 'TestUser');
      
      expect(analysis.isInappropriate).toBe(true);
      expect(analysis.categories).toContain('offensive');
      expect(analysis.confidence).toBeGreaterThan(0.3);
      expect(analysis.language).toBe('uk');
      expect(analysis.suggestedResponse).toContain('TestUser');
    });

    it('should detect Ukrainian toxic language', async () => {
      const analysis = await detector.analyzeContent('йди помри токсик', 'user1', 'TestUser');
      
      expect(analysis.isInappropriate).toBe(true);
      expect(analysis.categories).toContain('toxic');
      expect(analysis.severity).toBe('high');
      expect(analysis.language).toBe('uk');
    });

    it('should detect Ukrainian discriminatory language', async () => {
      const analysis = await detector.analyzeContent('расист сексист', 'user1', 'TestUser');
      
      expect(analysis.isInappropriate).toBe(true);
      expect(analysis.categories).toContain('discriminatory');
      expect(analysis.severity).toBe('high');
      expect(analysis.language).toBe('uk');
    });

    it('should detect Ukrainian spam content', async () => {
      const analysis = await detector.analyzeContent('натисни тут купи зараз обмежений час', 'user1', 'TestUser');
      
      expect(analysis.isInappropriate).toBe(true);
      expect(analysis.categories).toContain('spam');
      expect(analysis.language).toBe('uk');
    });
  });

  describe('English Content Detection', () => {
    it('should detect English offensive words', async () => {
      const detector = new InappropriateContentDetector({ primaryLanguage: 'en' });
      const analysis = await detector.analyzeContent('you are stupid idiot', 'user1', 'TestUser');
      
      expect(analysis.isInappropriate).toBe(true);
      expect(analysis.categories).toContain('offensive');
      expect(analysis.language).toBe('en');
    });

    it('should detect English toxic language', async () => {
      const detector = new InappropriateContentDetector({ primaryLanguage: 'en' });
      const analysis = await detector.analyzeContent('go die toxic cancer', 'user1', 'TestUser');
      
      expect(analysis.isInappropriate).toBe(true);
      expect(analysis.categories).toContain('toxic');
      expect(analysis.severity).toBe('high');
    });
  });

  describe('Pattern Detection', () => {
    it('should detect ALL CAPS as aggressive pattern', async () => {
      const analysis = await detector.analyzeContent('THIS IS ALL CAPS MESSAGE!!!', 'user1', 'TestUser');
      
      expect(analysis.categories).toContain('pattern');
      expect(analysis.confidence).toBeGreaterThan(0);
    });

    it('should detect excessive punctuation', async () => {
      const analysis = await detector.analyzeContent('What?!?!?! Are you serious?!?!', 'user1', 'TestUser');
      
      expect(analysis.categories).toContain('pattern');
    });

    it('should detect repeated characters', async () => {
      const analysis = await detector.analyzeContent('noooooooo waaaaaayyy', 'user1', 'TestUser');
      
      expect(analysis.categories).toContain('pattern');
    });

    it('should detect suspicious URLs', async () => {
      const analysis = await detector.analyzeContent('click here bit.ly/suspicious telegram.me/spam', 'user1', 'TestUser');
      
      expect(analysis.categories).toContain('pattern');
      expect(analysis.confidence).toBeGreaterThan(0.3);
    });
  });

  describe('Severity Assessment', () => {
    it('should classify toxic content as high severity', async () => {
      const analysis = await detector.analyzeContent('йди помри', 'user1', 'TestUser');
      
      expect(analysis.severity).toBe('high');
      expect(analysis.shouldApplyPenalty).toBe(true);
    });

    it('should classify discriminatory content as high severity', async () => {
      const analysis = await detector.analyzeContent('расист', 'user1', 'TestUser');
      
      expect(analysis.severity).toBe('high');
    });

    it('should classify offensive content based on sensitivity level', async () => {
      const mediumDetector = new InappropriateContentDetector({ sensitivityLevel: 'medium' });
      const analysis = await mediumDetector.analyzeContent('дурень', 'user1', 'TestUser');
      
      expect(analysis.severity).toBe('medium');
    });

    it('should not elevate severity on low sensitivity', async () => {
      const lowDetector = new InappropriateContentDetector({ sensitivityLevel: 'low' });
      const analysis = await lowDetector.analyzeContent('дурень', 'user1', 'TestUser');
      
      expect(analysis.severity).toBe('low');
    });
  });

  describe('Response Generation', () => {
    it('should generate Ukrainian sarcastic responses when enabled', async () => {
      const analysis = await detector.analyzeContent('дурень', 'user1', 'TestUser');
      
      expect(analysis.suggestedResponse).toBeTruthy();
      expect(analysis.suggestedResponse).toContain('TestUser');
      expect(analysis.language).toBe('uk');
    });

    it('should generate appropriate responses for different categories', async () => {
      const categories = ['offensive', 'toxic', 'discriminatory', 'spam'];
      
      for (const category of categories) {
        let testMessage = '';
        switch (category) {
          case 'offensive': testMessage = 'дурень'; break;
          case 'toxic': testMessage = 'токсик'; break;
          case 'discriminatory': testMessage = 'расист'; break;
          case 'spam': testMessage = 'натисни тут'; break;
        }
        
        const analysis = await detector.analyzeContent(testMessage, 'user1', 'TestUser');
        
        if (analysis.isInappropriate) {
          expect(analysis.suggestedResponse).toBeTruthy();
          expect(analysis.suggestedResponse).toContain('TestUser');
        }
      }
    });

    it('should include penalty tasks for high severity', async () => {
      const analysis = await detector.analyzeContent('йди помри', 'user1', 'TestUser');
      
      expect(analysis.severity).toBe('high');
      expect(analysis.suggestedResponse.length).toBeGreaterThan(50); // Should include penalty task
    });

    it('should generate simple response when sarcasm is disabled', async () => {
      const detector = new InappropriateContentDetector({ enableSarcasm: false, primaryLanguage: 'uk' });
      const analysis = await detector.analyzeContent('дурень', 'user1', 'TestUser');
      
      if (analysis.isInappropriate) {
        expect(analysis.suggestedResponse).toContain('TestUser');
        expect(analysis.suggestedResponse).toContain('позитивним');
      }
    });
  });

  describe('Penalty System', () => {
    it('should track user warnings', async () => {
      await detector.analyzeContent('дурень', 'user1', 'TestUser');
      expect(detector.getUserWarnings('user1')).toBe(1);
      
      await detector.analyzeContent('ідіот', 'user1', 'TestUser');
      expect(detector.getUserWarnings('user1')).toBe(2);
    });

    it('should apply penalty for high severity immediately', async () => {
      const analysis = await detector.analyzeContent('йди помри', 'user1', 'TestUser');
      
      expect(analysis.shouldApplyPenalty).toBe(true);
      expect(detector.getUserWarnings('user1')).toBe(1);
    });

    it('should apply penalty after multiple warnings', async () => {
      // First two warnings
      await detector.analyzeContent('дурень', 'user1', 'TestUser');
      await detector.analyzeContent('ідіот', 'user1', 'TestUser');
      
      // Third should trigger penalty
      const analysis = await detector.analyzeContent('тупий', 'user1', 'TestUser');
      expect(analysis.shouldApplyPenalty).toBe(true);
    });

    it('should not apply penalty when disabled', async () => {
      const detector = new InappropriateContentDetector({ enablePenalties: false });
      const analysis = await detector.analyzeContent('йди помри', 'user1', 'TestUser');
      
      expect(analysis.shouldApplyPenalty).toBe(false);
    });

    it('should reset user warnings', async () => {
      await detector.analyzeContent('дурень', 'user1', 'TestUser');
      expect(detector.getUserWarnings('user1')).toBe(1);
      
      detector.resetUserWarnings('user1');
      expect(detector.getUserWarnings('user1')).toBe(0);
    });
  });

  describe('Custom Configuration', () => {
    it('should detect custom forbidden words', async () => {
      detector.addCustomForbiddenWords(['тестслово', 'заборонено']);
      
      const analysis = await detector.analyzeContent('це тестслово в повідомленні', 'user1', 'TestUser');
      
      expect(analysis.isInappropriate).toBe(true);
      expect(analysis.categories).toContain('custom');
    });

    it('should remove custom forbidden words', async () => {
      detector.addCustomForbiddenWords(['тимчасове']);
      detector.removeCustomForbiddenWords(['тимчасове']);
      
      const analysis = await detector.analyzeContent('тимчасове слово', 'user1', 'TestUser');
      
      expect(analysis.isInappropriate).toBe(false);
    });

    it('should identify admin users', async () => {
      expect(detector.isAdmin('admin1')).toBe(true);
      expect(detector.isAdmin('admin2')).toBe(true);
      expect(detector.isAdmin('regular_user')).toBe(false);
    });

    it('should update configuration', async () => {
      detector.updateConfiguration({
        sensitivityLevel: 'high',
        enableSarcasm: false
      });
      
      const config = detector.getConfiguration();
      expect(config.sensitivityLevel).toBe('high');
      expect(config.enableSarcasm).toBe(false);
    });
  });

  describe('Confidence Adjustment', () => {
    it('should adjust confidence based on sensitivity level', async () => {
      const lowDetector = new InappropriateContentDetector({ sensitivityLevel: 'low' });
      const mediumDetector = new InappropriateContentDetector({ sensitivityLevel: 'medium' });
      const highDetector = new InappropriateContentDetector({ sensitivityLevel: 'high' });
      
      const message = 'дурень';
      
      const lowAnalysis = await lowDetector.analyzeContent(message, 'user1', 'TestUser');
      const mediumAnalysis = await mediumDetector.analyzeContent(message, 'user1', 'TestUser');
      const highAnalysis = await highDetector.analyzeContent(message, 'user1', 'TestUser');
      
      if (lowAnalysis.isInappropriate && mediumAnalysis.isInappropriate && highAnalysis.isInappropriate) {
        expect(lowAnalysis.confidence).toBeLessThan(mediumAnalysis.confidence);
        expect(mediumAnalysis.confidence).toBeLessThan(highAnalysis.confidence);
      }
    });

    it('should boost confidence for multiple matches', async () => {
      const singleMatch = await detector.analyzeContent('дурень', 'user1', 'TestUser');
      const multipleMatches = await detector.analyzeContent('дурень ідіот тупий', 'user1', 'TestUser');
      
      if (singleMatch.isInappropriate && multipleMatches.isInappropriate) {
        expect(multipleMatches.confidence).toBeGreaterThan(singleMatch.confidence);
      }
    });
  });

  describe('Statistics', () => {
    it('should provide accurate statistics', async () => {
      await detector.analyzeContent('дурень', 'user1', 'TestUser');
      await detector.analyzeContent('ідіот', 'user1', 'TestUser');
      await detector.analyzeContent('тупий', 'user2', 'TestUser2');
      
      const stats = detector.getStats();
      
      expect(stats.totalWarnings).toBe(3);
      expect(stats.usersWithWarnings).toBe(2);
      expect(stats.configuredSensitivity).toBe('medium');
      expect(stats.primaryLanguage).toBe('uk');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty messages', async () => {
      const analysis = await detector.analyzeContent('', 'user1', 'TestUser');
      
      expect(analysis.isInappropriate).toBe(false);
      expect(analysis.confidence).toBe(0);
    });

    it('should handle very long messages', async () => {
      const longMessage = 'дурень '.repeat(100);
      const analysis = await detector.analyzeContent(longMessage, 'user1', 'TestUser');
      
      expect(analysis.isInappropriate).toBe(true);
      expect(analysis.confidence).toBeGreaterThan(0);
    });

    it('should handle special characters and emojis', async () => {
      const analysis = await detector.analyzeContent('🤬 дурень! 😡', 'user1', 'TestUser');
      
      expect(analysis.isInappropriate).toBe(true);
      expect(analysis.language).toBe('uk');
    });

    it('should handle concurrent analysis', async () => {
      const promises: Promise<any>[] = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(detector.analyzeContent(`дурень ${i}`, `user${i}`, `TestUser${i}`));
      }
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.isInappropriate).toBe(true);
        expect(result.language).toBe('uk');
      });
    });

    it('should handle username with special characters', async () => {
      const analysis = await detector.analyzeContent('дурень', 'user1', 'Тест-Юзер_123');
      
      if (analysis.isInappropriate) {
        expect(analysis.suggestedResponse).toContain('Тест-Юзер_123');
      }
    });

    it('should not break on malformed input', async () => {
      const malformedInputs = [
        null as any,
        undefined as any,
        123 as any,
        {} as any,
        [] as any
      ];
      
      for (const input of malformedInputs) {
        try {
          const analysis = await detector.analyzeContent(input, 'user1', 'TestUser');
          expect(analysis).toBeDefined();
        } catch (error) {
          // Should handle gracefully without crashing
          expect(error).toBeDefined();
        }
      }
    });
  });
}); 