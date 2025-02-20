/**
 * App.jsx
 * 
 * Frontend for PDF Text Analyzer.
 * Allows users to upload a PDF, sends it to the backend for analysis,
 * and displays text statistics along with the top word frequencies.
 */

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';

/**
 * FileUpload component
 * Provides a drag-and-drop interface for uploading PDF files.
 *
 * @param {Function} onUpload - Callback function invoked with the selected file.
 */
function FileUpload({ onUpload }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {'application/pdf': ['.pdf']},
    multiple: false,
    onDrop: files => files[0] && onUpload(files[0])
  });

  return (
    <div {...getRootProps()} className={`p-8 border-4 border-dashed rounded-xl text-center cursor-pointer 
      ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
      <input {...getInputProps()} />
      <p className="text-lg">
        {isDragActive ? 'Drop PDF here' : 'Drag & drop PDF, or click to select'}
      </p>
      <p className="text-sm text-gray-500 mt-2">Max file size: 10MB</p>
    </div>
  );
}

/**
 * StatsCard component
 * Displays a single statistic (title and value).
 *
 * @param {string} title - The statistic title.
 * @param {string|number} value - The statistic value.
 */
function StatsCard({ title, value }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md border border-gray-100">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

/**
 * Main App component
 * Manages file upload state, triggers the analysis request,
 * and displays the results including text statistics and word frequency.
 */
export default function App() {
  const [stats, setStats] = useState(null);
  const [wordFrequency, setWordFrequency] = useState([]);
  const [loading, setLoading] = useState(false);

  /**
   * handleUpload
   * Handles the file upload process and API communication.
   *
   * @param {File} file - The uploaded PDF file.
   */
  const handleUpload = async (file) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      // Post the file to the backend for analysis
      const response = await axios.post('http://localhost:5000/api/analyze', formData);
      
      setStats(response.data.stats);
      setWordFrequency(response.data.wordFrequency);
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Toaster position="top-right" />
        <h1 className="text-3xl font-bold text-gray-900 mb-8">PDF Text Analyzer</h1>

        <FileUpload onUpload={handleUpload} />

        {loading && (
          <div className="mt-8 text-center text-gray-600">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            <p className="mt-4">Processing document...</p>
          </div>
        )}

        {stats && (
          <div className="mt-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard title="Word Count" value={stats.wordCount} />
              <StatsCard title="Characters (with spaces)" value={stats.charCount} />
              <StatsCard title="Characters (no spaces)" value={stats.charCountWithoutSpaces} />
              <StatsCard title="Sentence Count" value={stats.sentenceCount} />
              <StatsCard title="Avg. Word Length" value={stats.avgWordLength?.toFixed(1)} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Top 20 Words</h2>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="stopwords" 
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="stopwords" className="text-sm">Exclude common words</label>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {wordFrequency.map(([word, count], index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{word}</span>
                    <span className="text-blue-600 font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
