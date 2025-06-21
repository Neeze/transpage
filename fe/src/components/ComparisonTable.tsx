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
              5,000 pages/month
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
               Document model
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Standard model
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Advanced model
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
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;
