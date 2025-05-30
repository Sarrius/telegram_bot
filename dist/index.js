"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const dotenv_1 = __importDefault(require("dotenv"));
const handleMessage_1 = require("./usecases/handleMessage");
// Load environment variables
dotenv_1.default.config();
const token = process.env.BOT_TOKEN;
if (!token) {
    throw new Error('BOT_TOKEN is not set in environment variables');
}
// Enable polling
const bot = new node_telegram_bot_api_1.default(token, { polling: true });
// Get bot username for mention detection
let botUsername = '';
bot.getMe().then((me) => {
    botUsername = me.username || '';
});
// Listen for all messages in group chats
bot.on('message', (msg) => {
    if (!msg.text || !msg.chat || msg.chat.type === 'private')
        return;
    // React with emoji to every message
    const reaction = (0, handleMessage_1.getReaction)(msg.text);
    bot.sendMessage(msg.chat.id, reaction, {
        reply_to_message_id: msg.message_id,
        allow_sending_without_reply: true,
    });
    // If bot is mentioned, reply
    if (botUsername && msg.text.toLowerCase().includes(`@${botUsername.toLowerCase()}`)) {
        const reply = (0, handleMessage_1.getReply)(msg.text);
        bot.sendMessage(msg.chat.id, reply, {
            reply_to_message_id: msg.message_id,
            allow_sending_without_reply: true,
        });
    }
});
