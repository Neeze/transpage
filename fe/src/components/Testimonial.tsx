"use client";

import React from 'react';
import Image from 'next/image';

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  logoSrc: string;
}

const Testimonial: React.FC<TestimonialProps> = ({ quote, author, role, company, logoSrc }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
      <div className="h-16 flex items-center mb-4">
        <Image
          src={logoSrc}
          alt={company}
          width={120}
          height={40}
          className="object-contain"
        />
      </div>
      <p className="text-gray-700 italic mb-6">"{quote}"</p>
      <div className="flex items-start">
        <div>
          <p className="font-semibold text-gray-900">{author}</p>
          <p className="text-gray-600 text-sm">{role}, {company}</p>
        </div>
      </div>
    </div>
  );
};

export default Testimonial;
