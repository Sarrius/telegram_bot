import axios from 'axios';

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'general' | 'politics' | 'weather' | 'emergency' | 'economy' | 'social';
  source: string;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  alerts: WeatherAlert[];
  city: string;
  description: string;
}

export interface WeatherAlert {
  type: 'warning' | 'watch' | 'emergency';
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  startTime: Date;
  endTime: Date;
}

export interface DailySummary {
  date: Date;
  weather: WeatherData;
  topNews: NewsItem[];
  criticalAlerts: (NewsItem | WeatherAlert)[];
}

export class NewsWeatherMonitor {
  private readonly NEWS_API_KEY: string;
  private readonly WEATHER_API_KEY: string;
  private readonly UKRAINE_NEWS_SOURCES = [
    'pravda.com.ua',
    'ukrinform.ua',
    'tsn.ua',
    'unian.ua',
    'korrespondent.net'
  ];
  
  private lastNewsCheck: Date = new Date(0);
  private lastCriticalNewsIds: Set<string> = new Set();
  private criticalKeywords: string[] = [
    'надзвичайна ситуація', 'аварія', 'пожежа', 'вибух', 'теракт',
    'землетрус', 'повінь', 'ураган', 'смерч', 'критична ситуація',
    'евакуація', 'жертви', 'постраждалі', 'катастрофа', 'руйнування',
    'обстріл', 'атака', 'військові дії', 'тривога', 'сирена'
  ];

  constructor(newsApiKey: string, weatherApiKey: string) {
    this.NEWS_API_KEY = newsApiKey;
    this.WEATHER_API_KEY = weatherApiKey;
  }

  /**
   * Отримує новини України за останні 24 години
   */
  async getUkrainianNews(hoursBack: number = 24): Promise<NewsItem[]> {
    try {
      const fromDate = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
      
      // Використовуємо NewsAPI для отримання новин
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: 'Ukraine OR Україна',
          language: 'uk',
          sortBy: 'publishedAt',
          from: fromDate.toISOString(),
          apiKey: this.NEWS_API_KEY,
          pageSize: 50
        },
        timeout: 10000
      });

      const newsItems: NewsItem[] = response.data.articles.map((article: any, index: number) => ({
        id: `${article.url}_${article.publishedAt}` || `news_${Date.now()}_${index}`,
        title: article.title || 'Без заголовка',
        description: article.description || article.content?.substring(0, 200) || '',
        url: article.url || '',
        publishedAt: new Date(article.publishedAt),
        severity: this.determineSeverity(article.title + ' ' + article.description),
        category: this.determineCategory(article.title + ' ' + article.description),
        source: article.source?.name || 'Невідоме джерело'
      }));

      return newsItems.filter(item => item.title && item.title !== '[Removed]');
    } catch (error) {
      console.error('Помилка отримання новин:', error);
      return [];
    }
  }

  /**
   * Отримує дані про погоду для України
   */
  async getWeatherData(city: string = 'Київ'): Promise<WeatherData | null> {
    try {
      // Використовуємо OpenWeatherMap API
      const [currentWeather, alerts] = await Promise.all([
        axios.get('https://api.openweathermap.org/data/2.5/weather', {
          params: {
            q: `${city},UA`,
            appid: this.WEATHER_API_KEY,
            units: 'metric',
            lang: 'uk'
          },
          timeout: 10000
        }),
        this.getWeatherAlerts(city)
      ]);

      const weather = currentWeather.data;
      
      return {
        temperature: Math.round(weather.main.temp),
        condition: weather.weather[0].description,
        humidity: weather.main.humidity,
        windSpeed: Math.round(weather.wind?.speed * 3.6), // м/с -> км/год
        pressure: Math.round(weather.main.pressure * 0.75), // гПа -> мм рт.ст.
        alerts,
        city: weather.name,
        description: `${Math.round(weather.main.temp)}°C, ${weather.weather[0].description}`
      };
    } catch (error) {
      console.error('Помилка отримання погоди:', error);
      return null;
    }
  }

  /**
   * Отримує попередження про погоду
   */
  private async getWeatherAlerts(city: string): Promise<WeatherAlert[]> {
    try {
      // Спробуємо отримати координати міста
      const geoResponse = await axios.get('https://api.openweathermap.org/geo/1.0/direct', {
        params: {
          q: `${city},UA`,
          limit: 1,
          appid: this.WEATHER_API_KEY
        },
        timeout: 5000
      });

      if (geoResponse.data.length === 0) return [];

      const { lat, lon } = geoResponse.data[0];

      // Отримуємо попередження
      const alertsResponse = await axios.get('https://api.openweathermap.org/data/3.0/onecall', {
        params: {
          lat,
          lon,
          appid: this.WEATHER_API_KEY,
          exclude: 'minutely,hourly,daily'
        },
        timeout: 5000
      });

      const alerts = alertsResponse.data.alerts || [];
      
      return alerts.map((alert: any) => ({
        type: this.mapAlertType(alert.event),
        title: alert.event,
        description: alert.description,
        severity: this.mapAlertSeverity(alert.tags),
        startTime: new Date(alert.start * 1000),
        endTime: new Date(alert.end * 1000)
      }));
    } catch (error) {
      console.error('Помилка отримання попереджень про погоду:', error);
      return [];
    }
  }

  /**
   * Створює ранкову зводку новин та погоди
   */
  async createMorningSummary(city: string = 'Київ'): Promise<string> {
    try {
      const [news, weather] = await Promise.all([
        this.getUkrainianNews(24),
        this.getWeatherData(city)
      ]);

      const topNews = news
        .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
        .slice(0, 5);

      let summary = `🌅 **Ранкова зводка на ${new Date().toLocaleDateString('uk-UA')}**\n\n`;

      // Погода
      if (weather) {
        summary += `🌤 **Погода в ${weather.city}:**\n`;
        summary += `${weather.description}\n`;
        summary += `🌡 Температура: ${weather.temperature}°C\n`;
        summary += `💨 Вітер: ${weather.windSpeed} км/год\n`;
        summary += `💧 Вологість: ${weather.humidity}%\n\n`;

        if (weather.alerts.length > 0) {
          summary += `⚠️ **Попередження про погоду:**\n`;
          weather.alerts.forEach(alert => {
            summary += `• ${alert.title}: ${alert.description}\n`;
          });
          summary += '\n';
        }
      }

      // Новини
      if (topNews.length > 0) {
        summary += `📰 **Головні новини:**\n\n`;
        topNews.forEach((item, index) => {
          const emoji = this.getSeverityEmoji(item.severity);
          summary += `${emoji} **${item.title}**\n`;
          if (item.description) {
            summary += `${item.description.substring(0, 150)}${item.description.length > 150 ? '...' : ''}\n`;
          }
          summary += `🔗 [Читати далі](${item.url})\n\n`;
        });
      } else {
        summary += `📰 **Новини:** Наразі немає свіжих новин\n\n`;
      }

      summary += `🤖 Гарного дня! Слідкую за новинами та повідомлю про важливі події.`;

      return summary;
    } catch (error) {
      console.error('Помилка створення ранкової зводки:', error);
      return '❌ Не вдалося створити ранкову зводку. Спробую пізніше.';
    }
  }

  /**
   * Перевіряє критичні новини та повертає їх
   */
  async checkCriticalNews(): Promise<NewsItem[]> {
    try {
      const recentNews = await this.getUkrainianNews(4); // Останні 4 години
      
      const criticalNews = recentNews.filter(item => {
        // Перевіряємо, чи не повідомляли вже про цю новину
        if (this.lastCriticalNewsIds.has(item.id)) {
          return false;
        }

        // Перевіряємо критичність
        const isCritical = item.severity === 'critical' || 
                          this.containsCriticalKeywords(item.title + ' ' + item.description);

        if (isCritical) {
          this.lastCriticalNewsIds.add(item.id);
          // Очищаємо старі ID (зберігаємо останні 100)
          if (this.lastCriticalNewsIds.size > 100) {
            const idsArray = Array.from(this.lastCriticalNewsIds);
            this.lastCriticalNewsIds = new Set(idsArray.slice(-100));
          }
        }

        return isCritical;
      });

      return criticalNews;
    } catch (error) {
      console.error('Помилка перевірки критичних новин:', error);
      return [];
    }
  }

  /**
   * Форматує критичну новину для відправки
   */
  formatCriticalAlert(item: NewsItem): string {
    const emoji = this.getSeverityEmoji(item.severity);
    const urgencyEmoji = item.severity === 'critical' ? '🚨🚨🚨' : '⚠️';
    
    let message = `${urgencyEmoji} **ВАЖЛИВА НОВИНА** ${urgencyEmoji}\n\n`;
    message += `${emoji} **${item.title}**\n\n`;
    
    if (item.description) {
      message += `${item.description}\n\n`;
    }
    
    message += `🔗 [Читати повністю](${item.url})\n`;
    message += `📍 Джерело: ${item.source}`;
    
    return message;
  }

  /**
   * Визначає рівень критичності новини
   */
  private determineSeverity(text: string): 'low' | 'medium' | 'high' | 'critical' {
    const lowerText = text.toLowerCase();
    
    if (this.containsCriticalKeywords(lowerText)) {
      return 'critical';
    }

    const highKeywords = ['важливо', 'терміново', 'екстрено', 'негайно'];
    if (highKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'high';
    }

    const mediumKeywords = ['новина', 'подія', 'розвиток', 'ситуація'];
    if (mediumKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Визначає категорію новини
   */
  private determineCategory(text: string): 'general' | 'politics' | 'weather' | 'emergency' | 'economy' | 'social' {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('погода') || lowerText.includes('дощ') || lowerText.includes('сніг')) {
      return 'weather';
    }

    if (this.containsCriticalKeywords(lowerText)) {
      return 'emergency';
    }

    if (lowerText.includes('політика') || lowerText.includes('уряд') || lowerText.includes('президент')) {
      return 'politics';
    }

    if (lowerText.includes('економіка') || lowerText.includes('гривня') || lowerText.includes('ціни')) {
      return 'economy';
    }

    return 'general';
  }

  /**
   * Перевіряє чи містить текст критичні ключові слова
   */
  private containsCriticalKeywords(text: string): boolean {
    return this.criticalKeywords.some(keyword => text.toLowerCase().includes(keyword));
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
   * Мапує тип попередження про погоду
   */
  private mapAlertType(event: string): 'warning' | 'watch' | 'emergency' {
    const lowerEvent = event.toLowerCase();
    if (lowerEvent.includes('emergency') || lowerEvent.includes('extreme')) {
      return 'emergency';
    }
    if (lowerEvent.includes('warning')) {
      return 'warning';
    }
    return 'watch';
  }

  /**
   * Мапує рівень серйозності попередження
   */
  private mapAlertSeverity(tags: string[]): 'minor' | 'moderate' | 'severe' | 'extreme' {
    if (!tags || tags.length === 0) return 'minor';
    
    const tagString = tags.join(' ').toLowerCase();
    if (tagString.includes('extreme')) return 'extreme';
    if (tagString.includes('severe')) return 'severe';
    if (tagString.includes('moderate')) return 'moderate';
    return 'minor';
  }
} 