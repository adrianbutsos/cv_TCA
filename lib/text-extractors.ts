/**
 * Text extractors and pattern matchers for CV data
 * Extracts structured data from raw text using regex patterns
 */

export interface ExtractedData {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedIn?: string;
  website?: string;
  title?: string;
  bio?: string;
  rawText?: string;
}

// Regular expressions for pattern matching
const patterns = {
  // Email pattern
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,

  // Phone patterns (multiple formats)
  phone: /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+\d{1,3}\s?\d{4,14}/g,

  // LinkedIn URL
  linkedIn: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-]+)/gi,

  // Website/Portfolio
  website: /https?:\/\/(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)*/gi,

  // Location patterns (City, Country or City, State)
  location: /([A-Z][a-zA-Z]+),\s*([A-Z]{2}|[A-Z][a-zA-Z]+)/g,

  // Title/Position (looks for common job titles)
  title: /(?:Senior|Junior|Mid-level|Lead|Principal|Manager|Director|Head of|VP|CTO|CEO|CFO|CMO)?\s*(?:Software Engineer|Developer|Designer|Product Manager|Data Scientist|Analyst|Manager|Consultant|Architect|Engineer|Specialist|Coordinator|Officer)/gi,

  // Education titles
  education: /(?:Bachelor|Master|Ph\.D|MBA|Associate|Certificate|Diploma)[\s\w']*(?:in|of)?[\s\w-]*/gi,

  // Name pattern - looks for capitalized words at the start
  name: /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/m,
};

/**
 * Extract email from text
 */
export function extractEmail(text: string): string | undefined {
  const matches = text.match(patterns.email);
  return matches ? matches[0] : undefined;
}

/**
 * Extract phone number from text
 */
export function extractPhone(text: string): string | undefined {
  const matches = text.match(patterns.phone);
  return matches ? matches[0].replace(/\s+/g, '') : undefined;
}

/**
 * Extract LinkedIn URL from text
 */
export function extractLinkedIn(text: string): string | undefined {
  const matches = text.match(patterns.linkedIn);
  if (matches && matches.length > 0) {
    // Clean up the match
    let url = matches[0];
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    return url;
  }
  return undefined;
}

/**
 * Extract website/portfolio from text
 */
export function extractWebsite(text: string): string | undefined {
  const matches = text.match(patterns.website);
  // Prefer non-linkedin URLs
  if (matches) {
    const nonLinkedIn = matches.find(url => !url.includes('linkedin'));
    return nonLinkedIn || matches[0];
  }
  return undefined;
}

/**
 * Extract location from text
 */
export function extractLocation(text: string): string | undefined {
  const matches = text.match(patterns.location);
  if (matches && matches.length > 0) {
    // Clean up the match
    return matches[0].trim();
  }
  return undefined;
}

/**
 * Extract job title/position from text
 */
export function extractTitle(text: string): string | undefined {
  const matches = text.match(patterns.title);
  if (matches && matches.length > 0) {
    return matches[0].trim();
  }
  return undefined;
}

/**
 * Extract name from text (looks for capitalized words at start or after common prefixes)
 */
export function extractName(text: string): string | undefined {
  // Try to find name at the beginning (first line often contains the name)
  const firstLine = text.split('\n')[0];
  
  // Remove common prefixes and patterns
  const cleanedFirstLine = firstLine
    .replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s*/i, '')
    .replace(/\b(?:Tel|Phone|Email|Address|LinkedIn|Website|Github|Contact)[\s:].*/gi, '')
    .trim();

  // Check if the first line looks like a name (2-4 capitalized words)
  const nameMatch = cleanedFirstLine.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})(?:\s|$)/);
  
  if (nameMatch && nameMatch[1].length > 2 && nameMatch[1].length < 50) {
    return nameMatch[1].trim();
  }

  return undefined;
}

/**
 * Extract a professional bio/summary from text
 */
export function extractBio(text: string): string | undefined {
  // Look for common section headers
  const bioSectionPatterns = /(?:professional\s+)?(?:summary|bio|about|overview|profile|introduction)/i;
  
  const lines = text.split('\n');
  let bioStartIndex = -1;

  // Find the bio section
  for (let i = 0; i < lines.length; i++) {
    if (bioSectionPatterns.test(lines[i])) {
      bioStartIndex = i + 1;
      break;
    }
  }

  if (bioStartIndex === -1) {
    return undefined;
  }

  // Collect lines until we hit another section header or end of text
  const sectionHeaderPattern = /(?:experience|education|skills|projects|certifications|languages|awards|references)/i;
  const bioLines = [];

  for (let i = bioStartIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Stop if we hit another section
    if (sectionHeaderPattern.test(line)) {
      break;
    }

    // Only add non-empty lines
    if (line.length > 0) {
      bioLines.push(line);
    }

    // Limit to first 500 characters or 3-4 sentences
    if (bioLines.join(' ').length > 500) {
      break;
    }
  }

  const bio = bioLines.join(' ').trim();
  return bio.length > 0 ? bio : undefined;
}

/**
 * Main extraction function - extracts all available data from text
 */
export function extractAllData(text: string): ExtractedData {
  if (!text || text.trim().length === 0) {
    return {};
  }

  return {
    name: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    location: extractLocation(text),
    linkedIn: extractLinkedIn(text),
    website: extractWebsite(text),
    title: extractTitle(text),
    bio: extractBio(text),
    rawText: text,
  };
}

/**
 * Confidence score for extracted data (0-100)
 * Higher score means more likely to be correct
 */
export function getConfidenceScore(data: ExtractedData): number {
  let score = 0;
  let fields = 0;

  if (data.name) {
    score += 20;
    fields++;
  }
  if (data.email) {
    score += 20;
    fields++;
  }
  if (data.phone) {
    score += 15;
    fields++;
  }
  if (data.location) {
    score += 15;
    fields++;
  }
  if (data.linkedIn || data.website) {
    score += 15;
    fields++;
  }
  if (data.title) {
    score += 15;
    fields++;
  }

  // Normalize to 0-100
  return Math.min(100, Math.round((score / 100) * 100));
}
