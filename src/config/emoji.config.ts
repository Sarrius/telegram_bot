// === Кастомізуй тут! ===
// Додавай свої слова і емодзі у форматі:
//   слово: ['емодзі1', 'емодзі2', ...]
// Якщо слово зустрічається в повідомленні — бот вибере одну з емодзі.
// Якщо слова немає — використає default.

export const emojiReactions: Record<string, string[]> = {
  hello: ['👋', '😊'],
  wow: ['😮', '🤩'],
  sad: ['😢', '😔'],
  pizza: ['🍕', '😋'],
  love: ['❤️', '😍'],
  cat: ['🐱', '😺'],
  dog: ['🐶', '🐕'],
  сонце: ['☀️', '🌞'], // українське слово
  кава: ['☕', '😍'], // українське слово
  default: ['👍', '😄', '😂', '🔥', '🥳']
};

export const mentionReplies: Record<string, string[]> = {
  hello: ['Hello! 👋', 'Hi there!'],
  wow: ['Wow indeed! 🤩', 'Amazing!'],
  sad: ['Don\'t be sad! 😊', 'Cheer up!'],
  pizza: ['Mmm, pizza! 🍕', 'Who wants a slice?'],
  love: ['Love is in the air! ❤️', 'Aww!'],
  cat: ['Meow! 🐱', 'Cats are awesome!'],
  dog: ['Woof! 🐶', 'Dogs are the best!'],
  сонце: ['Сонячного дня! ☀️', 'Більше сонця! 🌞'],
  кава: ['Кава заряджає! ☕', 'Час кави!'],
  default: ['How can I help?', 'Yes?']
}; 