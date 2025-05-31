export interface BotCapability {
  id: string;
  name: string;
  nameUk: string;
  description: string;
  descriptionUk: string;
  examples: string[];
  examplesUk: string[];
  category: 'conversation' | 'entertainment' | 'moderation' | 'utility' | 'social';
}

export class BotCapabilities {
  private capabilities: BotCapability[] = [
    {
      id: 'ukrainian_conversation',
      name: 'Ukrainian Conversations',
      nameUk: 'Українські розмови',
      description: 'Natural conversations in Ukrainian with context awareness',
      descriptionUk: 'Природні розмови українською з розумінням контексту',
      examples: [
        '@bot Привіт! Як справи?',
        'Розкажи щось цікаве',
        'Як твої справи?'
      ],
      examplesUk: [
        '@bot Привіт! Як справи?',
        'Розкажи щось цікаве',
        'Як твої справи?'
      ],
      category: 'conversation'
    },
    {
      id: 'jokes_and_stories',
      name: 'Jokes and Stories',
      nameUk: 'Жарти та історії',
      description: 'Ukrainian jokes, funny stories, and entertaining content',
      descriptionUk: 'Українські жарти, смішні історії та розважальний контент',
      examples: [
        'Tell me a joke',
        'Розкажи жарт',
        'Розкажи історію'
      ],
      examplesUk: [
        'Розкажи жарт',
        'Розкажи історію',
        'Хочу почути щось смішне'
      ],
      category: 'entertainment'
    },
    {
      id: 'meme_generation',
      name: 'Meme Generation',
      nameUk: 'Генерація мемів',
      description: 'Create text-based and image memes with Ukrainian cultural context',
      descriptionUk: 'Створення текстових та графічних мемів з українським культурним контекстом',
      examples: [
        '/meme топ текст | низ текст',
        'створи мем про код',
        'make meme about coffee'
      ],
      examplesUk: [
        '/meme топ текст | низ текст',
        'створи мем про код',
        'зроби мем про каву'
      ],
      category: 'entertainment'
    },
    {
      id: 'sentiment_reactions',
      name: 'Smart Emoji Reactions',
      nameUk: 'Розумні емодзі-реакції',
      description: 'Automatic emoji reactions based on message sentiment and context',
      descriptionUk: 'Автоматичні емодзі-реакції на основі настрою та контексту повідомлення',
      examples: [
        'Це чудова новина! 🎉',
        'Сьогодні важкий день... 😢',
        'Потужно! ⚡'
      ],
      examplesUk: [
        'Це чудова новина! 🎉',
        'Сьогодні важкий день... 😢',
        'Потужно! ⚡'
      ],
      category: 'social'
    },
    {
      id: 'content_moderation',
      name: 'Content Moderation',
      nameUk: 'Модерація контенту',
      description: 'Automatic detection and witty responses to inappropriate content',
      descriptionUk: 'Автоматичне виявлення та дотепні відповіді на неприйнятний контент',
      examples: [
        'Detects offensive language',
        'Responds with Ukrainian humor',
        'Maintains positive atmosphere'
      ],
      examplesUk: [
        'Виявляє образливі слова',
        'Відповідає українським гумором',
        'Підтримує позитивну атмосферу'
      ],
      category: 'moderation'
    },
    {
      id: 'user_roles',
      name: 'User Role Assignment',
      nameUk: 'Призначення ролей користувачам',
      description: 'Assigns fun Ukrainian roles based on user behavior patterns',
      descriptionUk: 'Призначає веселі українські ролі на основі поведінки користувачів',
      examples: [
        '🎭 Мем Лорд - for funny content',
        '⚡ Енерджайзер - for energetic messages',
        '🧠 Чат Мудрець - for wise insights'
      ],
      examplesUk: [
        '🎭 Мем Лорд - за смішний контент',
        '⚡ Енерджайзер - за енергійні повідомлення',
        '🧠 Чат Мудрець - за мудрі думки'
      ],
      category: 'social'
    },
    {
      id: 'atmosphere_enhancement',
      name: 'Chat Atmosphere Enhancement',
      nameUk: 'Покращення атмосфери чату',
      description: 'Automatically engages during quiet periods to maintain chat activity',
      descriptionUk: 'Автоматично залучається під час тихих періодів для підтримки активності чату',
      examples: [
        'Starts conversations during quiet moments',
        'Suggests topics and games',
        'Encourages user interaction'
      ],
      examplesUk: [
        'Починає розмови під час тихих моментів',
        'Пропонує теми та ігри',
        'Заохочує взаємодію користувачів'
      ],
      category: 'social'
    },
    {
      id: 'learning_adaptation',
      name: 'Adaptive Learning',
      nameUk: 'Адаптивне навчання',
      description: 'Learns from user feedback and adapts responses over time',
      descriptionUk: 'Вчиться з відгуків користувачів та адаптує відповіді з часом',
      examples: [
        'Improves reaction accuracy',
        'Adapts to chat preferences',
        'Remembers conversation context'
      ],
      examplesUk: [
        'Покращує точність реакцій',
        'Адаптується до уподобань чату',
        "Запам'ятовує контекст розмов"
      ],
      category: 'utility'
    },
    {
      id: 'multilingual_support',
      name: 'Multilingual Support',
      nameUk: 'Підтримка багатьох мов',
      description: 'Supports Ukrainian (primary) and English with automatic language detection',
      descriptionUk: 'Підтримує українську (основну) та англійську з автоматичним визначенням мови',
      examples: [
        'Автоматично визначає мову',
        'Ukrainian-first approach',
        'English fallback support'
      ],
      examplesUk: [
        'Автоматично визначає мову',
        'Український підхід насамперед',
        'Підтримка англійської як запасної'
      ],
      category: 'utility'
    },
    {
      id: 'help_and_support',
      name: 'Help and Support',
      nameUk: 'Допомога та підтримка',
      description: 'Provides help information and emotional support to users',
      descriptionUk: 'Надає довідкову інформацію та емоційну підтримку користувачам',
      examples: [
        'Допоможи мені',
        'Що ти можеш?',
        'Потрібна підтримка'
      ],
      examplesUk: [
        'Допоможи мені',
        'Що ти можеш?',
        'Потрібна підтримка'
      ],
      category: 'utility'
    }
  ];

  // Keywords that trigger the capabilities display
  private capabilityTriggers = {
    uk: [
      'що ти можеш', 'що можеш', 'можливості', 'функції', 'команди',
      'що вмієш', 'які функції', 'що робиш', 'твої можливості',
      'список команд', 'допомога', 'help', 'що ти вмієш робити',
      'розкажи про себе', 'що ти умієш', 'покажи команди'
    ],
    en: [
      'what can you do', 'capabilities', 'features', 'commands', 'help',
      'what do you do', 'your features', 'bot capabilities', 'list commands',
      'show features', 'what are your functions', 'bot help'
    ]
  };

  detectCapabilityRequest(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    
    // Check Ukrainian triggers
    const ukrainianMatch = this.capabilityTriggers.uk.some(trigger => 
      lowerMessage.includes(trigger)
    );
    
    // Check English triggers
    const englishMatch = this.capabilityTriggers.en.some(trigger => 
      lowerMessage.includes(trigger)
    );
    
    return ukrainianMatch || englishMatch;
  }

  generateCapabilitiesResponse(language: 'uk' | 'en' = 'uk', userName?: string): string {
    const greeting = userName ? 
      (language === 'uk' ? `Привіт, ${userName}! 👋` : `Hello, ${userName}! 👋`) :
      (language === 'uk' ? 'Привіт! 👋' : 'Hello! 👋');

    const title = language === 'uk' ? 
      '🤖 Ось що я можу робити:' : 
      '🤖 Here\'s what I can do:';

    let response = `${greeting}\n\n${title}\n\n`;

    // Group capabilities by category
    const categories = {
      conversation: language === 'uk' ? '💬 Розмови' : '💬 Conversations',
      entertainment: language === 'uk' ? '🎭 Розваги' : '🎭 Entertainment', 
      social: language === 'uk' ? '👥 Соціальні функції' : '👥 Social Features',
      moderation: language === 'uk' ? '🛡️ Модерація' : '🛡️ Moderation',
      utility: language === 'uk' ? '🔧 Утиліти' : '🔧 Utilities'
    };

    Object.entries(categories).forEach(([categoryKey, categoryName]) => {
      const categoryCapabilities = this.capabilities.filter(
        cap => cap.category === categoryKey
      );

      if (categoryCapabilities.length > 0) {
        response += `**${categoryName}**\n`;
        
        categoryCapabilities.forEach(capability => {
          const name = language === 'uk' ? capability.nameUk : capability.name;
          const description = language === 'uk' ? capability.descriptionUk : capability.description;
          const examples = language === 'uk' ? capability.examplesUk : capability.examples;
          
          response += `• **${name}**: ${description}\n`;
          if (examples.length > 0) {
            response += `  _Приклади:_ ${examples.slice(0, 2).map(ex => `"${ex}"`).join(', ')}\n`;
          }
          response += '\n';
        });
      }
    });

    // Add footer
    const footer = language === 'uk' ? 
      '💡 _Просто напишіть мені або згадайте @bot, і я відповім українською!_\n🇺🇦 _Зроблено для української спільноти з ❤️_' :
      '💡 _Just message me or mention @bot, and I\'ll respond in Ukrainian!_\n🇺🇦 _Made for Ukrainian community with ❤️_';
    
    response += `\n${footer}`;

    return response;
  }

  getCapabilityById(id: string): BotCapability | undefined {
    return this.capabilities.find(cap => cap.id === id);
  }

  getAllCapabilities(): BotCapability[] {
    return [...this.capabilities];
  }

  getCapabilitiesByCategory(category: string): BotCapability[] {
    return this.capabilities.filter(cap => cap.category === category);
  }
} 