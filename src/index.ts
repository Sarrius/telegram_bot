import TelegramBot, { User } from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import http from 'http';
import { getReaction, getReply } from './usecases/handleMessage';

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
      bot_username: botUsername || 'not_retrieved'
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Start server immediately
let botInstance: TelegramBot | null = null;
let botUsername = '';

server.listen(port, () => {
  console.log(`✅ HTTP server listening on port ${port}`);
  console.log('✅ Health check endpoint available at /health');
  
  // Wait a bit before starting bot to avoid conflicts with previous instances
  console.log('⏳ Waiting 3 seconds before initializing bot to avoid polling conflicts...');
  setTimeout(() => {
    initializeBot();
  }, 3000);
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

    // Create bot instance with simple polling (like the original)
    botInstance = new TelegramBot(token, { 
      polling: {
        interval: 1000,  // Slightly slower polling
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
      
      // If it's a conflict error, try to restart after a delay
      if (error.message.includes('409') || error.message.includes('Conflict')) {
        console.log('🔄 Polling conflict detected. Attempting to restart polling in 10 seconds...');
        setTimeout(() => {
          restartPolling();
        }, 10000);
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
    }).catch((error) => {
      console.error('❌ Error during bot initialization:', error.message);
      if (error.message.includes('409') || error.message.includes('Conflict')) {
        console.log('🔄 Will retry initialization in 15 seconds...');
        setTimeout(() => {
          initializeBot();
        }, 15000);
      }
    });

  } catch (error) {
    console.error('❌ Failed to initialize bot:', error);
    // Don't exit - keep the health check server running
  }
}

function restartPolling() {
  if (!botInstance) return;
  
  try {
    console.log('🛑 Stopping current polling...');
    botInstance.stopPolling();
    
    setTimeout(() => {
      console.log('🚀 Restarting polling...');
      botInstance!.startPolling().then(() => {
        console.log('✅ Polling restarted successfully');
      }).catch((error) => {
        console.error('❌ Failed to restart polling:', error.message);
        // Try again after another delay
        if (error.message.includes('409') || error.message.includes('Conflict')) {
          console.log('🔄 Will retry in 20 seconds...');
          setTimeout(() => {
            restartPolling();
          }, 20000);
        }
      });
    }, 2000);
  } catch (error) {
    console.error('❌ Error during polling restart:', error);
  }
}

function handleMessage(msg: any) {
  try {
    if (!msg.text || !msg.chat || msg.chat.type === 'private' || !botInstance) {
      return;
    }

    console.log(`📨 Message from ${msg.chat.title || msg.chat.id}: ${msg.text.substring(0, 50)}...`);

    // React with emoji to every message
    const reaction = getReaction(msg.text);
    botInstance.sendMessage(msg.chat.id, reaction, {
      reply_to_message_id: msg.message_id,
      allow_sending_without_reply: true,
    }).catch(err => {
      console.error('❌ Error sending reaction:', err.message);
    });

    // If bot is mentioned, reply
    if (botUsername && msg.text.toLowerCase().includes(`@${botUsername.toLowerCase()}`)) {
      const reply = getReply(msg.text);
      botInstance.sendMessage(msg.chat.id, reply, {
        reply_to_message_id: msg.message_id,
        allow_sending_without_reply: true,
      }).catch(err => {
        console.error('❌ Error sending reply:', err.message);
      });
    }
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
  
  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('⏰ Force shutdown after timeout');
    process.exit(1);
  }, 10000);
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