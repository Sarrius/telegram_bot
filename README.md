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

### 2. Deploy (Choose One)

#### Railway
- [Create a Railway account](https://railway.app/)
- Click "New Project" → "Deploy from GitHub" or upload your code
- Add `BOT_TOKEN` as a variable in the Railway dashboard
- Set Start Command: `npm run build && npm start`

#### Replit
- [Create a Replit account](https://replit.com/)
- Import this repo or create a new Node.js repl
- Add `.env` file with `BOT_TOKEN=...`
- Run `npm install`, then `npm run dev` or use the "Run" button

#### Deta (Node.js Micro)
- [Create a Deta account](https://deta.space/)
- Use the Node.js runtime, upload your code
- Set `BOT_TOKEN` in environment variables
- Set Start Command: `npm run build && npm start`

#### Fly.io
- [Install Fly CLI](https://fly.io/docs/hands-on/install-flyctl/)
- Run `fly launch` and follow prompts
- Set `BOT_TOKEN` with `fly secrets set BOT_TOKEN=...`
- Deploy with `fly deploy`

### 3. Invite Bot to Group
- Add your bot to a Telegram group
- Grant permission to read messages

### 4. Config
- Edit `src/config/emoji.config.ts` to change emojis and replies

---

**Enjoy your emoji bot!** 