import { MessageHandler, MessageContext, BotResponse } from './handleMessage';
import { NLPConversationEngine, ConversationContext } from '../domain/nlpConversation';
import { InappropriateContentDetector, ContentConfiguration } from '../domain/inappropriateContentDetector';
import { AtmosphereEnhancer, AtmosphereConfig } from '../domain/atmosphereEnhancer';
import { MemeGenerator, MemeRequest } from '../domain/memeGenerator';
import { BotCapabilities } from '../domain/botCapabilities';
import { PotuzhnoPowerWordsDetector, PowerWordMatch } from '../domain/potuzhnoPowerWordsDetector';
import { ModerationHandler, ModerationResponse, ModerationConfig } from './moderationHandler';
import { analyzeMessage } from '../domain/messageAnalyzer';

export interface EnhancedMessageContext extends MessageContext {
  isDirectMention?: boolean;
  requestsMeme?: boolean;
  memeRequest?: string;
  chatType?: 'private' | 'group' | 'supergroup' | 'channel';
}

export interface EnhancedBotResponse extends BotResponse {
  conversationResponse?: string;
  inappropriateContentWarning?: string;
  moderationResponse?: {
    type: ModerationResponse['responseType'];
    message: string;
    confidence: number;
    reasoning: string;
  };
  atmosphereAction?: {
    type: 'engagement' | 'role_assignment' | 'poll';
    content: string;
    data?: any;
  };
  memeResponse?: {
    type: 'image' | 'url' | 'text';
    content: Buffer | string;
    attribution?: string;
  };
  powerWordReaction?: {
    emoji: string;
    match: PowerWordMatch;
    motivationalResponse?: string;
  };
  responseType: 'reaction' | 'reply' | 'conversation' | 'content_warning' | 'moderation' | 'meme' | 'atmosphere' | 'power_word' | 'none';
}

export class EnhancedMessageHandler {
  private baseHandler: MessageHandler;
  private nlpEngine: NLPConversationEngine;
  private contentDetector: InappropriateContentDetector;
  private atmosphereEnhancer: AtmosphereEnhancer;
  private memeGenerator: MemeGenerator;
  private botCapabilities: BotCapabilities;
  private powerWordsDetector: PotuzhnoPowerWordsDetector;
  private moderationHandler: ModerationHandler;
  
  private engagementCheckInterval: NodeJS.Timeout | null = null;
  private chatEngagementCallbacks: Map<string, (action: any) => void> = new Map();

  constructor(
    contentConfig?: Partial<ContentConfiguration>,
    atmosphereConfig?: Partial<AtmosphereConfig>,
    moderationConfig?: Partial<ModerationConfig>
  ) {
    this.baseHandler = new MessageHandler();
    this.nlpEngine = new NLPConversationEngine();
    this.contentDetector = new InappropriateContentDetector({
      primaryLanguage: 'uk', // Default to Ukrainian
      ...contentConfig
    });
    this.atmosphereEnhancer = new AtmosphereEnhancer({
      primaryLanguage: 'uk', // Default to Ukrainian
      ...atmosphereConfig
    });
    this.memeGenerator = new MemeGenerator();
    this.botCapabilities = new BotCapabilities();
    this.powerWordsDetector = new PotuzhnoPowerWordsDetector();
    this.moderationHandler = new ModerationHandler(moderationConfig);

    console.log('🇺🇦 Enhanced Ukrainian Telegram Bot Handler initialized');
    // Start periodic atmosphere engagement checks
    this.startAtmosphereMonitoring();
  }

  async handleMessage(context: EnhancedMessageContext): Promise<EnhancedBotResponse> {
    const startTime = Date.now();
    console.log(`🚀 Enhanced processing: "${context.text?.substring(0, 50)}..." from ${context.userName}`);

    try {
      // Step 1: Check for profanity/inappropriate language (highest priority)
      const moderationAnalysis = this.moderationHandler.analyzeMessage(
        context.text,
        context.chatType || 'group',
        context.userId,
        context.chatId
      );

      if (moderationAnalysis.shouldRespond) {
        console.log(`🔴 Profanity detected: ${moderationAnalysis.responseType} response (${(moderationAnalysis.confidence * 100).toFixed(1)}%)`);
        return {
          ...this.createBaseResponse(),
          shouldReply: true,
          reply: moderationAnalysis.response,
          confidence: moderationAnalysis.confidence,
          reasoning: moderationAnalysis.reasoning,
          moderationResponse: {
            type: moderationAnalysis.responseType,
            message: moderationAnalysis.response,
            confidence: moderationAnalysis.confidence,
            reasoning: moderationAnalysis.reasoning
          },
          responseType: 'moderation'
        };
      }

      // Step 2: Check for other inappropriate content 
      const contentAnalysis = await this.contentDetector.analyzeContent(
        context.text,
        context.userId,
        context.userName || 'Unknown'
      );

      if (contentAnalysis.isInappropriate) {
        console.log(`⚠️ Inappropriate content detected: ${contentAnalysis.categories.join(', ')} (${contentAnalysis.severity})`);
        return {
          ...this.createBaseResponse(),
          shouldReply: true,
          reply: contentAnalysis.suggestedResponse,
          confidence: contentAnalysis.confidence,
          reasoning: `Inappropriate content detected: ${contentAnalysis.categories.join(', ')}`,
          inappropriateContentWarning: contentAnalysis.suggestedResponse,
          responseType: 'content_warning'
        };
      }

      // Step 2: Update atmosphere tracking
      const sentiment = this.extractSentiment(context.text);
      this.atmosphereEnhancer.updateChatActivity(
        context.chatId,
        context.userId,
        context.userName || 'Unknown',
        context.text,
        sentiment
      );

      // Step 2.1: Always update NLP statistics for tracking purposes
      const nlpContext: ConversationContext = {
        userId: context.userId,
        userName: context.userName || 'Unknown',
        chatHistory: [],
        currentMessage: context.text,
        chatTopic: this.extractChatTopic(context.text)
      };
      // Generate response to update user statistics (we may not use the response)
      await this.nlpEngine.generateConversationalResponse(nlpContext);

      // Step 3: Check for bot capabilities requests (high priority)
      if (this.isBotCapabilitiesRequest(context)) {
        const capabilitiesResponse = await this.handleCapabilitiesRequest(context);
        if (capabilitiesResponse) {
          return capabilitiesResponse;
        }
      }

      // Step 4: Check for power words ("потужно" синоніми) with typo tolerance
      const powerWordMatch = this.powerWordsDetector.getBestPowerWordMatch(context.text);
      if (powerWordMatch) {
        console.log(`⚡ Power word detected: "${powerWordMatch.originalWord}" -> "${powerWordMatch.matchedWord}" (${(powerWordMatch.confidence * 100).toFixed(1)}%)`);
        
        const emoji = this.powerWordsDetector.getReactionEmoji(powerWordMatch);
        const motivationalResponse = this.powerWordsDetector.getMotivationalResponse(powerWordMatch);
        
        return {
          ...this.createBaseResponse(),
          shouldReact: true,
          reaction: emoji,
          shouldReply: Math.random() < 0.3, // 30% шанс додатково відповісти
          reply: Math.random() < 0.3 ? motivationalResponse : undefined,
          confidence: powerWordMatch.confidence,
          reasoning: `Power word detected: ${powerWordMatch.originalWord} -> ${powerWordMatch.matchedWord}`,
          powerWordReaction: {
            emoji,
            match: powerWordMatch,
            motivationalResponse
          },
          responseType: 'power_word'
        };
      }

      // Step 5: Check for direct conversation requests (mentions, replies, help requests)
      if (this.isDirectConversationRequest(context)) {
        const conversationResponse = await this.handleConversation(context);
        if (conversationResponse) {
          return conversationResponse;
        }
      }

      // Step 6: Check for meme requests
      if (this.isMemeRequest(context)) {
        const memeResponse = await this.handleMemeRequest(context);
        if (memeResponse) {
          return memeResponse;
        }
      }

      // Step 7: Enhanced emotional trigger detection
      const shouldEngageEmotionally = this.shouldEngageBasedOnEmotions(context);
      if (!shouldEngageEmotionally.shouldEngage) {
        console.log(`🤐 Staying quiet: ${shouldEngageEmotionally.reasoning}`);
        return {
          ...this.createBaseResponse(),
          confidence: shouldEngageEmotionally.confidence,
          reasoning: shouldEngageEmotionally.reasoning,
          responseType: 'none'
        };
      }

      // Step 8: Use base handler for sentiment reactions only if we decided to engage
      const baseResponse = await this.baseHandler.handleMessage(context);

      // Step 9: Enhance with meme suggestions if appropriate
      if (baseResponse.shouldReact && Math.random() < 0.1) { // 10% chance to suggest meme
        const memeData = await this.tryGenerateContextualMeme(context.text);
        if (memeData) {
          return {
            ...baseResponse,
            memeResponse: memeData,
            responseType: 'meme'
          };
        }
      }

      // Step 10: Return enhanced base response
      const processingTime = Date.now() - startTime;
      console.log(`✅ Enhanced processing completed in ${processingTime}ms`);
      
      return {
        ...baseResponse,
        responseType: baseResponse.shouldReact ? 'reaction' : (baseResponse.shouldReply ? 'reply' : 'none')
      };

    } catch (error) {
      console.error('❌ Error in enhanced message handling:', error);
      return {
        ...this.createBaseResponse(),
        confidence: 0,
        reasoning: 'Error in enhanced processing, falling back to safe response',
        responseType: 'none'
      };
    }
  }

  private async handleConversation(context: EnhancedMessageContext): Promise<EnhancedBotResponse | null> {
    try {
      const conversationContext: ConversationContext = {
        userId: context.userId,
        userName: context.userName || 'Unknown',
        chatHistory: [], // Could be enhanced to maintain chat history
        currentMessage: context.text,
        chatTopic: this.extractChatTopic(context.text)
      };

      const nlpResponse = await this.nlpEngine.generateConversationalResponse(conversationContext);
      
      console.log(`🤖 NLP Response: "${nlpResponse.response}" (confidence: ${(nlpResponse.confidence * 100).toFixed(1)}%)`);

      return {
        ...this.createBaseResponse(),
        shouldReply: true,
        reply: nlpResponse.response,
        confidence: nlpResponse.confidence,
        reasoning: `Direct conversation with ${nlpResponse.detectedIntent} intent`,
        conversationResponse: nlpResponse.response,
        responseType: 'conversation'
      };
    } catch (error) {
      console.error('❌ Error in conversation handling:', error);
      return null;
    }
  }

  private async handleMemeRequest(context: EnhancedMessageContext): Promise<EnhancedBotResponse | null> {
    try {
      let memeResult;
      
      if (context.memeRequest) {
        // Specific meme request
        const memeRequest = this.parseMemeRequest(context.memeRequest);
        memeResult = await this.memeGenerator.generateMeme(memeRequest);
      } else {
        // Suggest meme based on message content
        const suggestedMeme = this.memeGenerator.suggestMemeForMessage(context.text);
        if (suggestedMeme) {
          memeResult = await this.memeGenerator.generateMeme(suggestedMeme);
        } else {
          memeResult = await this.memeGenerator.generateQuickMeme(context.text);
        }
      }

      if (memeResult && memeResult.success) {
        console.log(`🎭 Meme generated: ${memeResult.attribution}`);
        
        return {
          ...this.createBaseResponse(),
          shouldReply: true,
          reply: `Here's your meme! ${memeResult.attribution}`,
          confidence: 0.9,
          reasoning: 'Meme request fulfilled',
          memeResponse: {
            type: memeResult.imageUrl ? 'url' : 'text',
            content: memeResult.imageUrl || memeResult.text!,
            attribution: memeResult.attribution
          },
          responseType: 'meme'
        };
      }
    } catch (error) {
      console.error('❌ Error in meme generation:', error);
    }
    
    return null;
  }

  private async tryGenerateContextualMeme(text: string): Promise<{ type: 'image' | 'url' | 'text'; content: Buffer | string; attribution?: string } | null> {
    try {
      const suggested = this.memeGenerator.suggestMemeForMessage(text);
      if (suggested) {
        const result = await this.memeGenerator.generateMeme(suggested);
        if (result.success) {
          return {
            type: result.imageUrl ? 'url' : 'text',
            content: result.imageUrl || result.text!,
            attribution: result.attribution
          };
        }
      }
    } catch (error) {
      console.error('❌ Error generating contextual meme:', error);
    }
    return null;
  }

  // Atmosphere enhancement methods
  public registerChatEngagementCallback(chatId: string, callback: (action: any) => void): void {
    this.chatEngagementCallbacks.set(chatId, callback);
  }

  private startAtmosphereMonitoring(): void {
    // Check for engagement opportunities every 5 minutes
    this.engagementCheckInterval = setInterval(async () => {
      await this.checkForEngagementOpportunities();
    }, 5 * 60 * 1000);
  }

  private async checkForEngagementOpportunities(): Promise<void> {
    for (const [chatId, callback] of this.chatEngagementCallbacks.entries()) {
      try {
        const action = await this.atmosphereEnhancer.generateEngagementAction(chatId);
        if (action) {
          console.log(`🎯 Atmosphere engagement for chat ${chatId}: ${action.type}`);
          callback(action);
        }
      } catch (error) {
        console.error(`❌ Error checking engagement for chat ${chatId}:`, error);
      }
    }
  }

  // Utility methods
  private isDirectConversationRequest(context: EnhancedMessageContext): boolean {
    return !!(
      context.isDirectMention ||
      context.mentionsBot ||
      context.isReplyToBot ||
      context.text.toLowerCase().includes('@bot') ||
      context.text.startsWith('/chat') ||
      (context.text.toLowerCase().includes('tell me') && context.text.length > 15)
    );
  }

  private isMemeRequest(context: EnhancedMessageContext): boolean {
    const lowerText = context.text.toLowerCase();
    return !!(
      context.requestsMeme ||
      lowerText.includes('meme') ||
      lowerText.includes('make a meme') ||
      lowerText.includes('generate meme') ||
      lowerText.startsWith('/meme')
    );
  }

  private parseMemeRequest(request: string): MemeRequest {
    // Simple parsing - could be enhanced with NLP
    const parts = request.split('|').map(p => p.trim());
    return {
      topText: parts[0] || request,
      bottomText: parts[1] || undefined
    };
  }

  private extractSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const analysis = analyzeMessage(text);
    if (analysis.includes('positive') || analysis.includes('excitement') || analysis.includes('overly_positive')) {
      return 'positive';
    }
    if (analysis.includes('negative') || analysis.includes('aggressive')) {
      return 'negative';
    }
    return 'neutral';
  }

  private extractChatTopic(text: string): string | undefined {
    // Simple topic extraction - could be enhanced
    const topics = ['food', 'work', 'music', 'movies', 'sports', 'weather', 'technology'];
    const lowerText = text.toLowerCase();
    
    for (const topic of topics) {
      if (lowerText.includes(topic)) {
        return topic;
      }
    }
    return undefined;
  }

  private createBaseResponse(): EnhancedBotResponse {
    return {
      shouldReact: false,
      shouldReply: false,
      confidence: 0,
      reasoning: '',
      responseType: 'none'
    };
  }

  // Configuration methods
  public updateContentConfiguration(config: Partial<ContentConfiguration>): void {
    this.contentDetector.updateConfiguration(config);
  }

  public updateAtmosphereConfiguration(config: Partial<AtmosphereConfig>): void {
    this.atmosphereEnhancer.updateConfig(config);
  }

  // Statistics and monitoring
  public getEnhancedStats() {
    return {
      base: this.baseHandler.getStats(),
      nlp: this.nlpEngine.getStats(),
      content: this.contentDetector.getStats(),
      moderation: this.moderationHandler.getStats(),
      atmosphere: {
        activeChatCallbacks: this.chatEngagementCallbacks.size
      },
      memes: {
        availableTemplates: this.memeGenerator.getAvailableTemplates().length
      },
      powerWords: {
        vocabularySize: this.powerWordsDetector.getDetectionStats('').totalMatches || 0,
        confidenceThreshold: 0.8
      }
    };
  }

  public getChatAtmosphereStats(chatId: string) {
    const chatStats = this.atmosphereEnhancer.getChatStats(chatId);
    const userRoles = this.atmosphereEnhancer.getAllUserRoles()
      .filter(role => role.userId.startsWith(chatId)); // Assuming userId contains chatId
    
    return {
      chatActivity: chatStats,
      userRoles: userRoles,
      engagementCallbackRegistered: this.chatEngagementCallbacks.has(chatId)
    };
  }

  public getUserRole(userId: string) {
    return this.atmosphereEnhancer.getUserRole(userId);
  }

  // Admin methods
  public async recordContentFeedback(userId: string, messageId: string, isAppropriate: boolean): Promise<void> {
    // Could be enhanced to train the inappropriate content detector
    console.log(`📝 Content feedback: User ${userId}, Message ${messageId}, Appropriate: ${isAppropriate}`);
  }

  public resetUserWarnings(userId: string): void {
    this.contentDetector.resetUserWarnings(userId);
  }

  public addCustomForbiddenWords(words: string[]): void {
    this.contentDetector.addCustomForbiddenWords(words);
  }

  // Moderation management methods
  public updateModerationConfig(config: Partial<ModerationConfig>): void {
    this.moderationHandler.updateConfig(config);
  }

  public getModerationConfig(): ModerationConfig {
    return this.moderationHandler.getConfig();
  }

  public addProfanityWord(word: string, language: 'ua' | 'ru'): void {
    this.moderationHandler.addProfanityWord(word, language);
  }

  public removeProfanityWord(word: string, language: 'ua' | 'ru'): void {
    this.moderationHandler.removeProfanityWord(word, language);
  }

  public addModerationResponse(type: 'warning' | 'moderate' | 'strict', response: string): void {
    this.moderationHandler.addCustomResponse(type, response);
  }

  public removeModerationResponse(type: 'warning' | 'moderate' | 'strict', response: string): void {
    this.moderationHandler.removeCustomResponse(type, response);
  }

  public testProfanityMessage(message: string): { analysis: any; response: ModerationResponse } {
    return this.moderationHandler.testMessage(message);
  }

  // Bot capabilities methods
  private isBotCapabilitiesRequest(context: EnhancedMessageContext): boolean {
    return this.botCapabilities.detectCapabilityRequest(context.text);
  }

  private async handleCapabilitiesRequest(context: EnhancedMessageContext): Promise<EnhancedBotResponse | null> {
    try {
      // Detect language
      const language = this.detectLanguage(context.text);
      const response = this.botCapabilities.generateCapabilitiesResponse(
        language === 'uk' || language === 'mixed' ? 'uk' : 'en',
        context.userName
      );

      console.log(`📋 Capabilities request from ${context.userName} (${language})`);

      return {
        ...this.createBaseResponse(),
        shouldReply: true,
        reply: response,
        confidence: 0.95,
        reasoning: 'Bot capabilities request detected',
        conversationResponse: response,
        responseType: 'conversation'
      };
    } catch (error) {
      console.error('❌ Error in capabilities handling:', error);
      return null;
    }
  }

  private detectLanguage(text: string): 'uk' | 'en' | 'mixed' {
    const lowerText = text.toLowerCase();
    
    // Check for Ukrainian specific characters and words
    const ukrainianChars = /[іїєґ]/g;
    const ukrainianWords = ['що', 'як', 'коли', 'де', 'чому', 'і', 'в', 'на', 'з', 'можеш', 'можливості', 'функції'];
    
    const hasUkrainianChars = ukrainianChars.test(lowerText);
    const ukrainianWordCount = ukrainianWords.filter(word => lowerText.includes(word)).length;
    
    if (hasUkrainianChars || ukrainianWordCount >= 1) {
      return 'uk';
    }
    
    // Check for mixed language
    const englishWords = ['what', 'can', 'you', 'do', 'capabilities', 'features', 'help'];
    const englishWordCount = englishWords.filter(word => lowerText.includes(word)).length;
    
    if (ukrainianWordCount > 0 && englishWordCount > 0) {
      return 'mixed';
    }
    
    return englishWordCount > 0 ? 'en' : 'uk';
  }

  // NEW: Enhanced emotional engagement detection
  private shouldEngageBasedOnEmotions(context: EnhancedMessageContext): {
    shouldEngage: boolean;
    confidence: number;
    reasoning: string;
  } {
    const text = context.text.toLowerCase();
    
    // Always engage on direct emotional appeals
    const emotionalTriggers = {
      // Помощь и поддержка
      helpSeeking: [
        'допоможи', 'допомога', 'потрібна допомога', 'потрібна підтримка', 'help me',
        'підтримай', 'підтримайте', 'важко', 'складно', 'не знаю що робити',
        'поради', 'порада', 'що робити', 'як бути', 'розгубився', 'розгубилася'
      ],
      // Сильні емоції (позитивні)
      strongPositive: [
        'супер', 'чудово', 'фантастично', 'неймовірно', 'вау', 'wow',
        'офігенно', 'бомбезно', 'класно', 'круто', 'топ', 'бест',
        'ура', 'ідеально', 'прекрасно', 'геніально', 'love', 'обожнюю'
      ],
      // Сильні емоції (негативні)
      strongNegative: [
        'жахливо', 'ужасно', 'кошмар', 'депресія', 'сумно', 'грустно',
        'погано', 'катастрофа', 'біда', 'трагедія', 'провал', 'невдача',
        'паскудно', 'відстій', 'hate', 'ненавиджу', 'злюся', 'розчарований'
      ],
      // Підтримка в чаті
      chatSupport: [
        'хтось є', 'є хто', 'хто онлайн', 'чого так тихо', 'мертвий чат',
        'де всі', 'чат спить', 'оживіть чат', 'хочеться поговорити',
        'нудно', 'скучно', 'давайте поговоримо', 'розважте мене'
      ],
      // Привітання та прощання
      greetings: [
        'всім привіт', 'привіт усім', 'доброго ранку всім', 'доброї ночі всім',
        'добрий день усім', 'hello everyone', 'hi all', 'good morning all',
        'всім спокійної ночі', 'до побачення всім', 'піду спати'
      ]
    };

    // Check emotional triggers
    for (const [category, triggers] of Object.entries(emotionalTriggers)) {
      for (const trigger of triggers) {
        if (text.includes(trigger)) {
          return {
            shouldEngage: true,
            confidence: 0.85,
            reasoning: `Emotional trigger detected (${category}): "${trigger}"`
          };
        }
      }
    }

    // Patterns that indicate user wants interaction
    const interactionPatterns = [
      /^хто .+ \?/, // "хто тут?", "хто онлайн?"
      /що .+ думаєте/, // "що ви думаєте"
      /ваша думка/, // "ваша думка"
      /як вам/, // "як вам це"
      /\?.{0,5}$/, // Questions ending with ?
      /!{2,}/, // Multiple exclamation marks
    ];

    for (const pattern of interactionPatterns) {
      if (pattern.test(text)) {
        return {
          shouldEngage: true,
          confidence: 0.7,
          reasoning: `Interaction pattern detected: ${pattern}`
        };
      }
    }

    // Check for excessive caps or emoji (high emotion)
    const capsRatio = (text.match(/[А-ЯA-Z]/g) || []).length / text.length;
    const emojiCount = (text.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu) || []).length;
    
    if (capsRatio > 0.5 && text.length > 5) {
      return {
        shouldEngage: true,
        confidence: 0.75,
        reasoning: `High caps ratio (${(capsRatio * 100).toFixed(1)}%) indicates strong emotion`
      };
    }

    if (emojiCount >= 3) {
      return {
        shouldEngage: true,
        confidence: 0.7,
        reasoning: `Multiple emojis (${emojiCount}) indicate emotional expression`
      };
    }

    // Check message length - very short might be reaction, very long might need support
    if (text.length <= 3 && /^[ха-я]+$/.test(text)) {
      return {
        shouldEngage: false,
        confidence: 0.8,
        reasoning: 'Very short message, likely not needing response'
      };
    }

    if (text.length > 200 && !context.mentionsBot) {
      return {
        shouldEngage: true,
        confidence: 0.6,
        reasoning: 'Long message might benefit from supportive reaction'
      };
    }

    // Default: don't engage on ordinary messages
    return {
      shouldEngage: false,
      confidence: 0.9,
      reasoning: 'Ordinary message without emotional triggers or direct appeals'
    };
  }

  // Cleanup
  public dispose(): void {
    if (this.engagementCheckInterval) {
      clearInterval(this.engagementCheckInterval);
    }
    this.atmosphereEnhancer.dispose();
    this.chatEngagementCallbacks.clear();
  }
} 