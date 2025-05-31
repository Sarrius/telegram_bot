#!/usr/bin/env node

// Тест перевірки стандартних налаштувань функцій
const { FeatureManager } = require('../../dist/config/featureManager');

console.log('🧪 Тестування стандартних налаштувань функцій...\n');

// Створюємо новий інстанс FeatureManager
const featureManager = FeatureManager.getInstance();

// Скидаємо до стандартних налаштувань
console.log(featureManager.resetToDefaults());
console.log('');

// Перевіряємо які функції увімкнені
console.log(featureManager.getFeatureStatus());
console.log('');

// Перевіряємо конкретно powerWords
if (featureManager.isEnabled('powerWords')) {
    console.log('✅ powerWords увімкнена (як і очікувалося)');
} else {
    console.log('❌ powerWords вимкнена (помилка!)');
}

// Перевіряємо конфігурацію
const allFeatures = featureManager.getAllFeatures();

// Функції що мають бути увімкнені (пряме звернення)
const shouldBeEnabled = ['powerWords', 'news', 'weather', 'memes', 'knowledgeSearch'];
const enabledFeatures = Object.entries(allFeatures).filter(([_, enabled]) => enabled).map(([name]) => name);

// Функції що мають бути вимкнені (моніторинг чату)
const shouldBeDisabled = ['moderation', 'memory', 'nlp', 'atmosphere', 'profanityFilter'];
const disabledFeatures = Object.entries(allFeatures).filter(([_, enabled]) => !enabled).map(([name]) => name);

console.log('🔍 Перевірка конфігурації:');
console.log(`✅ Увімкнені функції: ${enabledFeatures.join(', ')}`);
console.log(`🔴 Вимкнені функції: ${disabledFeatures.join(', ')}`);

const correctlyEnabled = shouldBeEnabled.every(feature => allFeatures[feature]);
const correctlyDisabled = shouldBeDisabled.every(feature => !allFeatures[feature]);

if (correctlyEnabled && correctlyDisabled) {
    console.log('\n✅ Конфігурація правильна!');
    console.log('📊 Моніторинг чату вимкнений, пряме звернення працює');
} else {
    console.log('\n❌ Помилка в конфігурації!');
}

console.log('\n🎯 Результат: Функції моніторингу чату вимкнені (окрім powerWords), функції прямого звернення працюють'); 