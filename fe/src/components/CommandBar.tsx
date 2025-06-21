"use client";

import React from 'react';

interface CommandBarProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onRotate?: () => void;
  onDownload?: () => void;
  onReset?: () => void;
}

const CommandBar: React.FC<CommandBarProps> = ({
  onZoomIn = () => {},
  onZoomOut = () => {},
  onRotate = () => {},
  onDownload = () => {},
  onReset = () => {},
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-md shadow-sm flex items-center p-1 mb-4">
      <button 
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md flex items-center justify-center transition-colors"
        onClick={onZoomIn}
        title="Zoom in"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      </button>
      <button 
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md flex items-center justify-center transition-colors"
        onClick={onZoomOut}
        title="Zoom out"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
        </svg>
      </button>
      <div className="h-5 w-px bg-gray-300 mx-1"></div>
      <button 
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md flex items-center justify-center transition-colors"
        onClick={onRotate}
        title="Rotate"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
      <div className="h-5 w-px bg-gray-300 mx-1"></div>
      <button 
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md flex items-center justify-center transition-colors"
        onClick={onDownload}
        title="Download results"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>
      <div className="flex-grow"></div>
      <button 
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md flex items-center justify-center transition-colors"
        onClick={onReset}
        title="Reset view"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span className="ml-1 text-sm">Reset</span>
      </button>
    </div>
  );
};

export default CommandBar;
