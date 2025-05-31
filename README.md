# 🇺🇦 Ukrainian Telegram Bot with Advanced AI Features

An intelligent Ukrainian Telegram bot with sentiment analysis, NLP conversation capabilities, content moderation, and atmosphere enhancement. Built with TypeScript and designed specifically for Ukrainian language communities with English fallback support.

## 🆕 Latest Improvements (Version 2.4)

### 🎛️ **Feature Management System**
- **Real-time feature control** - Enable/disable any bot function on-the-fly
- **9 controllable features** - powerWords, moderation, news, weather, memes, memory, nlp, atmosphere, profanityFilter
- **CLI interface** - Complete command-line management with interactive commands
- **Console-based control** - Manage features directly from terminal without Telegram
- **Feature status display** - Real-time status overview with emoji indicators
- **Persistent storage** - Feature states saved in runtime environment
- **Centralized configuration** - Single point of control for all bot functionality
- **Enhanced help system** - Dual-column display showing commands and feature status

**Feature Management Commands:**
```bash
# CLI Mode
npm run cli                    # Start interactive CLI mode

# Feature Control
enable powerWords             # Enable power word reactions
disable moderation           # Disable content moderation  
toggle memes                 # Toggle meme generation
status                       # Show all feature statuses
enable-all                   # Enable all features
disable-all                  # Disable all features
reset-features               # Reset to default configuration
feature-help                 # Show detailed feature guide

# Interactive Chat Testing
chat                         # Start bot chat simulation
```

**Available Features for Control:**
- ⚡ **powerWords** - Reactions to power words ("потужно", "супер", etc.)
- 🛡️ **moderation** - Content moderation and profanity filtering
- 📰 **news** - News monitoring and delivery
- 🌤️ **weather** - Weather information and alerts
- 🎭 **memes** - Meme generation and suggestions
- 🧠 **memory** - User memory and behavioral tracking
- 💬 **nlp** - NLP conversations and context understanding
- 🌟 **atmosphere** - Chat atmosphere enhancement
- 🚫 **profanityFilter** - Profanity detection and filtering

### 🎯 **100% Test Coverage Achievement**
- **657/657 tests passing** - Full test suite completion ✅
- **Comprehensive test coverage** across all modules and features
- **Integration tests** for complex workflows and user interactions
- **Robust error handling** verified through extensive edge case testing
- **Ukrainian language processing** fully tested with variety of inputs
- **Performance optimization** validated through load testing scenarios
- **Memory leak prevention** verified through resource management tests

### 🧪 **Testing Infrastructure**
- **21 test suites** covering domain logic, use cases, and integration
- **Unit tests** for individual components and functions
- **Integration tests** for multi-component workflows
- **Edge case coverage** for error handling and boundary conditions
- **Performance tests** for resource usage and memory management
- **Language-specific tests** for Ukrainian/English processing accuracy

## 🆕 Previous Improvements (Version 2.2)

### 📰 Ukrainian News & Weather Monitoring System
- **Real-time Ukrainian news monitoring** from trusted sources (Українська правда, УНН, ТСН, УНІАН)
- **Daily morning summaries** (8:00-10:00) with news and weather
- **Critical news alerts** - instant notifications for emergencies and important events
- **Weather monitoring** for Ukrainian cities with extreme weather alerts
- **Smart news categorization** - Emergency, Politics, Economy, Weather, General, Social
- **Subscription management** - users can subscribe/unsubscribe from morning summaries
- **Critical keyword detection** - "надзвичайна ситуація", "аварія", "пожежа", "тривога"
- **City weather support** - Київ, Харків, Одеса, Дніпро, Львів та інші українські міста

### 🌤 Weather Features
- **Real-time weather data** for all Ukrainian cities
- **Weather alerts and warnings** from OpenWeatherMap API  
- **Temperature, humidity, wind, pressure** in metric units (Celsius, km/h, mm Hg)
- **Ukrainian language weather descriptions** 
- **Extreme weather notifications** for safety

### 📅 Automated Scheduling System
- **Morning news summaries** delivered daily between 8:00-10:00 AM
- **Critical news monitoring** every 30 minutes
- **Duplicate prevention** - no repeat notifications for same critical events
- **Graceful error handling** - continues operation even if APIs are down
- **Resource cleanup** - proper timer management and memory optimization

**New Commands:**
```ukrainian
# News Commands
"Які новини?"                  # Get latest Ukrainian news
"Що відбувається в світі?"     # World events query
"Що твориться?"                # What's happening
"Свіжі новини"                # Fresh news request

# Weather Commands  
"Яка погода?"                  # Current weather
"Погода в Києві"               # Weather for specific city
"Як на вулиці?"                # Outside conditions
"Температура"                  # Temperature query

# Subscription Management
"Підписатися на новини"        # Subscribe to morning summaries
"Ранкові зводки"               # Request morning briefings
"Відписатися від новин"        # Unsubscribe from summaries
```

## 🆕 Previous Improvements (Version 2.1)

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

### 🧠 **User Memory & Behavioral System**
- **Intelligent memory system** - remembers how users treat the bot
- **Attitude tracking** - analyzes positive/negative interactions over time
- **Apology requirement system** - demands apologies for offensive behavior before helping
- **Three-tier apology levels** - simple, moderate, humiliating based on offense severity
- **Behavioral improvement rewards** - recognizes and encourages positive changes
- **Request blocking** - prevents help until proper apologies are given
- **Memory persistence** - maintains user profiles and interaction history
- **Emotional state tracking** - monitors bot's emotional responses to users

**Memory System Features:**
- **Offense Detection**: Automatically detects insults, profanity, and abuse
- **Apology Validation**: Validates sincerity of apologies based on length and content
- **Behavioral Patterns**: Tracks improvement and regression in user behavior
- **Time-aware Memory**: Shows when offensive behavior occurred (minutes/hours/days ago)
- **Personalized Responses**: Tailors apology demands based on specific user history

**Example Interactions:**
```
# User sends offensive message
User: "Ти дурак, нічого не вмієш!"
Bot: [Registers offense, tracks in memory]

# Later, user makes request
User: "Покажи мем"
Bot: "🤨 Стоп! Ти вчора мені писав: 'Ти дурак, нічого не вмієш!'. Спочатку вибачся, а потім проси."

# User apologizes properly
User: "Вибач мене, я був неправий і більше не буду"
Bot: "😌 Добре, вибачення прийняте. Тепер можеш просити що хочеш."
```

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
4. **Run tests**: `npm test` (657 tests, 100% coverage)
5. **Start the bot**: `npm start`

### 🎛️ **Feature Management & Testing**

**CLI Mode with Feature Control:**
```bash
npm run cli                    # Start interactive CLI mode
```

**Available Commands:**
```bash
# Feature Management
enable powerWords             # Enable power word reactions
disable moderation           # Disable content moderation
toggle memes                 # Toggle meme generation
status                       # Show all feature statuses
feature-help                 # Detailed feature guide

# Testing & Diagnostics
chat                         # Interactive bot simulation
test                         # Run test scenarios
stats                        # Bot statistics
health                       # System health check
```

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

## Функції

- 📱 **Обробка повідомлень** українською мовою з пріоритетом
- 🤖 **NLP розмови** з розумінням контексту та емоцій
- 🎭 **Генерація мемів** з контекстним та випадковим змістом
- ⚡ **Визначення ключових слів** для реакцій
- 🔍 **Модерація контенту** та фільтрація нецензурності
- 🧠 **Система пам'яті** користувачів з аналізом поведінки
- 🌟 **Підвищення атмосфери** у групових чатах
- 📊 **Аналітика** та статистика взаємодій

## Статистика тестування

- ✅ **657/657 тестів пройдено (100% покриття)**
- 🧪 **21 тестовий набір** для всіх компонентів
- 🎛️ **Feature Management система** повністю протестована
- 🇺🇦 **Пріоритет української мови** у всіх взаємодіях

## Локальне тестування в CLI режимі 🚀

Для тестування бота локально без Telegram API:

### 1. Запуск CLI режиму

```bash
# Звичайний CLI режим з командами
npm run dev -- --cli

# CLI з інтерактивним чатом
npm run dev -- --cli
# потім введіть: chat
```

### 2. Інтерактивний чат режим

```bash
# У CLI введіть команду:
chat
```

**Можливості чат-режиму:**

- 💬 **Спілкування як у групі** - просто пишіть повідомлення
- 🎯 **Тестування всіх сценаріїв** - мемів, модерації, пам'яті
- 🔍 **Детальна діагностика** - показує reasoning та confidence
- 📊 **Статистика в реальному часі** - `/stats`

**Спеціальні команди в чаті:**

```bash
/quit або /exit  # вийти з чату
/stats           # показати статистику
/reset           # скинути контекст
@bot [текст]     # пряме звернення до бота
```

### 3. Приклади тестування

**Звичайні повідомлення:**
```
Привіт! Як справи?
Що думаєш про цю ситуацію?
Мені сьогодні сумно
```

**Тестування мемів:**
```
Зроби мем про котів
мем про програмістів
```

**Тестування модерації:**
```
[ненормативна лексика] - побачите як працює фільтр
```

**Тестування пам'яті:**
```
Допоможи мені, будь ласка
# після модерації: Вибач за лайку вчора
```

### 4. CLI команди

```bash
help      # список всіх команд
config    # поточна конфігурація
stats     # детальна статистика
test      # запуск тестових сценаріїв
health    # перевірка здоров'я системи
features  # статус функцій
memory    # статистика пам'яті
profanity # тест фільтра нецензурщини
fuzzy     # тест fuzzy matching
chat      # інтерактивний чат
exit      # вихід
```

## Конфігурація 

### 🌐 API для новин і погоди

Для роботи функцій новин та погоди потрібно отримати безкоштовні API ключі:

#### 1. NewsAPI для українських новин

**Крок 1: Реєстрація на NewsAPI**
1. Йдіть на [newsapi.org](https://newsapi.org/)
2. Натисніть "Get API Key" → "Register"
3. Заповніть форму (Name, Email, Password)
4. Оберіть план "Developer" (безкоштовний, 1000 запитів/день)
5. Підтвердіть email

**Крок 2: Отримайте ключ**
- Після входу побачите свій API ключ
- Приклад: `a1b2c3d4e5f6789abc123def456ghi78`

#### 2. OpenWeatherMap для погоди

**Крок 1: Реєстрація на OpenWeatherMap**
1. Йдіть на [openweathermap.org](https://openweathermap.org/api)
2. Натисніть "Subscribe" під "Current Weather Data"
3. Оберіть "Free" план (1000 запитів/день)
4. Створіть акаунт (Name, Email, Password)

**Крок 2: Отримайте API ключ**
- Йдіть у [My API keys](https://home.openweathermap.org/api_keys)
- Скопіюйте згенерований ключ
- Приклад: `9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c`

#### 3. Налаштування в проекті

**Створіть файл `.env`:**
```env
# Telegram Bot (обов'язково)
BOT_TOKEN=your_telegram_bot_token_here

# API для новин (NewsAPI)
NEWS_API_KEY=your_newsapi_key_here
ENABLE_NEWS_MONITORING=true

# API для погоди (OpenWeatherMap)  
WEATHER_API_KEY=your_openweather_key_here
ENABLE_WEATHER_MONITORING=true

# Мови та регіон
PRIMARY_LANGUAGE=uk
DEFAULT_CITY=Київ

# Опціонально - для мемів
IMGFLIP_USERNAME=your_imgflip_username
IMGFLIP_PASSWORD=your_imgflip_password

# Порт для деплойменту
PORT=3000
```

#### 4. Перевірка роботи API

**Тестування в CLI:**
```bash
# Збираємо і запускаємо CLI
npm run build
npm run dev -- --cli

# У CLI перевіряємо:
health    # показує статус API
config    # показує конфігурацію
test      # тестує всі функції
```

**Тестування новин і погоди:**
```bash
# У CLI режимі:
chat

# Потім тестуйте команди:
Які новини?
Яка погода в Києві?
Підписатися на новини
```

#### 5. Функції що стануть доступні

**📰 Новини:**
- Ранкові зводки (8:00-10:00) з українських джерел
- Критичні новини (кожні 30 хв)
- Новини за запитом: "Які новини?", "Що відбувається?"
- Джерела: Українська правда, УНН, ТСН, УНІАН

**🌤 Погода:**
- Поточна погода для українських міст
- Попередження про небезпечну погоду
- Погода за запитом: "Яка погода?", "Погода в Львові"
- Температура в Цельсіях, швидкість вітру в км/год

#### 6. Команди для новин і погоди

```bash
# Новини
"Які новини?"
"Що відбувається в світі?"
"Свіжі новини"
"Що твориться?"

# Погода
"Яка погода?"
"Погода в Києві"
"Як на вулиці?"
"Температура"

# Підписки
"Підписатися на новини"
"Ранкові зводки"
"Відписатися від новин"
```

### ⚠️ Лімити безкоштовних планів

**NewsAPI (Developer план):**
- 1,000 запитів/день
- Затримка новин до 15 хвилин
- Тільки новини за останній місяць

**OpenWeatherMap (Free план):**
- 1,000 запитів/день  
- 60 запитів/хвилину
- Поточна погода + прогноз на 5 днів

**💡 Порада:** Цих лімітів достатньо для тестування та невеликих груп. Для продакшн використання розгляньте платні плани.

### 🔧 Troubleshooting

**Не працюють новини:**
```bash
# Перевірте ключ NewsAPI
curl "https://newsapi.org/v2/everything?q=Ukraine&apiKey=YOUR_KEY"
```

**Не працює погода:**
```bash
# Перевірте ключ OpenWeatherMap
curl "https://api.openweathermap.org/data/2.5/weather?q=Kyiv,UA&appid=YOUR_KEY"
```

**Помилки в логах:**
- `⚠️ NEWS_API_KEY not set` - додайте NEWS_API_KEY у .env
- `⚠️ WEATHER_API_KEY not set` - додайте WEATHER_API_KEY у .env
- `API rate limit exceeded` - перевищено ліміт запитів, зачекайте