import { loadStripe } from '@stripe/stripe-js';

const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string;

export const stripePromise = loadStripe(pk);
