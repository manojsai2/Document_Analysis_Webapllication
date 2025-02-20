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
