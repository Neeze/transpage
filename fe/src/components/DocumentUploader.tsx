"use client";

import React, { useState } from 'react';

const DocumentUploader: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      // In a real app, you'd upload the file here
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadedFile(file);
      // In a real app, you'd upload the file here
    }
  };

  const resetFile = () => {
    setUploadedFile(null);
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <h3 className="text-xl font-semibold mb-4">Try it yourself</h3>
      <p className="text-gray-600 mb-6">Upload a document to see Transpage in action.</p>
      
      {!uploadedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
            isDragging ? 'bg-azure-blue-50 border-azure-blue-400' : 'border-gray-300 hover:border-azure-blue-300'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center">
            <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-gray-600 mb-4">Drag and drop your document here, or</p>
            <label className="cursor-pointer azure-button-secondary">
              Browse files
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.tiff,.docx"
                onChange={handleFileInput}
              />
            </label>
            <p className="text-xs text-gray-500 mt-4">Supported formats: PDF, JPEG, PNG, TIFF, DOCX</p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="mr-4 text-azure-blue-600">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-grow">
              <p className="font-medium">{uploadedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(uploadedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={resetFile}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mt-6">
            <button className="azure-button-primary w-full">
              Process Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;
