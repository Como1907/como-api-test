const bcrypt = require('bcryptjs');
const { sendOTP } = require('./email/mail.js');
const express = require('express');
const app = express();
const {resolve} = require('path');
const cors = require('cors');
const basicAuth = require('express-basic-auth');
// Replace if using a different env file or config
const env = require('dotenv').config({path: './.env'});

app.use(cors());

const basicAuthorizer = (username, password) => {
  const userMatches = basicAuth.safeCompare(username, process.env.BASIC_AUTH_USERNAME);
  const passwordMatches = basicAuth.safeCompare(password, process.env.BASIC_AUTH_PASSWORD);

  return userMatches & passwordMatches;
};
app.use(basicAuth({
  authorizer: basicAuthorizer,
  challenge: true,
}));

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
  appInfo: { // For sample support and debugging, not required for production:
    name: "stripe-samples/accept-a-payment/payment-element",
    version: "0.0.2",
    url: "https://github.com/stripe-samples"
  }
});

app.use(express.static(process.env.STATIC_DIR));
app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith('/webhook')) {
        req.rawBody = buf.toString();
      }
    },
  })
);

app.get('/', (req, res) => {
  const path = resolve(process.env.STATIC_DIR + '/index.html');
  res.sendFile(path);
});

app.get('/config', (req, res) => {
  res.send({
    message: 'Como API Available...',
  });
});

app.post('/create-payment-intent', async (req, res) => {
  // Create a PaymentIntent with the amount, currency, and a payment method type.
  //
  // See the documentation [0] for the full list of supported parameters.
  //
  // [0] https://stripe.com/docs/api/payment_intents/create
  var amount = req.body.amount
  var description = req.body.description
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: 'EUR',
      amount: amount,
      description: description,
      automatic_payment_methods: { enabled: false }
    });

    // Send publishable key and PaymentIntent details to client
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
});

// Expose a endpoint as a webhook handler for asynchronous events.
// Configure your webhook in the stripe developer dashboard
// https://dashboard.stripe.com/test/webhooks
app.post('/webhook', async (req, res) => {
  let data, eventType;

  // Check if webhook signing is configured.
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // we can retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  if (eventType === 'payment_intent.succeeded') {
    // Funds have been captured
    // Fulfill any orders, e-mail receipts, etc
    // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
    console.log('💰 Payment captured!');
  } else if (eventType === 'payment_intent.payment_failed') {
    console.log('❌ Payment failed.');
  }
  res.sendStatus(200);
});

// Endpoint to send OTP
app.post('/send-otp', async (req, res) => {
  console.log('Sending email',req.body)
  const { email } = req.body;
  const saltRounds = 10;
  const otp = Math.floor(100000 + Math.random() * 900000);
  const hashedOtp = await bcrypt.hash(otp.toString(), saltRounds);

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const emailSent = await sendOTP(email, otp);
  console.log('emailSent',emailSent, otp)

  if (emailSent) {
    res.status(200).json({ hashedOtp: hashedOtp, message: 'OTP sent successfully'});
  } else {
    res.status(500).json({ error: 'There was an error sending the email' });
  }
});

app.listen(4242, () =>
  console.log(`Node server listening at http://localhost:4242`)
);
