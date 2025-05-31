import { CLICommandDetector, CLICommandMatch } from '../../src/domain/cliCommandDetector';

describe('CLICommandDetector', () => {
  let detector: CLICommandDetector;

  beforeEach(() => {
    detector = new CLICommandDetector();
  });

  describe('Constructor', () => {
    it('should initialize properly', () => {
      expect(detector).toBeDefined();
    });
  });

  describe('Help command detection', () => {
    it('should detect English help commands only', () => {
      const englishCommands = [
        'help',
        '/help',
        'commands',
        'show commands',
        'list commands',
        'what commands',
        'available commands'
      ];

      englishCommands.forEach(command => {
        const result = detector.detectCommand(command);
        expect(result.isCommand).toBe(true);
        expect(result.command).toBe('help');
        expect(result.language).toBe('en');
        expect(result.confidence).toBeGreaterThan(0.9);
      });
    });

    it('should detect bot mention help commands', () => {
      const botMentionCommands = [
        '@bot cli help',
        '@bot help'
      ];

      botMentionCommands.forEach(command => {
        const result = detector.detectCommand(command);
        expect(result.isCommand).toBe(true);
        expect(result.command).toBe('help');
        expect(result.language).toBe('en');
        expect(result.confidence).toBeGreaterThan(0.9);
      });
    });

    it('should NOT detect Ukrainian help words as CLI commands', () => {
      const nonCommands = [
        'команди',
        'допомога',
        'довідка',
        'показати команди',
        'список команд',
        'які команди',
        'що можна зробити',
        'бот допомога',
        'бот команди'
      ];

      nonCommands.forEach(command => {
        const result = detector.detectCommand(command);
        expect(result.isCommand).toBe(false);
      });
    });
  });

  describe('Status command detection', () => {
    it('should detect English status commands only', () => {
      const statusCommands = [
        'status',
        '/status',
        '@bot status',
        '@bot cli status'
      ];

      statusCommands.forEach(command => {
        const result = detector.detectCommand(command);
        expect(result.isCommand).toBe(true);
        expect(result.command).toBe('status');
        expect(result.language).toBe('en');
        expect(result.confidence).toBeGreaterThan(0.8);
      });
    });

    it('should NOT detect Ukrainian status words as CLI commands', () => {
      const nonCommands = [
        'статус',
        'стан',
        'показати статус',
        'статус функцій'
      ];

      nonCommands.forEach(command => {
        const result = detector.detectCommand(command);
        expect(result.isCommand).toBe(false);
      });
    });
  });

  describe('Features command detection', () => {
    it('should detect English features commands only', () => {
      const featuresCommands = [
        'features',
        '@bot features'
      ];

      featuresCommands.forEach(command => {
        const result = detector.detectCommand(command);
        expect(result.isCommand).toBe(true);
        expect(result.command).toBe('features');
        expect(result.language).toBe('en');
        expect(result.confidence).toBeGreaterThan(0.8);
      });
    });

    it('should NOT detect Ukrainian features words as CLI commands', () => {
      const nonCommands = [
        'функції',
        'показати функції',
        'список функцій',
        '@bot функції'
      ];

      nonCommands.forEach(command => {
        const result = detector.detectCommand(command);
        expect(result.isCommand).toBe(false);
      });
    });
  });

  describe('Feature control commands', () => {
    it('should detect English feature control commands', () => {
      const englishCommands = [
        { command: 'enable powerWords', expectedCommand: 'enable' },
        { command: 'disable moderation', expectedCommand: 'disable' },
        { command: 'toggle memes', expectedCommand: 'toggle' },
        { command: 'turn on news', expectedCommand: 'enable' },
        { command: 'turn off weather', expectedCommand: 'disable' }
      ];

      englishCommands.forEach(({ command, expectedCommand }) => {
        const result = detector.detectCommand(command);
        expect(result.isCommand).toBe(true);
        expect(result.command).toBe(expectedCommand);
        expect(result.args).toHaveLength(1);
        expect(result.language).toBe('en');
      });
    });

    it('should detect bot mention feature control', () => {
      const botCommands = [
        '@bot enable powerWords',
        '@bot disable moderation',
        '@bot toggle memes'
      ];

      botCommands.forEach(command => {
        const result = detector.detectCommand(command);
        expect(result.isCommand).toBe(true);
        expect(['enable', 'disable', 'toggle']).toContain(result.command);
        expect(result.args).toHaveLength(1);
        expect(result.language).toBe('en');
      });
    });

    it('should NOT detect Ukrainian feature control as CLI commands', () => {
      const nonCommands = [
        'увімкни powerWords',
        'увімкнути moderation',
        'включи memes',
        'вимкни powerWords',
        'вимкнути moderation',
        'відключи memes',
        '@bot увімкни news',
        '@bot вимкни weather'
      ];

      nonCommands.forEach(command => {
        const result = detector.detectCommand(command);
        expect(result.isCommand).toBe(false);
      });
    });
  });

  describe('Language detection', () => {
    it('should only detect English CLI commands', () => {
      const englishTexts = [
        'help',
        'commands',
        'enable features',
        'status',
        'toggle powerWords'
      ];

      englishTexts.forEach(text => {
        const result = detector.detectCommand(text);
        if (result.isCommand) {
          expect(result.language).toBe('en');
        }
      });
    });

    it('should not detect Ukrainian words as CLI commands', () => {
      const ukrainianTexts = [
        'команди',
        'допомога',
        'статус функцій',
        'увімкни powerWords',
        'показати команди'
      ];

      ukrainianTexts.forEach(text => {
        const result = detector.detectCommand(text);
        expect(result.isCommand).toBe(false);
      });
    });
  });

  describe('Non-command detection', () => {
    it('should not detect regular messages as commands', () => {
      const regularMessages = [
        'Привіт, як справи?',
        'Hello everyone!',
        'Доброго ранку',
        'Good morning',
        'Що нового?',
        'How are you?',
        'Дякую за допомогу',
        'Thank you for help',
        'Гарний день сьогодні',
        'Nice weather today'
      ];

      regularMessages.forEach(message => {
        const result = detector.detectCommand(message);
        expect(result.isCommand).toBe(false);
        expect(result.confidence).toBe(0);
      });
    });

    it('should not detect partial matches', () => {
      const partialMatches = [
        'helping others',
        'commanding officer',
        'featured article',
        'enabling technology'
      ];

      partialMatches.forEach(text => {
        const result = detector.detectCommand(text);
        expect(result.isCommand).toBe(false);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty input', () => {
      const result = detector.detectCommand('');
      expect(result.isCommand).toBe(false);
      expect(result.confidence).toBe(0);
    });

    it('should handle whitespace-only input', () => {
      const result = detector.detectCommand('   ');
      expect(result.isCommand).toBe(false);
    });

    it('should handle case variations', () => {
      const caseVariations = [
        'HELP',
        'Help',
        'hElP',
        'COMMANDS',
        'Commands',
        'cOmMaNdS'
      ];

      caseVariations.forEach(command => {
        const result = detector.detectCommand(command);
        expect(result.isCommand).toBe(true);
        expect(result.command).toBe('help');
      });
    });

    it('should extract feature names correctly', () => {
      const featureCommands = [
        { command: 'enable powerWords', expectedFeature: 'powerWords' },
        { command: 'disable knowledgeSearch', expectedFeature: 'knowledgeSearch' },
        { command: 'toggle moderation', expectedFeature: 'moderation' }
      ];

      featureCommands.forEach(({ command, expectedFeature }) => {
        const result = detector.detectCommand(command);
        expect(result.isCommand).toBe(true);
        expect(result.args).toContain(expectedFeature);
      });
    });
  });

  describe('Statistics', () => {
    it('should provide comprehensive stats', () => {
      const stats = detector.getStats();
      
      expect(stats.helpPatterns).toBeGreaterThan(0);
      expect(stats.statusPatterns).toBeGreaterThan(0);
      expect(stats.featurePatterns).toBeGreaterThan(0);
      expect(stats.supportedCommands).toContain('help');
      expect(stats.supportedCommands).toContain('status');
      expect(stats.supportedCommands).toContain('enable');
      expect(stats.supportedCommands).toContain('disable');
      expect(stats.languages).toContain('uk');
      expect(stats.languages).toContain('en');
      expect(stats.triggerTypes).toContain('direct');
      expect(stats.triggerTypes).toContain('mention');
    });
  });
}); 