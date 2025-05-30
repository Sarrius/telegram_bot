import { analyzeMessage } from '../domain/messageAnalyzer';
import { emojiReactions, mentionReplies } from '../config/emoji.config';

export function getReaction(text: string): string {
  const key = analyzeMessage(text);
  const emojis = emojiReactions[key] || emojiReactions['default'];
  return emojis[Math.floor(Math.random() * emojis.length)];
}

export function getReply(text: string): string {
  const key = analyzeMessage(text);
  const replies = mentionReplies[key] || mentionReplies['default'];
  return replies[Math.floor(Math.random() * replies.length)];
} 