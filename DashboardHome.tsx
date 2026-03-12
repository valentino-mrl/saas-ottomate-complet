import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChartBarIcon,
  MegaphoneIcon,
  CreditCardIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const quickLinks = [
  { name: 'Generate Leads', href: '/app/leads', icon: UserGroupIcon, color: 'bg-blue-500' },
  { name: 'Create Template', href: '/app/mail-templates', icon: EnvelopeIcon, color: 'bg-green-500' },
  { name: 'Configure Voice Bot', href: '/app/voice-bot', icon: PhoneIcon, color: 'bg-purple-500' },
  { name: 'Setup Receptionist', href: '/app/receptionist', icon: UserIcon, color: 'bg-orange-500' },
  { name: 'View Analytics', href: '/app/analytics', icon: ChartBarIcon, color: 'bg-indigo-500' },
  { name: 'Launch Campaign', href: '/app/campaigns', icon: MegaphoneIcon, color: 'bg-pink-500' },
  { name: 'Manage Billing', href: '/app/billing', icon: CreditCardIcon, color: 'bg-yellow-500' },
];

export default function DashboardHome() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's an overview of your platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickLinks.map((link) => (
          <Link
            key={link.name}
            to={link.href}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className={`${link.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
              <link.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{link.name}</h3>
            <p className="text-sm text-gray-600 mt-2">Click to get started</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Generate your first leads using the Leads interface</li>
          <li>Create email templates for your outreach campaigns</li>
          <li>Configure your voice bot for automated sales calls</li>
          <li>Set up your virtual receptionist for inbound calls</li>
          <li>Launch your first email campaign</li>
          <li>Monitor performance in the Analytics dashboard</li>
        </ol>
      </div>
    </div>
  );
}

