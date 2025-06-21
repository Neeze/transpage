"use client";

import React from 'react';

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  ctaText?: string;
  ctaLink?: string;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  description,
  features,
  isPopular = false,
  ctaText = "Get started",
}) => {
  return (
    <div className={`
      bg-white rounded-lg shadow-sm border p-6
      transition-all duration-300 hover:shadow-md
      ${isPopular ? 'border-azure-blue-500 relative' : 'border-gray-200'}
    `}>
      {isPopular && (
        <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
          <span className="bg-azure-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            Popular
          </span>
        </div>
      )}
      
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <div className="mb-4">
        <span className="text-3xl font-bold">{price}</span>
        {price !== 'Free' && <span className="text-gray-600">/month</span>}
      </div>
      
      <p className="text-gray-600 mb-6">{description}</p>
      
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg className="w-5 h-5 text-azure-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
        <button 
        className={`w-full py-3 px-4 rounded-md font-medium transition-colors duration-200 ${
          title === 'Free' 
            ? 'bg-white border border-blue-600 hover:bg-blue-50 text-blue-600' 
            : isPopular 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-white border border-blue-600 hover:bg-blue-50 text-blue-600'
        }`}
      >
        {ctaText}
      </button>
    </div>
  );
};

export default PricingCard;
