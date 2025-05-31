#!/usr/bin/env node

// Тест виключно для слів-синонімів "потужно"
const { PotuzhnoPowerWordsDetector } = require('../../dist/domain/potuzhnoPowerWordsDetector');

console.log('⚡ Тестування слів-синонімів "ПОТУЖНО"');
console.log('='.repeat(50));

const detector = new PotuzhnoPowerWordsDetector();

// Слова-синоніми "потужно" які мають спрацьовувати
const potuzhnоSynonyms = [
    'потужно',
    'потужний',  
    'потужно працює',
    'супер',
    'супер результат',
    'мега',
    'мега крутий',
    'ультра',
    'ультра швидко',
    'топ',
    'топ робота',
    'могутній',
    'могутньо',
    'сильний',
    'сильно',
    'міцний',
    'міцно',
    'енергійний',
    'енергійно',
    'динамічний',
    'динамічно',
    'вогняний',
    'блискавичний',
    'крутий',
    'круто',
    'класний',
    'класно',
    'офігенний',
    'офігенно',
    'бомбезний',
    'неймовірний',
    'неймовірно'
];

// Тестуємо кожне слово
console.log('🔍 Тестування детектування:');
console.log('');

let successCount = 0;
let totalCount = potuzhnоSynonyms.length;

potuzhnоSynonyms.forEach(word => {
    const bestMatch = detector.getBestPowerWordMatch(word);
    
    if (bestMatch) {
        const emoji = detector.getReactionEmoji(bestMatch);
        console.log(`✅ "${word}"`);
        console.log(`   Виявлено: "${bestMatch.matchedWord}"`);
        console.log(`   Впевненість: ${(bestMatch.confidence * 100).toFixed(1)}%`);
        console.log(`   Реакція: ${emoji}`);
        console.log(`   Категорія: ${bestMatch.category}`);
        successCount++;
    } else {
        console.log(`❌ "${word}" - НЕ ВИЯВЛЕНО!`);
    }
    console.log('');
});

console.log('📊 РЕЗУЛЬТАТИ:');
console.log(`✅ Успішно: ${successCount}/${totalCount} (${(successCount/totalCount*100).toFixed(1)}%)`);
console.log(`❌ Пропущено: ${totalCount - successCount}/${totalCount}`);

if (successCount === totalCount) {
    console.log('🎉 ВСІХ СЛІВ ВИЯВЛЕНО! Детектор працює ідеально.');
} else if (successCount > totalCount * 0.8) {
    console.log('👍 Більшість слів виявлено. Детектор працює добре.');
} else {
    console.log('⚠️ Багато слів пропущено. Потрібно покращити детектор.');
}

console.log('');
console.log('🎯 Це тест саме для слів-синонімів "потужно"');
console.log('⚡ Якщо всі слова виявляються - реакції мають працювати в Telegram!'); 