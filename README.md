# PDF Text Analyzer

A web application that extracts and analyzes text from PDF files. It processes uploaded PDFs, extracts text using direct parsing (with a fallback to OCR), calculates text statistics (word count, character count, sentence count, etc.), and displays the top 20 most frequent words.

## Features

- **File Upload:** Supports PDF uploads up to 10MB.
- **Text Extraction:** Uses `pdf-parse` for direct extraction and Tesseract.js for OCR fallback.
- **Text Statistics:** Calculates word count, character count (with and without spaces), sentence count, and average word length.
- **Word Frequency:** Displays the top 20 words (excluding common stop words).

## Setup Instructions

### Prerequisites

- Node.js (v12+)
- npm

### Installation

#### Backend Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/pdf-text-analyzer.git
   cd pdf-text-analyzer/backend
2. **Install the required backend modules:**

   ```bash
   npm install express multer cors pdf-parse pdf-to-img tesseract.js

3.**Start the backend server:**
   bash
   npm start
**The backend server will start on port 5000.**

#### Frontend Setup
1.**Navigate to the frontend directory:**

   bash
   cd ../frontend

2.**Install the required frontend modules:**
   bash
   npm install react react-dom react-dropzone react-hot-toast axios

3.**Start the frontend:**
   bash

   npm start
**The frontend will run on port 5173 by default.**

# API Documentation

## POST /api/analyze

**Description:**  
Analyzes the uploaded PDF and returns text statistics and word frequency.

---

### Request

- **Content-Type:** `multipart/form-data`
- **Parameter:**  
  - `file` (PDF file to be analyzed)

---

### Response

- **stats:** An object containing:
  - `wordCount`
  - `charCount`
  - `charCountWithoutSpaces`
  - `sentenceCount`
  - `avgWordLength`
- **wordFrequency:** An array of `[word, frequency]` pairs (top 20 words).

---

### Error Responses

- **400:** No file uploaded or wrong file type.
- **500:** Internal server error during processing.

---

# Design Decisions & Trade-offs

## Text Extraction Method

- The app attempts direct extraction with `pdf-parse` first for efficiency.
- If that fails (e.g., for scanned documents), it falls back to OCR with `Tesseract.js`.
- This trade-off balances speed with robustness.

## File Size Limit

- A 10MB limit is set to prevent performance issues and memory overload during processing.

## Frontend/Backend Separation

- Separating the frontend and backend increases maintainability.
- However, it requires managing CORS and deploying two separate services.

---

# Future Improvements

- **Enhanced Stop Words:**  
  Expand and customize the stop words list for improved word frequency accuracy.
- **Progress Indicators:**  
  Implement detailed progress updates during OCR processing.
- **Parallel Processing:**  
  Optimize OCR performance with parallel processing techniques.
- **Error Logging:**  
  Integrate better error logging and monitoring for production use.
- **Multi-format Support:**  
  Extend support to other document formats (e.g., DOCX).
