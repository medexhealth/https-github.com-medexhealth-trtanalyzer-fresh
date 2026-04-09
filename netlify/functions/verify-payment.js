import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { paymentId } = JSON.parse(event.body);

    if (!paymentId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'paymentId is required' }),
      };
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
    const isSucceeded = paymentIntent.status === 'succeeded';

    // Check if payment was made within the last 7 days
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const paymentAgeMs = Date.now() - (paymentIntent.created * 1000); // Stripe timestamps are in seconds
    const isWithinWindow = paymentAgeMs < sevenDaysMs;

    const verified = isSucceeded && isWithinWindow;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        verified,
        expired: isSucceeded && !isWithinWindow,
      }),
    };
  } catch (error) {
    console.error('Stripe verification error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to verify payment' }),
    };
  }
};
