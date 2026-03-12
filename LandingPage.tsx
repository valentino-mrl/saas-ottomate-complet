import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChartBarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function LandingPage() {
  // Landing page is now just marketing - auth is handled by separate LoginPage/RegisterPage

  const features = [
    {
      icon: UserGroupIcon,
      title: 'Lead Generation',
      description: 'Generate B2B leads filtered by category and location',
    },
    {
      icon: EnvelopeIcon,
      title: 'Email Campaigns',
      description: 'Create templates and launch automated email campaigns',
    },
    {
      icon: PhoneIcon,
      title: 'Voice Automation',
      description: 'Automated sales calls and virtual receptionist',
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics',
      description: 'Track performance across all your marketing channels',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-blue-600">Ottomate</h1>
            <div className="flex gap-4">
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Marketing content */}
          <div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Automate Your Business Growth
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Generate leads, automate outreach, and manage your sales pipeline
              all in one powerful platform.
            </p>

            <div className="space-y-4 mb-8">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start">
                  <feature.icon className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-4">Key Benefits</h3>
              <ul className="space-y-2">
                {[
                  'Automated lead generation',
                  'Email template management',
                  'Voice bot for sales calls',
                  'Virtual receptionist',
                  'Real-time analytics',
                  'Flexible billing options',
                ].map((benefit) => (
                  <li key={benefit} className="flex items-center text-gray-700">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: CTA */}
          <div className="bg-white rounded-xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Ready to Get Started?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of businesses automating their growth with Ottomate.
            </p>
            <div className="space-y-3">
              <Link
                to="/register"
                className="block w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="block w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

