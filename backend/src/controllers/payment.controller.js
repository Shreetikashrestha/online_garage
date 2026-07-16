import * as paymentService from '../services/payment.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import stripe from '../config/stripe.js';
import env from '../config/env.js';
import ApiError from '../utils/apiError.js';

export const initializePayment = asyncHandler(async (req, res) => {
  const { bookingId, method } = req.body;
  
  const payment = await paymentService.initializePayment(bookingId, req.user.id, method);

  res.status(200).json({
    status: 'success',
    data: { payment },
  });
});

export const releasePayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.releasePayment(req.body.bookingId, req.user.id);

  res.status(200).json({
    status: 'success',
    data: { payment },
  });
});

export const getPaymentStatus = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentStatus(req.params.bookingId, req.user.id, req.user.role);

  res.status(200).json({
    status: 'success',
    data: { payment },
  });
});

export const webhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    throw new ApiError(400, `Webhook Error: ${err.message}`);
  }

  await paymentService.handleStripeWebhook(event);

  res.json({ received: true });
});
