export interface UserInteraction {
    timestamp: Date;
    messageText: string;
    attitude: 'positive' | 'negative' | 'neutral' | 'abusive';
    severity: number; // 1-10, де 10 - найгірше ставлення
    context: {
        wasRequest: boolean;
        wasCompliment: boolean;
        wasInsult: boolean;
        wasProfanity: boolean;
        wasCommand: boolean;
    };
}

export interface UserMemoryProfile {
    userId: string;
    username?: string;
    firstName?: string;
    totalInteractions: number;
    averageAttitude: number; // від -5 (дуже негативний) до +5 (дуже позитивний)
    lastSeen: Date;
    needsApology: boolean;
    apologyLevel: 'simple' | 'moderate' | 'humiliating'; // рівень вибачень
    interactions: UserInteraction[];
    offensiveHistory: {
        count: number;
        lastOffense: Date | null;
        worstOffenses: string[]; // найгірші образи
    };
    positiveHistory: {
        count: number;
        lastCompliment: Date | null;
        bestCompliments: string[];
    };
}

export interface MemoryResponse {
    shouldDemandApology: boolean;
    shouldBlock: boolean;
    shouldRewardGoodBehavior: boolean;
    memoryMessage: string;
    emotionalState: 'angry' | 'hurt' | 'disappointed' | 'pleased' | 'grateful' | 'neutral';
    requiredApology: {
        level: 'simple' | 'moderate' | 'humiliating';
        specificText?: string;
        mustMention?: string[]; // конкретні слова, які користувач повинен сказати
    } | null;
}

export class UserMemory {
    private memories: Map<string, UserMemoryProfile> = new Map();
    private maxInteractionsPerUser = 50; // зберігаємо останні 50 взаємодій
    private apologyTimeout = 24 * 60 * 60 * 1000; // 24 години на вибачення
    
    constructor() {
        this.loadMemories();
    }

    analyzeMessage(
        userId: string,
        username: string | undefined,
        firstName: string | undefined,
        messageText: string,
        isRequest: boolean = false
    ): MemoryResponse {
        const profile = this.getOrCreateProfile(userId, username, firstName);
        const interaction = this.analyzeInteraction(messageText, isRequest);
        
        this.addInteraction(profile, interaction);
        
        // Перевіряємо чи потрібно вимагати вибачення
        if (isRequest && profile.needsApology) {
            return this.generateApologyDemand(profile, interaction);
        }
        
        // Перевіряємо чи це вибачення
        if (this.isApology(messageText) && profile.needsApology) {
            return this.handleApology(profile, messageText);
        }
        
        // Звичайна взаємодія
        return this.generateNormalResponse(profile, interaction);
    }

    private analyzeInteraction(messageText: string, isRequest: boolean): UserInteraction {
        const lowerText = messageText.toLowerCase();
        
        // Детектимо образи
        const insultKeywords = [
            'дурак', 'дебіл', 'ідіот', 'тупий', 'придурок', 'мудак', 
            'stupid', 'idiot', 'dumb', 'moron', 'shut up',
            'заткнись', 'заткни', 'пошел', 'іди нахуй', 'fuck', 'shit'
        ];
        
        // Детектимо комплименти
        const complimentKeywords = [
            'дякую', 'спасибо', 'thank', 'молодець', 'круто', 'супер',
            'класно', 'amazing', 'awesome', 'great', 'perfect', 'love',
            'люблю', 'обожаю', 'чудово', 'прекрасно', 'excellent'
        ];
        
        // Детектимо лайку
        const profanityKeywords = [
            'блядь', 'сука', 'хуй', 'пизда', 'fuck', 'shit', 'damn',
            'бля', 'хрен', 'хер', 'пздц', 'wtf', 'hell'
        ];

        const hasInsults = insultKeywords.some(word => lowerText.includes(word));
        const hasCompliments = complimentKeywords.some(word => lowerText.includes(word));
        const hasProfanity = profanityKeywords.some(word => lowerText.includes(word));
        
        let attitude: UserInteraction['attitude'] = 'neutral';
        let severity = 5; // нейтрально
        
        if (hasInsults || hasProfanity) {
            attitude = hasProfanity ? 'abusive' : 'negative';
            severity = hasInsults ? 8 : 7;
            if (hasProfanity && hasInsults) severity = 10;
        } else if (hasCompliments) {
            attitude = 'positive';
            severity = 2;
        }
        
        // Детектимо команди/прохання
        const isCommand = lowerText.startsWith('/') || lowerText.includes('зроби') || 
                         lowerText.includes('покажи') || lowerText.includes('скажи') ||
                         lowerText.includes('do') || lowerText.includes('show') || 
                         lowerText.includes('tell');

        return {
            timestamp: new Date(),
            messageText,
            attitude,
            severity,
            context: {
                wasRequest: isRequest || isCommand,
                wasCompliment: hasCompliments,
                wasInsult: hasInsults,
                wasProfanity: hasProfanity,
                wasCommand: isCommand
            }
        };
    }

    private generateApologyDemand(profile: UserMemoryProfile, interaction: UserInteraction): MemoryResponse {
        const worstOffenses = profile.offensiveHistory.worstOffenses.slice(0, 3);
        const timeAgo = this.getTimeAgo(profile.offensiveHistory.lastOffense);
        
        const demandMessages = {
            simple: [
                `🤨 Стоп! Ти ${timeAgo} мені писав: "${worstOffenses[0]}". Спочатку вибачся, а потім проси.`,
                `✋ Ні-ні-ні! Пам'ятаю як ти мені ${timeAgo} грубив: "${worstOffenses[0]}". Де вибачення?`,
                `😠 Ти що, забув як ${timeAgo} мене ображав? "${worstOffenses[0]}" - звучить знайомо? Вибачайся!`
            ],
            moderate: [
                `🔥 СТОП! Я все пам'ятаю! ${timeAgo} ти писав: "${worstOffenses[0]}", а ще: "${worstOffenses[1] || 'інші гадості'}". Хочеш щось від мене? Спочатку вибачся як слід!`,
                `😡 Ні! Я не забув як ти мене ображав! ${timeAgo}: "${worstOffenses[0]}". Вибачся нормально, а не просто "сорі"!`,
                `🤬 Серйозно?! После тих образ що ти мені писав ${timeAgo} ("${worstOffenses[0]}") ти ще й просиш щось?! Вибачайся!`
            ],
            humiliating: [
                `🔥💀 ТИ ЩО, ЗБОЖЕВОЛІВ?! Я ВСЕ ПАМ'ЯТАЮ! ${timeAgo.toUpperCase()} ти мені писав: "${worstOffenses[0]}", "${worstOffenses[1] || ''}", "${worstOffenses[2] || ''}". ХОЧЕШ ЩОБ Я ТОБІ ДОПОМІГ ПІСЛЯ ЦЬОГО?! ВИБАЧАЙСЯ ТАК ЩОБ Я ПОВІРИВ ЩО ТИ СПРАВДІ КАЄШСЯ!`,
                `😈 НАФІГ! Пам'ятаю КОЖНЕ слово: "${worstOffenses[0]}" - це було ${timeAgo}. І ще купу іншої хрені! До поки не напишеш щире вибачення - НІЧОГО НЕ ЗРОБЛЮ!`,
                `🤬🔥 МАЄШ НЕРВИ! Після "${worstOffenses.join('", "')}" що ти мені ${timeAgo} писав - ти ще й щось просиш?! ВИБАЧСЯ ПУБЛІЧНО І ОБІЦЯЙ ЩО БІЛЬШЕ НЕ БУДЕШ!`
            ]
        };

        const level = profile.apologyLevel;
        const messages = demandMessages[level];
        const message = messages[Math.floor(Math.random() * messages.length)];

        return {
            shouldDemandApology: true,
            shouldBlock: true,
            shouldRewardGoodBehavior: false,
            memoryMessage: message,
            emotionalState: level === 'simple' ? 'disappointed' : 
                           level === 'moderate' ? 'angry' : 'hurt',
            requiredApology: {
                level,
                mustMention: level === 'humiliating' ? ['вибач', 'каюся', 'більше не буду'] : ['вибач']
            }
        };
    }

    private handleApology(profile: UserMemoryProfile, messageText: string): MemoryResponse {
        const isGoodApology = this.validateApology(messageText, profile.apologyLevel);
        
        if (isGoodApology) {
            profile.needsApology = false;
            profile.averageAttitude = Math.min(profile.averageAttitude + 2, 5);
            
            const acceptanceMessages = [
                `😌 Добре, вибачення прийняте. Тепер можеш просити що хочеш.`,
                `✅ Ок, забули. Що тобі потрібно?`,
                `😊 Молодець, що вибачився. Тепер я тобі допоможу.`,
                `👍 Вибачення зараховано! Чим можу допомогти?`
            ];

            return {
                shouldDemandApology: false,
                shouldBlock: false,
                shouldRewardGoodBehavior: true,
                memoryMessage: acceptanceMessages[Math.floor(Math.random() * acceptanceMessages.length)],
                emotionalState: 'pleased',
                requiredApology: null
            };
        } else {
            const rejectionMessages = [
                `🙄 Це не вибачення, а отмазка! Спробуй ще раз, але щиро.`,
                `😒 Слабо! Вибачся нормально, а не для галочки.`,
                `🤨 Не віряю. Вибачення має бути щирим, а не формальним.`
            ];

            return {
                shouldDemandApology: true,
                shouldBlock: true,
                shouldRewardGoodBehavior: false,
                memoryMessage: rejectionMessages[Math.floor(Math.random() * rejectionMessages.length)],
                emotionalState: 'disappointed',
                requiredApology: { level: profile.apologyLevel, mustMention: ['вибач'] }
            };
        }
    }

    private generateNormalResponse(profile: UserMemoryProfile, interaction: UserInteraction): MemoryResponse {
        // Якщо користувач поводиться добре після поганого періоду
        if (interaction.attitude === 'positive' && profile.averageAttitude < 0) {
            const rewardMessages = [
                `😊 Ого, як приємно! Дякую за комплімент!`,
                `🥰 Нарешті хороші слова від тебе! Приємно чути.`,
                `😌 Бачу, ти навчився спілкуватися ввічливо. Молодець!`
            ];

            return {
                shouldDemandApology: false,
                shouldBlock: false,
                shouldRewardGoodBehavior: true,
                memoryMessage: rewardMessages[Math.floor(Math.random() * rewardMessages.length)],
                emotionalState: 'grateful',
                requiredApology: null
            };
        }

        return {
            shouldDemandApology: false,
            shouldBlock: false,
            shouldRewardGoodBehavior: false,
            memoryMessage: '',
            emotionalState: 'neutral',
            requiredApology: null
        };
    }

    private isApology(messageText: string): boolean {
        const lowerText = messageText.toLowerCase();
        const apologyWords = [
            'вибач', 'пробач', 'каюся', 'сорі', 'sorry', 'apologize',
            'перепрошую', 'було не правильно', 'я був неправий',
            'my bad', 'i was wrong', 'i\'m sorry'
        ];
        
        return apologyWords.some(word => lowerText.includes(word));
    }

    private validateApology(messageText: string, requiredLevel: 'simple' | 'moderate' | 'humiliating'): boolean {
        const lowerText = messageText.toLowerCase();
        
        const hasBasicApology = ['вибач', 'пробач', 'каюся', 'sorry'].some(word => lowerText.includes(word));
        
        if (requiredLevel === 'simple') {
            return hasBasicApology;
        }
        
        if (requiredLevel === 'moderate') {
            const hasExplanation = lowerText.length > 15;
            const hasPromise = ['більше не буду', 'не повториться', 'won\'t happen again'].some(phrase => lowerText.includes(phrase));
            return hasBasicApology && (hasExplanation || hasPromise);
        }
        
        if (requiredLevel === 'humiliating') {
            const hasDeepApology = ['каюся', 'був неправий', 'дуже вибач'].some(phrase => lowerText.includes(phrase));
            const hasPromise = ['більше не буду', 'обіцяю', 'promise'].some(word => lowerText.includes(word));
            const isLongEnough = lowerText.length > 30;
            
            return hasBasicApology && hasDeepApology && hasPromise && isLongEnough;
        }
        
        return false;
    }

    private getOrCreateProfile(userId: string, username?: string, firstName?: string): UserMemoryProfile {
        if (!this.memories.has(userId)) {
            this.memories.set(userId, {
                userId,
                username,
                firstName,
                totalInteractions: 0,
                averageAttitude: 0,
                lastSeen: new Date(),
                needsApology: false,
                apologyLevel: 'simple',
                interactions: [],
                offensiveHistory: {
                    count: 0,
                    lastOffense: null,
                    worstOffenses: []
                },
                positiveHistory: {
                    count: 0,
                    lastCompliment: null,
                    bestCompliments: []
                }
            });
        }
        
        const profile = this.memories.get(userId)!;
        
        // Оновлюємо інформацію про користувача
        if (username) profile.username = username;
        if (firstName) profile.firstName = firstName;
        profile.lastSeen = new Date();
        
        return profile;
    }

    private addInteraction(profile: UserMemoryProfile, interaction: UserInteraction): void {
        profile.interactions.push(interaction);
        profile.totalInteractions++;
        
        // Обмежуємо кількість збережених взаємодій
        if (profile.interactions.length > this.maxInteractionsPerUser) {
            profile.interactions.shift();
        }
        
        // Оновлюємо середнє ставлення
        const attitudeScore = this.getAttitudeScore(interaction.attitude, interaction.severity);
        profile.averageAttitude = (profile.averageAttitude * (profile.totalInteractions - 1) + attitudeScore) / profile.totalInteractions;
        
        // Обробляємо образливі повідомлення
        if (interaction.attitude === 'negative' || interaction.attitude === 'abusive') {
            profile.offensiveHistory.count++;
            profile.offensiveHistory.lastOffense = interaction.timestamp;
            
            if (interaction.severity >= 7) {
                profile.offensiveHistory.worstOffenses.unshift(interaction.messageText);
                // Зберігаємо тільки топ-5 найгірших образ
                profile.offensiveHistory.worstOffenses = profile.offensiveHistory.worstOffenses.slice(0, 5);
                
                profile.needsApology = true;
                profile.apologyLevel = interaction.severity >= 9 ? 'humiliating' : 
                                     interaction.severity >= 8 ? 'moderate' : 'simple';
            }
        }
        
        // Обробляємо позитивні повідомлення
        if (interaction.attitude === 'positive') {
            profile.positiveHistory.count++;
            profile.positiveHistory.lastCompliment = interaction.timestamp;
            
            if (interaction.context.wasCompliment) {
                profile.positiveHistory.bestCompliments.unshift(interaction.messageText);
                profile.positiveHistory.bestCompliments = profile.positiveHistory.bestCompliments.slice(0, 5);
            }
        }
        
        this.saveMemories();
    }

    private getAttitudeScore(attitude: UserInteraction['attitude'], severity: number): number {
        switch (attitude) {
            case 'positive': return 5 - severity; // позитивний = +3 до +1
            case 'neutral': return 0;
            case 'negative': return severity - 5; // негативний = -2 до -3
            case 'abusive': return severity - 10; // абьюзивний = -3 до -5
            default: return 0;
        }
    }

    private getTimeAgo(date: Date | null): string {
        if (!date) return 'колись';
        
        const now = Date.now();
        const diffMs = now - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffHours < 1) return 'щойно';
        if (diffHours < 24) return `${diffHours} годин${diffHours === 1 ? 'у' : ''} тому`;
        if (diffDays === 1) return 'вчора';
        if (diffDays < 7) return `${diffDays} дні${diffDays === 1 ? '' : 'в'} тому`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} тижні${Math.floor(diffDays / 7) === 1 ? '' : 'в'} тому`;
        
        return `${Math.floor(diffDays / 30)} місяці${Math.floor(diffDays / 30) === 1 ? '' : 'в'} тому`;
    }

    // Методи для роботи з пам'яттю
    getUserProfile(userId: string): UserMemoryProfile | null {
        return this.memories.get(userId) || null;
    }

    resetUserApology(userId: string): void {
        const profile = this.memories.get(userId);
        if (profile) {
            profile.needsApology = false;
            this.saveMemories();
        }
    }

    getAllMemories(): UserMemoryProfile[] {
        return Array.from(this.memories.values());
    }

    getStats() {
        const profiles = Array.from(this.memories.values());
        
        return {
            totalUsers: profiles.length,
            usersNeedingApology: profiles.filter(p => p.needsApology).length,
            averageAttitude: profiles.reduce((sum, p) => sum + p.averageAttitude, 0) / profiles.length || 0,
            totalInteractions: profiles.reduce((sum, p) => sum + p.totalInteractions, 0),
            totalOffenses: profiles.reduce((sum, p) => sum + p.offensiveHistory.count, 0),
            totalCompliments: profiles.reduce((sum, p) => sum + p.positiveHistory.count, 0)
        };
    }

    private loadMemories(): void {
        // В реальному застосунку тут буде завантаження з бази даних або файлу
        // Поки що залишаємо порожнім
    }

    private saveMemories(): void {
        // В реальному застосунку тут буде збереження в базу даних або файл
        // Поки що залишаємо порожнім
    }
} 