# Telegram Emoji Reaction Bot

A lightweight Telegram bot that reacts to group messages with emojis and replies when mentioned.

## Features
- Reacts to messages with emojis (random or keyword-based)
- Replies when mentioned (e.g., `@mybot hello`)
- No database, only in-memory
- Easy config for emojis and replies

## Quick Start

### 1. Get a Bot Token
- Talk to [@BotFather](https://t.me/BotFather) on Telegram
- Create a new bot and copy the token

### 2. Local Setup & Run

#### a) Clone the repository
```
git clone https://github.com/Sarrius/telegram_bot.git
cd telegram_bot
```

#### b) Create a `.env` file in the project root
```
BOT_TOKEN=your_botfather_token_here
```

#### c) Install dependencies
```
npm install
```

#### d) Build the project
```
npm run build
```

#### e) Start the bot
```
npm start
```

Or for development (auto-reload):
```
npm run dev
```

### 3. Push Your Changes
```
git add .
git commit -m "your message"
git push
```

### 4. Customize Emoji & Replies
- Edit `src/config/emoji.config.ts` to add your own words and emoji/replies.
- Example:
  ```ts
  export const emojiReactions: Record<string, string[]> = {
    hello: ['👋', '😊'],
    pizza: ['🍕', '😋'],
    // ...
    default: ['👍']
  };
  ```
- Changes take effect after restarting the bot.

### 5. Deploy (Optional)
See instructions for Railway, Replit, Deta, or Fly.io below.

---

**Enjoy your emoji bot!** 