"use client";

import React from 'react';
import Image from 'next/image';

interface DemoBoxProps {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
}

const DemoBox: React.FC<DemoBoxProps> = ({ title, description, imageSrc, imageAlt, reverse = false }) => {
  return (
    <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 items-center mb-16`}>
      <div className="w-full md:w-1/2 animate-fade-in">
        <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">{title}</h3>
        <p className="text-lg text-gray-600 mb-6">{description}</p>
        <button className="text-azure-blue-600 font-medium flex items-center hover:text-azure-blue-700 transition-colors">
          Learn more
          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="w-full md:w-1/2 animate-fade-in">
        <div className="relative shadow-lg rounded-lg overflow-hidden border border-gray-100">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={600}
            height={400}
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default DemoBox;
