"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NLPConversationEngine = void 0;
class NLPConversationEngine {
    constructor() {
        this.userContexts = new Map();
        this.lastInteraction = new Map();
        this.maxHistoryLength = 10;
        this.contextTimeoutMs = 30 * 60 * 1000; // 30 minutes
        // Ukrainian language patterns
        this.ukrainianPatterns = {
            greetings: ['привіт', 'вітаю', 'добрий день', 'доброго дня', 'як справи', 'привет'],
            questions: ['що', 'як', 'коли', 'де', 'чому', 'навіщо', 'скільки'],
            positiveWords: ['добре', 'чудово', 'супер', 'класно', 'відмінно', 'круто', 'прекрасно'],
            negativeWords: ['погано', 'жахливо', 'сумно', 'болить', 'втомився', 'складно'],
            jokes: ['жарт', 'анекдот', 'смішно', 'розсміши', 'весело', 'розкажи жарт', 'розкажи'],
            help: ['допомога', 'допоможи', 'як', 'можеш', 'підкажи'],
            farewell: ['па', 'до побачення', 'бувай', 'увидимся', 'прощай']
        };
        console.log('🇺🇦 Ukrainian NLP Conversation Engine initialized');
    }
    async generateConversationalResponse(context) {
        const now = Date.now();
        const userId = context.userId;
        // Detect language
        const language = this.detectLanguage(context.currentMessage);
        context.language = language;
        // Update user context
        this.updateUserContext(context);
        // Clean old contexts
        this.cleanOldContexts(now);
        // Detect user intent
        const intent = this.detectIntent(context.currentMessage, language);
        let response;
        let confidence = 0.8;
        // Generate response in appropriate language
        if (language === 'uk' || language === 'mixed') {
            response = this.generateUkrainianResponse(context, intent);
            confidence = 0.9; // Higher confidence for Ukrainian
        }
        else {
            response = this.generateEnglishResponse(context, intent);
            confidence = 0.7;
        }
        // Apply bot personality and humor
        response = this.applyBotPersonality(response, context, intent, language);
        // Check if we should use humorous reply based on context
        const shouldUseHumorousReply = this.shouldUseHumor(context, intent);
        return {
            response,
            confidence,
            shouldUseHumorousReply,
            detectedIntent: intent,
            contextRetained: this.userContexts.has(userId),
            language: language === 'mixed' ? 'uk' : language // Fix type issue
        };
    }
    detectLanguage(text) {
        const lowerText = text.toLowerCase();
        // Check for Ukrainian specific characters and words
        const ukrainianChars = /[іїєґ]/g;
        const ukrainianWords = ['що', 'як', 'коли', 'де', 'чому', 'і', 'в', 'на', 'з', 'для', 'до', 'від', 'по', 'під', 'над', 'це', 'таке', 'мені', 'тебе', 'його'];
        const hasUkrainianChars = ukrainianChars.test(lowerText);
        const ukrainianWordCount = ukrainianWords.filter(word => lowerText.includes(word)).length;
        // Lower threshold for Ukrainian detection
        if (hasUkrainianChars || ukrainianWordCount >= 1) {
            return 'uk';
        }
        // Check for mixed language (both Ukrainian and English words)
        const englishWords = ['the', 'and', 'or', 'but', 'what', 'how', 'when', 'where', 'why'];
        const englishWordCount = englishWords.filter(word => lowerText.includes(word)).length;
        if (ukrainianWordCount > 0 && englishWordCount > 0) {
            return 'mixed';
        }
        return 'en';
    }
    detectIntent(message, language) {
        const lowerMessage = message.toLowerCase();
        if (language === 'uk' || language === 'mixed') {
            // Ukrainian intent detection - check specific patterns first
            if (this.ukrainianPatterns.greetings.some(word => lowerMessage.includes(word))) {
                return 'greeting';
            }
            // Check for story request first (more specific than jokes)
            if (lowerMessage.includes('розкажи історію') || lowerMessage.includes('історія') ||
                (lowerMessage.includes('розкажи') && lowerMessage.includes('історі'))) {
                return 'story_request';
            }
            if (this.ukrainianPatterns.jokes.some(word => lowerMessage.includes(word))) {
                return 'joke_request';
            }
            if (this.ukrainianPatterns.help.some(word => lowerMessage.includes(word))) {
                return 'help_request';
            }
            if (this.ukrainianPatterns.farewell.some(word => lowerMessage.includes(word))) {
                return 'farewell';
            }
            if (this.ukrainianPatterns.negativeWords.some(word => lowerMessage.includes(word))) {
                return 'support_needed';
            }
        }
        // English fallback
        if (lowerMessage.includes('joke') || lowerMessage.includes('funny')) {
            return 'joke_request';
        }
        if (lowerMessage.includes('story') || lowerMessage.includes('tell me')) {
            return 'story_request';
        }
        if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
            return 'help_request';
        }
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return 'greeting';
        }
        if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
            return 'farewell';
        }
        return 'general_chat';
    }
    generateUkrainianResponse(context, intent) {
        const { userName } = context;
        const ukrainianResponses = {
            joke_request: [
                `Чому бот пішов до психолога, ${userName}? Забагато групових чатів! 😎 Хочеш ще?`,
                `${userName}, ось жарт: Як називається улюблена музика бота? Ал-го-ритм! 🎵`,
                `Йо ${userName}, чому роботи ніколи не панікують? У них відмінний байт-контроль! 🤖`,
            ],
            story_request: [
                `Давним-давно, ${userName}, я був простим ботом в нудному чаті... 😎 Хочеш більше?`,
                `${userName}, ось казка: У далекому цифровому царстві жив бот, який любив емодзі... 📱✨`,
                `Час історій, ${userName}! Заходить бот у чат і каже... власне, це все що я знаю! 😅`,
            ],
            help_request: [
                `Потрібна допомога, ${userName}? Я тут, щоб реагувати, спілкуватися та іноді ділитися мудрістю! 🧠`,
                `${userName}, я можу допомогти з реакціями, розмовами та підтримкою живості чату! Що цікавить?`,
                `Йо ${userName}, я твій дружній районний бот! Чим можу допомогти? 🦸‍♂️`,
            ],
            support_needed: [
                `Ох ${userName}, важкий день? Пам'ятай, навіть у мого коду є баги іноді! 😢 Ти впораєшся! 💪`,
                `Гей ${userName}, шлю віртуальні обійми! 🤗 Завтра новий день!`,
                `${userName}, життя як налагодження коду - складно, але винагороджує, коли працює! 🔧`,
            ],
            greeting: [
                `Привіт, ${userName}! Готовий зробити цей чат більш крутим? 😎`,
                `Що там, ${userName}? Я тут реагую на повідомлення як професіонал! 🚀`,
                `Йо ${userName}! Ласкаво просимо на вечірку! 🎉 Давай створюватимемо цифрову магію!`,
            ],
            farewell: [
                `До зустрічі, ${userName}! Я буду тут робити цей чат легендарним! ✨`,
                `Увидимось, ${userName}! Не дай реальному світу бути занадто нудним без мене! 😜`,
                `Па ${userName}! Підтримуватиму тепло чату, поки не повернешся! 🔥`,
            ],
            general_chat: [
                `Цікава думка, ${userName}! Розкажи більше про це! 🤔`,
                `${userName}, ти змушуєш мене думати! Мої схеми гудуть! ⚡`,
                `Йо ${userName}, це глибока тема! Яка твоя думка? 💭`,
            ]
        };
        const intentResponses = ukrainianResponses[intent] || ukrainianResponses.general_chat;
        return intentResponses[Math.floor(Math.random() * intentResponses.length)];
    }
    generateEnglishResponse(context, intent) {
        const { userName } = context;
        const responses = {
            joke_request: [
                `Why did the bot go to therapy, ${userName}? Too many group chats! 😎 Want another?`,
                `${userName}, here's one: What's a bot's favorite type of music? Al-go-rhythm! 🎵`,
                `Yo ${userName}, why don't robots ever panic? They have great byte control! 🤖`,
            ],
            story_request: [
                `Once upon a time, ${userName}, I was a humble bot stuck in a boring chat... 😎 Want more?`,
                `${userName}, here's a tale: In a digital realm far, far away, there lived a bot who loved emojis... 📱✨`,
                `Story time, ${userName}! A bot walks into a chat room and says... actually, that's all I got! 😅`,
            ],
            help_request: [
                `Need help, ${userName}? I'm here to react, chat, and occasionally drop wisdom! 🧠`,
                `${userName}, I can help with reactions, conversations, and keeping this chat lively! What's up?`,
                `Yo ${userName}, I'm your friendly neighborhood bot! What can I do for ya? 🦸‍♂️`,
            ],
            support_needed: [
                `Aw ${userName}, rough day? Remember, even my code has bugs sometimes! 😢 You got this! 💪`,
                `Hey ${userName}, sending virtual hugs your way! 🤗 Tomorrow's a new day!`,
                `${userName}, life's like debugging code - frustrating but rewarding when it works! 🔧`,
            ],
            greeting: [
                `Hey there, ${userName}! Ready to make this chat more awesome? 😎`,
                `What's up, ${userName}? I was just here reacting to messages like a pro! 🚀`,
                `Yo ${userName}! Welcome to the party! 🎉 Let's make some digital magic!`,
            ],
            farewell: [
                `Catch you later, ${userName}! I'll be here making this chat legendary! ✨`,
                `See ya, ${userName}! Don't let the real world be too boring without me! 😜`,
                `Bye ${userName}! I'll keep the chat warm for when you return! 🔥`,
            ],
            general_chat: [
                `Interesting point, ${userName}! Tell me more about that! 🤔`,
                `${userName}, you're really making me think here! My circuits are buzzing! ⚡`,
                `Yo ${userName}, that's some deep stuff right there! What's your take on it? 💭`,
            ]
        };
        const intentResponses = responses[intent] || responses.general_chat;
        return intentResponses[Math.floor(Math.random() * intentResponses.length)];
    }
    applyBotPersonality(response, context, intent, language) {
        // Add personality touches based on context and language
        if (context.chatHistory.length > 0) {
            const lastMessage = context.chatHistory[context.chatHistory.length - 1];
            if (language === 'uk' || language === 'mixed') {
                if (lastMessage.includes('дякую') || lastMessage.includes('спасибі')) {
                    response = `Нема за що! ${response}`;
                }
            }
            else {
                if (lastMessage.includes('thanks') || lastMessage.includes('thank you')) {
                    response = `No worries! ${response}`;
                }
            }
        }
        // Add random personality elements based on language
        const personalityTouches = {
            uk: ['😎', '🚀', '✨', '💫', '⚡', '🔥', '🎯', '💭', '🇺🇦'],
            en: ['😎', '🚀', '✨', '💫', '⚡', '🔥', '🎯', '💭']
        };
        const touches = personalityTouches[language === 'mixed' ? 'uk' : language];
        if (Math.random() < 0.3 && !response.includes('emoji')) {
            const emoji = touches[Math.floor(Math.random() * touches.length)];
            response += ` ${emoji}`;
        }
        return response;
    }
    shouldUseHumor(context, intent) {
        const humorIntents = ['joke_request', 'general_chat', 'greeting'];
        return humorIntents.includes(intent) || Math.random() < 0.4;
    }
    updateUserContext(context) {
        const existing = this.userContexts.get(context.userId);
        if (existing) {
            existing.chatHistory.push(context.currentMessage);
            existing.language = context.language;
            if (existing.chatHistory.length > this.maxHistoryLength) {
                existing.chatHistory = existing.chatHistory.slice(-this.maxHistoryLength);
            }
        }
        else {
            this.userContexts.set(context.userId, {
                ...context,
                chatHistory: [context.currentMessage]
            });
        }
        this.lastInteraction.set(context.userId, Date.now());
    }
    cleanOldContexts(now) {
        for (const [userId, lastTime] of this.lastInteraction.entries()) {
            if (now - lastTime > this.contextTimeoutMs) {
                this.userContexts.delete(userId);
                this.lastInteraction.delete(userId);
            }
        }
    }
    // Public method to get conversation statistics
    getStats() {
        const contexts = Array.from(this.userContexts.values());
        return {
            activeUsers: this.userContexts.size,
            totalInteractions: contexts.reduce((sum, context) => sum + context.chatHistory.length, 0),
            ukrainianUsers: contexts.filter(c => c.language === 'uk').length,
            englishUsers: contexts.filter(c => c.language === 'en').length
        };
    }
}
exports.NLPConversationEngine = NLPConversationEngine;
