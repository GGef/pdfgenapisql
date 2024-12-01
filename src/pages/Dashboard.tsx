import React from 'react';
import { Link } from 'react-router-dom';
import { Database, BookTemplate, FileOutput, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { name: 'Total Imports', value: '12', change: '+2 this week' },
    { name: 'Templates Created', value: '8', change: '+3 this month' },
    { name: 'PDFs Generated', value: '147', change: '+23 this week' },
  ];

  const quickActions = [
    {
      name: 'Import Data',
      description: 'Upload new CSV files to process',
      icon: Database,
      href: '/imports',
    },
    {
      name: 'Create Template',
      description: 'Design new PDF templates',
      icon: BookTemplate,
      href: '/templates',
    },
    {
      name: 'Generate PDFs',
      description: 'Create PDFs from your data',
      icon: FileOutput,
      href: '/builder',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</dd>
              <dd className="mt-2 text-sm text-green-600">{stat.change}</dd>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {quickActions.map((action) => (
          <Link
            key={action.name}
            to={action.href}
            className="relative group bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div>
              <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                <action.icon className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900">
                {action.name}
                <ArrowRight className="inline-block ml-2 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
              </h3>
              <p className="mt-2 text-sm text-gray-500">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          <div className="mt-4 divide-y divide-gray-200">
            {/* Activity items would go here */}
            <p className="py-4 text-sm text-gray-500">No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  );
}