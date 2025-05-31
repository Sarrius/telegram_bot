# 🇺🇦 Ukrainian Telegram Bot with Advanced AI Features

An intelligent Ukrainian Telegram bot with sentiment analysis, NLP conversation capabilities, content moderation, and atmosphere enhancement. Built with TypeScript and designed specifically for Ukrainian language communities with English fallback support.

## 🆕 Latest Improvements (Version 2.1)

### 🎯 Enhanced Bot Capabilities Response
- **50+ Ukrainian trigger variations** - "що ти можеш", "які фічі", "допомога", "шо можеш"
- **25+ English trigger variations** - "what can you do", "capabilities", "help", "whatcha got"  
- **Detailed instruction format** - Shows exactly how to use each feature
- **Smart decision explanation** - Bot explains when and why it responds
- **Improved categorization** - Features grouped logically with clear examples

### 🧠 Smarter Emotional Engagement Logic
**Bot WILL respond to:**
- ✅ **Direct mentions** - @bot or replies to bot messages
- ✅ **Strong emotional triggers** - Help requests, very strong emotions, urgent chat support needs
- ✅ **Interactive patterns** - Direct questions with "?", multiple "!!!" 
- ✅ **High emotion indicators** - CAPS text (>50%), 3+ emojis, extreme expressions
- ✅ **Group greetings** - "всім привіт", "hello everyone"
- ✅ **Capability requests** - "що ти можеш", "what can you do"

**Bot WON'T spam on:**
- ❌ **Ordinary messages** - Regular daily conversations
- ❌ **Short reactions** - 1-3 character responses  
- ❌ **Technical discussions** - Without emotional content
- ❌ **Private conversations** - Between users
- ❌ **Mild emotions** - Weak positive/negative expressions
- ❌ **Emoji reactions** - No longer sends emoji as messages

### 🔧 Technical Improvements
- **Priority processing system** - Content → Capabilities → Emotions → Base reactions
- **Enhanced regex patterns** - Better Unicode emoji detection
- **Detailed logging** - Every decision includes reasoning
- **Conservative reaction thresholds** - Higher quality, less spam
- **No emoji spam** - Bot no longer sends emoji as messages, only meaningful text responses
- **Updated test coverage** - 100% total coverage, all tests passing

## 🎯 Complete Feature Overview

### 🤖 **Bot Capabilities Display**
- **Smart help system** - responds to capability questions in Ukrainian/English
- **Comprehensive feature list** - displays all bot functions with examples
- **Auto-detection** - recognizes questions about bot abilities
- **Multi-language support** - responds in user's preferred language

**Capability Request Examples:**
```
# Formal Ukrainian requests
Що ти можеш?                    # What can you do?
Які твої функції?               # What are your functions?
Покажи команди                  # Show commands
Розкажи про себе               # Tell me about yourself

# Informal Ukrainian variants  
Шо можеш?                      # Slang "what can you do"
Які фічі?                      # What features
Що по функціям?                # What about functions
Покажи скілзи                  # Show skills

# English requests
What can you do?               # Direct capability question
What are your capabilities?    # Formal capability request
Show me what you got           # Informal capability request
What's your deal?              # Casual capability question

# Help requests
Допомога                       # Help (Ukrainian)
Help                          # Help (English)
Інструкція                    # Instructions
Manual                        # Manual
```

### 🗣️ **Natural Language Processing (NLP) Conversation Engine**
- **Ukrainian-first conversations** with intelligent intent detection
- **Smart context management** - remembers conversation history across chats
- **Multilingual support** - Ukrainian primary, English fallback
- **Intent recognition**: greetings, jokes, help requests, stories, support, farewell
- **Personality-driven responses** with appropriate humor and emojis
- **Real-time user profiling** and adaptive conversation styles

**Bot Interaction Examples:**
```
@bot Привіт! Як справи?          # Direct mention conversations
Розкажи щось цікаве             # Tell me something interesting
Розкажи жарт                    # Joke requests
Допоможи мені                   # Help requests
Розкажи історію                 # Story requests
```

### 🛡️ **Inappropriate Content Detection & Moderation**
- **Ukrainian and English content analysis** with cultural context
- **Multi-level severity assessment** (low, medium, high)
- **Sarcastic Ukrainian responses** to inappropriate content
- **Progressive penalty system** with warning tracking
- **Pattern detection**: ALL CAPS, excessive punctuation, suspicious URLs
- **Admin controls** and custom forbidden word lists
- **Real-time feedback system** for content accuracy

**Detection Categories:**
- Offensive language (Ukrainian: дурень, ідіот / English: stupid, idiot)
- Toxic behavior (Ukrainian: йди помри / English: go die)
- Discriminatory content (Ukrainian: расист / English: racist)
- Spam patterns (натисни тут, купи зараз)
- Custom forbidden words

### 🔴 **Advanced Profanity Filter & Moderation**
- **Comprehensive profanity detection** for Ukrainian and Russian languages
- **161 profanity words** in vocabulary (89 Ukrainian + 72 Russian)
- **Severity-based responses** (warning → moderate → strict)
- **Smart language detection** with mixed-language support
- **Chat type restrictions** (groups enabled, private disabled by default)
- **Configurable moderation levels** with custom response templates
- **132 response templates** for varied, natural reactions
- **Root word matching** for detecting variations and derivatives

**Profanity Response System:**
- **Warning Level** (mild): "🤦‍♂️ Давай без нецензурщини, добре?"
- **Moderate Level**: "⚠️ Останній шанс, припини токсити!"
- **Strict Level** (severe): "🤬 Думаєш, можна так гавкати? Здохнеш за це!"

**Features:**
- **Custom word management** - add/remove profanity words dynamically
- **Obfuscation detection** - handles symbols and number substitutions (п1зда, му@ак)
- **Latin-Cyrillic detection** - catches transliteration attempts (xuynya)
- **Confidence scoring** - 80-100% accuracy with detailed reasoning
- **Statistics tracking** - comprehensive moderation analytics

### 🎭 **Chat Atmosphere Enhancement**
- **Ukrainian user role assignment** based on behavior patterns
- **Smart engagement triggers** during quiet periods (configurable threshold)
- **Topic tracking** from Ukrainian conversations (їжа, музика, фільми, робота)
- **Mood analysis** and atmosphere scoring (positive, negative, neutral)
- **Automatic engagement** with Ukrainian jokes, facts, and games
- **Community building** through role recognition and encouragement

**User Roles (Ukrainian):**
- 🎭 **Мем Лорд** - Posts funny content (triggers: лол, смішно, 😂)
- ⚡ **Енерджайзер** - Brings energy to conversations (triggers: круто, вау)
- 🧠 **Чат Мудрець** - Provides wise insights (triggers: думаю, вважаю)
- 🎯 **Стартер Тем** - Initiates discussions (triggers: що думаєте, питання)
- 🎮 **Гейм Майстер** - Gaming enthusiast (triggers: гра, геймер)
- 🍽️ **Фуді Дослідник** - Food lover (triggers: їжа, ресторан)
- 🏃 **Фітнес Мотиватор** - Health and fitness (triggers: спорт, тренування)
- 🎵 **Музичний Гуру** - Music expert (triggers: музика, пісня)
- 💻 **Тех Гуру** - Technology expert (triggers: код, програма)

### 🎨 **Advanced Meme Generation**
- **Ukrainian text-based memes** with cultural references
- **Smart meme suggestions** based on conversation context (10% random chance)
- **Multiple meme templates** for programming, life, food, work, Ukrainian culture
- **Trending Ukrainian memes** generation
- **Command-based meme creation**: `/meme топ текст | низ текст`
- **Contextual meme detection** for keywords
- **Imgflip API integration** with graceful text fallback

**Meme Categories & Examples:**
```
Programming: "Коли твій код працює з першого разу"
Life: "Коли п'ятниця нарешті настала"
Food: "Коли мама готує борщ"
Work: "Коли понеділок знову настав"
Ukrainian: "Коли хтось каже 'на українській'"
```

**Meme Triggers:**
- Keywords: `мем`, `meme`, `смішно`, `код не працює`, `кава`, `понеділок`
- Commands: `/meme топ|низ`, `створи мем про...`, `make meme about...`
- Context: Flag emoji 🇺🇦, Ukrainian food (борщ, вареники), confusion expressions

### 📋 **Interactive Help System**
- **Capability detection** - automatically recognizes help requests
- **Context-aware responses** - shows relevant features based on current conversation
- **Multiple language support** - displays help in Ukrainian or English
- **Comprehensive feature overview** - lists all available bot functions with examples

**Help Request Examples:**
```
Що ти можеш робити?             # What can you do?
Покажи всі команди              # Show all commands  
What are your features?         # English help request
Твої можливості                 # Your capabilities
Розкажи про себе               # Tell me about yourself
```

### ⚡ **"Потужно" Power Words Detection**
- **Advanced word recognition** - detects "потужно" synonyms with 80%+ accuracy
- **Typo tolerance** - handles spelling mistakes and variations (потыжно, могутный, супир)
- **Category classification** - power, strength, energy, intensity with different intensities
- **Smart emoji reactions** - category-specific emojis (⚡💪🚀🔥) based on word type
- **Motivational responses** - generates encouraging Ukrainian messages (30% chance)
- **Fuzzy matching** - uses Levenshtein distance for spelling error tolerance

**Detected Power Words:**
```
Power: потужно, могутній, супер, мега, ультра, топ
Strength: сильний, міцний, дужий  
Energy: енергійний, динамічний, вогняний, блискавичний
Intensity: крутий, класний, офігенний, бомбезний, неймовірний
```

**Example Reactions:**
```
"Потужно працюю!" → ⚡ + "ПОТУЖНО! Відчуваю енергію!"
"Супер результат!" → ⚡ + "Так тримати! супер - це про нас!"
"Могутній успіх!" → 💪 + "Ця сила неперебориста!"
```

### 🎯 **Enhanced Sentiment-Based Reactions**
- **Deep emotional analysis** with Ukrainian cultural understanding
- **Smart reaction selection** based on message intensity and clarity
- **Learning system** that adapts to user preferences through feedback
- **Cooldown management** to prevent reaction spam (configurable per chat)
- **Multi-language sentiment detection** with fuzzy typo tolerance
- **Confidence scoring** for reaction appropriateness

## 🌟 Ukrainian Language Features

### 🇺🇦 Primary Ukrainian Support
- **Native Ukrainian Language Processing**: Advanced Ukrainian language detection and response generation
- **Ukrainian Sentiment Analysis**: Understands Ukrainian emotional expressions and cultural context
- **Ukrainian Meme Generation**: Creates culturally relevant Ukrainian memes and text-based humor
- **Ukrainian Content Moderation**: Detects inappropriate content in Ukrainian with contextual responses
- **Cultural Awareness**: Recognizes Ukrainian cultural references, holidays, and expressions

### 🗣️ Conversational AI in Ukrainian
- **Natural Ukrainian Conversations**: Responds naturally in Ukrainian with proper grammar and cultural context
- **Ukrainian Humor and Jokes**: Large collection of Ukrainian jokes, puns, and cultural humor
- **Ukrainian Role Assignment**: Assigns chat roles in Ukrainian (Мем Лорд, Чат Мудрець, Енерджайзер, etc.)
- **Ukrainian Fun Facts**: Shares interesting facts translated and culturally adapted for Ukrainian audiences

## 🚀 Core Features

### 🧠 Advanced NLP & Conversation
- **Intelligent Conversations**: Context-aware responses in Ukrainian and English
- **Intent Detection**: Recognizes user intentions in both languages
- **Conversation History**: Maintains chat context for better responses
- **Multilingual Support**: Primarily Ukrainian with English fallback

### 😊 Sentiment-Based Reactions
- **Ukrainian Emotional Analysis**: Detects emotions in Ukrainian text with high accuracy
- **Contextual Reactions**: Responds appropriately to positive, negative, and neutral messages
- **Cultural Sensitivity**: Understands Ukrainian emotional expressions and cultural nuances
- **Emoji Reactions**: Uses appropriate emojis for Ukrainian context

### 🛡️ Content Moderation
- **Ukrainian Content Detection**: Advanced detection of inappropriate content in Ukrainian
- **Sarcastic Responses**: Humorous Ukrainian responses to inappropriate content
- **Penalty System**: Configurable warning and penalty system
- **Cultural Context**: Understands Ukrainian slang and colloquialisms

### 🎭 Meme Generation
- **Ukrainian Meme Templates**: Large collection of Ukrainian meme formats
- **Text-Based Memes**: Creates funny Ukrainian text memes when images aren't available
- **Cultural Memes**: Ukrainian-specific humor and cultural references
- **Imgflip Integration**: Optional image meme generation with Ukrainian text

### 🌟 Atmosphere Enhancement
- **Chat Engagement**: Automatically engages users during quiet periods in Ukrainian
- **User Roles**: Assigns fun Ukrainian role names based on user behavior
- **Interactive Polls**: Creates engaging polls in Ukrainian
- **Community Building**: Encourages positive Ukrainian community interaction

## 🔧 Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd telegram_bot

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 🧪 **Testing & Quality Assurance**

This project maintains **100% test coverage** as a mandatory requirement. All features, classes, and logic are comprehensively tested.

#### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode (for development)
npm run test:watch

# Run specific test file
npm test -- atmosphereEnhancer.test.ts
```

#### Test Coverage Requirements

- **100% statement coverage** - Every line of code must be tested
- **100% branch coverage** - Every conditional path must be tested  
- **100% function coverage** - Every function must be tested
- **Edge case testing** - Handle malformed inputs, concurrent operations, errors

#### Test Structure

```
tests/
├── config/             # Configuration and utility tests
├── domain/             # Core business logic tests
│   ├── nlpConversation.test.ts
│   ├── inappropriateContentDetector.test.ts
│   ├── atmosphereEnhancer.test.ts
│   ├── memeGenerator.test.ts
│   └── ...
├── usecases/           # Use case and handler tests
├── integration/        # Integration and workflow tests
└── ...
```

#### Development Workflow

```bash
# 1. Write/modify code
# 2. Write/update tests
# 3. Ensure 100% coverage
npm run test:coverage

# 4. All tests must pass
npm test

# 5. Commit only after successful tests
git add .
git commit -m "feat: add new feature with 100% test coverage"
```

#### Mandatory Testing Rules

1. **Every new feature** must have comprehensive tests
2. **Every class method** must be tested with multiple scenarios
3. **Every error condition** must be tested
4. **Every edge case** must be handled and tested
5. **Ukrainian and English** functionality must both be tested
6. **Concurrent operations** must be tested for thread safety

### Environment Configuration

Create a `.env` file with:

```env
# Required
BOT_TOKEN=your_telegram_bot_token_here

# Optional - for enhanced meme generation
IMGFLIP_USERNAME=your_imgflip_username
IMGFLIP_PASSWORD=your_imgflip_password

# Language Configuration (default is Ukrainian)
PRIMARY_LANGUAGE=uk

# Port for deployment
PORT=3000
```

### Running the Bot

```bash
# Development mode with hot reload
npm run dev

# Production build and start
npm run build
npm start

# Production mode with PM2 (recommended)
npm install -g pm2
npm run build
pm2 start dist/index.js --name telegram-bot
```

## 🇺🇦 Configuration & Customization

### Language Configuration

The bot is configured for Ukrainian as the primary language by default. You can customize all language settings:

```typescript
// Complete configuration options
const config = {
  // Content moderation settings
  contentConfig: {
    primaryLanguage: 'uk',           // 'uk' | 'en'
    sensitivityLevel: 'medium',      // 'low' | 'medium' | 'high'
    enableSarcasm: true,             // Ukrainian sarcastic responses
    enablePenalties: true,           // Progressive penalty system
    customForbiddenWords: [],        // Additional banned words
    adminUserIds: ['admin1']         // Admin user IDs
  },
  
  // Atmosphere enhancement settings
  atmosphereConfig: {
    primaryLanguage: 'uk',           // 'uk' | 'en'
    quietPeriodThresholdMs: 600000,  // 10 minutes before engagement
    enableAutomaticEngagement: true, // Auto-engage during quiet periods
    enableRoleAssignment: true,      // Assign Ukrainian user roles
    enablePolls: true,               // Interactive polls
    enableFunFacts: true,            // Ukrainian fun facts
    maxEngagementPerHour: 3          // Rate limiting
  }
};
```

### Feature Toggle Configuration

```typescript
// Enable/disable specific features
const features = {
  nlpConversations: true,      // Intelligent conversations
  contentModeration: true,     // Inappropriate content detection
  atmosphereEnhancement: true, // Chat engagement and roles
  memeGeneration: true,        // Meme creation and suggestions
  sentimentReactions: true     // Emoji reactions to messages
};
```

### Advanced Bot Configuration

```bash
# Enhanced environment variables
BOT_TOKEN=your_telegram_bot_token_here
PRIMARY_LANGUAGE=uk
CONTENT_SENSITIVITY=medium
ENABLE_SARCASM=true
ENABLE_PENALTIES=true
QUIET_PERIOD_MINUTES=10
MAX_ENGAGEMENT_PER_HOUR=3
ENABLE_AUTO_ENGAGEMENT=true
ENABLE_ROLE_ASSIGNMENT=true

# Optional Imgflip integration
IMGFLIP_USERNAME=your_imgflip_username
IMGFLIP_PASSWORD=your_imgflip_password

# Deployment settings
PORT=3000
NODE_ENV=production
```

## 📝 Bot Commands & Usage

### 🗣️ **Conversation Commands**

```bash
# Direct conversations (Ukrainian primary)
@bot Привіт! Як справи?           # General greeting
@bot Розкажи щось цікаве          # Request interesting content
@bot Допоможи мені з питанням     # Ask for help
@bot Розкажи жарт                 # Request a joke
@bot Розкажи історію              # Request a story

# English fallback support
@bot Hello! How are you?          # English greeting
@bot Tell me something interesting # English content request
@bot Help me with something       # English help request
```

### 🎨 **Meme Generation Commands**

```bash
# Command-based meme creation
/meme Коли твій код працює | Але ти не знаєш чому
/meme When your code works | But you don't know why

# Natural language meme requests
Створи мем про код                # Create programming meme
Зроби мем про понеділок          # Create Monday meme
Make a meme about coffee         # English meme request

# Contextual triggers (automatic suggestions)
Мій код не працює 😫             # May trigger coding meme
Потрібна кава!                   # May trigger coffee meme  
🇺🇦 Слава Україні!              # May trigger Ukraine meme
```

### 🛡️ **Moderation Features**

```bash
# Admin commands (for configured admin users)
/reset_warnings @username        # Reset user warnings
/add_forbidden word1 word2       # Add custom forbidden words
/sensitivity high|medium|low     # Adjust sensitivity
/stats                          # Show moderation statistics

# User feedback on moderation
👍 Good detection                # Positive feedback  
👎 False positive               # Negative feedback
```

### 🎭 **Atmosphere & Role Commands**

```bash
# Role information
/my_role                        # Show your chat role
/roles                          # Show all chat roles
/chat_stats                     # Show chat atmosphere stats

# Engagement triggers
/engage                         # Manually trigger engagement
/joke                          # Request Ukrainian joke
/fact                          # Request Ukrainian fun fact
/poll Питання?;Варіант1;Варіант2 # Create poll
```

## 📖 Usage Examples

### 🇺🇦 Ukrainian Conversations
```
User: Привіт! Як справи?
Bot: Привіт! Готовий зробити цей чат більш крутим? 😎

User: Розкажи жарт
Bot: Чому вчені не довіряють атомам? Бо вони все вигадують! ⚛️

User: Допоможи мені
Bot: Потрібна допомога? Я тут, щоб реагувати, спілкуватися та іноді ділитися мудрістю! 🧠

User: Розкажи щось цікаве про Україну
Bot: Знаєте, що Україна має найбільшу територію в Європі? 🇺🇦 Це справді неймовірна країна!
```

### 🎨 Meme Generation
```
User: Створи мем про код
Bot: 📝 Коли твій код працює з першого разу:
     Але ти не знаєш чому 🤖
     
     🎭 Створено українським мем-генератором

User: /meme Понеділок знову | Чому так швидко?
Bot: 📝 Понеділок знову:
     Чому так швидко?
     
     🎭 Створено українським мем-генератором
```

### 🛡️ Content Moderation
```
User: [inappropriate content in Ukrainian]
Bot: Гей @username, здається твоя клавіатура зламалась! 😤 
     Спробуй якісь приємніші слова!
     
     📝 Завдання для роздумів: Напиши 3 позитивні слова українською.

User: [toxic content]
Bot: @username, давай тримати наш чат позитивним! 🌟
     Можеш перефразувати це більш дружньо?
```

### 🎭 Atmosphere & Roles  
```
Bot: 🎭 @username отримав роль "Мем Лорд"! 
     Характеристики: постить смішний контент, розважає спільноту

User: лол 😂 дуже смішно
Bot: 👑 Мем Лорд @username знову вражає! Зібрано: 5 смішинок

[During quiet period]
Bot: 🎯 Час для цікавого факту! 
     Знаете, що слово "мавпа" українською походить від арабського? 🐒
```

## 🚀 **Quick Start**

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Set up environment variables** (see DEPLOYMENT.md)
4. **Run tests**: `npm test` (417 tests, 91.86% coverage)
5. **Start the bot**: `npm start`

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 💬 **How to Use**

Simply add the bot to your Telegram group and start interacting:

```
@bot Що ти можеш?              # See all capabilities
@bot Привіт! Як справи?        # Start a conversation
Розкажи жарт                   # Request a joke
/meme топ текст | низ текст    # Create a meme
```

The bot automatically detects Ukrainian and responds appropriately!

## 🚀 Deployment

### Quick Deploy Options

#### Vercel (Recommended)
```bash
npm i -g vercel
vercel --prod
```

#### Render
Push to main branch with the included `render.yaml` configuration.

#### Railway
```bash
npm i -g @railway/cli
railway login
railway init
railway variables set BOT_TOKEN=your_token
railway up
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 📊 Features Status

- ✅ Ukrainian Language Processing
- ✅ Sentiment Analysis (Ukrainian + English)
- ✅ NLP Conversations (Ukrainian primary)
- ✅ Content Moderation (Ukrainian + English)
- ✅ Atmosphere Enhancement (Ukrainian + English)
- ✅ Meme Generation (Ukrainian + English)
- ✅ User Role Assignment (Ukrainian names)
- ✅ Text-based Memes (Ukrainian focus)
- ✅ Deployment Ready (Multiple platforms)

## 🤝 Contributing

Contributions are welcome! Please focus on:

1. **Ukrainian Language Improvements**: Better Ukrainian language processing
2. **Cultural Content**: More Ukrainian cultural references and humor
3. **Regional Support**: Support for regional Ukrainian dialects
4. **Documentation**: Ukrainian language documentation

## 📄 License

MIT License - Feel free to use this bot for your Ukrainian communities!

## 🙏 Acknowledgments

- Built for the Ukrainian community
- Supports Ukrainian language and culture
- Designed to bring Ukrainian speakers together
- Слава Україні! 🇺🇦

---

**Made with ❤️ for the Ukrainian community** 