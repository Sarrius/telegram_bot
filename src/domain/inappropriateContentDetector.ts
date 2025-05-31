export interface ContentAnalysis {
  isInappropriate: boolean;
  severity: 'low' | 'medium' | 'high';
  categories: string[];
  confidence: number;
  suggestedResponse: string;
  shouldApplyPenalty: boolean;
  language: 'uk' | 'en';
}

export interface ContentConfiguration {
  sensitivityLevel: 'low' | 'medium' | 'high';
  customForbiddenWords: string[];
  enableSarcasm: boolean;
  enablePenalties: boolean;
  adminUserIds: string[];
  primaryLanguage: 'uk' | 'en';
}

export class InappropriateContentDetector {
  private config: ContentConfiguration;
  
  // Ukrainian inappropriate words
  private readonly ukrainianForbiddenWords: { [key: string]: string[] } = {
    offensive: [
      'дурень', 'ідіот', 'дебіл', 'тупий', 'ненавиджу', 'помри', 'здохни',
      'жалюгідний', 'невдаха', 'нікчемний', 'сміття', 'лайно'
    ],
    toxic: [
      'токсик', 'рак', 'йди помри', 'здохни', 'повісься',
      'даремна трата місця', 'без мозгів', 'дебіл'
    ],
    discriminatory: [
      'расист', 'сексист', 'гомофоб', 'дискримінація'
    ],
    spam: [
      'натисни тут', 'купи зараз', 'обмежений час', 'діяти швидко',
      'вітаємо з виграшем', 'отримай приз', 'заробляй гроші'
    ]
  };

  private readonly defaultForbiddenWords: { [key: string]: string[] } = {
    offensive: [
      'stupid', 'idiot', 'moron', 'dumb', 'hate', 'kill', 'die',
      'pathetic', 'loser', 'worthless', 'garbage', 'trash'
    ],
    toxic: [
      'toxic', 'cancer', 'kys', 'go die', 'neck yourself',
      'waste of space', 'braindead', 'retard'
    ],
    discriminatory: [
      'racist', 'sexist', 'homophobic', 'transphobic'
    ],
    spam: [
      'click here', 'buy now', 'limited time', 'act fast',
      'congratulations you won', 'claim your prize'
    ]
  };

  // Ukrainian sarcastic responses
  private readonly ukrainianSarcasticResponses: { [key: string]: string[] } = {
    offensive: [
      "Гей {username}, ти запозичив цю поведінку з фільму про гангстерів 90-х? 😎 Давай тримати спокій!",
      "Ого {username}, це трохи занадто гостро для цього чату! 🌶️ Збав тон, чемпіоне.",
      "Йо {username}, здається твоя клавіатура зламалась! 😤 Спробуй якісь приємніші слова!",
      "{username}, твій автокорект одержимий тролем? 👹 Давай будемо дружніми!"
    ],
    toxic: [
      "Йой {username}, ця енергія може живити ціле місто! ⚡ Може перенаправиш її позитивно?",
      "Гей {username}, сьогодні втілюєш свого внутрішнього лиходія? 🦹‍♂️ Як щодо героїчних вібрацій?",
      "Вау {username}, це темніше ніж мій екран о 3 ранку! 🌙 Просвітли трохи!",
      "{username}, збережи це ставлення для битви з босом у відеогрі! 🎮 Тут спокійна зона!"
    ],
    discriminatory: [
      "Стоп {username}, цей чат - зона рівних можливостей для веселощів! 🤝 Залишайся толерантним!",
      "Гей {username}, тут все про хороші вібрації! 🌈 Як щодо поширити трохи любові?",
      "Ні {username}, це не летить у нашому районі! ✈️ Тут усі вітаються!",
      "{username}, цей чат як Швейцарія - нейтральний і мирний! 🏔️ Залишайся поважливим!"
    ],
    spam: [
      "Гарна спроба {username}, але це не ринок! 🛒 Залиш торгові пропозиції деінде!",
      "Гей {username}, неправильний чат для цієї бізнес-пропозиції! 💼 Тут соціальна зона!",
      "Йо {username}, твій внутрішній підприємець показується! 💰 Але давай залишимо все невимушено!",
      "{username}, це не торговий канал! 📺 Залиш рекламу для телебачення!"
    ]
  };

  private readonly sarcasticResponses: { [key: string]: string[] } = {
    offensive: [
      "Hey {username}, did you borrow that attitude from a 90s gangster movie? 😎 Let's keep it chill!",
      "Whoa {username}, that's a bit too spicy for this chat! 🌶️ Tone it down, champ.",
      "Yo {username}, your keyboard seems to be malfunctioning! 😤 Try some nicer words!",
      "{username}, did your autocorrect get possessed by a troll? 👹 Let's keep it friendly!"
    ],
    toxic: [
      "Yikes {username}, that energy could power a city! ⚡ Maybe redirect it positively?",
      "Hey {username}, channeling your inner villain today? 🦹‍♂️ How about some hero vibes instead?",
      "Wow {username}, that's darker than my screen at 3 AM! 🌙 Lighten up a bit!",
      "{username}, save that attitude for a video game boss fight! 🎮 This is a chill zone!"
    ],
    discriminatory: [
      "Hold up {username}, this chat is an equal opportunity fun zone! 🤝 Let's keep it inclusive!",
      "Hey {username}, we're all about good vibes here! 🌈 How about we spread some love instead?",
      "Nope {username}, that doesn't fly in this neighborhood! ✈️ Everyone's welcome here!",
      "{username}, this chat is Switzerland - neutral and peaceful! 🏔️ Keep it respectful!"
    ],
    spam: [
      "Nice try {username}, but this isn't a marketplace! 🛒 Save the sales pitch for elsewhere!",
      "Hey {username}, wrong chat for that business proposal! 💼 This is a social zone!",
      "Yo {username}, your inner entrepreneur is showing! 💰 But let's keep it casual here!",
      "{username}, this isn't a shopping channel! 📺 Keep the commercials for TV time!"
    ]
  };

  // Ukrainian penalty tasks
  private readonly ukrainianPenaltyTasks: string[] = [
    "Напиши 3 хороші речі про цей чат, щоб компенсувати той коментар! 😤",
    "Поділись цікавим фактом, щоб виправитись! 🧠",
    "Розкажи про свій улюблений емодзі і чому! 😊",
    "Зроби комплімент останнім 3 людям, які писали до тебе! 💝",
    "Поділись милим мемом, щоб очистити вібрації чату! 🧼",
    "Напиши хайку про дружбу! 🌸",
    "Розкажи, за що ти вдячний сьогодні! 🙏"
  ];

  private readonly penaltyTasks: string[] = [
    "Write 3 nice things about this chat to make up for that comment! 😤",
    "Share a fun fact to redeem yourself! 🧠",
    "Tell us your favorite emoji and why! 😊",
    "Compliment the last 3 people who posted before you! 💝",
    "Share a wholesome meme to cleanse the chat vibes! 🧼",
    "Write a haiku about friendship! 🌸",
    "Tell us what you're grateful for today! 🙏"
  ];

  private userWarnings: Map<string, number> = new Map();
  private readonly maxWarnings = 3;

  constructor(config: Partial<ContentConfiguration> = {}) {
    this.config = {
      sensitivityLevel: 'medium',
      customForbiddenWords: [],
      enableSarcasm: true,
      enablePenalties: true,
      adminUserIds: [],
      primaryLanguage: 'uk', // Default to Ukrainian
      ...config
    };
  }

  async analyzeContent(message: string, userId: string, userName: string): Promise<ContentAnalysis> {
    const lowerMessage = message.toLowerCase();
    const categories: string[] = [];
    let severity: 'low' | 'medium' | 'high' = 'low';
    let confidence = 0;

    // Detect language
    const language = this.detectLanguage(message);
    
    // Choose appropriate word lists
    const forbiddenWords = language === 'uk' ? this.ukrainianForbiddenWords : this.defaultForbiddenWords;

    // Check against different categories
    for (const [category, words] of Object.entries(forbiddenWords)) {
      const categoryScore = this.checkCategory(lowerMessage, words);
      if (categoryScore > 0) {
        categories.push(category);
        confidence = Math.max(confidence, categoryScore);
        
        if (category === 'toxic' || category === 'discriminatory') {
          severity = 'high';
        } else if (category === 'offensive' && this.config.sensitivityLevel !== 'low') {
          severity = 'medium';
        }
      }
    }

    // Check custom forbidden words
    if (this.config.customForbiddenWords.length > 0) {
      const customScore = this.checkCategory(lowerMessage, this.config.customForbiddenWords);
      if (customScore > 0) {
        categories.push('custom');
        confidence = Math.max(confidence, customScore);
        severity = this.config.sensitivityLevel;
      }
    }

    // Advanced pattern detection
    const patternScore = this.detectPatterns(message);
    if (patternScore > 0) {
      categories.push('pattern');
      confidence = Math.max(confidence, patternScore);
    }

    confidence = this.adjustConfidenceForSensitivity(confidence);
    const isInappropriate = confidence > 0.3 && categories.length > 0;
    
    let suggestedResponse = '';
    let shouldApplyPenalty = false;

    if (isInappropriate) {
      suggestedResponse = this.generateResponse(categories, userName, severity, language);
      shouldApplyPenalty = this.shouldApplyPenalty(userId, severity);
    }

    return {
      isInappropriate,
      severity,
      categories,
      confidence,
      suggestedResponse,
      shouldApplyPenalty,
      language
    };
  }

  private detectLanguage(text: string): 'uk' | 'en' {
    const lowerText = text.toLowerCase();
    
    // Check for Ukrainian specific characters
    const ukrainianChars = /[іїєґ]/g;
    const ukrainianWords = ['що', 'як', 'коли', 'де', 'чому', 'і', 'в', 'на', 'з'];
    
    const hasUkrainianChars = ukrainianChars.test(lowerText);
    const ukrainianWordCount = ukrainianWords.filter(word => lowerText.includes(word)).length;
    
    if (hasUkrainianChars || ukrainianWordCount >= 1) {
      return 'uk';
    }
    
    return this.config.primaryLanguage;
  }

  private checkCategory(message: string, words: string[]): number {
    let score = 0;
    let matches = 0;

    for (const word of words) {
      if (message.includes(word)) {
        matches++;
        score += 0.2;
      }
    }

    // Boost score for multiple matches
    if (matches > 1) {
      score *= 1.5;
    }

    return Math.min(score, 1.0);
  }

  private detectPatterns(message: string): number {
    let score = 0;

    // ALL CAPS DETECTION
    if (message.length > 10 && message === message.toUpperCase()) {
      score += 0.3;
    }

    // Excessive punctuation
    const punctuationCount = (message.match(/[!?]{2,}/g) || []).length;
    if (punctuationCount > 0) {
      score += punctuationCount * 0.1;
    }

    // Repeated characters
    const repeatedChars = (message.match(/(.)\1{3,}/g) || []).length;
    if (repeatedChars > 0) {
      score += repeatedChars * 0.15;
    }

    // Suspicious URLs
    if (message.match(/bit\.ly|tinyurl|click here|telegram\.me/gi)) {
      score += 0.4;
    }

    return Math.min(score, 1.0);
  }

  private adjustConfidenceForSensitivity(confidence: number): number {
    switch (this.config.sensitivityLevel) {
      case 'low':
        return confidence * 0.7;
      case 'high':
        return Math.min(confidence * 1.3, 1.0);
      default:
        return confidence;
    }
  }

  private generateResponse(categories: string[], userName: string, severity: 'low' | 'medium' | 'high', language: 'uk' | 'en'): string {
    if (!this.config.enableSarcasm) {
      return language === 'uk' 
        ? `Гей ${userName}, давай тримати чат позитивним! 😊`
        : `Hey ${userName}, let's keep the chat positive! 😊`;
    }

    // Choose response pool based on language and category
    const responsePool = language === 'uk' 
      ? this.ukrainianSarcasticResponses 
      : this.sarcasticResponses;
    
    const primaryCategory = categories[0];
    const responses = responsePool[primaryCategory] || responsePool.offensive;
    
    let response = responses[Math.floor(Math.random() * responses.length)];
    response = response.replace('{username}', userName);

    // Add penalty task for higher severity
    if (severity === 'high' && this.config.enablePenalties) {
      const tasks = language === 'uk' ? this.ukrainianPenaltyTasks : this.penaltyTasks;
      const task = tasks[Math.floor(Math.random() * tasks.length)];
      response += ` ${task}`;
    }

    return response;
  }

  private shouldApplyPenalty(userId: string, severity: 'low' | 'medium' | 'high'): boolean {
    if (!this.config.enablePenalties) return false;

    const currentWarnings = this.userWarnings.get(userId) || 0;
    
    if (severity === 'high' || currentWarnings >= 2) {
      this.userWarnings.set(userId, currentWarnings + 1);
      return true;
    }

    this.userWarnings.set(userId, currentWarnings + 1);
    return false;
  }

  // Public methods for configuration
  public updateConfiguration(newConfig: Partial<ContentConfiguration>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public addCustomForbiddenWords(words: string[]): void {
    this.config.customForbiddenWords = [...this.config.customForbiddenWords, ...words];
  }

  public removeCustomForbiddenWords(words: string[]): void {
    this.config.customForbiddenWords = this.config.customForbiddenWords.filter(
      word => !words.includes(word)
    );
  }

  public getUserWarnings(userId: string): number {
    return this.userWarnings.get(userId) || 0;
  }

  public resetUserWarnings(userId: string): void {
    this.userWarnings.delete(userId);
  }

  public isAdmin(userId: string): boolean {
    return this.config.adminUserIds.includes(userId);
  }

  public getConfiguration(): ContentConfiguration {
    return { ...this.config };
  }

  public getStats(): {
    totalWarnings: number;
    usersWithWarnings: number;
    configuredSensitivity: string;
    primaryLanguage: string;
  } {
    return {
      totalWarnings: Array.from(this.userWarnings.values()).reduce((sum, count) => sum + count, 0),
      usersWithWarnings: this.userWarnings.size,
      configuredSensitivity: this.config.sensitivityLevel,
      primaryLanguage: this.config.primaryLanguage
    };
  }
} 