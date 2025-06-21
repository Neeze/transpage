"use client";

import React from 'react';
import Image from 'next/image';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, delay = 0 }) => {
  return (
    <div 
      className="group bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:border-azure-blue-300 hover:shadow-md transition-all duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-azure-blue-50 rounded-md flex items-center justify-center text-azure-blue-600 mr-3">
          {icon && (
            <Image 
              src={icon} 
              alt={title} 
              width={24} 
              height={24} 
              className="object-contain" 
            />
          )}
        </div>
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
      <div className="mt-4">
        <button className="text-azure-blue-600 font-medium flex items-center group-hover:text-azure-blue-700">
          Learn more
          <svg className="ml-1 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FeatureCard;
