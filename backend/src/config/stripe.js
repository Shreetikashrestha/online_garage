import Stripe from 'stripe';
import env from './env.js';

const isRealKey = env.STRIPE_SECRET_KEY &&
  (env.STRIPE_SECRET_KEY.startsWith('sk_test_') || env.STRIPE_SECRET_KEY.startsWith('sk_live_')) &&
  !env.STRIPE_SECRET_KEY.includes('your_');

const stripe = isRealKey
  ? new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    })
  : null;

export default stripe;
