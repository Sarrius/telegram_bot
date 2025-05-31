import axios from 'axios';

export interface MemeRequest {
  templateId?: string;
  topText: string;
  bottomText?: string;
  style?: 'classic' | 'modern' | 'ukrainian';
  language?: 'uk' | 'en';
}

export interface MemeResult {
  success: boolean;
  text?: string;
  imageUrl?: string;
  errorMessage?: string;
  attribution?: string;
  language: 'uk' | 'en';
}

export class MemeGenerator {
  // Ukrainian text-based meme templates
  private readonly ukrainianTextMemes: { [key: string]: string[] } = {
    programming: [
      "Коли твій код працює з першого разу:\n{text}",
      "Я пояснюю свій код гумовій качечці:\n{text}",
      "Коли хтось просить полагодити їх комп'ютер:\n{text}",
    ],
    life: [
      "Понеділок вранці такий:\n{text}",
      "Коли хтось каже 'просто будь собою':\n{text}",
      "Я намагаюся бути дорослим:\n{text}",
    ],
    food: [
      "Коли хтось питає що на вечерю:\n{text}",
      "Я бачу піцу:\n{text}",
      "Намагаюся харчуватися здорово:\n{text}",
    ],
    work: [
      "Коли нарешті п'ятниця:\n{text}",
      "Я на нарадах:\n{text}",
      "Коли дедлайн завтра:\n{text}",
    ],
    general: [
      "Всі: {text}\nЯ: Ну, насправді...",
      "Ніхто:\nАбсолютно ніхто:\nЯ: {text}",
      "Завдання виконано невдало:\n{text}",
    ],
    ukrainian: [
      "Коли готуєш борщ:\n{text}",
      "Бачиш українську прапор:\n{text} 🇺🇦",
      "Пояснюєш іноземцям про Україну:\n{text}",
      "Коли хтось плутає Україну з Росією:\n{text}",
    ]
  };

  private readonly textMemeTemplates: { [key: string]: string[] } = {
    programming: [
      "When your code works on the first try:\n{text}",
      "Me explaining my code to rubber duck:\n{text}",
      "When someone asks me to fix their computer:\n{text}",
    ],
    life: [
      "Monday morning be like:\n{text}",
      "When someone says 'just be yourself':\n{text}",
      "Me trying to adult:\n{text}",
    ],
    food: [
      "When someone asks what's for dinner:\n{text}",
      "Me seeing pizza:\n{text}",
      "Trying to eat healthy:\n{text}",
    ],
    work: [
      "When Friday finally arrives:\n{text}",
      "Me in meetings:\n{text}",
      "When the deadline is tomorrow:\n{text}",
    ],
    general: [
      "Everyone: {text}\nMe: Well, actually...",
      "Nobody:\nAbsolutely nobody:\nMe: {text}",
      "Task failed successfully:\n{text}",
    ]
  };

  // Ukrainian meme suggestions
  private readonly ukrainianMemeSuggestions: { [key: string]: MemeRequest } = {
    'код': { topText: "Коли код працює", bottomText: "Але ти не знаєш чому", language: 'uk' },
    'кава': { topText: "Я до кави", bottomText: "Я після кави", language: 'uk' },
    'понеділок': { topText: "П'ятниця вечором", bottomText: "Понеділок ранком", language: 'uk' },
    'робота': { topText: "Моя робота", bottomText: "Також моя робота о 3 ночі", language: 'uk' },
    'їжа': { topText: "Коли приходить їжа", bottomText: "Мир ніколи не був варіантом", language: 'uk' },
    'україна': { topText: "Показую прапор України", bottomText: "Всім навколо", language: 'uk' }
  };

  private readonly memeSuggestions: { [key: string]: MemeRequest } = {
    'code': { topText: "When code works", bottomText: "But you don't know why", language: 'en' },
    'coffee': { topText: "Me before coffee", bottomText: "Me after coffee", language: 'en' },
    'monday': { topText: "Friday evening", bottomText: "Monday morning", language: 'en' },
    'work': { topText: "My code", bottomText: "Also my code at 3am", language: 'en' },
    'food': { topText: "When food arrives", bottomText: "Peace was never an option", language: 'en' }
  };

  constructor() {
    console.log('🎭 Ukrainian Meme Generator initialized');
  }

  public async generateMeme(request: MemeRequest): Promise<MemeResult> {
    try {
      const language = request.language || 'uk';
      
      // Try Imgflip API for image memes if available
      const imgflipResult = await this.tryImgflipGeneration(request);
      if (imgflipResult.success) {
        return { ...imgflipResult, language };
      }

      // Fallback to text-based memes
      return await this.generateTextMeme('general', request.topText, language);
    } catch (error) {
      console.error('Error generating meme:', error);
      return {
        success: false,
        errorMessage: 'Failed to generate meme',
        language: request.language || 'uk'
      };
    }
  }

  public async generateTextMeme(topic: string, text: string, language: 'uk' | 'en' = 'uk'): Promise<MemeResult> {
    try {
      const templates = language === 'uk' 
        ? (this.ukrainianTextMemes[topic] || this.ukrainianTextMemes.general)
        : (this.textMemeTemplates[topic] || this.textMemeTemplates.general);
      
      const template = templates[Math.floor(Math.random() * templates.length)];
      const memeText = template.replace('{text}', text);

      return {
        success: true,
        text: memeText,
        attribution: language === 'uk' ? 'Згенеровано українським мем-генератором' : 'Generated with Ukrainian meme engine',
        language
      };
    } catch (error) {
      console.error('Error generating text meme:', error);
      return {
        success: false,
        errorMessage: 'Failed to generate text meme',
        language
      };
    }
  }

  public suggestMemeForMessage(message: string, language: 'uk' | 'en' = 'uk'): MemeRequest | null {
    const lowerMessage = message.toLowerCase();
    
    const suggestions = language === 'uk' ? this.ukrainianMemeSuggestions : this.memeSuggestions;
    
    // Check for Ukrainian-specific keywords first
    if (language === 'uk') {
      // Enhanced Ukrainian keyword matching with flexible patterns
      if (lowerMessage.includes('робот') || lowerMessage.includes('роботі')) {
        return this.ukrainianMemeSuggestions['робота'];
      }
      if (lowerMessage.includes('їж') || lowerMessage.includes('хочу їжу')) {
        return this.ukrainianMemeSuggestions['їжа'];
      }
      if (lowerMessage.includes('україн') || lowerMessage.includes('слава україні')) {
        return this.ukrainianMemeSuggestions['україна'];
      }
      if (lowerMessage.includes('кав')) {
        return this.ukrainianMemeSuggestions['кава'];
      }
      if (lowerMessage.includes('понеділ')) {
        return this.ukrainianMemeSuggestions['понеділок'];
      }
      
      // Exact keyword matches as fallback
      for (const [keyword, meme] of Object.entries(suggestions)) {
        if (lowerMessage.includes(keyword)) {
          return meme;
        }
      }
      
      // Ukrainian-specific patterns
      if (lowerMessage.includes('борщ') || lowerMessage.includes('вареники')) {
        return { topText: "Коли готуєш українську їжу", bottomText: "Душа співає", language: 'uk' };
      }
      if (lowerMessage.includes('україна') || lowerMessage.includes('🇺🇦')) {
        return { topText: "Серце радіє", bottomText: "Коли згадують Україну", language: 'uk' };
      }
    } else {
      for (const [keyword, meme] of Object.entries(suggestions)) {
        if (lowerMessage.includes(keyword)) {
          return meme;
        }
      }
    }
    
    // General patterns for both languages
    if (lowerMessage.includes('confused') || lowerMessage.includes('плутаний')) {
      return {
        topText: language === 'uk' ? "Намагаюся зрозуміти" : "Me trying to understand",
        bottomText: message.substring(0, 30) + (message.length > 30 ? '...' : ''),
        language
      };
    }

    return null;
  }

  private async tryImgflipGeneration(request: MemeRequest): Promise<MemeResult> {
    // Try to use Imgflip API if credentials are available
    const username = process.env.IMGFLIP_USERNAME;
    const password = process.env.IMGFLIP_PASSWORD;
    
    if (!username || !password) {
      return { success: false, language: request.language || 'uk' };
    }

    try {
      const response = await axios.post('https://api.imgflip.com/caption_image', {
        template_id: request.templateId || '181913649', // Drake meme
        username,
        password,
        text0: request.topText,
        text1: request.bottomText || '',
      }, { timeout: 5000 });

      if (response.data.success) {
        return {
          success: true,
          imageUrl: response.data.data.url,
          attribution: 'Created with Imgflip API',
          language: request.language || 'uk'
        };
      }
    } catch (error) {
      console.log('Imgflip API not available, using text memes');
    }

    return { success: false, language: request.language || 'uk' };
  }

  // Ukrainian trending memes
  public async generateUkrainianTrendingMeme(topic: string): Promise<MemeResult> {
    const ukrainianTrendingTemplates = {
      'cat': { top: 'Коли хтось згадує котів', bottom: 'Я викликаний' },
      'coffee': { top: 'Я до кави', bottom: 'Я після кави' },
      'weekend': { top: "П'ятниця вечором", bottom: 'Понеділок ранком' },
      'coding': { top: 'Мій код', bottom: 'Також мій код о 3 ранку' },
      'food': { top: 'Коли приходить їжа', bottom: 'Мир не варіант' },
      'ukraine': { top: 'Коли бачу українську символіку', bottom: 'Гордість переповнює' }
    };

    const template = ukrainianTrendingTemplates[topic as keyof typeof ukrainianTrendingTemplates] || 
                    { top: `Коли згадується ${topic}`, bottom: 'Всім це подобається' };

    return await this.generateMeme({
      topText: template.top,
      bottomText: template.bottom,
      language: 'uk'
    });
  }

  // Quick meme generation with Ukrainian support
  public async generateQuickMeme(text: string, language: 'uk' | 'en' = 'uk'): Promise<MemeResult> {
    const shortText = text.length > 50 ? text.substring(0, 47) + '...' : text;
    
    const memeText = language === 'uk' 
      ? `Всі: ${shortText}\nЯ: Ну, насправді... мем момент`
      : `Everyone: ${shortText}\nMe: Well, actually... meme moment`;
    
    return {
      success: true,
      text: memeText,
      attribution: language === 'uk' ? 'Згенеровано українським мем-генератором' : 'Generated with Ukrainian meme engine',
      language
    };
  }

  // Get meme statistics
  public getStats(): {
    availableUkrainianTemplates: number;
    availableEnglishTemplates: number;
    totalSuggestions: number;
  } {
    return {
      availableUkrainianTemplates: Object.keys(this.ukrainianTextMemes).length,
      availableEnglishTemplates: Object.keys(this.textMemeTemplates).length,
      totalSuggestions: Object.keys(this.ukrainianMemeSuggestions).length + Object.keys(this.memeSuggestions).length
    };
  }

  // Language detection for memes
  private detectLanguage(text: string): 'uk' | 'en' {
    const ukrainianChars = /[іїєґ]/g;
    const ukrainianWords = ['що', 'як', 'коли', 'де', 'чому'];
    
    const hasUkrainianChars = ukrainianChars.test(text.toLowerCase());
    const ukrainianWordCount = ukrainianWords.filter(word => text.toLowerCase().includes(word)).length;
    
    return (hasUkrainianChars || ukrainianWordCount >= 1) ? 'uk' : 'en';
  }

  // Public method to get available templates by language
  public getAvailableTemplates(language: 'uk' | 'en' = 'uk'): string[] {
    return Object.keys(language === 'uk' ? this.ukrainianTextMemes : this.textMemeTemplates);
  }
} 