import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { getReaction, getReply } from './usecases/handleMessage';

// Load environment variables
dotenv.config();

const token = process.env.BOT_TOKEN;
if (!token) {
  throw new Error('BOT_TOKEN is not set in environment variables');
}

// Enable polling
const bot = new TelegramBot(token, { polling: true });

// Get bot username for mention detection
type BotInfo = { username: string };
let botUsername = '';
bot.getMe().then((me: BotInfo) => {
  botUsername = me.username;
});

// Listen for all messages in group chats
bot.on('message', (msg) => {
  if (!msg.text || !msg.chat || msg.chat.type === 'private') return;

  // React with emoji to every message
  const reaction = getReaction(msg.text);
  bot.sendMessage(msg.chat.id, reaction, {
    reply_to_message_id: msg.message_id,
    allow_sending_without_reply: true,
  });

  // If bot is mentioned, reply
  if (botUsername && msg.text.toLowerCase().includes(`@${botUsername.toLowerCase()}`)) {
    const reply = getReply(msg.text);
    bot.sendMessage(msg.chat.id, reply, {
      reply_to_message_id: msg.message_id,
      allow_sending_without_reply: true,
    });
  }
}); 