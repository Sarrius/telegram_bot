const { FuzzyMatcher } = require('./dist/config/vocabulary/fuzzy-matcher');
const { ukrainianVocabulary } = require('./dist/config/vocabulary/ukrainian');

function debugFuzzyMatching() {
  const fuzzyMatcher = new FuzzyMatcher(ukrainianVocabulary);
  
  const testWords = ['мотіваця', 'мотивація123!@#'];
  
  console.log('🧪 Testing failing fuzzy matches:');
  console.log('==========================================');
  
  testWords.forEach(word => {
    console.log(`\n🔍 Testing word: "${word}"`);
    const matches = fuzzyMatcher.findMatches(word, 3);
    console.log(`Found ${matches.length} matches:`);
    matches.forEach(match => {
      console.log(`  - ${match.word} (${match.category}) confidence: ${(match.confidence * 100).toFixed(1)}%`);
    });
  });
}

debugFuzzyMatching(); 