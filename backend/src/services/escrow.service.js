import stripe from '../config/stripe.js';
import prisma from '../config/database.js';
import ApiError from '../utils/apiError.js';

export const holdFunds = async (booking, amount, user) => {
  if (!stripe) throw new ApiError(500, 'Stripe is not configured');

  const mechanicStripeAccountId = process.env.MECHANIC_STRIPE_ACCOUNT_ID || 'acct_placeholder';

  const applicationFeeAmount = Math.round(amount * 0.1 * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
    payment_method_types: ['card'],
    transfer_data: {
      destination: mechanicStripeAccountId,
    },
    application_fee_amount: applicationFeeAmount,
    capture_method: 'manual',
    metadata: {
      bookingId: booking.id,
      userId: user.id,
      mechanicId: booking.mechanicId,
    },
  });

  return paymentIntent;
};

export const releaseFunds = async (paymentIntentId) => {
  if (!stripe) throw new ApiError(500, 'Stripe is not configured');

  const capturedIntent = await stripe.paymentIntents.capture(paymentIntentId);
  return capturedIntent;
};

export const refundFunds = async (paymentIntentId, amount = null) => {
  if (!stripe) throw new ApiError(500, 'Stripe is not configured');

  const options = { payment_intent: paymentIntentId };
  if (amount) {
    options.amount = Math.round(amount * 100);
  }

  const refund = await stripe.refunds.create(options);
  return refund;
};
