"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsWeatherHandler = void 0;
const newsWeatherMonitor_1 = require("../domain/newsWeatherMonitor");
const newsCommandsFuzzyMatcher_1 = require("../config/vocabulary/newsCommandsFuzzyMatcher");
class NewsWeatherHandler {
    constructor(newsApiKey, weatherApiKey, bot, subscribedChats = []) {
        this.scheduledTasks = new Map();
        this.timers = new Map();
        this.subscribedChats = new Set();
        this.morningHour = 8; // Година ранкових повідомлень
        this.monitoringEnabled = true;
        this.monitor = new newsWeatherMonitor_1.NewsWeatherMonitor(newsApiKey, weatherApiKey);
        this.bot = bot;
        this.subscribedChats = new Set(subscribedChats);
        this.fuzzyMatcher = new newsCommandsFuzzyMatcher_1.NewsCommandsFuzzyMatcher();
        this.initializeScheduler();
    }
    /**
     * Ініціалізує планувальник завдань
     */
    initializeScheduler() {
        // Планувальник ранкових зводок
        this.scheduleMorningSummary();
        // Планувальник моніторингу критичних новин
        this.scheduleCriticalMonitoring();
    }
    /**
     * Планує ранкові зводки
     */
    scheduleMorningSummary() {
        const taskId = 'morning_summary';
        const now = new Date();
        const nextMorning = new Date();
        // Встановлюємо час на ранок (між 8 і 10 годинами)
        const randomHour = this.morningHour + Math.floor(Math.random() * 2); // 8-9 години
        const randomMinute = Math.floor(Math.random() * 60);
        nextMorning.setHours(randomHour, randomMinute, 0, 0);
        // Якщо час вже минув сьогодні, планувати на завтра
        if (nextMorning <= now) {
            nextMorning.setDate(nextMorning.getDate() + 1);
        }
        const task = {
            id: taskId,
            type: 'morning_summary',
            nextRun: nextMorning,
            interval: 24 * 60 * 60 * 1000, // 24 години
            enabled: true
        };
        this.scheduledTasks.set(taskId, task);
        this.scheduleTask(task);
    }
    /**
     * Планує моніторинг критичних новин
     */
    scheduleCriticalMonitoring() {
        const taskId = 'critical_monitoring';
        const now = new Date();
        const nextCheck = new Date(now.getTime() + 30 * 60 * 1000); // Через 30 хвилин
        const task = {
            id: taskId,
            type: 'critical_monitoring',
            nextRun: nextCheck,
            interval: 30 * 60 * 1000, // Кожні 30 хвилин
            enabled: true
        };
        this.scheduledTasks.set(taskId, task);
        this.scheduleTask(task);
    }
    /**
     * Планує виконання завдання
     */
    scheduleTask(task) {
        // Очищаємо попередній таймер якщо є
        const existingTimer = this.timers.get(task.id);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }
        const now = Date.now();
        const delay = task.nextRun.getTime() - now;
        if (delay <= 0) {
            // Виконати негайно якщо час вже минув
            this.executeTask(task);
            return;
        }
        const timer = setTimeout(async () => {
            await this.executeTask(task);
            // Планувати наступне виконання
            if (task.enabled) {
                task.nextRun = new Date(Date.now() + task.interval);
                this.scheduleTask(task);
            }
        }, delay);
        this.timers.set(task.id, timer);
        console.log(`Заплановано завдання ${task.type} на ${task.nextRun.toLocaleString('uk-UA')}`);
    }
    /**
     * Виконує заплановане завдання
     */
    async executeTask(task) {
        try {
            switch (task.type) {
                case 'morning_summary':
                    await this.sendMorningSummary();
                    break;
                case 'critical_monitoring':
                    await this.checkAndSendCriticalNews();
                    break;
            }
        }
        catch (error) {
            console.error(`Помилка виконання завдання ${task.type}:`, error);
        }
    }
    /**
     * Відправляє ранкову зводку всім підписаним чатам
     */
    async sendMorningSummary() {
        if (this.subscribedChats.size === 0) {
            console.log('Немає підписаних чатів для ранкової зводки');
            return;
        }
        const summary = await this.monitor.createMorningSummary();
        for (const chatId of this.subscribedChats) {
            try {
                await this.bot.sendMessage(chatId, summary, {
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true
                });
                console.log(`Ранкова зводка відправлена до чату ${chatId}`);
            }
            catch (error) {
                console.error(`Помилка відправки ранкової зводки до чату ${chatId}:`, error);
            }
        }
    }
    /**
     * Перевіряє та відправляє критичні новини
     */
    async checkAndSendCriticalNews() {
        if (!this.monitoringEnabled || this.subscribedChats.size === 0) {
            return;
        }
        const criticalNews = await this.monitor.checkCriticalNews();
        for (const newsItem of criticalNews) {
            const alertMessage = this.monitor.formatCriticalAlert(newsItem);
            for (const chatId of this.subscribedChats) {
                try {
                    await this.bot.sendMessage(chatId, alertMessage, {
                        parse_mode: 'Markdown',
                        disable_web_page_preview: false
                    });
                    console.log(`Критична новина відправлена до чату ${chatId}: ${newsItem.title}`);
                }
                catch (error) {
                    console.error(`Помилка відправки критичної новини до чату ${chatId}:`, error);
                }
            }
        }
    }
    /**
     * Обробляє команду новин від користувача з толерантністю до помилок
     */
    async handleNewsCommand(chatId, messageText) {
        // Використовуємо fuzzy matching для розпізнавання команд
        const commandMatch = this.fuzzyMatcher.recognizeCommand(messageText);
        if (!commandMatch) {
            return '';
        }
        console.log(`Розпізнано команду: ${commandMatch.type} (впевненість: ${commandMatch.confidence})`);
        try {
            switch (commandMatch.type) {
                case 'news':
                    return await this.getNewsOnDemand();
                case 'weather':
                    const city = commandMatch.city || 'Київ';
                    return await this.getWeatherOnDemand(city);
                case 'subscribe':
                    return this.subscribeToMorningSummary(chatId);
                case 'unsubscribe':
                    return this.unsubscribeFromMorningSummary(chatId);
                default:
                    return '';
            }
        }
        catch (error) {
            console.error(`Помилка обробки команди ${commandMatch.type}:`, error);
            return '❌ Виникла помилка під час обробки запиту. Спробуйте пізніше.';
        }
    }
    /**
     * Отримує новини на вимогу
     */
    async getNewsOnDemand() {
        try {
            const news = await this.monitor.getUkrainianNews(24);
            if (news.length === 0) {
                return '📰 Наразі немає свіжих новин за останню добу.';
            }
            const topNews = news
                .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
                .slice(0, 7);
            let message = `📰 **Останні новини України:**\n\n`;
            topNews.forEach((item, index) => {
                const emoji = this.getSeverityEmoji(item.severity);
                message += `${emoji} **${item.title}**\n`;
                if (item.description) {
                    message += `${item.description.substring(0, 120)}${item.description.length > 120 ? '...' : ''}\n`;
                }
                message += `🔗 [Читати](${item.url})\n\n`;
            });
            message += `🕐 Оновлено: ${new Date().toLocaleString('uk-UA')}`;
            return message;
        }
        catch (error) {
            console.error('Помилка отримання новин на вимогу:', error);
            return '❌ Не вдалося отримати новини. Спробуйте пізніше.';
        }
    }
    /**
     * Отримує погоду на вимогу
     */
    async getWeatherOnDemand(city) {
        try {
            const weather = await this.monitor.getWeatherData(city);
            if (!weather) {
                return `❌ Не вдалося отримати дані про погоду для ${city}.`;
            }
            let message = `🌤 **Погода в ${weather.city}:**\n\n`;
            message += `🌡 **Температура:** ${weather.temperature}°C\n`;
            message += `☁️ **Стан:** ${weather.condition}\n`;
            message += `💨 **Вітер:** ${weather.windSpeed} км/год\n`;
            message += `💧 **Вологість:** ${weather.humidity}%\n`;
            message += `📊 **Тиск:** ${weather.pressure} мм рт.ст.\n`;
            if (weather.alerts.length > 0) {
                message += `\n⚠️ **Попередження:**\n`;
                weather.alerts.forEach(alert => {
                    message += `• ${alert.title}\n`;
                });
            }
            message += `\n🕐 Оновлено: ${new Date().toLocaleString('uk-UA')}`;
            return message;
        }
        catch (error) {
            console.error('Помилка отримання погоди на вимогу:', error);
            return '❌ Не вдалося отримати дані про погоду. Спробуйте пізніше.';
        }
    }
    /**
     * Підписує чат на ранкові зводки
     */
    subscribeToMorningSummary(chatId) {
        if (this.subscribedChats.has(chatId)) {
            return '✅ Ви вже підписані на ранкові зводки новин та погоди.';
        }
        this.subscribedChats.add(chatId);
        return '🔔 Ви підписалися на ранкові зводки! Щодня між 8:00 та 10:00 отримуватимете новини та погоду.';
    }
    /**
     * Відписує чат від ранкових зводок
     */
    unsubscribeFromMorningSummary(chatId) {
        if (!this.subscribedChats.has(chatId)) {
            return '❌ Ви не підписані на ранкові зводки.';
        }
        this.subscribedChats.delete(chatId);
        return '🔕 Ви відписалися від ранкових зводок новин та погоди.';
    }
    /**
     * Отримує статистику розпізнавання команд
     */
    getRecognitionStats() {
        return this.fuzzyMatcher.getRecognitionStats();
    }
    /**
     * Тестує розпізнавання команди (для налагодження)
     */
    testCommandRecognition(text) {
        return this.fuzzyMatcher.recognizeCommand(text);
    }
    /**
     * Повертає емодзі для рівня критичності
     */
    getSeverityEmoji(severity) {
        switch (severity) {
            case 'critical': return '🚨';
            case 'high': return '⚠️';
            case 'medium': return '📢';
            case 'low': return '💬';
            default: return '📰';
        }
    }
    /**
     * Вмикає/вимикає моніторинг критичних новин
     */
    toggleCriticalMonitoring(enabled) {
        this.monitoringEnabled = enabled;
        const task = this.scheduledTasks.get('critical_monitoring');
        if (task) {
            task.enabled = enabled;
            if (enabled) {
                this.scheduleTask(task);
                return '✅ Моніторинг критичних новин увімкнено.';
            }
            else {
                const timer = this.timers.get(task.id);
                if (timer) {
                    clearTimeout(timer);
                    this.timers.delete(task.id);
                }
                return '❌ Моніторинг критичних новин вимкнено.';
            }
        }
        return '❌ Помилка управління моніторингом.';
    }
    /**
     * Повертає статус планувальника
     */
    getSchedulerStatus() {
        let status = '📅 **Статус планувальника:**\n\n';
        for (const [id, task] of this.scheduledTasks) {
            const emoji = task.enabled ? '✅' : '❌';
            status += `${emoji} **${task.type}**\n`;
            status += `   Наступний запуск: ${task.nextRun.toLocaleString('uk-UA')}\n`;
            status += `   Інтервал: ${Math.round(task.interval / (60 * 1000))} хв\n\n`;
        }
        status += `🔔 Підписаних чатів: ${this.subscribedChats.size}\n`;
        status += `📊 Моніторинг: ${this.monitoringEnabled ? 'Увімкнено' : 'Вимкнено'}`;
        return status;
    }
    /**
     * Отримує список підписаних чатів
     */
    getSubscribedChats() {
        return Array.from(this.subscribedChats);
    }
    /**
     * Очищає всі таймери при завершенні роботи
     */
    cleanup() {
        for (const timer of this.timers.values()) {
            clearTimeout(timer);
        }
        this.timers.clear();
        console.log('Планувальник новин та погоди очищено');
    }
}
exports.NewsWeatherHandler = NewsWeatherHandler;
