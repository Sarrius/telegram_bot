# 🤖 Telegram Emoji Reaction Bot

> A fun and interactive Telegram bot that automatically reacts to group messages with emojis and responds when mentioned!

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app/)

## ✨ Features

🎯 **Smart Reactions**: Automatically reacts to messages with contextual emojis  
💬 **Mention Responses**: Replies with witty messages when mentioned  
⚡ **Zero Database**: Lightweight, in-memory only  
🎨 **Fully Customizable**: Easy emoji and response configuration  
🚀 **Cloud Ready**: Deploy to Railway, Vercel, or any Node.js platform  
🛡️ **Robust**: Handles conflicts and restarts gracefully  

## 🎬 Demo

When someone types "pizza" → Bot reacts with 🍕  
When someone mentions "@yourbot hello" → Bot replies with a friendly message  

## 🚀 Quick Start

### Step 1: Create Your Bot

1. **Open Telegram** and search for [@BotFather](https://t.me/BotFather)
2. **Start a chat** and send `/newbot`
3. **Choose a name** for your bot (e.g., "My Emoji Bot")
4. **Choose a username** (must end with 'bot', e.g., "my_emoji_bot")
5. **Copy the token** - you'll need this! 📋

### Step 2: Set Up Locally

```bash
# Clone the repository
git clone https://github.com/Sarrius/telegram_bot.git
cd telegram_bot

# Install dependencies
npm install

# Create environment file
echo "BOT_TOKEN=YOUR_BOT_TOKEN_HERE" > .env

# Build the project
npm run build

# Start the bot
npm start
```

### Step 3: Add Bot to Group

1. **Create or open** a Telegram group
2. **Add your bot** as a member
3. **Test it** by typing "hello" or mentioning "@yourbotname"

## 🎨 Customization

### Emoji Reactions

Edit `src/config/emoji.config.ts` to customize reactions:

```typescript
export const emojiReactions: Record<string, string[]> = {
  // Greetings
  hello: ['👋', '😊', '🤗'],
  hi: ['👋', '😄'],
  
  // Food
  pizza: ['🍕', '😋', '🤤'],
  coffee: ['☕', '😍'],
  
  // Emotions
  love: ['❤️', '💕', '🥰'],
  sad: ['😢', '🫂', '💙'],
  
  // Default fallback
  default: ['👍', '😊', '✨']
};
```

### Reply Messages

```typescript
export const mentionReplies: Record<string, string[]> = {
  hello: ['Hey there! 👋', 'Hello! How are you?', 'Hi! Great to see you!'],
  help: ['I can react to your messages with emojis! Just type normally.'],
  default: ['You called? 😊', 'Yes?', 'Hello! 👋']
};
```

## 🌐 Deploy to Railway

### Option 1: One-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template-id)

### Option 2: Manual Deploy

1. **Fork this repository** on GitHub
2. **Create account** on [Railway.app](https://railway.app)
3. **Connect GitHub** and select your forked repo
4. **Add environment variable**:
   - Key: `BOT_TOKEN`
   - Value: Your bot token from BotFather
5. **Deploy** - Railway will automatically build and run your bot!

## 🛠️ Development

```bash
# Run in development mode (auto-reload)
npm run dev

# Build TypeScript
npm run build

# Watch for changes
npm run watch

# Start production
npm start
```

## 📁 Project Structure

```
telegram_bot/
├── src/
│   ├── config/
│   │   └── emoji.config.ts     # 🎨 Emoji & reply configuration
│   ├── domain/
│   │   └── messageAnalyzer.ts  # 🧠 Message analysis logic
│   ├── usecases/
│   │   └── handleMessage.ts    # 💬 Message handling
│   └── index.ts                # 🚀 Main application entry
├── dist/                       # 📦 Compiled JavaScript
├── package.json               # 📋 Dependencies & scripts
├── tsconfig.json              # ⚙️ TypeScript configuration
└── README.md                  # 📖 This file
```

## 🐛 Troubleshooting

### Common Issues

**🔴 "409 Conflict" Error**
- **Cause**: Another instance of your bot is running
- **Solution**: The bot automatically handles this with retry logic. Wait 30 seconds.

**🔴 Bot doesn't respond**
- **Cause**: Missing `BOT_TOKEN` or bot not added to group
- **Solution**: Check environment variables and ensure bot is a group member

**🔴 "SIGTERM" on deployment**
- **Cause**: Platform couldn't bind to port
- **Solution**: Bot includes health check server - should work automatically

### Getting Help

1. **Check the logs** - they're very detailed with emoji indicators
2. **Verify bot token** - make sure it's correctly set
3. **Test locally first** - run `npm run dev` to debug

## 📊 Monitoring

The bot includes a health check endpoint:

```
GET /health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2025-05-30T20:30:00.000Z",
  "uptime": 3600,
  "bot_active": true,
  "bot_username": "your_bot_name"
}
```

## 🔧 Advanced Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BOT_TOKEN` | Your Telegram bot token | **Required** |
| `PORT` | HTTP server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |

### Custom Message Analysis

Edit `src/domain/messageAnalyzer.ts` to change how messages are categorized:

```typescript
export function analyzeMessage(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Add your custom logic here
  if (lowerText.includes('urgent')) return 'urgent';
  if (lowerText.includes('party')) return 'party';
  
  // Default categories...
}
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

## 📜 License

This project is open source. Feel free to use and modify!

## 🎉 Credits

Built with:
- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api) - Telegram Bot API wrapper
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Railway](https://railway.app/) - Deployment platform

---

**Made with ❤️ for the Telegram community**

Having issues? [Open an issue](https://github.com/Sarrius/telegram_bot/issues) or [start a discussion](https://github.com/Sarrius/telegram_bot/discussions)! 