import TelegramBot, { User } from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import http from 'http';
import { getReaction, getReply } from './usecases/handleMessage';

// Load environment variables
dotenv.config();

const token = process.env.BOT_TOKEN;
const port = process.env.PORT || 3000;

if (!token) {
  console.error('CRITICAL: BOT_TOKEN is not set in environment variables. Application will exit.');
  process.exit(1);
}

// Enable polling
const bot = new TelegramBot(token, { polling: true });
console.log('Telegram bot started with polling...');

// Get bot username for mention detection
let botUsername = '';
bot.getMe().then((me: User) => {
  botUsername = me.username || '';
  if (botUsername) {
    console.log(`Bot username: @${botUsername}`);
  } else {
    console.warn('Could not retrieve bot username. Mention functionality might be affected.');
  }
}).catch(err => {
  console.error('Failed to get bot info:', err);
});

// Listen for all messages in group chats
bot.on('message', (msg) => {
  if (!msg.text || !msg.chat || msg.chat.type === 'private') return;

  // React with emoji to every message
  const reaction = getReaction(msg.text);
  bot.sendMessage(msg.chat.id, reaction, {
    reply_to_message_id: msg.message_id,
    allow_sending_without_reply: true,
  }).catch(err => console.error('Error sending reaction:', err));

  // If bot is mentioned, reply
  if (botUsername && msg.text.toLowerCase().includes(`@${botUsername.toLowerCase()}`)) {
    const reply = getReply(msg.text);
    bot.sendMessage(msg.chat.id, reply, {
      reply_to_message_id: msg.message_id,
      allow_sending_without_reply: true,
    }).catch(err => console.error('Error sending reply:', err));
  }
});

// Create a simple HTTP server for health checks
const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(port, () => {
  console.log(`Server listening on port ${port} for health checks`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server and bot.');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
});

console.log('Application setup complete. Bot is running.'); 