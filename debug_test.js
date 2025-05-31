const { LearningEngine } = require('./dist/domain/learningEngine');
const { ReactionSelector } = require('./dist/usecases/reactionSelector');
const { FuzzyMatcher } = require('./dist/config/vocabulary/fuzzy-matcher');
const { ukrainianVocabulary } = require('./dist/config/vocabulary/ukrainian');

async function debugTest() {
  console.log('🔍 Starting debug test...');
  
  const learningEngine = new LearningEngine();
  const fuzzyMatcher = new FuzzyMatcher(ukrainianVocabulary);
  const reactionSelector = new ReactionSelector(learningEngine, fuzzyMatcher);
  
  const context = {
    messageContent: 'Супер мотивація сьогодні!',
    sentiment: 'overly_positive',
    keywords: ['супер', 'мотивація'],
    intensity: 'high',
    userId: 'new-user-123',
    chatId: 'chat-789',
    isGroupChat: true
  };
  
  console.log('🎯 Testing with context:', context);
  
  try {
    const result = await reactionSelector.selectReaction(context);
    console.log('✅ Result:', result);
    console.log('🔍 learningPatternId:', result.learningPatternId);
    console.log('🔍 learningPatternId type:', typeof result.learningPatternId);
    console.log('🔍 learningPatternId defined?', result.learningPatternId !== undefined);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugTest(); 