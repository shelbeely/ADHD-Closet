// Attribute-based Search and Filtering
// Multi-attribute queries with fuzzy matching

export interface SearchQuery {
  category?: string;
  attributes?: Record<string, any>;
  fuzzy?: boolean;
  threshold?: number; // 0-1, for fuzzy matching
}

export interface SearchResult<T> {
  item: T;
  score: number; // 0-1, relevance score
  matches: {
    attribute: string;
    value: any;
    exact: boolean;
  }[];
}

/**
 * Search items by attributes
 */
export function searchItems<T extends { category: string; attributes?: any }>(
  items: T[],
  query: SearchQuery
): SearchResult<T>[] {
  const { category, attributes, fuzzy = false, threshold = 0.7 } = query;
  
  const results: SearchResult<T>[] = [];
  
  for (const item of items) {
    // Category filter
    if (category && item.category !== category) {
      continue;
    }
    
    // Attribute matching
    if (attributes && Object.keys(attributes).length > 0) {
      const matchResult = matchAttributes(
        item.attributes || {},
        attributes,
        { fuzzy, threshold }
      );
      
      if (matchResult.score > 0) {
        results.push({
          item,
          score: matchResult.score,
          matches: matchResult.matches,
        });
      }
    } else {
      // No attribute filters, include all items in category
      results.push({
        item,
        score: 1,
        matches: [],
      });
    }
  }
  
  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  
  return results;
}

/**
 * Match item attributes against query attributes
 */
function matchAttributes(
  itemAttributes: Record<string, any>,
  queryAttributes: Record<string, any>,
  options: { fuzzy: boolean; threshold: number }
): { score: number; matches: any[] } {
  const matches: any[] = [];
  let totalScore = 0;
  const attributeCount = Object.keys(queryAttributes).length;
  
  if (attributeCount === 0) {
    return { score: 0, matches: [] };
  }
  
  for (const [key, queryValue] of Object.entries(queryAttributes)) {
    const itemValue = itemAttributes[key];
    
    if (itemValue === undefined) {
      // Attribute not present in item
      continue;
    }
    
    const matchScore = compareValues(itemValue, queryValue, options);
    
    if (matchScore > 0) {
      totalScore += matchScore;
      matches.push({
        attribute: key,
        value: itemValue,
        exact: matchScore === 1,
      });
    }
  }
  
  // Average score across all query attributes
  const score = totalScore / attributeCount;
  
  return {
    score: score >= options.threshold ? score : 0,
    matches,
  };
}

/**
 * Compare two values with optional fuzzy matching
 */
function compareValues(
  itemValue: any,
  queryValue: any,
  options: { fuzzy: boolean; threshold: number }
): number {
  // Exact match
  if (itemValue === queryValue) {
    return 1;
  }
  
  // Array matching (for multi-select attributes)
  if (Array.isArray(itemValue) && Array.isArray(queryValue)) {
    const intersection = itemValue.filter(v => queryValue.includes(v));
    return intersection.length / queryValue.length;
  }
  
  if (Array.isArray(itemValue)) {
    return itemValue.includes(queryValue) ? 1 : 0;
  }
  
  if (Array.isArray(queryValue)) {
    return queryValue.includes(itemValue) ? 1 : 0;
  }
  
  // String fuzzy matching
  if (options.fuzzy && typeof itemValue === 'string' && typeof queryValue === 'string') {
    return fuzzyMatch(itemValue, queryValue);
  }
  
  return 0;
}

/**
 * Fuzzy string matching (Levenshtein-based)
 */
function fuzzyMatch(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  const distance = levenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);
  
  return 1 - distance / maxLength;
}

/**
 * Levenshtein distance algorithm
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Find similar items based on attributes
 */
export function findSimilarItems<T extends { category: string; attributes?: any }>(
  targetItem: T,
  allItems: T[],
  options: {
    sameCategory?: boolean;
    threshold?: number;
    limit?: number;
  } = {}
): SearchResult<T>[] {
  const {
    sameCategory = true,
    threshold = 0.5,
    limit = 10,
  } = options;
  
  if (!targetItem.attributes) {
    return [];
  }
  
  const results = searchItems(allItems, {
    category: sameCategory ? targetItem.category : undefined,
    attributes: targetItem.attributes,
    fuzzy: true,
    threshold,
  });
  
  // Filter out the target item itself
  const filtered = results.filter(r => r.item !== targetItem);
  
  // Return top N results
  return filtered.slice(0, limit);
}

/**
 * Filter items by multiple criteria
 */
export function filterItems<T extends { category: string; attributes?: any }>(
  items: T[],
  filters: {
    categories?: string[];
    attributeFilters?: Array<{
      key: string;
      value: any;
      operator?: 'equals' | 'includes' | 'exists';
    }>;
  }
): T[] {
  let filtered = items;
  
  // Category filter
  if (filters.categories && filters.categories.length > 0) {
    filtered = filtered.filter(item => 
      filters.categories!.includes(item.category)
    );
  }
  
  // Attribute filters
  if (filters.attributeFilters && filters.attributeFilters.length > 0) {
    filtered = filtered.filter(item => {
      const attrs = item.attributes || {};
      
      return filters.attributeFilters!.every(filter => {
        const { key, value, operator = 'equals' } = filter;
        const itemValue = attrs[key];
        
        switch (operator) {
          case 'equals':
            return itemValue === value;
          
          case 'includes':
            if (Array.isArray(itemValue)) {
              return itemValue.includes(value);
            }
            return itemValue === value;
          
          case 'exists':
            return itemValue !== undefined && itemValue !== null;
          
          default:
            return false;
        }
      });
    });
  }
  
  return filtered;
}

/**
 * Group items by attribute value
 */
export function groupByAttribute<T extends { attributes?: any }>(
  items: T[],
  attributeKey: string
): Map<any, T[]> {
  const groups = new Map<any, T[]>();
  
  for (const item of items) {
    const value = item.attributes?.[attributeKey];
    
    if (value === undefined) {
      continue;
    }
    
    // Handle array values
    if (Array.isArray(value)) {
      for (const v of value) {
        if (!groups.has(v)) {
          groups.set(v, []);
        }
        groups.get(v)!.push(item);
      }
    } else {
      if (!groups.has(value)) {
        groups.set(value, []);
      }
      groups.get(value)!.push(item);
    }
  }
  
  return groups;
}

/**
 * Get all unique values for an attribute across items
 */
export function getUniqueAttributeValues<T extends { attributes?: any }>(
  items: T[],
  attributeKey: string
): any[] {
  const values = new Set<any>();
  
  for (const item of items) {
    const value = item.attributes?.[attributeKey];
    
    if (value === undefined) {
      continue;
    }
    
    if (Array.isArray(value)) {
      value.forEach(v => values.add(v));
    } else {
      values.add(value);
    }
  }
  
  return Array.from(values);
}
