const vaderSentiment = require('vader-sentiment');

export interface SentimentAnalysis {
  category: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  intensity: 'low' | 'medium' | 'high';
  scores: {
    compound: number;
    positive: number;
    negative: number;
    neutral: number;
  };
  isOverlyPositive: boolean;
  isNegative: boolean;
  isMotivational: boolean;
  isAggressive: boolean;
  detectedLanguage: 'ukrainian' | 'english' | 'mixed';
}

/**
 * Detects the primary language of the input text
 */
function detectLanguage(text: string): 'ukrainian' | 'english' | 'mixed' {
  const ukrainianChars = text.match(/[а-яіїєґ]/gi);
  const englishChars = text.match(/[a-z]/gi);

  const ukrainianCount = ukrainianChars ? ukrainianChars.length : 0;
  const englishCount = englishChars ? englishChars.length : 0;

  if (ukrainianCount > englishCount * 2) return 'ukrainian';
  if (englishCount > ukrainianCount * 2) return 'english';
  return 'mixed';
}

/**
 * Analyzes message and returns category string
 */
export function analyzeMessage(text: string): string {
  const analysis = analyzeMessageDetailed(text);
  return analysis.category;
}

/**
 * Comprehensive message analysis with detailed emotional intelligence
 */
export function analyzeMessageDetailed(text: string): SentimentAnalysis {
  const lowerText = text.toLowerCase();
  const detectedLanguage = detectLanguage(text);

  // Get sentiment scores from VADER
  const sentiment = vaderSentiment.SentimentIntensityAnalyzer.polarity_scores(text);

  // Determine basic sentiment
  let sentimentType: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (sentiment.compound >= 0.05) {
    sentimentType = 'positive';
  } else if (sentiment.compound <= -0.05) {
    sentimentType = 'negative';
  }

  // Determine intensity
  let intensity: 'low' | 'medium' | 'high' = 'low';
  const absCompound = Math.abs(sentiment.compound);
  if (absCompound >= 0.6) {
    intensity = 'high';
  } else if (absCompound >= 0.3) {
    intensity = 'medium';
  }

  // ===== MOTIVATIONAL KEYWORDS =====
  const motivationalKeywords = [
    // === ENGLISH MOTIVATIONAL ===
    'motivate', 'inspire', 'achievement', 'success', 'dream', 'goal', 'winner', 'champion',
    'believe', 'never give up', 'you can do it', 'keep going', 'push yourself',
    'mindset', 'grind', 'hustle', 'crush it', 'beast mode', 'no excuses',
    'limit', 'potential', 'manifest', 'blessed', 'grateful', 'thankful',
    'willpower', 'perseverance', 'effort', 'struggle', 'challenge', 'overcome',
    'dedication', 'determination', 'ambition', 'drive', 'focus', 'commitment',
    'passion', 'resilience', 'tenacity', 'hard work', 'discipline', 'success story',
    'vision', 'dream big', 'push limits', 'breakthrough', 'milestone', 'growth',
    'self-improvement', 'personal development', 'motivation', 'inspiration',
    'powerful', 'mighty', 'strong', 'robust', 'vigorous', 'forceful', 'intense',
    'dominant', 'commanding', 'overwhelming', 'crushing', 'devastating', 'explosive',

    // === UKRAINIAN BASIC MOTIVATIONAL ===
    'мотивація', 'натхнення', 'досягнення', 'успіх', 'мрія', 'ціль', 'переможець', 'чемпіон',
    'вірити', 'не здавайся', 'ти зможеш', 'продовжуй', 'тисни', 'не зупиняйся',
    'мислення', 'робота', 'пашіння', 'розбити', 'режим звіра', 'без виправдань',
    'межа', 'потенціал', 'маніфест', 'благословенний', 'вдячний', 'дякую',
    'сила волі', 'наполегливість', 'старання', 'зусилля', 'боротьба', 'виклик',
    'відданість', 'рішучість', 'амбіція', 'прагнення', 'фокус', 'відданість',
    'пристрасть', 'стійкість', 'наполегливість', 'важка праця', 'дисципліна',
    'історія успіху', 'бачення', 'мрій велико', 'розширюй межі', 'прорив',
    'віхи', 'зростання', 'самовдосконалення', 'особистий розвиток',

    // === UKRAINIAN POWER WORDS (ПОТУЖНО + СИНОНІМИ) ===
    'потужно', 'потужність', 'потужний', 'потужняк', 'потужненько', 'потужніший',
    'могутній', 'могутньо', 'могутність', 'могутністю', 'наймогутніший',
    'сильний', 'сильно', 'сила', 'силач', 'найсильніший', 'пересильний',
    'міцний', 'міцно', 'міцність', 'наміцніший', 'кріпкий', 'кріпко', 'кріпак',
    'дужий', 'дужче', 'дуже', 'дужий', 'найдужчий', 'передужий',
    'здоровий', 'здорово', 'здоровенний', 'здоровило', 'здоровань',
    'двожильний', 'стожильний', 'стосилий', 'повносилий', 'багатосильний',
    'снажний', 'снага', 'снажно', 'найснажніший',
    'м\'язистий', 'м\'язуватий', 'мускулистий', 'мускулястий', 'мускулатура',
    'жилавий', 'жилястий', 'жилка', 'тривкий', 'витривалий', 'стійкий',
    'кремезний', 'кремезність', 'дебелий', 'дебелість', 'товстий',
    'важкий', 'важко', 'вага', 'важіль', 'вагомий', 'найважчий',
    'тяжкий', 'тяжко', 'тяжіння', 'тяжкість', 'найтяжчий',
    'громовий', 'громовержець', 'громобій', 'громогласний', 'громовладний',
    'гучний', 'гучно', 'найгучніший', 'гуркіт', 'гуркотіння',
    'разючий', 'разити', 'розносити', 'розгромлювати', 'розтрощувати',
    'вражаючий', 'вражати', 'враження', 'вразливий', 'невразливий',
    'уражальний', 'ураження', 'уражати', 'поражаючий', 'поразка',
    'багатий', 'багатство', 'багатенький', 'заможний', 'розкішний',
    'ґрандіозний', 'грандіозно', 'величезний', 'велетенський', 'гігантський',
    'колосальний', 'масштабний', 'монументальний', 'титанічний', 'епічний',
    'фантастичний', 'неймовірний', 'надзвичайний', 'винятковий', 'унікальний',
    'феноменальний', 'легендарний', 'історичний', 'революційний', 'прорывний',
    'ударний', 'бойовий', 'войовничий', 'боєздатний', 'непереможний',
    'нездоланний', 'незламний', 'невразливий', 'неприступний', 'незворушний',
    'стальний', 'залізний', 'алмазний', 'золотий', 'платиновий',
    'енергійний', 'динамічний', 'активний', 'діяльний', 'запальний',
    'пристрасний', 'палкий', 'жаркий', 'вогняний', 'полум\'яний',
    'блискавичний', 'швидкісний', 'стрімкий', 'потужно-швидкий', 'турбо',
    'максимальний', 'повний', 'абсолютний', 'тотальний', 'стопроцентний',
    'досконалий', 'ідеальний', 'бездоганний', 'фундаментальний', 'основний',
    'головний', 'провідний', 'панівний', 'домінуючий', 'керівний',
    'супер', 'мега', 'ультра', 'максі', 'гіпер', 'екстра', 'топ',
    'класний', 'крутий', 'офігенний', 'космічний', 'божественний',
    'царський', 'королівський', 'імператорський', 'вищий', 'найкращий',
    'первокласний', 'елітний', 'преміум', 'люкс', 'ексклюзивний',
    'професійний', 'майстерний', 'експертний', 'віртуозний', 'геніальний'
  ];

  // ===== AGGRESSIVE KEYWORDS =====
  const aggressiveKeywords = [
    // === ENGLISH AGGRESSIVE ===
    'hate', 'stupid', 'idiot', 'moron', 'dumb', 'shut up', 'stfu',
    'kill', 'die', 'death', 'murder', 'destroy', 'annihilate',
    'pathetic', 'loser', 'worthless', 'useless', 'garbage', 'trash',
    'asshole', 'bastard', 'bitch', 'jerk', 'dick', 'fuck', 'fucking',
    'shit', 'bullshit', 'crap', 'piss off', 'screw you', 'damn',

    // === UKRAINIAN AGGRESSIVE ===
    'ненавиджу', 'дурень', 'ідіот', 'дебіл', 'тупий', 'заткнись', 'мовчи',
    'вбити', 'померти', 'смерть', 'вбивство', 'знищити', 'винищити',
    'жалюгідний', 'невдаха', 'нікчемний', 'марний', 'сміття', 'відходи',
    'урод', 'покидьок', 'придурок', 'кретин', 'дурак', 'бидло', 'мразь',
    'піди на', 'йди в', 'відчепись', 'відстань', 'задовбав',
    'їбаний', 'сука', 'хуй', 'пизда', 'блядь', 'гандон', 'мудак',
    'єблан', 'підор', 'педик', 'гомик', 'трансуха', 'шалава', 'шлюха',
    'курва', 'срака', 'гівно', 'сцикло', 'мразота', 'чмо', 'гнида'
  ];

  // ===== POSITIVE EXPRESSIONS =====
  const ukrainianPositiveExpressions = [
    'супер', 'чудово', 'прекрасно', 'фантастично', 'неймовірно', 'вау',
    'класно', 'круто', 'бомбезно', 'топчик', 'огонь', 'бестіально',
    'захопливо', 'вражаюче', 'блискуче', 'геніально', 'видатно', 'неперевершено',
    'чудесно', 'божественно', 'космічно', 'магічно', 'казково', 'райсько'
  ];

  // ===== NEGATIVE EXPRESSIONS =====
  const ukrainianNegativeExpressions = [
    'погано', 'жахливо', 'страшно', 'кошмар', 'жах', 'катастрофа',
    'сумно', 'депресивно', 'ужас', 'біда', 'горе', 'нещастя',
    'відстій', 'мерзота', 'огидно', 'паскудно', 'ганьба', 'трагедія',
    'провал', 'крах', 'розруха', 'руїна', 'занепад', 'деградація'
  ];

  // ===== ANALYZE CONTENT =====
  const isMotivational = motivationalKeywords.some(keyword =>
    lowerText.includes(keyword)
  );

  const isAggressive = aggressiveKeywords.some(keyword =>
    lowerText.includes(keyword)
  );

  const hasUkrainianPositive = ukrainianPositiveExpressions.some(expr =>
    lowerText.includes(expr)
  );

  const hasUkrainianNegative = ukrainianNegativeExpressions.some(expr =>
    lowerText.includes(expr)
  );

  // Adjust sentiment based on Ukrainian expressions
  if (detectedLanguage === 'ukrainian' || detectedLanguage === 'mixed') {
    if (hasUkrainianPositive && !hasUkrainianNegative) {
      sentimentType = 'positive';
      if (intensity === 'low') intensity = 'medium';
    } else if (hasUkrainianNegative && !hasUkrainianPositive) {
      sentimentType = 'negative';
      if (intensity === 'low') intensity = 'medium';
    }
  }

  // Detect overly positive content
  const isOverlyPositive = (sentimentType === 'positive' && intensity === 'high') ||
    (sentimentType === 'positive' && isMotivational) ||
    (hasUkrainianPositive && isMotivational);

  // Detect negative content
  const isNegative = sentimentType === 'negative' || isAggressive || hasUkrainianNegative;

  // ===== DETERMINE CATEGORY =====
  let category = 'default';

  if (isOverlyPositive) {
    category = 'overly_positive';
  } else if (isNegative && isAggressive) {
    category = 'aggressive';
  } else if (isNegative) {
    category = 'negative';
  } else if (sentimentType === 'positive' && intensity === 'medium') {
    category = 'positive';
  } else if (isMotivational) {
    category = 'motivational';
  }

  // ===== FALLBACK KEYWORD CATEGORIES =====
  const keywordCategories = {
    greeting: [
      // English
      'hello', 'hi', 'hey', 'good morning', 'good evening',
      // Ukrainian
      'привіт', 'вітаю', 'добрий день', 'доброго ранку', 'добрий вечір',
      'здоров', 'здрастуйте', 'як справи', 'як діла'
    ],
    food: [
      // English
      'pizza', 'coffee', 'food', 'eat', 'hungry', 'delicious',
      // Ukrainian
      'піца', 'кава', 'їжа', 'їсти', 'голодний', 'смачно',
      'борщ', 'вареники', 'сало', 'хліб', 'м\'ясо', 'овочі'
    ],
    love: [
      // English
      'love', 'heart', 'romantic', 'valentine',
      // Ukrainian
      'кохання', 'любов', 'серце', 'романтика', 'валентинка',
      'коханий', 'кохана', 'милий', 'мила'
    ],
    sad: [
      // English
      'sad', 'cry', 'depressed', 'upset',
      // Ukrainian
      'сумний', 'плакати', 'депресія', 'засмучений',
      'смуток', 'сльози', 'горе', 'печаль'
    ],
    angry: [
      // English
      'angry', 'mad', 'furious', 'rage',
      // Ukrainian
      'злий', 'божевільний', 'лютий', 'гнів', 'бісить', 'дратує'
    ],
    funny: [
      // English
      'haha', 'lol', 'funny', 'joke', 'hilarious',
      // Ukrainian
      'хаха', 'лол', 'смішно', 'жарт', 'кумедно', 'ржу', 'угарний'
    ],
    work: [
      // English
      'work', 'job', 'office', 'meeting', 'deadline',
      // Ukrainian
      'робота', 'офіс', 'зустріч', 'дедлайн', 'завдання', 'проект'
    ],
    weather: [
      // English
      'weather', 'rain', 'sun', 'snow', 'hot', 'cold',
      // Ukrainian
      'погода', 'дощ', 'сонце', 'сніг', 'спека', 'холод', 'тепло'
    ]
  };

  // Check keyword categories if no sentiment category found
  if (category === 'default') {
    for (const [cat, keywords] of Object.entries(keywordCategories)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        category = cat;
        break;
      }
    }
  }

  // Final fallback
  if (category === 'default') {
    category = 'neutral';
  }

  return {
    category,
    sentiment: sentimentType,
    intensity,
    scores: {
      compound: sentiment.compound,
      positive: sentiment.pos,
      negative: sentiment.neg,
      neutral: sentiment.neu
    },
    isOverlyPositive,
    isNegative,
    isMotivational,
    isAggressive,
    detectedLanguage
  };
}