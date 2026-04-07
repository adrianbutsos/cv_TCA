/**
 * File parser - Handles extraction of text from various file formats
 * Supports: PDF, DOCX, TXT, Images (with OCR)
 */

/**
 * Parse text file
 */
export async function parseTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text || '');
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Parse PDF file using pdfjs-dist
 */
export async function parsePdfFile(file: File): Promise<string> {
  try {
    // Dynamically import pdfjs-dist
    const pdfModule = await import('pdfjs-dist');
    const pdfjsLib = pdfModule.default || pdfModule;
    
    // Set worker source
    if (typeof window !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => (item.str || ''))
          .join(' ');
        fullText += pageText + '\n';
      } catch (pageError) {
        console.warn(`[v0] Error processing page ${i}:`, pageError);
        // Continue with next page if one fails
      }
    }

    return fullText.trim() || 'No text found in PDF';
  } catch (error) {
    console.error('[v0] Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file. Please ensure it\'s a valid PDF.');
  }
}

/**
 * Parse DOCX file using mammoth
 */
export async function parseDocxFile(file: File): Promise<string> {
  try {
    // Dynamically import mammoth
    const mammoth = await import('mammoth');

    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    return result.value;
  } catch (error) {
    console.error('[v0] Error parsing DOCX:', error);
    throw new Error('Failed to parse DOCX file. Please ensure it\'s a valid Word document.');
  }
}

/**
 * Parse image file using Tesseract OCR
 */
export async function parseImageFile(file: File): Promise<string> {
  try {
    // Dynamically import tesseract
    const TesseractModule = await import('tesseract.js');
    const Tesseract = TesseractModule.default || TesseractModule;

    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = async (e) => {
        try {
          const imageSrc = e.target?.result as string;
          
          // Use Tesseract to extract text
          const worker = await Tesseract.createWorker('eng');
          const { data: { text } } = await worker.recognize(imageSrc);
          await worker.terminate();
          
          resolve(text || 'No text detected in image');
        } catch (error) {
          console.warn('[v0] OCR failed, returning empty:', error);
          resolve(''); // Return empty instead of throwing for images
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('[v0] Error parsing image:', error);
    // Don't throw - OCR is optional, return empty string
    return '';
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
