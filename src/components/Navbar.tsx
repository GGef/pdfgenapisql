import React from 'react';
import { useLocation } from 'react-router-dom';
import { FileSpreadsheet } from 'lucide-react';

const pageNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/imports': 'Data Imports',
  '/templates': 'Template Manager',
  '/builder': 'PDF Builder',
  '/team': 'Team Management',
  '/settings': 'Settings'
};

export default function Navbar() {
  const location = useLocation();
  const pageName = pageNames[location.pathname] || 'Dashboard';

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <FileSpreadsheet className="w-8 h-8 text-blue-600" />
            <h1 className="ml-2 text-2xl font-bold text-gray-900">{pageName}</h1>
          </div>
        </div>
      </div>
    </nav>
  );
}