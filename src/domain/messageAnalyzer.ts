export function analyzeMessage(text: string): string {
  const lowered = text.toLowerCase();
  if (lowered.includes('hello')) return 'hello';
  if (lowered.includes('wow')) return 'wow';
  if (lowered.includes('sad')) return 'sad';
  return 'default';
} 