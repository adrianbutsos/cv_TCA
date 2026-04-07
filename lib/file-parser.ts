/**
 * File parser - Handles extraction of text from various file formats
 * Supports: PDF, DOCX, TXT, Images (with OCR)
 */

import { Packer, Document } from 'docx';

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
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set up the worker
    const pdfWorker = await import('pdfjs-dist/build/pdf.worker');
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
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
    const Tesseract = await import('tesseract.js');

    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = async (e) => {
        try {
          const imageSrc = e.target?.result as string;
          
          // Use Tesseract to extract text
          const { data: { text } } = await Tesseract.recognize(imageSrc, 'eng');
          resolve(text);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('[v0] Error parsing image:', error);
    throw new Error('Failed to extract text from image. Please try with a clearer image.');
  }
}

/**
 * Main parser function - detects file type and parses accordingly
 */
export async function parseFile(file: File): Promise<string> {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  console.log('[v0] Parsing file:', fileName, 'Type:', fileType);

  try {
    // PDF files
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await parsePdfFile(file);
    }

    // DOCX files
    if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      return await parseDocxFile(file);
    }

    // Text files
    if (
      fileType.includes('text') ||
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
