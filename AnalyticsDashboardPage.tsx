import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../lib/apiClient';
import {
  ChartBarIcon,
  UserGroupIcon,
  EnvelopeIcon,
  PhoneIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

export default function AnalyticsDashboardPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', period],
    queryFn: () => analyticsApi.getOverview(),
  });

  const statCards = [
    {
      title: 'Leads Generated',
      value: analytics?.leads?.generated || 0,
      subtitle: `${analytics?.leads?.consumed || 0} consumed`,
      icon: UserGroupIcon,
      color: 'bg-blue-500',
    },
    {
      title: 'Emails Sent',
      value: analytics?.emails?.sent || 0,
      subtitle: `${analytics?.emails?.opened || 0} opened`,
      icon: EnvelopeIcon,
      color: 'bg-green-500',
    },
    {
      title: 'Calls Made',
      value: (analytics?.calls?.sales_bot || 0) + (analytics?.calls?.receptionist || 0),
      subtitle: `${analytics?.calls?.sales_bot || 0} sales, ${analytics?.calls?.receptionist || 0} receptionist`,
      icon: PhoneIcon,
      color: 'bg-purple-500',
    },
    {
      title: 'Active Campaigns',
      value: analytics?.campaigns?.active || 0,
      subtitle: `${analytics?.campaigns?.avg_open_rate?.toFixed(1) || 0}% avg open rate`,
      icon: ChartBarIcon,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Track performance across all your marketing channels.</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as typeof period)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading analytics...</div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat) => (
              <div key={stat.title} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.subtitle}</p>
                  </div>
                  <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Email Performance */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Open Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {analytics?.emails?.sent
                    ? ((analytics.emails.opened / analytics.emails.sent) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Click Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {analytics?.emails?.sent
                    ? ((analytics.emails.clicked / analytics.emails.sent) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Conversions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {analytics?.campaigns?.total_conversions || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Campaign Performance */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Campaign Performance</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Average Open Rate</p>
                  <p className="text-sm text-gray-600">Across all campaigns</p>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
                  <span className="text-2xl font-bold text-gray-900">
                    {analytics?.campaigns?.avg_open_rate?.toFixed(1) || 0}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Average Click Rate</p>
                  <p className="text-sm text-gray-600">Across all campaigns</p>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
                  <span className="text-2xl font-bold text-gray-900">
                    {analytics?.campaigns?.avg_click_rate?.toFixed(1) || 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
