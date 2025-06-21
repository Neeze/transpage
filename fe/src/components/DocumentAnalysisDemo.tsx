"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import CommandBar from './CommandBar';

interface DocumentAnalysisDemoProps {
  highlightedAreas?: {
    title: string;
    description: string;
    x: string;
    y: string;
    width: string;
    height: string;
  }[];
}

const DocumentAnalysisDemo: React.FC<DocumentAnalysisDemoProps> = ({ 
  highlightedAreas = [
    { 
      title: 'Date', 
      description: 'Automatically extracted document date', 
      x: '65%', 
      y: '20%', 
      width: '25%', 
      height: '8%' 
    },
    { 
      title: 'Total Amount', 
      description: 'Extracted total amount with currency', 
      x: '70%', 
      y: '65%', 
      width: '20%', 
      height: '8%' 
    },
    { 
      title: 'Entity Name', 
      description: 'Recognized business or person name', 
      x: '15%', 
      y: '30%', 
      width: '35%', 
      height: '8%' 
    }
  ] 
}) => {
  const [activeHighlight, setActiveHighlight] = useState<number | null>(null);
  const [showAllHighlights, setShowAllHighlights] = useState(true);

  const handleHighlightHover = (index: number | null) => {
    setActiveHighlight(index);
    setShowAllHighlights(index === null);
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <h3 className="text-xl font-semibold mb-4">Interactive Document Analysis</h3>
      <p className="text-gray-600 mb-8">See how Azure AI Document Intelligence identifies and extracts key information from documents.</p>
        <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 relative">
          {/* Document toolbar */}
          <CommandBar 
            onZoomIn={() => console.log('Zoom in')}
            onZoomOut={() => console.log('Zoom out')}
            onRotate={() => console.log('Rotate')}
            onDownload={() => console.log('Download')}
            onReset={() => {
              setActiveHighlight(null);
              setShowAllHighlights(true);
            }}
          />
          
          {/* Document with highlighted areas */}
          <div className="relative border border-gray-300 rounded-md overflow-hidden bg-white">
            <Image 
              src="/images/document-demo.svg" 
              alt="Document analysis demo" 
              width={600} 
              height={400}
              className="w-full h-auto"
            />
            
            {/* Highlighted areas */}
            {highlightedAreas.map((area, index) => (
              <div 
                key={index}
                className={`absolute cursor-pointer transition-all duration-300 border-2 rounded-md ${
                  activeHighlight === index || showAllHighlights 
                    ? 'opacity-100 border-azure-blue-500' 
                    : 'opacity-0 border-transparent'
                }`}
                style={{ 
                  top: area.y, 
                  left: area.x, 
                  width: area.width, 
                  height: area.height,
                  backgroundColor: activeHighlight === index ? 'rgba(0, 120, 212, 0.2)' : 'rgba(0, 120, 212, 0.1)'
                }}
                onMouseEnter={() => handleHighlightHover(index)}
                onMouseLeave={() => handleHighlightHover(null)}
              />
            ))}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="bg-gray-50 p-6 rounded-md h-full border border-gray-200">
            <h4 className="text-lg font-medium mb-4">Extracted Information</h4>
            
            <div className="space-y-4">
              {highlightedAreas.map((area, index) => (
                <div 
                  key={index}
                  className={`p-3 border rounded-md transition-all duration-300 ${
                    activeHighlight === index || showAllHighlights
                      ? 'border-azure-blue-300 bg-azure-blue-50' 
                      : 'border-gray-200 bg-white'
                  }`}
                  onMouseEnter={() => handleHighlightHover(index)}
                  onMouseLeave={() => handleHighlightHover(null)}
                >
                  <h5 className="font-medium text-azure-blue-700">{area.title}</h5>
                  <p className="text-gray-600 text-sm">{area.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Azure AI Document Intelligence automatically identifies and extracts key information from various document types with high accuracy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentAnalysisDemo;
