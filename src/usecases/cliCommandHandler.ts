import { CLICommandDetector, CLICommandMatch } from '../domain/cliCommandDetector';
import { FeatureManager } from '../config/featureManager';
import { featureMapper } from '../config/featureMapping';

export interface CLICommandResponse {
  shouldRespond: boolean;
  responseType: 'cli_help' | 'cli_status' | 'cli_features' | 'cli_control' | 'ignore';
  response: string;
  confidence: number;
  reasoning: string;
  command?: string;
  args?: string[];
}

export class CLICommandHandler {
  private detector: CLICommandDetector;
  private featureManager: FeatureManager;

  constructor() {
    this.detector = new CLICommandDetector();
    this.featureManager = FeatureManager.getInstance();
    console.log('🎛️ CLI Command Handler initialized');
  }

  public handleMessage(
    text: string,
    chatType: string,
    userId: string,
    chatId: string
  ): CLICommandResponse {
    try {
      const match = this.detector.detectCommand(text);

      if (!match.isCommand) {
        return {
          shouldRespond: false,
          responseType: 'ignore',
          response: '',
          confidence: 0,
          reasoning: 'Not a CLI command'
        };
      }

      console.log(`🎛️ CLI command detected: ${match.command} (${match.confidence})`);

      switch (match.command) {
        case 'help':
          return this.handleHelpCommand(match);
        case 'status':
          return this.handleStatusCommand(match);
        case 'features':
          return this.handleFeaturesCommand(match);
        case 'cli':
          return this.handleCliModeCommand(match);
        case 'enable':
        case 'disable':
        case 'toggle':
          return this.handleFeatureControl(match);
        default:
          return {
            shouldRespond: false,
            responseType: 'ignore',
            response: '',
            confidence: 0,
            reasoning: `Unknown CLI command: ${match.command}`
          };
      }
    } catch (error) {
      console.error('❌ CLI command handler error:', error);
      return {
        shouldRespond: false,
        responseType: 'ignore',
        response: '',
        confidence: 0,
        reasoning: `Error processing CLI command: ${error}`
      };
    }
  }

  private handleHelpCommand(match: CLICommandMatch): CLICommandResponse {
    const response = this.generateHelpResponse(match.language);
    
    return {
      shouldRespond: true,
      responseType: 'cli_help',
      response,
      confidence: match.confidence,
      reasoning: `CLI help command in ${match.language}`,
      command: match.command,
      args: match.args
    };
  }

  private handleStatusCommand(match: CLICommandMatch): CLICommandResponse {
    const response = this.generateStatusResponse(match.language);
    
    return {
      shouldRespond: true,
      responseType: 'cli_status',
      response,
      confidence: match.confidence,
      reasoning: `CLI status command in ${match.language}`,
      command: match.command,
      args: match.args
    };
  }

  private handleFeaturesCommand(match: CLICommandMatch): CLICommandResponse {
    const response = this.generateFeaturesResponse(match.language);
    
    return {
      shouldRespond: true,
      responseType: 'cli_features',
      response,
      confidence: match.confidence,
      reasoning: `CLI features command in ${match.language}`,
      command: match.command,
      args: match.args
    };
  }

  private handleCliModeCommand(match: CLICommandMatch): CLICommandResponse {
    const response = this.generateCliModeResponse(match.language);
    
    return {
      shouldRespond: true,
      responseType: 'cli_help',
      response,
      confidence: match.confidence,
      reasoning: `CLI mode entry command in ${match.language}`,
      command: match.command,
      args: match.args
    };
  }

  private handleFeatureControl(match: CLICommandMatch): CLICommandResponse {
    if (!match.args || match.args.length === 0) {
      const errorMsg = match.language === 'uk' 
        ? '❌ Потрібно вказати назву функції. Наприклад: "увімкни powerWords" або "увімкни nlpConversations"'
        : '❌ Feature name required. Example: "enable powerWords" or "enable nlpConversations"';
      
      return {
        shouldRespond: true,
        responseType: 'cli_control',
        response: errorMsg,
        confidence: match.confidence,
        reasoning: 'Missing feature name',
        command: match.command,
        args: match.args
      };
    }

    const inputFeature = match.args[0];
    
    // Знаходимо правильну назву функції через mapper
    const mappedFeature = featureMapper.findFeatureByAlias(inputFeature);
    
    if (!mappedFeature) {
      const availableFeatures = featureMapper.getAllFeatureManagerNames().join(', ');
      const errorMsg = match.language === 'uk' 
        ? `❌ Невідома функція: "${inputFeature}"\n\n🎛️ Доступні функції:\n${availableFeatures}\n\n💡 Спробуйте: features - для детального списку`
        : `❌ Unknown feature: "${inputFeature}"\n\n🎛️ Available features:\n${availableFeatures}\n\n💡 Try: features - for detailed list`;
      
      return {
        shouldRespond: true,
        responseType: 'cli_control',
        response: errorMsg,
        confidence: match.confidence,
        reasoning: `Unknown feature: ${inputFeature}`,
        command: match.command,
        args: match.args
      };
    }

    let result: string;

    switch (match.command) {
      case 'enable':
        result = this.featureManager.enableFeature(mappedFeature as any);
        break;
      case 'disable':
        result = this.featureManager.disableFeature(mappedFeature as any);
        break;
      case 'toggle':
        result = this.featureManager.toggleFeature(mappedFeature as any);
        break;
      default:
        result = match.language === 'uk' 
          ? '❌ Невідома команда'
          : '❌ Unknown command';
    }

    // Додаємо інформацію про мапінг
    const featureInfo = featureMapper.getFeatureInfo(mappedFeature);
    if (featureInfo && inputFeature !== mappedFeature) {
      result += `\n💡 "${inputFeature}" → "${mappedFeature}" (${featureInfo.description})`;
    }

    return {
      shouldRespond: true,
      responseType: 'cli_control',
      response: result,
      confidence: match.confidence,
      reasoning: `Feature control: ${match.command} ${inputFeature} → ${mappedFeature}`,
      command: match.command,
      args: [mappedFeature] // Повертаємо mapped назву
    };
  }

  private generateHelpResponse(language: 'uk' | 'en'): string {
    const features = this.featureManager.getAllFeatures();
    const featureEntries = Object.entries(features);

    if (language === 'uk') {
      let response = '🎛️ **Доступні команди бота:**\n\n';
      
      // Основні команди
      response += '📋 **Основні команди:**\n';
      response += '• `help` або `/help` - показати цю довідку\n';
      response += '• `status` - показати статус всіх функцій\n';
      response += '• `що ти можеш` - показати можливості бота\n';
      response += '• `новини` - отримати останні новини\n';
      response += '• `погода [місто]` - дізнатися погоду\n\n';

      // Управління функціями
      response += '⚙️ **Управління функціями:**\n';
      response += '• `увімкни [функція]` - увімкнути функцію\n';
      response += '• `вимкни [функція]` - вимкнути функцію\n';
      response += '• `перемкни [функція]` - перемкнути функцію\n\n';

      // Через упоминание бота
      response += '🤖 **Через упоминание бота:**\n';
      response += '• `@bot help` - ця довідка\n';
      response += '• `@bot status` - статус функцій\n';
      response += '• `@bot увімкни powerWords`\n\n';

      // Статус функцій
      response += '🎛️ **Поточний статус функцій:**\n';
      featureEntries.forEach(([name, enabled]) => {
        const emoji = enabled ? '✅' : '🔴';
        const status = enabled ? 'ВМК' : 'ВИМ';
        response += `• ${emoji} \`${name}\` - ${status}\n`;
      });

      response += '\n💡 **Приклади:**\n';
      response += '• `увімкни knowledgeSearch`\n';
      response += '• `скільки буде 2+2?`\n';
      response += '• `хто такий Ейнштейн?`\n';
      response += '• `@bot вимкни moderation`\n';

      return response;
    } else {
      let response = '🎛️ **Available Bot Commands:**\n\n';
      
      // Basic commands
      response += '📋 **Basic Commands:**\n';
      response += '• `help` or `/help` - show this help\n';
      response += '• `status` - show all features status\n';
      response += '• `what can you do` - show bot capabilities\n';
      response += '• `news` - get latest news\n';
      response += '• `weather [city]` - get weather info\n\n';

      // Feature management
      response += '⚙️ **Feature Management:**\n';
      response += '• `enable [feature]` - enable feature\n';
      response += '• `disable [feature]` - disable feature\n';
      response += '• `toggle [feature]` - toggle feature\n\n';

      // Via bot mention
      response += '🤖 **Via Bot Mention:**\n';
      response += '• `@bot help` - this help\n';
      response += '• `@bot status` - features status\n';
      response += '• `@bot enable powerWords`\n\n';

      // Features status
      response += '🎛️ **Current Features Status:**\n';
      featureEntries.forEach(([name, enabled]) => {
        const emoji = enabled ? '✅' : '🔴';
        const status = enabled ? 'ON ' : 'OFF';
        response += `• ${emoji} \`${name}\` - ${status}\n`;
      });

      response += '\n💡 **Examples:**\n';
      response += '• `enable knowledgeSearch`\n';
      response += '• `what is 2+2?`\n';
      response += '• `who is Einstein?`\n';
      response += '• `@bot disable moderation`\n';

      return response;
    }
  }

  private generateStatusResponse(language: 'uk' | 'en'): string {
    return this.featureManager.getFeatureStatus();
  }

  private generateFeaturesResponse(language: 'uk' | 'en'): string {
    const basicHelp = this.featureManager.getFeatureHelp();
    const mappedFeatures = featureMapper.getFormattedFeaturesList();
    
    return basicHelp + '\n\n' + mappedFeatures;
  }

  private generateCliModeResponse(language: 'uk' | 'en'): string {
    if (language === 'uk') {
      return `🖥️ **CLI режим активовано!**

📖 **Доступні CLI команди:**

**Основні команди:**
• \`help\` - показати довідку
• \`status\` - статус всіх функцій
• \`features\` - список функцій для управління

**Управління функціями:**
• \`enable [функція]\` - увімкнути функцію
• \`disable [функція]\` - вимкнути функцію
• \`toggle [функція]\` - перемкнути функцію

**Приклади:**
• \`enable powerWords\`
• \`disable moderation\`
• \`status\`

💡 **Підказка:** Для звичайного спілкування просто пишіть без команд CLI.
Наприклад: "що ти можеш?" - дасть дружню відповідь.`;
    } else {
      return `🖥️ **CLI Mode Activated!**

📖 **Available CLI Commands:**

**Basic Commands:**
• \`help\` - show help
• \`status\` - show all features status
• \`features\` - list manageable features

**Feature Management:**
• \`enable [feature]\` - enable feature
• \`disable [feature]\` - disable feature
• \`toggle [feature]\` - toggle feature

**Examples:**
• \`enable powerWords\`
• \`disable moderation\`
• \`status\`

💡 **Tip:** For natural conversation, just type without CLI commands.
Example: "what can you do?" - will give a friendly response.`;
    }
  }

  public getStats() {
    const detectorStats = this.detector.getStats();
    return {
      ...detectorStats,
      handlerName: 'CLICommandHandler',
      version: '1.0.0',
      integrations: ['FeatureManager', 'CLICommandDetector'],
      capabilities: [
        'Help command with features status',
        'Feature status display',
        'Feature management (enable/disable/toggle)',
        'Multi-language support (Ukrainian/English)',
        'Bot mention support (@bot commands)',
        'Telegram slash commands (/help, /status)'
      ]
    };
  }

  // Тестовий метод для CLI
  public testCommand(command: string): any {
    const result = this.handleMessage(command, 'private', 'test', 'test');
    return {
      command,
      detected: result.shouldRespond,
      response: result.shouldRespond ? result.response.substring(0, 100) + '...' : 'Not detected',
      confidence: result.confidence,
      reasoning: result.reasoning
    };
  }
} 