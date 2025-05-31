import TelegramBot, { User } from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import http from 'http';
import { EnhancedMessageHandler, EnhancedMessageContext } from './usecases/enhancedMessageHandler';

// Load environment variables first
dotenv.config();

// Get environment variables
const token = process.env.BOT_TOKEN;
const port = process.env.PORT || 3000;

console.log('=== TELEGRAM BOT STARTING ===');
console.log(`Port: ${port}`);
console.log(`BOT_TOKEN present: ${!!token}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

// Create HTTP server FIRST (Railway needs this immediately)
const server = http.createServer((req, res) => {
  const url = req.url || '';
  console.log(`HTTP Request: ${req.method} ${url}`);
  
  if (req.method === 'GET' && (url === '/health' || url === '/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      bot_active: !!botInstance,
      bot_username: botUsername || 'not_retrieved',
      retry_count: retryCount
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Start server immediately
let botInstance: TelegramBot | null = null;
let botUsername = '';
let retryCount = 0;
let maxRetries = 3;
let isRetrying = false;
let messageHandler: EnhancedMessageHandler;

server.listen(port, () => {
  console.log(`✅ HTTP server listening on port ${port}`);
  console.log('✅ Health check endpoint available at /health');
  
  // Wait longer before starting bot to ensure any previous instances are fully shut down
  console.log('⏳ Waiting 10 seconds before initializing bot to avoid polling conflicts...');
  setTimeout(() => {
    initializeBot();
  }, 10000);
});

server.on('error', (err) => {
  console.error('❌ HTTP server error:', err);
  process.exit(1);
});

function initializeBot() {
  try {
    console.log('🤖 Initializing Telegram bot...');
    
    if (!token) {
      console.error('❌ BOT_TOKEN environment variable is not set');
      console.log('⚠️ Bot will not start, but health check server remains active');
      return;
    }

    // Initialize the enhanced message handler with all features
    messageHandler = new EnhancedMessageHandler();
    console.log('🧠 Enhanced message handler initialized with NLP, content detection, and meme generation');

    // Create bot instance with simple polling
    botInstance = new TelegramBot(token, { 
      polling: {
        interval: 2000,  // Slower polling to be gentler
        autoStart: false // Don't auto-start, we'll start manually
      }
    });

    // Set up error handlers
    botInstance.on('error', (error) => {
      console.error('❌ Bot error:', error.message);
      // Don't exit on bot errors, just log them
    });

    botInstance.on('polling_error', (error) => {
      console.error('❌ Polling error:', error.message);
      
      // If it's a conflict error and we haven't reached max retries
      if ((error.message.includes('409') || error.message.includes('Conflict')) && !isRetrying) {
        console.log(`🔄 Polling conflict detected (attempt ${retryCount + 1}/${maxRetries})`);
        
        if (retryCount < maxRetries) {
          isRetrying = true;
          retryCount++;
          const backoffDelay = Math.min(30000 * retryCount, 120000); // 30s, 60s, 90s, max 120s
          console.log(`⏳ Will retry in ${backoffDelay/1000} seconds...`);
          
          setTimeout(() => {
            restartPollingWithBackoff();
          }, backoffDelay);
        } else {
          console.error(`❌ Max retries (${maxRetries}) reached. Giving up on bot polling.`);
          console.log('⚠️ Health check server will continue running.');
        }
      }
    });

    // Get bot info first
    console.log('📡 Getting bot information...');
    botInstance.getMe().then((me: User) => {
      botUsername = me.username || '';
      console.log(`✅ Bot info retrieved: @${botUsername} (${me.first_name})`);
      
      // Set up message handler
      botInstance!.on('message', handleMessage);
      
      // Start polling after getting bot info
      console.log('🚀 Starting bot polling...');
      return botInstance!.startPolling();
    }).then(() => {
      console.log('✅ Bot polling started successfully');
      console.log('🎉 Telegram bot is now running!');
      retryCount = 0; // Reset retry count on success
      isRetrying = false;
    }).catch((error) => {
      console.error('❌ Error during bot initialization:', error.message);
      if ((error.message.includes('409') || error.message.includes('Conflict')) && retryCount < maxRetries) {
        console.log('🔄 Will retry initialization in 30 seconds...');
        retryCount++;
        setTimeout(() => {
          initializeBot();
        }, 30000);
      } else {
        console.error('❌ Bot initialization failed permanently');
      }
    });

  } catch (error) {
    console.error('❌ Failed to initialize bot:', error);
    // Don't exit - keep the health check server running
  }
}

function restartPollingWithBackoff() {
  if (!botInstance) {
    isRetrying = false;
    return;
  }
  
  try {
    console.log('🛑 Stopping current polling...');
    botInstance.stopPolling();
    
    // Wait longer before restarting
    setTimeout(() => {
      console.log('🚀 Attempting to restart polling...');
      botInstance!.startPolling().then(() => {
        console.log('✅ Polling restarted successfully');
        retryCount = 0; // Reset on success
        isRetrying = false;
      }).catch((error) => {
        console.error('❌ Failed to restart polling:', error.message);
        isRetrying = false; // Allow the polling_error handler to try again
      });
    }, 5000); // 5 second wait between stop and start
  } catch (error) {
    console.error('❌ Error during polling restart:', error);
    isRetrying = false;
  }
}

async function handleMessage(msg: any) {
  try {
    if (!msg.text || !msg.chat || msg.chat.type === 'private' || !botInstance || !messageHandler) {
      return;
    }

    console.log(`📨 Message from ${msg.chat.title || msg.chat.id}: ${msg.text.substring(0, 50)}...`);

    // Create enhanced message context
    const context: EnhancedMessageContext = {
      text: msg.text,
      userId: msg.from?.id?.toString() || 'unknown',
      chatId: msg.chat.id.toString(),
      userName: msg.from?.username || msg.from?.first_name || 'Unknown',
      chatType: msg.chat.type as 'private' | 'group' | 'supergroup' | 'channel',
      isGroupChat: msg.chat.type !== 'private',
      messageId: msg.message_id,
      isReplyToBot: msg.reply_to_message?.from?.username === botUsername,
      mentionsBot: botUsername ? msg.text.toLowerCase().includes(`@${botUsername.toLowerCase()}`) : false,
      isDirectMention: botUsername ? msg.text.toLowerCase().includes(`@${botUsername.toLowerCase()}`) : false,
      requestsMeme: msg.text.toLowerCase().includes('meme'),
      memeRequest: msg.text.toLowerCase().includes('meme') ? msg.text : undefined
    };

    // Use the enhanced message handler
    const response = await messageHandler.handleMessage(context);

    // Handle different response types
    if (response.responseType === 'meme' && response.memeResponse) {
      console.log(`🎭 Sending meme: ${response.memeResponse.attribution}`);
      if (response.memeResponse.type === 'image' && response.memeResponse.content instanceof Buffer) {
        await botInstance.sendPhoto(msg.chat.id, response.memeResponse.content, {
          caption: response.reply || 'Here\'s your meme! 🎭',
          reply_to_message_id: msg.message_id,
        }).catch(err => {
          console.error('❌ Error sending meme image:', err.message);
        });
      } else if (response.memeResponse.type === 'url') {
        await botInstance.sendMessage(msg.chat.id, `${response.reply}\n${response.memeResponse.content}`, {
          reply_to_message_id: msg.message_id,
        }).catch(err => {
          console.error('❌ Error sending meme URL:', err.message);
        });
      } else if (response.memeResponse.type === 'text') {
        await botInstance.sendMessage(msg.chat.id, `${response.memeResponse.content}`, {
          reply_to_message_id: msg.message_id,
        }).catch(err => {
          console.error('❌ Error sending text meme:', err.message);
        });
      }
    } else {
      // Емоджі реакції більше не надсилаються як повідомлення
      // Бот тепер тільки відповідає текстом коли це дійсно потрібно
      if (response.shouldReact && response.reaction) {
        console.log(`🎯 Reaction detected: ${response.reaction} (confidence: ${(response.confidence * 100).toFixed(1)}%) - но не надсилаємо як повідомлення`);
        // Просто логуємо реакцію, але не надсилаємо її
      }

      // Send reply if recommended
      if (response.shouldReply && response.reply) {
        console.log(`💬 Sending reply: ${response.reply.substring(0, 50)}... (confidence: ${(response.confidence * 100).toFixed(1)}%)`);
        await botInstance.sendMessage(msg.chat.id, response.reply, {
          reply_to_message_id: msg.message_id,
          allow_sending_without_reply: true,
        }).catch(err => {
          console.error('❌ Error sending reply:', err.message);
        });
      }
    }

    // Register atmosphere engagement callback if it's a group chat
    if (msg.chat.type !== 'private') {
      messageHandler.registerChatEngagementCallback(msg.chat.id.toString(), async (action) => {
        console.log(`🎯 Atmosphere engagement: ${action.type} - ${action.content}`);
        if (action.type === 'poll' && action.pollOptions) {
          await botInstance!.sendPoll(msg.chat.id, action.content, action.pollOptions, {
            is_anonymous: false,
          }).catch(err => {
            console.error('❌ Error sending poll:', err.message);
          });
        } else {
          await botInstance!.sendMessage(msg.chat.id, action.content).catch(err => {
            console.error('❌ Error sending atmosphere message:', err.message);
          });
        }
      });
    }

    // Log the decision reasoning
    console.log(`🧠 Bot decision (${response.responseType}): ${response.reasoning}`);

  } catch (error) {
    console.error('❌ Error handling message:', error);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📡 SIGTERM received - shutting down gracefully...');
  
  if (botInstance) {
    console.log('🛑 Stopping bot polling...');
    try {
      botInstance.stopPolling();
    } catch (error) {
      console.error('⚠️ Error stopping bot:', error);
    }
  }
  
  server.close(() => {
    console.log('🛑 HTTP server closed');
    process.exit(0);
  });
  
  // Force exit after 15 seconds (longer to allow proper cleanup)
  setTimeout(() => {
    console.error('⏰ Force shutdown after timeout');
    process.exit(1);
  }, 15000);
});

process.on('SIGINT', () => {
  console.log('📡 SIGINT received - shutting down gracefully...');
  process.emit('SIGTERM' as any);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  // Don't exit immediately - let health checks continue
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit immediately - let health checks continue
});

console.log('🎯 Application setup complete - waiting for server to start...'); 