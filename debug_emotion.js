const { MessageHandler } = require('./dist/usecases/handleMessage');

async function debugEmotionalAnalysis() {
  const messageHandler = new MessageHandler();
  
  const context = {
    text: 'Ще більше мотивації!',
    userId: 'test123',
    chatId: 'cooldown-test-chat',
    userName: 'TestUser',
    isGroupChat: true,
    messageId: 12345,
    isReplyToBot: false,
    mentionsBot: false
  };

  console.log(`\n🧪 Testing message: "${context.text}"`);
  console.log('==========================================');
  
  const response = await messageHandler.handleMessage(context);
  
  console.log('\n📊 Analysis Results:');
  console.log(`shouldReact: ${response.shouldReact}`);
  console.log(`confidence: ${(response.confidence * 100).toFixed(1)}%`);
  console.log(`reasoning: ${response.reasoning}`);
  
  if (response.emotionalProfile) {
    console.log('\n🧠 Emotional Profile:');
    console.log(`dominantEmotion: ${response.emotionalProfile.dominantEmotion}`);
    console.log(`intensity: ${(response.emotionalProfile.intensity * 100).toFixed(1)}%`);
    console.log(`clarity: ${(response.emotionalProfile.clarity * 100).toFixed(1)}%`);
    console.log(`emotionalWords: [${response.emotionalProfile.emotionalWords.join(', ')}]`);
  }
  
  // Get analyzer stats
  const stats = messageHandler.getStats();
  console.log('\n⚙️ Thresholds:');
  console.log(`minimumIntensity: ${(stats.emotional.thresholds.minimumIntensity * 100).toFixed(1)}%`);
  console.log(`minimumClarity: ${(stats.emotional.thresholds.minimumClarity * 100).toFixed(1)}%`);
  console.log(`minimumConfidence: ${(stats.emotional.thresholds.minimumConfidence * 100).toFixed(1)}%`);
}

debugEmotionalAnalysis().catch(console.error); 