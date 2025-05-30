"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReaction = getReaction;
exports.getReply = getReply;
const messageAnalyzer_1 = require("../domain/messageAnalyzer");
const emoji_config_1 = require("../config/emoji.config");
function getReaction(text) {
    const key = (0, messageAnalyzer_1.analyzeMessage)(text);
    const emojis = emoji_config_1.emojiReactions[key] || emoji_config_1.emojiReactions['default'];
    return emojis[Math.floor(Math.random() * emojis.length)];
}
function getReply(text) {
    const key = (0, messageAnalyzer_1.analyzeMessage)(text);
    const replies = emoji_config_1.mentionReplies[key] || emoji_config_1.mentionReplies['default'];
    return replies[Math.floor(Math.random() * replies.length)];
}
