import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { billingApi } from '../../lib/apiClient';
import { CreditCardIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function BillingPage() {
  const [addCreditsAmount, setAddCreditsAmount] = useState(50);

  // Note: Backend may need GET /api/billing/subscription and /api/billing/credits endpoints
  // For now, these are placeholders
  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      // Placeholder - backend should implement GET /api/billing/subscription
      return null;
    },
    enabled: false, // Disable until backend implements
  });

  const { data: credits, isLoading: creditsLoading } = useQuery({
    queryKey: ['credits'],
    queryFn: async () => {
      // Placeholder - backend should implement GET /api/billing/credits
      return null;
    },
    enabled: false, // Disable until backend implements
  });

  const handleCheckout = async (priceId: string, mode: 'subscription' | 'payment' = 'subscription') => {
    try {
      const result = await billingApi.createCheckoutSession({ priceId, mode });
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      alert('Error creating checkout session: ' + ((error as Error).message || 'Unknown error'));
    }
  };

  const handleAddCredits = async () => {
    // For credits, you'll need a priceId for the credit product
    // This is a placeholder - you'll need to configure this in Stripe
    alert('Please configure credit price ID in the backend');
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      priceId: '', // Stripe price ID
      features: ['100 leads/month', '500 emails/month', 'Basic support'],
    },
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      priceId: '', // TODO: Add Stripe price ID
      features: ['1,000 leads/month', '5,000 emails/month', 'Priority support'],
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 99,
      priceId: '', // TODO: Add Stripe price ID
      features: ['10,000 leads/month', '50,000 emails/month', '24/7 support', 'Advanced analytics'],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 299,
      priceId: '', // TODO: Add Stripe price ID
      features: ['Unlimited leads', 'Unlimited emails', 'Dedicated support', 'Custom integrations'],
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Billing & Credits</h1>
        <p className="text-gray-600 mt-2">
          Manage your subscription plan and purchase credits for pay-as-you-go features.
        </p>
      </div>

      {/* Current Subscription */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Subscription</h2>
        {subLoading ? (
          <div className="text-center py-4 text-gray-500">Loading subscription...</div>
        ) : subscription ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium text-gray-900">
                {plans.find((p) => p.id === (subscription as { plan?: string })?.plan)?.name || 'Unknown'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Status: <span className="font-medium">Active</span>
              </p>
            </div>
            <button
              onClick={() => handleCheckout('', 'subscription')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Manage Subscription
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">No active subscription</p>
            <p className="text-sm text-gray-500">Select a plan below to get started</p>
          </div>
        )}
      </div>

      {/* Credit Balance */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Credit Balance</h2>
        {creditsLoading ? (
          <div className="text-center py-4 text-gray-500">Loading credits...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Leads Credits</p>
              <p className="text-3xl font-bold text-gray-900">{(credits as { leads?: number } | null)?.leads || 0}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Email Credits</p>
              <p className="text-3xl font-bold text-gray-900">{(credits as { emails?: number } | null)?.emails || 0}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Call Credits</p>
              <p className="text-3xl font-bold text-gray-900">{(credits as { calls?: number } | null)?.calls || 0}</p>
            </div>
          </div>
        )}

        <div className="mt-6 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Credits</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount ($)
              </label>
              <input
                type="number"
                value={addCreditsAmount}
                onChange={(e) => setAddCreditsAmount(Number(e.target.value))}
                min="10"
                step="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleAddCredits}
              className="mt-6 flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              <PlusIcon className="w-5 h-5" />
              Add Credits
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`border-2 rounded-lg p-6 ${
                subscription && (subscription as { plan?: string })?.plan === plan.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200'
              }`}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  if (plan.priceId) {
                    handleCheckout(plan.priceId, 'subscription');
                  } else {
                    alert('Price ID not configured. Please contact support.');
                  }
                }}
                disabled={!plan.priceId || !!(subscription && (subscription as { plan?: string })?.plan === plan.id)}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  subscription && (subscription as { plan?: string })?.plan === plan.id
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {subscription && (subscription as { plan?: string })?.plan === plan.id
                  ? 'Current Plan'
                  : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment History</h2>
        <div className="text-center py-8 text-gray-500">
          <CreditCardIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>Payment history will appear here</p>
          <p className="text-sm mt-1">This feature requires backend implementation</p>
        </div>
      </div>
    </div>
  );
}

