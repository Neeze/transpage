"use client";

import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Microsoft Azure logo */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <div className="w-6 h-6 mr-2">
                <svg viewBox="0 0 24 24" className="w-full h-full">
                  <path fill="#F25022" d="M11.4 0H0v11.4h11.4V0z"/>
                  <path fill="#7FBA00" d="M24 0H12.6v11.4H24V0z"/>
                  <path fill="#00A4EF" d="M11.4 12.6H0V24h11.4V12.6z"/>
                  <path fill="#FFB900" d="M24 12.6H12.6V24H24V12.6z"/>
                </svg>
              </div>
              <span className="font-semibold text-gray-800 mr-1">Microsoft</span>
              <span className="text-gray-400">|</span>
              <span className="ml-1 font-semibold text-blue-600">Azure</span>
            </div>
            
            {/* Navigation menu */}
            <nav className="hidden md:flex space-x-6">
              <Link href="#" className="text-gray-600 hover:text-gray-900 font-medium">Explore</Link>
              <Link href="#" className="text-gray-600 hover:text-gray-900 font-medium">Products</Link>
              <Link href="#" className="text-gray-600 hover:text-gray-900 font-medium">Solutions</Link>
              <Link href="#" className="text-gray-600 hover:text-gray-900 font-medium">Pricing</Link>
              <Link href="#" className="text-gray-600 hover:text-gray-900 font-medium">Partners</Link>
              <Link href="#" className="text-gray-600 hover:text-gray-900 font-medium">Resources</Link>
            </nav>
          </div>

          {/* Right side - Search and actions */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <Link href="#" className="text-gray-600 hover:text-gray-900 text-sm">Learn</Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900 text-sm">Support</Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900 text-sm">Contact Sales</Link>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium">
              Get started
            </button>
            <button className="border border-gray-300 hover:border-gray-400 px-4 py-2 rounded text-sm">
              Sign in
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
