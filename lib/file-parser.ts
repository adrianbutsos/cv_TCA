/**
 * File parser - Handles extraction of text from various file formats
 * Supports: PDF, DOCX, TXT, Images (with OCR)
 * 
 * Note: PDF and Tesseract modules are imported dynamically to avoid
 * bundling large client-side libraries unnecessarily.
 */

/**
 * Parse text file - lightweight, always available
 */
export async function parseTextFile(file: File): Promise<string> {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text || '');
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  } catch (error) {
    console.error('[v0] Error parsing text file:', error);
    return '';
  }
}

/**
 * Parse PDF file using pdfjs-dist
 * This function uses dynamic imports to avoid bundling pdfjs in all clients
 */
export async function parsePdfFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Use a simple PDF extraction library approach instead of full pdfjs
    // For now, attempt to extract text from the binary PDF
    const dataView = new Uint8Array(arrayBuffer);
    let text = '';

    // Simple text extraction from PDF - looks for text streams
    const str = String.fromCharCode(...Array.from(dataView));
    
    // Extract text between BT...ET markers (basic PDF text operators)
    const matches = str.match(/BT([\s\S]*?)ET/g) || [];
    if (matches) {
      matches.forEach(match => {
        // Extract text from Tj and TJ operators
        const textMatches = match.match(/\((.*?)\)/g);
        if (textMatches) {
          textMatches.forEach(tm => {
            const cleanText = tm.replace(/[()\\]/g, '');
            text += cleanText + ' ';
          });
        }
      });
    }

    if (text.trim()) {
      return text.trim();
    }

    // Fallback: extract any readable text
    const readableText = str
      .replace(/[^\x20-\x7E\n]/g, '')
      .split('\n')
      .filter(line => line.trim().length > 3)
      .join('\n');

    return readableText || 'Unable to extract text from PDF. The PDF may be scanned or image-based.';
  } catch (error) {
    console.error('[v0] Error parsing PDF:', error);
    return 'Unable to parse PDF file.';
  }
}

/**
 * Parse DOCX file using mammoth
 * Dynamic import to avoid bundling mammoth when not needed
 */
export async function parseDocxFile(file: File): Promise<string> {
  try {
    // Dynamically import mammoth only when needed
    const { extractRawText } = await import('mammoth');

    const arrayBuffer = await file.arrayBuffer();
    const result = await extractRawText({ arrayBuffer });
    
    return result.value || '';
  } catch (error) {
    console.error('[v0] Error parsing DOCX:', error);
    return 'Unable to parse DOCX file.';
  }
}

/**
 * Parse image file using Tesseract OCR
 * This is optional and returns empty string on failure rather than throwing
 */
export async function parseImageFile(file: File): Promise<string> {
  try {
    // Try to dynamically import Tesseract, but don't fail the whole upload if it's not available
    const { createWorker } = await import('tesseract.js');

    const reader = new FileReader();
    
    return new Promise((resolve) => {
      reader.onload = async (e) => {
        try {
          const imageSrc = e.target?.result as string;
          
          const worker = await createWorker('eng');
          const { data: { text } } = await worker.recognize(imageSrc);
          await worker.terminate();
          
          resolve(text || '');
        } catch (error) {
          console.warn('[v0] OCR failed (optional feature):', error);
          resolve(''); // Return empty on OCR failure - it's optional
        }
      };
      reader.onerror = () => resolve(''); // Fail silently for images
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.warn('[v0] Tesseract not available (optional feature)');
    return ''; // OCR is optional
  }
}

/**
 * Main parser function - detects file type and parses accordingly
 */
export async function parseFile(file: File): Promise<string> {
  // Validate file size (max 50MB)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File is too large. Maximum size is 50MB.');
  }

  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  console.log('[v0] Parsing file:', fileName, 'Type:', fileType, 'Size:', file.size);

  try {
    // PDF files
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await parsePdfFile(file);
    }

    // DOCX files
    if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/msword' ||
      fileName.endsWith('.docx') ||
      fileName.endsWith('.doc')
    ) {
      return await parseDocxFile(file);
    }

    // Text files
    if (
      fileType.includes('text') ||
      fileType === 'application/plain' ||
      fileName.endsWith('.txt') ||
      fileName.endsWith('.md')
    ) {
      return await parseTextFile(file);
    }

    // Image files (PNG, JPG, etc.)
    if (fileType.includes('image')) {
      return await parseImageFile(file);
    }

    // Fallback: try to read as text
    console.log('[v0] File type unknown, attempting text parse as fallback');
    return await parseTextFile(file);
  } catch (error) {
    console.error('[v0] Error parsing file:', error);
    throw error;
  }
}

/**
 * Get supported file types for upload
 */
export function getSupportedFileTypes(): string {
  return '.pdf,.docx,.doc,.txt,.md,.png,.jpg,.jpeg,.gif,.bmp';
}

/**
 * Get user-friendly supported formats text
 */
export function getSupportedFormatsText(): string {
  return 'PDF, Word (DOCX), Text, Images (PNG, JPG, etc.)';
}
