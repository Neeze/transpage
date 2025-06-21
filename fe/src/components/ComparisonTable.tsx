"use client";

import React from 'react';

const ComparisonTable: React.FC = () => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Feature
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Free tier
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Standard tier
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Premium tier
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              Document pages
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              500 pages/month
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              2,500 pages/month
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              5,000 pages/month
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              Custom document models
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              Up to 5 models
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              Up to 15 models
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              Data extraction
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              Basic
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              Advanced
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              Advanced + Custom
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              SLA
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              99.9%
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              99.99%
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;
