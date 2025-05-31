# 🧪 Ручні тести для Telegram Bot

Ця директорія містить ручні тестові скрипти для перевірки функціональності бота без Telegram API.

## 📁 Структура файлів

### ⚡ Power Words тести
- `quick_test_power_words.js` - швидкий тест для перевірки реакцій на "потужні" слова
- `test_power_words_reaction_only.js` - детальний тест реакцій без текстових відповідей  
- `test_powerwords.js` - основний тест детектора power words
- `test_chat_powerwords.js` - тест обробки power words у чаті

### 📰 News & Weather тести
- `test_critical_news.js` - тест критичних новин з заголовками та посиланнями
- `test_weather_commands.js` - тест команд погоди для українських міст

### 🛡️ Модерація і поведінка
- `test-moderation.js` - тест системи модерації та фільтрації
- `test-bot-behavior.js` - тест загальної поведінки бота
- `test-memory.js` - тест функціональності пам'яті бота

## 🚀 Як запускати

### Окремі тести:
```bash
# Тест power words
node tests/manual/quick_test_power_words.js

# Тест новин
node tests/manual/test_critical_news.js

# Тест погоди
node tests/manual/test_weather_commands.js

# Тест модерації
node tests/manual/test-moderation.js
```

### Через npm скрипти:
```bash
# Основні TypeScript тести
npm test

# CLI режим для інтерактивного тестування
npm run cli chat
```

## 📝 Примітки

- Всі ручні тести працюють без Telegram API
- Для реальних API (новини/погода) потрібні ключі в .env
- Тести автоматично мокають залежності при потребі
- Результати виводяться у консоль з детальною інформацією

## 🔧 Налаштування

Переконайтеся, що:
1. Проект скомпільований: `npm run build`
2. Є файл .env з API ключами (якщо потрібно)
3. Всі залежності встановлені: `npm install` 