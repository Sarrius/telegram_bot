import { CapabilityFuzzyMatcher } from '../config/vocabulary/capabilityFuzzyMatcher';

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
  private fuzzyMatcher: CapabilityFuzzyMatcher;
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
    },
    {
      id: 'ukrainian_news',
      name: 'Ukrainian News',
      nameUk: 'Українські новини',
      description: 'Real-time news monitoring and daily summaries from Ukrainian sources',
      descriptionUk: 'Моніторинг новин у реальному часі та щоденні зводки з українських джерел',
      examples: [
        'Які новини?',
        'Що нового в світі?',
        'Розкажи останні новини',
        'Що відбувається в Україні?'
      ],
      examplesUk: [
        'Які новини?',
        'Що нового в світі?',
        'Розкажи останні новини',
        'Що відбувається в Україні?',
        'Що твориться?',
        'Свіжі новини'
      ],
      category: 'utility'
    },
    {
      id: 'weather_ukraine',
      name: 'Ukrainian Weather',
      nameUk: 'Погода в Україні',
      description: 'Weather information and alerts for Ukrainian cities',
      descriptionUk: 'Інформація про погоду та попередження для українських міст',
      examples: [
        'Яка погода?',
        'Погода в Києві',
        'Яка температура?',
        'Чи буде дощ?'
      ],
      examplesUk: [
        'Яка погода?',
        'Погода в Києві',
        'Яка температура?',
        'Чи буде дощ?',
        'Як на вулиці?',
        'Погода сьогодні'
      ],
      category: 'utility'
    },
    {
      id: 'morning_summary',
      name: 'Morning News Summary',
      nameUk: 'Ранкова зводка новин',
      description: 'Daily morning summaries with news and weather delivered automatically',
      descriptionUk: 'Щоденні ранкові зводки з новинами та погодою, що доставляються автоматично',
      examples: [
        'Підписатися на ранкові новини',
        'Хочу щоденні зводки',
        'Відписатися від новин'
      ],
      examplesUk: [
        'Підписатися на ранкові новини',
        'Хочу щоденні зводки',
        'Підписка на новини',
        'Відписатися від новин',
        'Ранкові повідомлення'
      ],
      category: 'utility'
    },
    {
      id: 'critical_alerts',
      name: 'Critical News Alerts',
      nameUk: 'Критичні повідомлення',
      description: 'Instant notifications about critical events, emergencies, and important news',
      descriptionUk: 'Миттєві сповіщення про критичні події, надзвичайні ситуації та важливі новини',
      examples: [
        'Автоматичні сповіщення про:',
        '• Надзвичайні ситуації',
        '• Важливі політичні події',
        '• Критичні погодні умови'
      ],
      examplesUk: [
        'Автоматичні сповіщення про:',
        '• Надзвичайні ситуації',
        '• Важливі політичні події',
        '• Критичні погодні умови',
        '• Екстрені повідомлення'
      ],
      category: 'utility'
    }
  ];

  constructor() {
    this.fuzzyMatcher = new CapabilityFuzzyMatcher();
  }

  // Keywords that trigger the capabilities display
  private capabilityTriggers = {
    uk: [

      // Прямі запити про можливості
      'що ти можеш', 'що можеш', 'можливості', 'функції', 'команди', 'що вмієш', 'які функції',
      'що робиш', 'твої можливості', 'список команд', 'допомога', 'help', 'що ти вмієш робити',
      'розкажи про себе', 'що ти умієш', 'покажи команди', 'що ти можеш зробити', 'що можеш робити',
      'які у тебе можливості', 'які твої функції', 'що в тебе є', 'що ти знаєш', 'чому ти навчений',
      'що ти можеш мені дати',

      // Неформальні варіанти
      'а що ти такий', 'хто ти такий', 'що за бот', 'який ти бот', 'покажи що можеш',
      'що ти за штука', 'яких ти можеш', 'розкажи що ти вмієш', 'що в тебе цікавого',
      'чим можеш допомогти',

      // Інструкції
      'як тебе користуватися', 'як з тобою працювати', 'що з тобою робити', 'як тебе викликати',
      'як до тебе звернутися', 'де твої команди', 'інструкція', 'мануал', 'керівництво', 'довідка',
      'як тобою користуватись', 'як тебе використовувати', 'як тебе питати', 'що робити з тобою',
      'faq', 'підкажи що вмієш', 'як тебе використати',

      // Про навички
      'які твої навички', 'що ти вивчив', 'які у тебе здібності', 'що ти розумієш',
      'з чим можеш допомогти', 'що входить в твої обов\'язки', 'чим займаєшся', 'для чого ти тут',
      'які твої вміння', 'на що ти здатен', 'що входить в твої функції',

      // Про призначення
      'для чого ти', 'що ти робиш', 'навіщо ти тут', 'яке твоє призначення', 'що ти тут робиш',
      'навіщо ти створений', 'в чому сенс тебе',

      // Знайомство
      'хто ти', 'представся', 'розкажи про себе', 'познайомся', 'поясни що ти робиш', 'опиши себе',
      'розкажи хто ти', 'хто ти такий', 'що це за бот', 'що ти за штука', 'що ти за програма',

      // Молодіжне / Сленг / Суржик
      'шо можеш', 'шо вмієш', 'шо робиш', 'шо за бот', 'шо за функції', 'що по функціям',
      'що по можливостям', 'що по командам', 'які фічі', 'фічі є', 'які скілзи', 'покажи фічі',
      'покажи що можеш', 'покажи здібності', 'покажи скілзи', 'які здібки', 'які навики',
      'шо ти шариш', 'шо ти вмієш зробить', 'шо в тебе є', 'шо в тебе заложено', 'що в тебе цікавого',
      'шо ти можеш', 'покажи шо ти можеш', 'покажи шо можеш', 'шо ти вмієш', 'шо умієш',
      'шо за фічі', 'шо за можливості', 'шо в тебе нового', 'шо цікавого',

      // Варіанти з "бот"
      'бот що ти можеш', 'бот покажи можливості', 'бот які функції', 'бот що вмієш',
      'бот розкажи про себе', 'бот що за команди', 'бот що можеш', 'бот покажи команди',
      'бот які можливості', 'бот інструкція', 'бот допомога', 'бот для чого ти',
      'бот хто ти', 'бот представся', 'бот що за фічі', 'бот що за штука',
    ],
    en: [
      // Direct capability requests
      'what can you do', 'capabilities', 'features', 'commands', 'help',
      'what do you do', 'your features', 'bot capabilities', 'list commands',
      'show features', 'what are your functions', 'bot help',

      // Variations with "can"
      'what can you help with', 'what are you capable of', 'what can you assist',
      'what services do you provide', 'what functionality do you have',
      'what skills do you have', 'what do you know how to do',

      // Informal variants
      'what are you', 'who are you', 'what kind of bot', 'what type of bot',
      'show me what you got', 'what\'s your deal', 'what are you about',
      'tell me about yourself', 'introduce yourself', 'what do you offer',

      // Help seeking
      'how to use you', 'how do you work', 'how to interact with you',
      'how to call you', 'how to summon you', 'where are your commands',
      'manual', 'guide', 'instructions', 'documentation',

      // Skill questions
      'what are your skills', 'what did you learn', 'what are you trained for',
      'what abilities do you have', 'what do you understand', 'what can you help with',
      'what are your duties', 'what do you do here', 'what\'s your purpose',

      // General questions  
      'describe yourself', 'explain what you do', 'present yourself',
      'what kind of assistant', 'what type of helper', 'what sort of bot',

      // Context variations
      'bot what can you do', 'bot show capabilities', 'bot list features',
      'bot what functions', 'bot tell about yourself', 'bot what commands',

      // Slang and casual
      'whatcha got', 'what\'s up with you', 'what you about', 'show me your stuff',
      'what\'s your game', 'what you bring to the table', 'what\'s your thing'
    ]
  };

  detectCapabilityRequest(message: string): {
    isRequest: boolean;
    confidence: number;
    language: 'uk' | 'en';
    matchedTrigger?: string;
  } {
    try {
      // Використовуємо fuzzy matching для толерантності до помилок
      const fuzzyResult = this.fuzzyMatcher.detectCapabilityRequest(message);
      
      if (fuzzyResult.isCapabilityRequest) {
        console.log(`Fuzzy match: "${fuzzyResult.matchedTrigger}" (впевненість: ${fuzzyResult.confidence})`);
        return {
          isRequest: true,
          confidence: fuzzyResult.confidence,
          language: fuzzyResult.language,
          matchedTrigger: fuzzyResult.matchedTrigger
        };
      }
    } catch (error) {
      console.warn('Fuzzy matcher error, falling back to old method:', error);
    }

    // Fallback до старого методу як резервний варіант
    const lowerMessage = message.toLowerCase();
    
    // Check Ukrainian triggers
    const ukrainianMatch = this.capabilityTriggers.uk.some(trigger =>
      lowerMessage.includes(trigger)
    );

    // Check English triggers  
    const englishMatch = this.capabilityTriggers.en.some(trigger =>
      lowerMessage.includes(trigger)
    );

    if (ukrainianMatch || englishMatch) {
      return {
        isRequest: true,
        confidence: 1.0,
        language: ukrainianMatch ? 'uk' : 'en'
      };
    }

    return {
      isRequest: false,
      confidence: 0,
      language: 'uk'
    };
  }

  generateCapabilitiesResponse(language: 'uk' | 'en' = 'uk', userName?: string): string {
    const greeting = userName ?
      (language === 'uk' ? `Привіт, ${userName}! 👋` : `Hello, ${userName}! 👋`) :
      (language === 'uk' ? 'Привіт! 👋' : 'Hello! 👋');

    if (language === 'uk') {
      return `${greeting}

🤖 **Що я вмію:**

💬 **Спілкування**
• Розмови українською
• Розпізнаю емоції і настрій
• Відповідаю на @bot

🎭 **Розваги**
• Українські жарти
• Мемі: /meme текст | текст
• Реакції на "потужно" ⚡

🔧 **Корисне**
• Новини України
• Погода в містах
• Курси валют

🛡️ **Модерація**
• Фільтрую нецензурщину
• Позитивна атмосфера в чаті

👥 **Соціальне**
• Емоційна підтримка
• Призначаю ролі користувачам
• Реакції смайликами

📱 **Як викликати:**
• @bot + ваше питання
• Відповідь на моє повідомлення
• "Що ти можеш?" "Новини?" "Погода?"

⚙️ **CLI команди:**
• @bot help - ця довідка
• @bot status - статус функцій

💡 _Просто пишіть - я розумію!_ 🇺🇦`;
    } else {
      return `${greeting}

🤖 **What I can do:**

💬 **Conversations**
• Chat in Ukrainian/English
• Emotion & mood recognition
• Respond to @bot mentions

🎭 **Entertainment**
• Ukrainian jokes & stories
• Memes: /meme text | text
• React to power words ⚡

🔧 **Utilities**
• Ukrainian news updates
• Weather for cities
• Currency exchange rates

🛡️ **Moderation**
• Filter inappropriate content
• Maintain positive atmosphere

👥 **Social**
• Emotional support
• User role assignments
• Emoji reactions

📱 **How to call me:**
• @bot + your question
• Reply to my messages
• "What can you do?" "News?" "Weather?"

⚙️ **CLI commands:**
• @bot help - this help
• @bot status - features status

💡 _Just start typing - I understand!_ 🇺🇦`;
    }
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