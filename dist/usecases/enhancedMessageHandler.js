"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedMessageHandler = void 0;
const handleMessage_1 = require("./handleMessage");
const nlpConversation_1 = require("../domain/nlpConversation");
const inappropriateContentDetector_1 = require("../domain/inappropriateContentDetector");
const atmosphereEnhancer_1 = require("../domain/atmosphereEnhancer");
const memeGenerator_1 = require("../domain/memeGenerator");
const messageAnalyzer_1 = require("../domain/messageAnalyzer");
class EnhancedMessageHandler {
    constructor(contentConfig, atmosphereConfig) {
        this.engagementCheckInterval = null;
        this.chatEngagementCallbacks = new Map();
        this.baseHandler = new handleMessage_1.MessageHandler();
        this.nlpEngine = new nlpConversation_1.NLPConversationEngine();
        this.contentDetector = new inappropriateContentDetector_1.InappropriateContentDetector({
            primaryLanguage: 'uk', // Default to Ukrainian
            ...contentConfig
        });
        this.atmosphereEnhancer = new atmosphereEnhancer_1.AtmosphereEnhancer({
            primaryLanguage: 'uk', // Default to Ukrainian
            ...atmosphereConfig
        });
        this.memeGenerator = new memeGenerator_1.MemeGenerator();
        console.log('🇺🇦 Enhanced Ukrainian Telegram Bot Handler initialized');
        // Start periodic atmosphere engagement checks
        this.startAtmosphereMonitoring();
    }
    async handleMessage(context) {
        const startTime = Date.now();
        console.log(`🚀 Enhanced processing: "${context.text?.substring(0, 50)}..." from ${context.userName}`);
        try {
            // Step 1: Check for inappropriate content first (highest priority)
            const contentAnalysis = await this.contentDetector.analyzeContent(context.text, context.userId, context.userName || 'Unknown');
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
            this.atmosphereEnhancer.updateChatActivity(context.chatId, context.userId, context.userName || 'Unknown', context.text, sentiment);
            // Step 2.1: Always update NLP statistics for tracking purposes
            const nlpContext = {
                userId: context.userId,
                userName: context.userName || 'Unknown',
                chatHistory: [],
                currentMessage: context.text,
                chatTopic: this.extractChatTopic(context.text)
            };
            // Generate response to update user statistics (we may not use the response)
            await this.nlpEngine.generateConversationalResponse(nlpContext);
            // Step 3: Check for direct conversation requests
            if (this.isDirectConversationRequest(context)) {
                const conversationResponse = await this.handleConversation(context);
                if (conversationResponse) {
                    return conversationResponse;
                }
            }
            // Step 4: Check for meme requests
            if (this.isMemeRequest(context)) {
                const memeResponse = await this.handleMemeRequest(context);
                if (memeResponse) {
                    return memeResponse;
                }
            }
            // Step 5: Use base handler for normal sentiment reactions
            const baseResponse = await this.baseHandler.handleMessage(context);
            // Step 6: Enhance with meme suggestions if appropriate
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
            // Step 7: Return enhanced base response
            const processingTime = Date.now() - startTime;
            console.log(`✅ Enhanced processing completed in ${processingTime}ms`);
            return {
                ...baseResponse,
                responseType: baseResponse.shouldReact ? 'reaction' : (baseResponse.shouldReply ? 'reply' : 'none')
            };
        }
        catch (error) {
            console.error('❌ Error in enhanced message handling:', error);
            return {
                ...this.createBaseResponse(),
                confidence: 0,
                reasoning: 'Error in enhanced processing, falling back to safe response',
                responseType: 'none'
            };
        }
    }
    async handleConversation(context) {
        try {
            const conversationContext = {
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
        }
        catch (error) {
            console.error('❌ Error in conversation handling:', error);
            return null;
        }
    }
    async handleMemeRequest(context) {
        try {
            let memeResult;
            if (context.memeRequest) {
                // Specific meme request
                const memeRequest = this.parseMemeRequest(context.memeRequest);
                memeResult = await this.memeGenerator.generateMeme(memeRequest);
            }
            else {
                // Suggest meme based on message content
                const suggestedMeme = this.memeGenerator.suggestMemeForMessage(context.text);
                if (suggestedMeme) {
                    memeResult = await this.memeGenerator.generateMeme(suggestedMeme);
                }
                else {
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
                        content: memeResult.imageUrl || memeResult.text,
                        attribution: memeResult.attribution
                    },
                    responseType: 'meme'
                };
            }
        }
        catch (error) {
            console.error('❌ Error in meme generation:', error);
        }
        return null;
    }
    async tryGenerateContextualMeme(text) {
        try {
            const suggested = this.memeGenerator.suggestMemeForMessage(text);
            if (suggested) {
                const result = await this.memeGenerator.generateMeme(suggested);
                if (result.success) {
                    return {
                        type: result.imageUrl ? 'url' : 'text',
                        content: result.imageUrl || result.text,
                        attribution: result.attribution
                    };
                }
            }
        }
        catch (error) {
            console.error('❌ Error generating contextual meme:', error);
        }
        return null;
    }
    // Atmosphere enhancement methods
    registerChatEngagementCallback(chatId, callback) {
        this.chatEngagementCallbacks.set(chatId, callback);
    }
    startAtmosphereMonitoring() {
        // Check for engagement opportunities every 5 minutes
        this.engagementCheckInterval = setInterval(async () => {
            await this.checkForEngagementOpportunities();
        }, 5 * 60 * 1000);
    }
    async checkForEngagementOpportunities() {
        for (const [chatId, callback] of this.chatEngagementCallbacks.entries()) {
            try {
                const action = await this.atmosphereEnhancer.generateEngagementAction(chatId);
                if (action) {
                    console.log(`🎯 Atmosphere engagement for chat ${chatId}: ${action.type}`);
                    callback(action);
                }
            }
            catch (error) {
                console.error(`❌ Error checking engagement for chat ${chatId}:`, error);
            }
        }
    }
    // Utility methods
    isDirectConversationRequest(context) {
        return !!(context.isDirectMention ||
            context.mentionsBot ||
            context.isReplyToBot ||
            context.text.toLowerCase().includes('@bot') ||
            context.text.startsWith('/chat') ||
            (context.text.toLowerCase().includes('tell me') && context.text.length > 15));
    }
    isMemeRequest(context) {
        const lowerText = context.text.toLowerCase();
        return !!(context.requestsMeme ||
            lowerText.includes('meme') ||
            lowerText.includes('make a meme') ||
            lowerText.includes('generate meme') ||
            lowerText.startsWith('/meme'));
    }
    parseMemeRequest(request) {
        // Simple parsing - could be enhanced with NLP
        const parts = request.split('|').map(p => p.trim());
        return {
            topText: parts[0] || request,
            bottomText: parts[1] || undefined
        };
    }
    extractSentiment(text) {
        const analysis = (0, messageAnalyzer_1.analyzeMessage)(text);
        if (analysis.includes('positive') || analysis.includes('excitement') || analysis.includes('overly_positive')) {
            return 'positive';
        }
        if (analysis.includes('negative') || analysis.includes('aggressive')) {
            return 'negative';
        }
        return 'neutral';
    }
    extractChatTopic(text) {
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
    createBaseResponse() {
        return {
            shouldReact: false,
            shouldReply: false,
            confidence: 0,
            reasoning: '',
            responseType: 'none'
        };
    }
    // Configuration methods
    updateContentConfiguration(config) {
        this.contentDetector.updateConfiguration(config);
    }
    updateAtmosphereConfiguration(config) {
        this.atmosphereEnhancer.updateConfig(config);
    }
    // Statistics and monitoring
    getEnhancedStats() {
        return {
            base: this.baseHandler.getStats(),
            nlp: this.nlpEngine.getStats(),
            content: this.contentDetector.getStats(),
            atmosphere: {
                activeChatCallbacks: this.chatEngagementCallbacks.size
            },
            memes: {
                availableTemplates: this.memeGenerator.getAvailableTemplates().length
            }
        };
    }
    getChatAtmosphereStats(chatId) {
        const chatStats = this.atmosphereEnhancer.getChatStats(chatId);
        const userRoles = this.atmosphereEnhancer.getAllUserRoles()
            .filter(role => role.userId.startsWith(chatId)); // Assuming userId contains chatId
        return {
            chatActivity: chatStats,
            userRoles: userRoles,
            engagementCallbackRegistered: this.chatEngagementCallbacks.has(chatId)
        };
    }
    getUserRole(userId) {
        return this.atmosphereEnhancer.getUserRole(userId);
    }
    // Admin methods
    async recordContentFeedback(userId, messageId, isAppropriate) {
        // Could be enhanced to train the inappropriate content detector
        console.log(`📝 Content feedback: User ${userId}, Message ${messageId}, Appropriate: ${isAppropriate}`);
    }
    resetUserWarnings(userId) {
        this.contentDetector.resetUserWarnings(userId);
    }
    addCustomForbiddenWords(words) {
        this.contentDetector.addCustomForbiddenWords(words);
    }
    // Cleanup
    dispose() {
        if (this.engagementCheckInterval) {
            clearInterval(this.engagementCheckInterval);
        }
        this.atmosphereEnhancer.dispose();
        this.chatEngagementCallbacks.clear();
    }
}
exports.EnhancedMessageHandler = EnhancedMessageHandler;
