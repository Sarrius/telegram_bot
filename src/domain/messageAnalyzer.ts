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
}

export function analyzeMessage(text: string): string {
  const analysis = analyzeMessageDetailed(text);
  return analysis.category;
}

export function analyzeMessageDetailed(text: string): SentimentAnalysis {
  const lowerText = text.toLowerCase();
  
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
  
  // Check for motivational keywords
  const motivationalKeywords = [
    'motivat', 'inspir', 'achiev', 'success', 'dream', 'goal', 'winner', 'champion',
    'believe', 'never give up', 'you can do it', 'keep going', 'push yourself',
    'mindset', 'grind', 'hustle', 'crush it', 'beast mode', 'no excuses',
    'limit', 'potential', 'manifest', 'blessed', 'grateful', 'thankful'
  ];
  
  const isMotivational = motivationalKeywords.some(keyword => 
    lowerText.includes(keyword)
  );
  
  // Check for aggressive keywords
  const aggressiveKeywords = [
    'hate', 'stupid', 'idiot', 'moron', 'dumb', 'shut up', 'stfu',
    'kill', 'die', 'death', 'murder', 'destroy', 'annihilate',
    'pathetic', 'loser', 'worthless', 'useless', 'garbage', 'trash'
  ];
  
  const isAggressive = aggressiveKeywords.some(keyword => 
    lowerText.includes(keyword)
  );
  
  // Detect overly positive (high positive sentiment + motivational keywords)
  const isOverlyPositive = sentimentType === 'positive' && 
                          intensity === 'high' && 
                          (isMotivational || sentiment.compound > 0.7);
  
  // Detect negative sentiment or aggressive content
  const isNegative = sentimentType === 'negative' || isAggressive;
  
  // Determine category based on analysis
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
  
  // Check for existing keyword categories (maintain compatibility)
  const keywordCategories = {
    greeting: ['hello', 'hi', 'hey', 'good morning', 'good evening'],
    food: ['pizza', 'coffee', 'food', 'eat', 'hungry', 'delicious'],
    love: ['love', 'heart', 'romantic', 'valentine'],
    sad: ['sad', 'cry', 'depressed', 'upset'],
    angry: ['angry', 'mad', 'furious', 'rage'],
    funny: ['haha', 'lol', 'funny', 'joke', 'hilarious'],
    work: ['work', 'job', 'office', 'meeting', 'deadline'],
    weather: ['weather', 'rain', 'sun', 'snow', 'hot', 'cold']
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
    isAggressive
  };
} 