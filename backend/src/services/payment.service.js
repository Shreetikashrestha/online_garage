import prisma from '../config/database.js';
import ApiError from '../utils/apiError.js';
import stripe from '../config/stripe.js';
import * as escrowService from './escrow.service.js';

export const initializePayment = async (bookingId, userId, method) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true },
  });

  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.userId !== userId) throw new ApiError(403, 'Unauthorized');
  
  const existingPayment = await prisma.payment.findUnique({
    where: { bookingId },
  });

  if (existingPayment && existingPayment.status !== 'FAILED') {
    throw new ApiError(400, 'Payment already initialized for this booking');
  }

  const paymentTiming = booking.user.isIdentityVerified ? 'POST_PAY' : 'PRE_PAY';

  let stripePaymentIntentId = null;
  let status = 'PENDING';

  if (method === 'CARD' && paymentTiming === 'PRE_PAY') {
    if (stripe) {
      const paymentIntent = await escrowService.holdFunds(booking, booking.estimatedTotal, booking.user);
      stripePaymentIntentId = paymentIntent.id;
    }
  }

  return prisma.payment.upsert({
    where: { bookingId },
    update: {
      amount: booking.estimatedTotal,
      method,
      paymentTiming,
      stripePaymentIntentId,
      status,
    },
    create: {
      bookingId,
      userId,
      amount: booking.estimatedTotal,
      method,
      paymentTiming,
      stripePaymentIntentId,
      status,
    },
  });
};

export const releasePayment = async (bookingId, userId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.userId !== userId) throw new ApiError(403, 'Unauthorized');
  if (booking.status !== 'COMPLETED') throw new ApiError(400, 'Service must be completed before releasing payment');

  const payment = await prisma.payment.findUnique({
    where: { bookingId },
  });

  if (!payment) throw new ApiError(404, 'Payment record not found');
  if (payment.status === 'RELEASED') throw new ApiError(400, 'Payment already released');

  if (payment.stripePaymentIntentId) {
    if (payment.status === 'HELD_IN_ESCROW') {
      await escrowService.releaseFunds(payment.stripePaymentIntentId);
    } else {
      throw new ApiError(400, 'Funds are not held in escrow');
    }
  }

  return prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'RELEASED' },
  });
};

export const getPaymentStatus = async (bookingId, userId, role) => {
  const payment = await prisma.payment.findUnique({
    where: { bookingId },
    include: {
      booking: true,
    },
  });

  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }

  if (role !== 'ADMIN' && payment.userId !== userId && payment.booking.mechanicId !== userId) {
    throw new ApiError(403, 'Unauthorized');
  }

  return payment;
};

export const handleStripeWebhook = async (event) => {
  switch (event.type) {
    case 'payment_intent.amount_capturable_updated':
      const intent = event.data.object;
      await prisma.payment.update({
        where: { stripePaymentIntentId: intent.id },
        data: { status: 'HELD_IN_ESCROW' },
      });
      break;
    
    case 'payment_intent.succeeded':
      const succeededIntent = event.data.object;
      await prisma.payment.update({
        where: { stripePaymentIntentId: succeededIntent.id },
        data: { status: 'RELEASED' },
      });
      break;

    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object;
      await prisma.payment.update({
        where: { stripePaymentIntentId: failedIntent.id },
        data: { status: 'FAILED' },
      });
      break;
  }
};
