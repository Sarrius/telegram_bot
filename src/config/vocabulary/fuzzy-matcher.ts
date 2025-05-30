import Fuse from 'fuse.js';
import { VocabularyEntry } from './ukrainian';

export interface FuzzyMatchResult {
  word: string;
  category: string;
  intensity: 'low' | 'medium' | 'high';
  confidence: number;
  matchType: 'exact' | 'variation' | 'typo' | 'fuzzy';
  originalWord: string;
}

export class FuzzyMatcher {
  private fuseInstances: Map<string, Fuse<any>> = new Map();
  private exactMatches: Map<string, { category: string; entry: VocabularyEntry }> = new Map();

  constructor(vocabulary: Record<string, VocabularyEntry[]>) {
    this.buildMatchingDataStructures(vocabulary);
  }

  private buildMatchingDataStructures(vocabulary: Record<string, VocabularyEntry[]>) {
    // Build exact match lookup for fast exact matching
    for (const [category, entries] of Object.entries(vocabulary)) {
      for (const entry of entries) {
        // Add main word
        this.exactMatches.set(entry.word.toLowerCase(), { category, entry });
        
        // Add variations
        entry.variations.forEach(variation => {
          this.exactMatches.set(variation.toLowerCase(), { category, entry });
        });
        
        // Add common typos
        entry.commonTypos.forEach(typo => {
          this.exactMatches.set(typo.toLowerCase(), { category, entry });
        });
      }

      // Build Fuse.js instance for fuzzy matching
      const searchableItems = entries.flatMap(entry => [
        { word: entry.word, category, entry, type: 'main' },
        ...entry.variations.map(v => ({ word: v, category, entry, type: 'variation' })),
        ...entry.commonTypos.map(t => ({ word: t, category, entry, type: 'typo' }))
      ]);

      const fuse = new Fuse(searchableItems, {
        keys: ['word'],
        threshold: 0.4, // 60% similarity required
        distance: 100,
        minMatchCharLength: 2,
        includeScore: true,
        findAllMatches: false
      });

      this.fuseInstances.set(category, fuse);
    }
  }

  /**
   * Find best matches for a word with spelling tolerance
   */
  findMatches(word: string, maxResults: number = 3): FuzzyMatchResult[] {
    const lowerWord = word.toLowerCase();
    const results: FuzzyMatchResult[] = [];

    // 1. Try exact match first (fastest)
    const exactMatch = this.exactMatches.get(lowerWord);
    if (exactMatch) {
      results.push({
        word: exactMatch.entry.word,
        category: exactMatch.category,
        intensity: exactMatch.entry.intensity,
        confidence: 1.0,
        matchType: 'exact',
        originalWord: word
      });
      return results;
    }

    // 2. Try fuzzy matching across all categories
    const allMatches: Array<{
      item: any;
      score: number;
      category: string;
    }> = [];

    for (const [category, fuse] of this.fuseInstances.entries()) {
      const matches = fuse.search(lowerWord, { limit: 2 });
      matches.forEach(match => {
        allMatches.push({
          item: match.item,
          score: match.score || 0,
          category
        });
      });
    }

    // Sort by confidence (lower score = better match in Fuse.js)
    allMatches.sort((a, b) => a.score - b.score);

    // Convert to results
    allMatches.slice(0, maxResults).forEach(match => {
      const confidence = 1 - match.score; // Convert Fuse score to confidence
      let matchType: 'exact' | 'variation' | 'typo' | 'fuzzy' = 'fuzzy';
      
      if (match.item.type === 'variation') matchType = 'variation';
      else if (match.item.type === 'typo') matchType = 'typo';
      
      results.push({
        word: match.item.entry.word,
        category: match.category,
        intensity: match.item.entry.intensity,
        confidence,
        matchType,
        originalWord: word
      });
    });

    return results;
  }

  /**
   * Check if text contains words from specific categories
   */
  findCategoriesInText(text: string, minConfidence: number = 0.6): Map<string, FuzzyMatchResult[]> {
    const words = this.extractWords(text);
    const categoriesFound = new Map<string, FuzzyMatchResult[]>();

    words.forEach(word => {
      const matches = this.findMatches(word, 1);
      matches.forEach(match => {
        if (match.confidence >= minConfidence) {
          if (!categoriesFound.has(match.category)) {
            categoriesFound.set(match.category, []);
          }
          categoriesFound.get(match.category)!.push(match);
        }
      });
    });

    return categoriesFound;
  }

  /**
   * Get dominant category with confidence scores
   */
  getDominantCategory(text: string): {
    category: string;
    confidence: number;
    matches: FuzzyMatchResult[];
    totalIntensity: number;
  } | null {
    const categories = this.findCategoriesInText(text, 0.5);
    
    if (categories.size === 0) return null;

    let bestCategory = '';
    let bestScore = 0;
    let bestMatches: FuzzyMatchResult[] = [];

    for (const [category, matches] of categories.entries()) {
      // Calculate category score based on:
      // - Number of matches
      // - Average confidence
      // - Intensity weights
      const intensityWeight = { low: 1, medium: 2, high: 3 };
      
      const totalIntensity = matches.reduce((sum, match) => 
        sum + intensityWeight[match.intensity], 0
      );
      
      const avgConfidence = matches.reduce((sum, match) => 
        sum + match.confidence, 0
      ) / matches.length;
      
      const categoryScore = (matches.length * avgConfidence * totalIntensity) / matches.length;
      
      if (categoryScore > bestScore) {
        bestScore = categoryScore;
        bestCategory = category;
        bestMatches = matches;
      }
    }

    return {
      category: bestCategory,
      confidence: bestScore,
      matches: bestMatches,
      totalIntensity: bestMatches.reduce((sum, match) => 
        sum + ({ low: 1, medium: 2, high: 3 })[match.intensity], 0
      )
    };
  }

  /**
   * Extract words from text, handling Ukrainian and English
   */
  private extractWords(text: string): string[] {
    // Split by whitespace and punctuation, keep words with Ukrainian/English chars
    return text
      .toLowerCase()
      .split(/[\s.,!?;:()\[\]{}""''«»„"]+/)
      .filter(word => word.length >= 2 && /[а-яіїєґa-z]/.test(word))
      .map(word => word.replace(/[^\wа-яіїєґ]/g, ''))
      .filter(word => word.length >= 2);
  }

  /**
   * Get statistics about vocabulary coverage
   */
  getStats(): {
    totalWords: number;
    categoryCounts: Record<string, number>;
    avgWordsPerCategory: number;
  } {
    const categoryCounts: Record<string, number> = {};
    let totalWords = 0;

    for (const [category] of this.fuseInstances.entries()) {
      // Count from exact matches instead (more reliable)
      const count = Array.from(this.exactMatches.entries())
        .filter(([_, data]) => data.category === category).length;
      categoryCounts[category] = count;
      totalWords += count;
    }

    return {
      totalWords,
      categoryCounts,
      avgWordsPerCategory: totalWords / Object.keys(categoryCounts).length || 0
    };
  }
} 