/**
 * server.cjs
 * 
 * Backend for PDF Text Analyzer.
 * This server handles file uploads, extracts text from PDFs (using pdf-parse and OCR fallback with Tesseract),
 * calculates text statistics and word frequency, then returns the results as JSON.
 *
 * Dependencies: express, multer, cors, pdf-parse, pdf-to-img, tesseract.js
 *
 * Setup:
 *  - Install dependencies: npm install express multer cors pdf-parse pdf-to-img tesseract.js
 *  - Start the server: node server.js
 */

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');

const app = express();

// Enable CORS for the frontend running at http://localhost:5173
app.use(cors({
  origin: 'http://localhost:5173' // Ensure this matches your frontend port
}));

// Dynamically import pdf-to-img to convert PDF pages to images for OCR fallback
let fromBuffer;
(async () => {
  try {
    const pdfToImg = await import('pdf-to-img');
    fromBuffer = pdfToImg.fromBuffer;
  } catch (error) {
    console.error('Failed to load pdf-to-img:', error);
    process.exit(1);
  }
})();

// Configure multer for file uploads (memory storage and file size limit of 10MB)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * calculateStats
 * Calculates various text statistics such as word count, character count,
 * sentence count, and average word length.
 *
 * @param {string} text - The input text from the PDF.
 * @returns {object} - Statistics object.
 */
function calculateStats(text) {
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  const charCountWithoutSpaces = text.replace(/\s/g, '').length;

  return {
    wordCount: words.length,
    charCount: text.length,
    charCountWithoutSpaces,
    sentenceCount: sentences.length,
    avgWordLength: words.reduce((acc, word) => acc + word.length, 0) / words.length || 0
  };
}

/**
 * calculateWordFrequency
 * Computes the frequency of words in the text while excluding common stop words.
 *
 * @param {string} text - The input text from the PDF.
 * @returns {Array} - Array of [word, frequency] pairs, sorted in descending order.
 */
function calculateWordFrequency(text) {
  const stopWords = new Set(['the', 'and', 'is', 'in', 'to', 'of']); // Extend as needed
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const frequency = {};

  words.forEach(word => {
    if (!stopWords.has(word)) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  });

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
}

/**
 * processPDF
 * Processes the PDF file buffer. Attempts to extract text directly, and if
 * insufficient text is found, falls back to OCR using Tesseract.js.
 *
 * @param {Buffer} buffer - The PDF file buffer.
 * @returns {Promise<string>} - The extracted text.
 */
async function processPDF(buffer) {
  try {
    // Attempt direct text extraction
    const pdfText = await pdfParse(buffer);
    if (pdfText.text.trim().length > 50) return pdfText.text;

    // Fallback to OCR: convert each page to an image and run OCR
    const pages = await fromBuffer(buffer);
    let fullText = '';
    
    for (const page of pages) {
      const { data: { text } } = await Tesseract.recognize(
        await page.data,
        'eng'
      );
      fullText += text + '\n';
    }
    
    return fullText;
  } catch (error) {
    throw new Error(`Processing failed: ${error.message}`);
  }
}

// API Endpoint for analyzing the PDF file
app.post('/api/analyze', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files allowed' });
    }

    // Extract text from the PDF and compute statistics
    const text = await processPDF(req.file.buffer);
    const stats = calculateStats(text);
    const wordFrequency = calculateWordFrequency(text);

    res.json({ stats, wordFrequency });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
