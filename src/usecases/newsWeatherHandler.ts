import { NewsWeatherMonitor, NewsItem } from '../domain/newsWeatherMonitor';
import TelegramBot from 'node-telegram-bot-api';
import { NewsCommandsFuzzyMatcher, NewsCommandMatch } from '../config/vocabulary/newsCommandsFuzzyMatcher';

export interface ScheduledTask {
  id: string;
  type: 'morning_summary' | 'critical_monitoring';
  nextRun: Date;
  interval: number; // в мілісекундах
  enabled: boolean;
}

export class NewsWeatherHandler {
  private monitor: NewsWeatherMonitor;
  private bot: TelegramBot;
  private scheduledTasks: Map<string, ScheduledTask> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private subscribedChats: Set<number> = new Set();
  private morningHour: number = 8; // Година ранкових повідомлень
  private monitoringEnabled: boolean = true;
  private fuzzyMatcher: NewsCommandsFuzzyMatcher;

  constructor(
    newsApiKey: string, 
    weatherApiKey: string, 
    bot: TelegramBot,
    subscribedChats: number[] = []
  ) {
    this.monitor = new NewsWeatherMonitor(newsApiKey, weatherApiKey);
    this.bot = bot;
    this.subscribedChats = new Set(subscribedChats);
    this.fuzzyMatcher = new NewsCommandsFuzzyMatcher();
    this.initializeScheduler();
  }

  /**
   * Ініціалізує планувальник завдань
   */
  private initializeScheduler(): void {
    // Планувальник ранкових зводок
    this.scheduleMorningSummary();
    
    // Планувальник моніторингу критичних новин
    this.scheduleCriticalMonitoring();
  }

  /**
   * Планує ранкові зводки
   */
  private scheduleMorningSummary(): void {
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

    const task: ScheduledTask = {
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
  private scheduleCriticalMonitoring(): void {
    const taskId = 'critical_monitoring';
    const now = new Date();
    const nextCheck = new Date(now.getTime() + 30 * 60 * 1000); // Через 30 хвилин

    const task: ScheduledTask = {
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
  private scheduleTask(task: ScheduledTask): void {
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
  private async executeTask(task: ScheduledTask): Promise<void> {
    try {
      switch (task.type) {
        case 'morning_summary':
          await this.sendMorningSummary();
          break;
        case 'critical_monitoring':
          await this.checkAndSendCriticalNews();
          break;
      }
    } catch (error) {
      console.error(`Помилка виконання завдання ${task.type}:`, error);
    }
  }

  /**
   * Відправляє ранкову зводку всім підписаним чатам
   */
  private async sendMorningSummary(): Promise<void> {
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
      } catch (error) {
        console.error(`Помилка відправки ранкової зводки до чату ${chatId}:`, error);
      }
    }
  }

  /**
   * Перевіряє та відправляє критичні новини
   */
  private async checkAndSendCriticalNews(): Promise<void> {
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
        } catch (error) {
          console.error(`Помилка відправки критичної новини до чату ${chatId}:`, error);
        }
      }
    }
  }

  /**
   * Обробляє команду новин від користувача з толерантністю до помилок
   */
  async handleNewsCommand(chatId: number, messageText: string): Promise<string> {
    try {
      // Використовуємо fuzzy matching для розпізнавання команд
      const commandMatch = this.fuzzyMatcher.recognizeCommand(messageText);
      
      if (!commandMatch) {
        return '';
      }

      console.log(`Розпізнано команду: ${commandMatch.type} (впевненість: ${commandMatch.confidence})`);

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
    } catch (error) {
      console.error(`Помилка обробки команди:`, error);
      return '❌ Виникла помилка під час обробки запиту. Спробуйте пізніше.';
    }
  }

  /**
   * Отримує новини на вимогу з фокусом на критичні події
   */
  private async getNewsOnDemand(): Promise<string> {
    try {
      const news = await this.monitor.getUkrainianNews(24);
      
      if (news.length === 0) {
        return '📰 Наразі немає свіжих новин за останню добу.';
      }

      // Сортуємо новини за важливістю: спочатку критичні, потім за часом
      const sortedNews = news.sort((a, b) => {
        // Пріоритет критичності
        const severityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
        
        if (severityDiff !== 0) {
          return severityDiff;
        }
        
        // При однаковій критичності - сортуємо за часом
        return b.publishedAt.getTime() - a.publishedAt.getTime();
      });

      // Окремо виділяємо критичні новини
      const criticalNews = sortedNews.filter(item => item.severity === 'critical');
      const otherNews = sortedNews.filter(item => item.severity !== 'critical').slice(0, 5);

      let message = '';

      // Спочатку показуємо критичні новини з акцентом
      if (criticalNews.length > 0) {
        message += `🚨 **КРИТИЧНІ НОВИНИ:**\n\n`;
        
        criticalNews.forEach((item, index) => {
          message += `🚨 **${item.title}**\n`;
          if (item.description) {
            message += `${item.description}\n`;
          }
          message += `🔗 [ЧИТАТИ ПОВНІСТЮ](${item.url})\n`;
          message += `📍 Джерело: ${item.source}\n`;
          message += `🕐 ${item.publishedAt.toLocaleString('uk-UA')}\n\n`;
        });
        
        message += `${'─'.repeat(40)}\n\n`;
      }

      // Потім показуємо інші важливі новини
      if (otherNews.length > 0) {
        message += `📰 **ВАЖЛИВІ НОВИНИ:**\n\n`;
        
        otherNews.forEach((item, index) => {
          const emoji = this.getSeverityEmoji(item.severity);
          message += `${emoji} **${item.title}**\n`;
          message += `🔗 [Читати](${item.url})\n`;
          message += `🕐 ${item.publishedAt.toLocaleString('uk-UA', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}\n\n`;
        });
      }

      if (criticalNews.length === 0 && otherNews.length === 0) {
        return '📰 Наразі немає важливих новин за останню добу.';
      }

      message += `🔄 Оновлено: ${new Date().toLocaleString('uk-UA')}`;
      
      return message;
    } catch (error) {
      console.error('Помилка отримання новин на вимогу:', error);
      return '❌ Не вдалося отримати новини. Спробуйте пізніше.';
    }
  }

  /**
   * Отримує погоду на вимогу
   */
  private async getWeatherOnDemand(city: string): Promise<string> {
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
    } catch (error) {
      console.error('Помилка отримання погоди на вимогу:', error);
      return '❌ Не вдалося отримати дані про погоду. Спробуйте пізніше.';
    }
  }

  /**
   * Підписує чат на ранкові зводки
   */
  private subscribeToMorningSummary(chatId: number): string {
    if (this.subscribedChats.has(chatId)) {
      return '✅ Ви вже підписані на ранкові зводки новин та погоди.';
    }

    this.subscribedChats.add(chatId);
    return '🔔 Ви підписалися на ранкові зводки! Щодня між 8:00 та 10:00 отримуватимете новини та погоду.';
  }

  /**
   * Відписує чат від ранкових зводок
   */
  private unsubscribeFromMorningSummary(chatId: number): string {
    if (!this.subscribedChats.has(chatId)) {
      return '❌ Ви не підписані на ранкові зводки.';
    }

    this.subscribedChats.delete(chatId);
    return '🔕 Ви відписалися від ранкових зводок новин та погоди.';
  }

  /**
   * Отримує статистику розпізнавання команд
   */
  getRecognitionStats(): {
    totalKeywords: number;
    totalVariations: number;
    supportedCities: number;
  } {
    return this.fuzzyMatcher.getRecognitionStats();
  }

  /**
   * Тестує розпізнавання команди (для налагодження)
   */
  testCommandRecognition(text: string): NewsCommandMatch | null {
    return this.fuzzyMatcher.recognizeCommand(text);
  }

  /**
   * Повертає емодзі для рівня критичності
   */
  private getSeverityEmoji(severity: string): string {
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
  toggleCriticalMonitoring(enabled: boolean): string {
    this.monitoringEnabled = enabled;
    const task = this.scheduledTasks.get('critical_monitoring');
    
    if (task) {
      task.enabled = enabled;
      if (enabled) {
        this.scheduleTask(task);
        return '✅ Моніторинг критичних новин увімкнено.';
      } else {
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
  getSchedulerStatus(): string {
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
  getSubscribedChats(): number[] {
    return Array.from(this.subscribedChats);
  }

  /**
   * Очищає всі таймери при завершенні роботи
   */
  cleanup(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    console.log('Планувальник новин та погоди очищено');
  }
} 