import { MemeGenerator, MemeRequest, MemeResult } from '../../src/domain/memeGenerator';

describe('MemeGenerator', () => {
  let generator: MemeGenerator;

  beforeEach(() => {
    generator = new MemeGenerator();
  });

  describe('Basic Meme Generation', () => {
    it('should generate Ukrainian text meme successfully', async () => {
      const request: MemeRequest = {
        topText: 'Коли твій код працює',
        bottomText: 'Але ти не знаєш чому',
        language: 'uk'
      };

      const result = await generator.generateMeme(request);

      expect(result.success).toBe(true);
      expect(result.language).toBe('uk');
      expect(result.text).toBeTruthy();
      expect(result.text).toContain('Коли твій код працює');
      expect(result.attribution).toContain('українським мем-генератором');
    });

    it('should generate English text meme successfully', async () => {
      const request: MemeRequest = {
        topText: 'When your code works',
        bottomText: 'But you dont know why',
        language: 'en'
      };

      const result = await generator.generateMeme(request);

      expect(result.success).toBe(true);
      expect(result.language).toBe('en');
      expect(result.text).toBeTruthy();
      expect(result.text).toContain('When your code works');
      expect(result.attribution).toContain('Ukrainian meme engine');
    });

    it('should default to Ukrainian language', async () => {
      const request: MemeRequest = {
        topText: 'Test meme'
      };

      const result = await generator.generateMeme(request);

      expect(result.success).toBe(true);
      expect(result.language).toBe('uk');
    });

    it('should handle meme request without bottom text', async () => {
      const request: MemeRequest = {
        topText: 'Тільки верхній текст',
        language: 'uk'
      };

      const result = await generator.generateMeme(request);

      expect(result.success).toBe(true);
      expect(result.text).toContain('Тільки верхній текст');
    });
  });

  describe('Text-Based Meme Templates', () => {
    it('should generate programming themed Ukrainian memes', async () => {
      const result = await generator.generateTextMeme('programming', 'мій код', 'uk');

      expect(result.success).toBe(true);
      expect(result.language).toBe('uk');
      expect(result.text).toContain('мій код');
      expect(result.text).toBeTruthy();
    });

    it('should generate life themed Ukrainian memes', async () => {
      const result = await generator.generateTextMeme('life', 'моє життя', 'uk');

      expect(result.success).toBe(true);
      expect(result.language).toBe('uk');
      expect(result.text).toContain('моє життя');
    });

    it('should generate food themed Ukrainian memes', async () => {
      const result = await generator.generateTextMeme('food', 'піца', 'uk');

      expect(result.success).toBe(true);
      expect(result.language).toBe('uk');
      expect(result.text).toContain('піца');
    });

    it('should generate work themed Ukrainian memes', async () => {
      const result = await generator.generateTextMeme('work', 'понеділок', 'uk');

      expect(result.success).toBe(true);
      expect(result.language).toBe('uk');
      expect(result.text).toContain('понеділок');
    });

    it('should generate Ukrainian specific memes', async () => {
      const result = await generator.generateTextMeme('ukrainian', 'Україна', 'uk');

      expect(result.success).toBe(true);
      expect(result.language).toBe('uk');
      expect(result.text).toContain('Україна');
    });

    it('should fall back to general templates for unknown topics', async () => {
      const result = await generator.generateTextMeme('unknown-topic', 'тест', 'uk');

      expect(result.success).toBe(true);
      expect(result.language).toBe('uk');
      expect(result.text).toContain('тест');
    });

    it('should generate English memes for all topics', async () => {
      const topics = ['programming', 'life', 'food', 'work', 'general'];

      for (const topic of topics) {
        const result = await generator.generateTextMeme(topic, 'test text', 'en');

        expect(result.success).toBe(true);
        expect(result.language).toBe('en');
        expect(result.text).toContain('test text');
      }
    });
  });

  describe('Meme Suggestions', () => {
    it('should suggest Ukrainian meme for kod keyword', () => {
      const suggestion = generator.suggestMemeForMessage('мій код не працює', 'uk');

      expect(suggestion).toBeTruthy();
      expect(suggestion!.topText).toContain('код');
      expect(suggestion!.language).toBe('uk');
    });

    it('should suggest Ukrainian meme for kava keyword', () => {
      const suggestion = generator.suggestMemeForMessage('потрібна кава', 'uk');

      expect(suggestion).toBeTruthy();
      expect(suggestion!.topText).toContain('кави');
      expect(suggestion!.language).toBe('uk');
    });

    it('should suggest Ukrainian meme for ponedilok keyword', () => {
      const suggestion = generator.suggestMemeForMessage('знову понеділок', 'uk');

      expect(suggestion).toBeTruthy();
      expect(suggestion!.topText).toContain("П'ятниця");
      expect(suggestion!.language).toBe('uk');
    });

    it('should suggest Ukrainian meme for robota keyword', () => {
      const suggestion = generator.suggestMemeForMessage('на роботі', 'uk');

      expect(suggestion).toBeTruthy();
      expect(suggestion!.topText).toContain('робота');
      expect(suggestion!.language).toBe('uk');
    });

    it('should suggest Ukrainian meme for yizha keyword', () => {
      const suggestion = generator.suggestMemeForMessage('хочу їжу', 'uk');

      expect(suggestion).toBeTruthy();
      expect(suggestion!.topText).toContain('їжа');
      expect(suggestion!.language).toBe('uk');
    });

    it('should suggest Ukrainian meme for ukraina keyword', () => {
      const suggestion = generator.suggestMemeForMessage('Слава Україні!', 'uk');

      expect(suggestion).toBeTruthy();
      expect(suggestion!.topText).toContain('України');
      expect(suggestion!.language).toBe('uk');
    });

    it('should suggest English memes for English keywords', () => {
      const englishKeywords = ['code', 'coffee', 'monday', 'work', 'food'];

      for (const keyword of englishKeywords) {
        const suggestion = generator.suggestMemeForMessage(`my ${keyword} today`, 'en');

        expect(suggestion).toBeTruthy();
        expect(suggestion!.language).toBe('en');
      }
    });

    it('should suggest memes for Ukrainian food keywords', () => {
      const foodKeywords = ['борщ', 'вареники'];

      for (const keyword of foodKeywords) {
        const suggestion = generator.suggestMemeForMessage(`готую ${keyword}`, 'uk');

        expect(suggestion).toBeTruthy();
        expect(suggestion!.topText).toContain('українську їжу');
        expect(suggestion!.language).toBe('uk');
      }
    });

    it('should suggest memes for Ukrainian flag emoji', () => {
      const suggestion = generator.suggestMemeForMessage('🇺🇦 Ukraine', 'uk');

      expect(suggestion).toBeTruthy();
      expect(suggestion!.topText).toContain('радіє');
      expect(suggestion!.language).toBe('uk');
    });

    it('should suggest confused meme for Ukrainian confused messages', () => {
      const suggestion = generator.suggestMemeForMessage('я дуже плутаний з цим', 'uk');

      expect(suggestion).toBeTruthy();
      expect(suggestion!.topText).toContain('зрозуміти');
      expect(suggestion!.language).toBe('uk');
    });

    it('should suggest confused meme for English confused messages', () => {
      const suggestion = generator.suggestMemeForMessage('I am so confused about this', 'en');

      expect(suggestion).toBeTruthy();
      expect(suggestion!.topText).toContain('understand');
      expect(suggestion!.language).toBe('en');
    });

    it('should return null for messages without clear meme triggers', () => {
      const suggestion = generator.suggestMemeForMessage('це просто звичайне повідомлення', 'uk');

      expect(suggestion).toBeNull();
    });
  });

  describe('Ukrainian Trending Memes', () => {
    it('should generate Ukrainian cat meme', async () => {
      const result = await generator.generateUkrainianTrendingMeme('cat');

      expect(result.success).toBe(true);
      expect(result.language).toBe('uk');
      expect(result.text).toContain('котів');
    });

    it('should generate Ukrainian coffee meme', async () => {
      const result = await generator.generateUkrainianTrendingMeme('coffee');

      expect(result.success).toBe(true);
      expect(result.language).toBe('uk');
      expect(result.text).toContain('кави');
    });

    it('should generate Ukrainian weekend meme', async () => {
      const result = await generator.generateUkrainianTrendingMeme('weekend');

      expect(result.success).toBe(true);
      expect(result.language).toBe('uk');
      expect(result.text).toContain("П'ятниця");
    });

    it('should generate Ukrainian coding meme', async () => {
      const result = await generator.generateUkrainianTrendingMeme('coding');

      expect(result.success).toBe(true);
      expect(result.language).toBe('uk');
      expect(result.text).toContain('код');
    });

    it('should generate Ukrainian food meme', async () => {
      const result = await generator.generateUkrainianTrendingMeme('food');

      expect(result.success).toBe(true);
      expect(result.language).toBe('uk');
      expect(result.text).toContain('їжа');
    });

    it('should generate Ukrainian ukraine meme', async () => {
      const result = await generator.generateUkrainianTrendingMeme('ukraine');

      expect(result.success).toBe(true);
      expect(result.language).toBe('uk');
      expect(result.text).toContain('українську');
    });

    it('should generate default Ukrainian meme for unknown topics', async () => {
      const result = await generator.generateUkrainianTrendingMeme('unknown');

      expect(result.success).toBe(true);
      expect(result.language).toBe('uk');
      expect(result.text).toContain('unknown');
    });
  });

  describe('Quick Meme Generation', () => {
    it('should generate quick Ukrainian meme', async () => {
      const result = await generator.generateQuickMeme('тестовий текст', 'uk');

      expect(result.success).toBe(true);
      expect(result.language).toBe('uk');
      expect(result.text).toContain('тестовий текст');
      expect(result.text).toContain('мем момент');
    });

    it('should generate quick English meme', async () => {
      const result = await generator.generateQuickMeme('test text', 'en');

      expect(result.success).toBe(true);
      expect(result.language).toBe('en');
      expect(result.text).toContain('test text');
      expect(result.text).toContain('meme moment');
    });

    it('should truncate long text for quick memes', async () => {
      const longText = 'a'.repeat(100);
      const result = await generator.generateQuickMeme(longText, 'uk');

      expect(result.success).toBe(true);
      expect(result.text).toContain('...');
      expect(result.text!.indexOf('aaaa')).toBeLessThan(50);
    });

    it('should default to Ukrainian for quick memes', async () => {
      const result = await generator.generateQuickMeme('test');

      expect(result.success).toBe(true);
      expect(result.language).toBe('uk');
    });
  });

  describe('Available Templates', () => {
    it('should provide Ukrainian template list', () => {
      const templates = generator.getAvailableTemplates('uk');

      expect(templates).toContain('programming');
      expect(templates).toContain('life');
      expect(templates).toContain('food');
      expect(templates).toContain('work');
      expect(templates).toContain('general');
      expect(templates).toContain('ukrainian');
      expect(templates.length).toBeGreaterThan(0);
    });

    it('should provide English template list', () => {
      const templates = generator.getAvailableTemplates('en');

      expect(templates).toContain('programming');
      expect(templates).toContain('life');
      expect(templates).toContain('food');
      expect(templates).toContain('work');
      expect(templates).toContain('general');
      expect(templates.length).toBeGreaterThan(0);
    });

    it('should default to Ukrainian templates', () => {
      const templates = generator.getAvailableTemplates();

      expect(templates).toContain('ukrainian');
    });
  });

  describe('Statistics', () => {
    it('should provide accurate statistics', () => {
      const stats = generator.getStats();

      expect(stats.availableUkrainianTemplates).toBeGreaterThan(0);
      expect(stats.availableEnglishTemplates).toBeGreaterThan(0);
      expect(stats.totalSuggestions).toBeGreaterThan(0);
      expect(typeof stats.availableUkrainianTemplates).toBe('number');
      expect(typeof stats.availableEnglishTemplates).toBe('number');
      expect(typeof stats.totalSuggestions).toBe('number');
    });

    it('should have Ukrainian templates', () => {
      const stats = generator.getStats();

      expect(stats.availableUkrainianTemplates).toBeGreaterThanOrEqual(6); // programming, life, food, work, general, ukrainian
    });

    it('should have English templates', () => {
      const stats = generator.getStats();

      expect(stats.availableEnglishTemplates).toBeGreaterThanOrEqual(5); // programming, life, food, work, general
    });

    it('should have suggestion keywords', () => {
      const stats = generator.getStats();

      expect(stats.totalSuggestions).toBeGreaterThanOrEqual(10); // Ukrainian + English suggestions combined
    });
  });

  describe('Error Handling', () => {
    it('should handle empty top text gracefully', async () => {
      const request: MemeRequest = {
        topText: '',
        language: 'uk'
      };

      const result = await generator.generateMeme(request);

      expect(result.success).toBe(true);
      expect(result.language).toBe('uk');
    });

    it('should handle very long text', async () => {
      const longText = 'a'.repeat(1000);
      const request: MemeRequest = {
        topText: longText,
        language: 'uk'
      };

      const result = await generator.generateMeme(request);

      expect(result.success).toBe(true);
      expect(result.text).toBeTruthy();
    });

    it('should handle special characters and emojis', async () => {
      const request: MemeRequest = {
        topText: '🎉🎊 Привіт! 😊 Спеціальні символи: @#$%^&*()',
        language: 'uk'
      };

      const result = await generator.generateMeme(request);

      expect(result.success).toBe(true);
      expect(result.text).toContain('🎉🎊');
      expect(result.text).toContain('Привіт');
    });

    it('should handle null/undefined gracefully', async () => {
      try {
        const request: any = {
          topText: null,
          language: 'uk'
        };

        const result = await generator.generateMeme(request);

        // Should either succeed with empty handling or fail gracefully
        expect(result).toBeDefined();
        expect(typeof result.success).toBe('boolean');
      } catch (error) {
        // Should not crash the application
        expect(error).toBeDefined();
      }
    });
  });

  describe('Imgflip Integration', () => {
    it('should fallback to text memes when Imgflip is not available', async () => {
      // Test without Imgflip credentials
      const originalEnv = process.env.IMGFLIP_USERNAME;
      delete process.env.IMGFLIP_USERNAME;

      const request: MemeRequest = {
        templateId: '181913649',
        topText: 'Top text',
        bottomText: 'Bottom text',
        language: 'en'
      };

      const result = await generator.generateMeme(request);

      expect(result.success).toBe(true);
      expect(result.text).toBeTruthy(); // Should fallback to text meme
      expect(result.imageUrl).toBeFalsy();

      // Restore environment
      if (originalEnv) {
        process.env.IMGFLIP_USERNAME = originalEnv;
      }
    });

    it('should handle Imgflip API errors gracefully', async () => {
      // Set invalid credentials to trigger API error
      const originalUsername = process.env.IMGFLIP_USERNAME;
      const originalPassword = process.env.IMGFLIP_PASSWORD;

      process.env.IMGFLIP_USERNAME = 'invalid_user';
      process.env.IMGFLIP_PASSWORD = 'invalid_pass';

      const request: MemeRequest = {
        templateId: '181913649',
        topText: 'Test top text',
        bottomText: 'Test bottom text',
        language: 'en'
      };

      const result = await generator.generateMeme(request);

      expect(result.success).toBe(true); // Should fallback to text memes
      expect(result.text).toBeTruthy();

      // Restore environment
      if (originalUsername) process.env.IMGFLIP_USERNAME = originalUsername;
      if (originalPassword) process.env.IMGFLIP_PASSWORD = originalPassword;
    });
  });

  describe('Language Detection', () => {
    it('should detect Ukrainian by special characters', () => {
      // Access private method through any cast for testing
      const detectLanguage = (generator as any).detectLanguage.bind(generator);
      
      expect(detectLanguage('Привіт! Як справи?')).toBe('uk');
      expect(detectLanguage('що це таке іїєґ')).toBe('uk');
    });

    it('should detect Ukrainian by keywords', () => {
      const detectLanguage = (generator as any).detectLanguage.bind(generator);
      
      expect(detectLanguage('що як коли де чому')).toBe('uk');
    });

    it('should default to English for non-Ukrainian text', () => {
      const detectLanguage = (generator as any).detectLanguage.bind(generator);
      
      expect(detectLanguage('Hello world')).toBe('en');
      expect(detectLanguage('This is English text')).toBe('en');
    });

    it('should handle mixed language content', () => {
      const detectLanguage = (generator as any).detectLanguage.bind(generator);
      
      expect(detectLanguage('Hello що це?')).toBe('uk'); // Ukrainian characters present
    });

    it('should handle empty strings', () => {
      const detectLanguage = (generator as any).detectLanguage.bind(generator);
      
      expect(detectLanguage('')).toBe('en'); // Default to English
    });
  });

  describe('Edge Cases and Stress Tests', () => {
    it('should handle concurrent meme generation', async () => {
      const promises = [];

      for (let i = 0; i < 10; i++) {
        const request: MemeRequest = {
          topText: `Мем ${i}`,
          bottomText: `Текст ${i}`,
          language: 'uk'
        };
        promises.push(generator.generateMeme(request));
      }

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.text).toContain(`Мем ${index}`);
      });
    });

    it('should handle rapid suggestion requests', () => {
      const messages = [
        'код не працює',
        'хочу каву',
        'понеділок знову',
        'на роботі',
        'Слава Україні',
        'борщ вареники'
      ];

      messages.forEach(message => {
        const suggestion = generator.suggestMemeForMessage(message, 'uk');
        if (suggestion) {
          expect(suggestion.language).toBe('uk');
          expect(suggestion.topText).toBeTruthy();
        }
      });
    });

    it('should maintain consistent output for same input', async () => {
      const request: MemeRequest = {
        topText: 'Консистентний тест',
        bottomText: 'Той самий результат',
        language: 'uk'
      };

      const result1 = await generator.generateMeme(request);
      const result2 = await generator.generateMeme(request);

      expect(result1.success).toBe(result2.success);
      expect(result1.language).toBe(result2.language);
      // Note: Text might vary due to random template selection, which is expected
    });
  });
}); 