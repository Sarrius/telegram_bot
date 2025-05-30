"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeMessage = analyzeMessage;
function analyzeMessage(text) {
    const lowered = text.toLowerCase();
    if (lowered.includes('hello'))
        return 'hello';
    if (lowered.includes('wow'))
        return 'wow';
    if (lowered.includes('sad'))
        return 'sad';
    return 'default';
}
