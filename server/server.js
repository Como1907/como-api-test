const bcrypt = require('bcryptjs');
const { sendOTP, sendTicketPurchaseEmail, sendSeasonTicketPurchaseEmail, sendFixtureTicketTransferToPersonEmail, sendSeasonTicketTransferToPersonEmail, sendFailureIssueFixtureTicketsEmail, sendFailureIssueSeasonTicketsEmail } = require('./email/mail.js');
const { getSeasonTicketSeatsArray, getCollectibleOrdersReport, getSingleTickets} = require('./firebase/firebase.js');
const { sendSmsOtp, verifySmsOtp } = require('./sms/index.js');
const { getPlanetToken, getPlanetEvents, getPostiLiberiBiglietto, getEventOrganizers,
        getMappaPostoInfo, getMappaPostiInfo, getMappaBloccaPosto, getMappaBlocchi,
        getMappaSbloccaPosto, getPlanetNazioni, getPlanetProvince, 
        getPlanetComuni, getPlanetsocietaSportiva, getPlaNetSeasonTickets, 
        getPlaNetSeasonTribunas, getPlaNetSeasonEvents, utenzaAddPersona, 
        getBigliettoIsUtilizzatore, checkVroTicketIssueEligible, issueSingleMatchTickets, 
        issueSeasonTickets, getPlaNetTitoloStato, getPlaNetTitoloInfo, getPlaNetTitoloIsCedibile,
        getPlaNetTitoloInfoBySigilloFiscale, getPlanetEventPricing, getTesseraTifoso, 
        tesseraTifosoRegistra, getAutVerificaTesseraTifoso, tesseraTifosoEmetti, getPlanetTitoloInfoCessione,
        getPlaNetSubscriptionPrices, getPlanetTitoloEsteso, transferSeasonTicketToPerson, 
        transferTicketToPerson, getPlanetSubscriptionAvailableSeat, getPlanetCheckSeasonTicketHolder,
        getMappaPostiAbbonamentoInfo, getTitoliAcquistabiliAbbonamento, getTitoliAcquistabili, getPlanetEventDetail,
        getMappaBloccaPosti, getMappaSbloccaPosti
      }
        = require('./planet/index.js');
const express = require('express');
const app = express();
const {resolve} = require('path');
const cors = require('cors');
const basicAuth = require('express-basic-auth');
// Replace if using a different env file or config
const env = require('dotenv').config({path: './.env'});
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const basicAuthorizer = (username, password) => {
  const userMatches = basicAuth.safeCompare(username, process.env.BASIC_AUTH_USERNAME);
  const passwordMatches = basicAuth.safeCompare(password, process.env.BASIC_AUTH_PASSWORD);

  return userMatches & passwordMatches;
};
app.use(basicAuth({
  authorizer: basicAuthorizer,
  challenge: true,
}));

// process.env.STRIPE_SECRET_KEY_FOUNDATION
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
      automatic_payment_methods: { enabled: true }
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

// #############################################################################
// ############################ FIREBASE ACTIONS ###############################
// #############################################################################

app.post('/get-season-seats-array', async (req, res) => {
  console.log('Requesting Array', req.body)
  const { season } = req.body;

  if (!season) {
    return res.status(400).json({ error: 'Season is required' });
  }

  const seasonArr = await getSeasonTicketSeatsArray(season);
  console.log('Array received', seasonArr)

  if (seasonArr) {
    res.status(200).json({ seasonArr: seasonArr, message: 'Season Array received successfully'});
  } else {
    res.status(500).json({ error: 'There was an error getting the Season Array' });
  }
});

app.get('/get-collectible-orders', async (req, res) => {
  const queryParams = req.query;
  const collectibleOrders = await getCollectibleOrdersReport(queryParams).then((result) => {
    return result;
  }).catch((error) => {
    console.log(error);
    return null;
  });

  if (collectibleOrders) {
    res.status(200).json({ collectibleOrders: collectibleOrders, message: 'Collectible Orders received successfully'});
  } else {
    res.status(500).json({ error: 'There was an error getting the Collectible Orders' });
  }
});

app.get('/get-single-tickets', async (req, res) => {
  const queryParams = req.query;
  const singleTickets = await getSingleTickets(queryParams).then((result) => {
    return result;
  }).catch((error) => {
    console.log(error);
    return null;
  });

  if (singleTickets) {
    res.status(200).json({ singleTickets: singleTickets, message: 'Single Tickets for fixture received successfully'});
  } else {
    res.status(500).json({ error: 'There was an error getting the Single Tickets' });
  }
});

// #############################################################################
// ############################ PLANET ACTIONS #################################
// #############################################################################

app.get('/get-planet-token', async (req, res) => {
  const result = await getPlanetToken();

  if (result.success) {
    res.status(200).json({ data: result.data });
  } else {
    res.status(500).json({
      error: result.error
    });
  }
});

app.get('/utenza-organizzatori', async (req, res) => {
  const response = await getEventOrganizers(req.query);

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'There was an error getting the Event Organizers'
    });
  }
});

app.get('/planet-events', async (req, res) => {
  const response = await getPlanetEvents(req.query);

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'There was an error getting the Planet Data'
    });
  }
});

app.get('/planet-event-detail', async (req, res) => {
  const response = await getPlanetEventDetail(req.query);

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'There was an error getting the Planet Data'
    });
  }
});

//Get subscription type
app.get('/abbonamento-tipiabbonamento', async (req, res) => {
  
  const response = await getPlaNetSeasonTickets(req.query);

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'There was an error getting the PlaNet Season Tickets'
    });
  }
});


//Get subscription tribuna
app.get('/abbonamento-ordiniposto', async (req, res) => {

  const response = await getPlaNetSeasonTribunas(req.query);

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'There was an error getting the PlaNet Season Tribunas'
    });
  }
});

//Get events linked to the subscription
app.get('/abbonamento-eventipertipoabbonamento', async (req, res) => {
  
  const response = await getPlaNetSeasonEvents(req.query);

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'There was an error getting the PlaNet subscription Events'
    });
  }
});

//Get subscription pricing
app.get('/abbonamento-codiciriduzione', async (req, res) => {
  
  const response = await getPlaNetSubscriptionPrices(req.query);

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'There was an error getting the PlaNet Subscription'
    });
  }
});

//Get subscription getPlanetSubscriptionAvailableSeat
app.get('/planet-posti-liberi-abbonamento', async (req, res) => {
  const response = await getPlanetSubscriptionAvailableSeat(req.query);

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'There was an error getting the PlaNet Subscription'
    });
  }
});

//getPlanetCheckSeasonTicketHolder
app.get('/planet-abbonamento-isutilizzatore', async (req, res) => {
  console.log(req.query)
  const response = await getPlanetCheckSeasonTicketHolder(req.query);

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'There was an error getting the PlaNet Subscription'
    });
  }
});

//Get event pricing
app.get('/evento-codiciriduzione', async (req, res) => {
  
  const response = await getPlanetEventPricing(req.query);

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'There was an error getting the PlaNet Subscription'
    });
  }
});

app.get('/planet-posti-liberi-biglietto', async (req, res) => {

  console.log('request params')
  console.log(req.query)
  const response = await getPostiLiberiBiglietto(req.query);

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'There was an error getting the Planet Data'
    });
  }
});

// Get Blocks Info
app.get('/mappa-blocchi', async (req, res) => {

  console.log('request params')
  console.log(req.query)
  const response = await getMappaBlocchi(req.query);

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'There was an error getting the Planet Stadium Blocks'
    });
  }
});


// Get Seat Info
app.get('/planet-mappa-postoinfo', async (req, res) => {

  console.log('request params')
  console.log(req.query)
  const response = await getMappaPostoInfo(req.query);

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'There was an error getting the Planet Data'
    });
  }
});

// Get Seat Info - Stato: 0, Free, stato: 1 Sold/Reserved/Issued , 2 Blocked, 3 Free
app.get('/planet-mappa-postiinfo', async (req, res) => {

  console.log('request params')
  console.log(req.query)
  const response = await getMappaPostiInfo(req.query);

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'There was an error getting the Planet Data'
    });
  }
});

// Lock Seat Subscription
app.get('/planet-mappa-bloccaposti', async (req, res) => {

  console.log('request params')
  console.log(req.query)
  const response = await getMappaBloccaPosti(req.query);

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'There was an error getting the Planet Data'
    });
  }
});

// Unlock Seat Subscription
app.get('/planet-mappa-sbloccaposti', async (req, res) => {

  console.log('request params sbloccaposti season')
  console.log(req.query)
  const response = await getMappaSbloccaPosti(req.query);

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'There was an error getting the Planet Data'
    });
  }
});

// Lock Seat
app.get('/planet-mappa-bloccaposto', async (req, res) => {

  console.log('request params')
  console.log(req.query)
  const response = await getMappaBloccaPosto(req.query);

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'There was an error getting the Planet Data'
    });
  }
});

// Unlock Seat
app.get('/planet-mappa-sbloccaposto', async (req, res) => {

  console.log('request params')
  console.log(req.query)
  const response = await getMappaSbloccaPosto(req.query);

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'There was an error getting the Planet Data'
    });
  }
});

app.get('/planet-nazioni', async (req, res) => {
  const response = await getPlanetNazioni();

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'There was an error getting the Planet Data'
    });
  }
});

app.get('/planet-province', async (req, res) => {
  const response = await getPlanetProvince();

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'There was an error getting the Planet Data'
    });
  }
});

app.get('/planet-comuni', async (req, res) => {
  const response = await getPlanetComuni();

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'There was an error getting the Planet Data'
    });
  }
});

app.get('/planet-societa-sportiva', async (req, res) => {
  const response = await getPlanetsocietaSportiva();

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'There was an error getting the Planet Data'
    });
  }
});

// Add Persona
app.post('/utenza-addpersona', async (req, res) => {
  console.log('Creating users', req.body.params)
  const responses = await utenzaAddPersona(req.body.params);
  const allSuccessful = responses.every(response => response.success);

  if (allSuccessful) {
    res.status(200).json({
      data: responses.map(response => response.data),
      success: true
    });
  } else {
    const successfulCreations = responses.filter(response => response.success).map(response => response.data);
    const failedCreations = responses.filter(response => !response.success).map(response => ({ error: response.error, user: response.user }));

    res.status(500).json({
      success: false,
      successfulCreations: successfulCreations,
      failedCreations: failedCreations,
      error: 'There was an error processing one or more user creations!'
    });
  }
}); 

// Check if a Ticket holder already has issued ticket for anEvent
app.post('/biglietto-isutilizzatore', async (req, res) => {

  console.log('request params')
  console.log(req.body.params)
  const responses = await getBigliettoIsUtilizzatore(req.body.params);
  const allSuccessful = responses.every(response => response.success);

  console.log('####################### response ###################')
  console.log(responses)
  if (allSuccessful) {
    res.status(200).json({
      data: responses.map(response => response.data),
      success: true
    });
  } else {
    const successfulValidations = responses.filter(response => response.success).map(response => response.data);
    const failedValidations = responses.filter(response => !response.success).map(response => ({ error: response.error, user: response.user }));

    res.status(500).json({
      success: false,
      successfulValidations: successfulValidations,
      failedValidations: failedValidations,
      error: 'There was an error processing one or more user creations!'
    });
  }
}); 

// Check Supporter Card
app.get('/tessera-tifoso', async (req, res) => {

  console.log('request params')
  console.log(req.query)
  const response = await getTesseraTifoso(req.query);

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'There was an error getting the Supporter Card Info'
    });
  }
});


// Check Supporter Card in VRO
app.get('/autorizzazione-verificatesseratifoso', async (req, res) => {

  console.log('request params')
  console.log(req.query)
  const response = await getAutVerificaTesseraTifoso(req.query);

  console.log('####################### response ###################')
  console.log(response)

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: response.error.response.data //'There was an error getting the VRO Supporter Card Info'
    });
  }
});

// Register Supporter Card
app.post('/tesseratifoso-registra', async (req, res) => {

  console.log('request params')
  console.log(req.body.params)
  const response = await tesseraTifosoRegistra(req.body.params);

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'There was an error getting the Supporter Card Info'
    });
  }
});

// Isue Supporter Card in VRO and Check
app.post('/tesseratifoso-emetti', async (req, res) => {

  console.log('request params')
  // console.log(req.body.params)
  const response = await tesseraTifosoEmetti(req.body.params);

  console.log('####################### response ###################')
  console.log(response)
  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: response.error.response.data
    });
  }
});


// Check VRO Ticket Eligibility
app.post('/autorizzazione-verificapersona', async (req, res) => {
  console.log('request params')
  console.log(req.body.params)
  const responses = await checkVroTicketIssueEligible(req.body.params);
  const allSuccessful = responses.every(response => response.success);

  console.log('####################### response ###################')
  console.log(responses)
  if (allSuccessful) {
    res.status(200).json({
      data: responses.map(response => response.data),
      success: true
    });
  } else {
    const successfulValidations = responses.filter(response => response.success).map(response => response.data);
    const failedValidations = responses.filter(response => !response.success).map(response => ({ error: response.error, user: response.user }));

    res.status(500).json({
      success: false,
      successfulValidations: successfulValidations,
      failedValidations: failedValidations,
      error: 'There was an error processing one or more user creations!'
    });
  }
}); 

app.post('/biglietto-emettiesteso', async (req, res) => {
  console.log('Issuing Tickets', req.body.params)
  const responses = await issueSingleMatchTickets(req.body.params);
  const allSuccessful = responses.every(response => response.success);

  if (allSuccessful) {
    res.status(200).json({
      data: responses.map(response => response.data),
      success: true
    });
  } else {
    const successfulCreations = responses.filter(response => response.success).map(response => response.data);
    const failedCreations = responses.filter(response => !response.success).map(response => ({ error: response.error, data: response.data }));

    res.status(500).json({
      success: false,
      successfulCreations: successfulCreations,
      failedCreations: failedCreations,
      error: 'There was an error processing one or more ticket issuing!'
    });
  }
});

app.post('/abbonamento-emettiesteso', async (req, res) => {
  console.log('Issuing Season Tickets', req.body.params)
  const responses = await issueSeasonTickets(req.body.params);
  const allSuccessful = responses.every(response => response.success);

  if (allSuccessful) {
    res.status(200).json({
      data: responses.map(response => response.data),
      success: true
    });
  } else {
    const successfulCreations = responses.filter(response => response.success).map(response => response.data);
    const failedCreations = responses.filter(response => !response.success).map(response => ({ error: response.error, data: response.data }));

    res.status(500).json({
      success: false,
      successfulCreations: successfulCreations,
      failedCreations: failedCreations,
      error: 'There was an error processing one or more ticket issuing!'
    });
  }
});

// Get the Issued Ticket Title Stato - Barcode etc.
app.post('/titolo-stato', async (req, res) => {

  console.log('Getting Titolo Stato', req.body.params)
  const responses = await getPlaNetTitoloStato(req.body.params);
  const allSuccessful = responses.every(response => response.success);

  if (allSuccessful) {
    res.status(200).json({
      data: responses.map(response => response.data),
      success: true
    });
  } else {
    const successfulCreations = responses.filter(response => response.success).map(response => response.data);
    const failedCreations = responses.filter(response => !response.success).map(response => ({ error: response.error, user: response.user }));

    res.status(500).json({
      success: false,
      successfulCreations: successfulCreations,
      failedCreations: failedCreations,
      error: 'There was an errorgetting the Titolo Stato!'
    });
  }
});

// Get the Issued Ticket Title Stato - By ID
app.post('/titolo-info', async (req, res) => {

  console.log('Getting Titolo Info', req.body.params)
  const responses = await getPlaNetTitoloInfo(req.body.params);
  const allSuccessful = responses.every(response => response.success);

  if (allSuccessful) {
    res.status(200).json({
      data: responses.map(response => response.data),
      success: true
    });
  } else {
    const successfulCreations = responses.filter(response => response.success).map(response => response.data);
    const failedCreations = responses.filter(response => !response.success).map(response => ({ error: response.error, user: response.user }));

    res.status(500).json({
      success: false,
      successfulCreations: successfulCreations,
      failedCreations: failedCreations,
      error: 'There was an errorgetting the Titolo Info!'
    });
  }
});

//Get the Issued Ticket Title Esteso
app.post('/titolo-esteso', async (req, res) => {

  console.log('Getting Titolo Info Esteso', req.body.params)
  const responses = await getPlanetTitoloEsteso(req.body.params);
  const allSuccessful = responses.every(response => response.success);

  if (allSuccessful) {
    res.status(200).json({
      data: responses.map(response => response.data),
      success: true
    });
  } else {
    const successfulCreations = responses.filter(response => response.success).map(response => response.data);
    const failedCreations = responses.filter(response => !response.success).map(response => ({ error: response.error, user: response.user }));

    res.status(500).json({
      success: false,
      successfulCreations: successfulCreations,
      failedCreations: failedCreations,
      error: 'There was an error getting the Titolo Esteso!'
    });
  }
})

// Get the Issued Ticket Title Info Transfer
app.post('/titolo-infocessione', async (req, res) => {
  
    console.log('Getting Titolo Info Cessione', req.body.params)
    const responses = await getPlanetTitoloInfoCessione(req.body.params);
    const allSuccessful = responses.every(response => response.success);
  
    if (allSuccessful) {
      res.status(200).json({
        data: responses.map(response => response.data),
        success: true
      });
    } else {
      const successfulCreations = responses.filter(response => response.success).map(response => response.data);
      const failedCreations = responses.filter(response => !response.success).map(response => ({ error: response.error, user: response.user }));
  
      res.status(500).json({
        success: false,
        successfulCreations: successfulCreations,
        failedCreations: failedCreations,
        error: 'There was an error getting the Issued Ticket Title Info Transfer'
      });
    }
  }
);

// Get the Issued Ticket Title Stato - By Fiscal Seal.
app.post('/titolo-info-by-sigillo-fiscale', async (req, res) => {

  console.log('Getting Titolo Info Sigillo Fiscale', req.body.params)
  console.log(req.query)
  const response = await getPlaNetTitoloInfoBySigilloFiscale(req.body.params);

  console.log('####################### response ###################')
  console.log(response)

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: response.error //'There was an error getting the Issued Ticket Title Stato - By Fiscal Seal.'
    });
  }
});


// Determines whether a ticket is transferable under secondary ticketing regulations
app.post('/titolo-iscedibile', async (req, res) => {

  console.log('Getting Titolo Is Cedibile/Transferrable', req.body.params)
  console.log(req.query)
  const response = await getPlaNetTitoloIsCedibile(req.body.params);

  console.log('####################### response ###################')
  console.log(response)

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: response.error.response.data //'There was an error getting the VRO Supporter Card Info'
    });
  }
});

// Transfer Football Event
app.post('/abbonamento-cessione', async (req, res) => {
  console.log('Posting transferSeasonTicketToPerson', req.body.params)
  const responses = await transferSeasonTicketToPerson(req.body.params);
  const allSuccessful = responses.every(response => response.success);

  if (allSuccessful) {
    res.status(200).json({
      data: responses.map(response => response.data),
      success: true
    });
  } else {
    const successfulCreations = responses.filter(response => response.success).map(response => response.data);
    const failedCreations = responses.filter(response => !response.success).map(response => ({ error: response.error, user: response.user }));

    res.status(500).json({
      success: false,
      successfulCreations: successfulCreations,
      failedCreations: failedCreations,
      error: 'There was an processing the Abbonamento Cessione!'
    });
  }
});

app.post('/biglietto-cessione', async (req, res) => {
  console.log('Posting transferTicketToPerson', req.body.params)
  const responses = await transferTicketToPerson(req.body.params);
  const allSuccessful = responses.every(response => response.success);

  if (allSuccessful) {
    res.status(200).json({
      data: responses.map(response => response.data),
      success: true
    });
  } else {
    const successfulCreations = responses.filter(response => response.success).map(response => response.data);
    const failedCreations = responses.filter(response => !response.success).map(response => ({ error: response.error, user: response.user }));

    res.status(500).json({
      success: false,
      successfulCreations: successfulCreations,
      failedCreations: failedCreations,
      error: 'There was an processing the Biglietto Cessione!'
    });
  }
});

app.get('/mappa-posti-abbonamento-info', async (req, res) => {

  console.log('request params')
  console.log(req.query)
  const response = await getMappaPostiAbbonamentoInfo(req.query);

  console.log('####################### response ###################')
  console.log(response)

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: response.error.response.data //'There was an error getting the VRO Supporter Card Info'
    });
  }
});

app.get('/titoli-acquistabili-abbonamento', async (req, res) => {

  console.log('request params')
  console.log(req.query)
  const response = await getTitoliAcquistabiliAbbonamento(req.query);

  console.log('####################### response ###################')
  console.log(response)

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: response.error.response.data //'There was an error getting the VRO Supporter Card Info'
    });
  }
});

app.get('/titoli-acquistabili', async (req, res) => {

  console.log('request params')
  console.log(req.query)
  const response = await getTitoliAcquistabili(req.query);

  console.log('####################### response ###################')
  console.log(response)

  if (response.success) {
    res.status(200).json({
      data: response.data,
      success: true
    });
  } else {
    res.status(500).json({
      success: false,
      error: response.error.response.data //'There was an error getting the VRO Supporter Card Info'
    });
  }
});

// #############################################################################
// ############################ TWILIO SMS #####################################
// #############################################################################
app.post('/send-sms-otp', async (req, res) => {
  console.log('Sending SMS',req.body)
  const { phone } = req.body.params;

  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required.' });
  }

  try {
    const verification = await sendSmsOtp(phone);
    console.log('verification', verification)
    if (verification.status === 'pending') {
      res.status(200).json({ message: 'SMS sent successfully.' });
    } else {
      res.status(422).json({ message: 'Unable to send SMS. Please try again later.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error while sending SMS.' });
  }
});

app.post('/verify-sms-otp', async (req, res) => {
  console.log('Verifying SMS',req.body)
  const { phone, code } = req.body.params;

  if (!phone || !code) {
    return res.status(400).json({ message: 'Both phone number and verification code are required.' });
  }

  try {
    const verificationCheck = await verifySmsOtp(phone, code);
    console.log('verificationCheck', verificationCheck)
    if (verificationCheck.status === 'approved') {
      res.status(200).json({ message: 'SMS verified successfully.' });
    } else {
      res.status(422).json({ message: 'Verification failed. The code might be incorrect or expired.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error while verifying SMS.' });
  }
});
// #############################################################################
// ############################ SENDGRID EMAILS ################################
// #############################################################################

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

// Endpoint to send Ticket Purchase Email
app.post('/send-ticket-purchase-email', async (req, res) => {
  console.log('Sending email',req.body)
  const { email, ticket, ticketsPdf, language } = req.body.params;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const emailSent = await sendTicketPurchaseEmail(email, ticket, language, ticketsPdf);
  console.log('emailSent', emailSent)

  if (emailSent) {
    res.status(200).json({ message: 'Email sent successfully'});
  } else {
    res.status(500).json({ error: 'There was an error sending the email' });
  }
});

// Endpoint to send Ticket Purchase Email
app.post('/send-season-ticket-purchase-email', async (req, res) => {
  console.log('Sending email',req.body)
  const { email, ticket, ticketsPdf, language } = req.body.params;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const emailSent = await sendSeasonTicketPurchaseEmail(email, ticket, language, ticketsPdf);
  console.log('emailSent', emailSent)

  if (emailSent) {
    res.status(200).json({ message: 'Email sent successfully'});
  } else {
    res.status(500).json({ error: 'There was an error sending the email' });
  }
});

app.post('/send-transfer-fixture-ticket-email', async (req, res) => {
  console.log('Sending email',req.body)
  const { email, ticket, ticketsPdf, language } = req.body.params;

  if (!email.sender && !email.receiver) {
    return res.status(400).json({ error: 'Missing email sender or receiver'})
  }

  const emailSent = await sendFixtureTicketTransferToPersonEmail(email, ticket, language, ticketsPdf);
  console.log('emailSent', emailSent)

  if (emailSent) {
    res.status(200).json({ message: 'Email sent successfully'});
  } else {
    res.status(500).json({ error: 'There was an error sending the email' });
  }
});

app.post('/send-transfer-season-ticket-email', async (req, res) => {
  console.log('Sending email',req.body)
  const { email, ticket, ticketsPdf, language } = req.body.params;

  if (!email.sender && !email.receiver) {
    return res.status(400).json({ error: 'Missing email sender or receiver'})
  }

  const emailSent = await sendSeasonTicketTransferToPersonEmail(email, ticket, language, ticketsPdf);
  console.log('emailSent', emailSent)

  if (emailSent) {
    res.status(200).json({ message: 'Email sent successfully'});
  } else {
    res.status(500).json({ error: 'There was an error sending the email' });
  }
});

app.post('/send-failure-issue-fixture-tickets-email', async (req, res) => {
  console.log('Sending email',req.body)
  const { email, ticket, language } = req.body.params;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const emailSent = await sendFailureIssueFixtureTicketsEmail(email, ticket, language);
  console.log('emailSent', emailSent)

  if (emailSent) {
    res.status(200).json({ message: 'Email sent successfully'});
  } else {
    res.status(500).json({ error: 'There was an error sending the email' });
  }
});

app.post('/send-failure-issue-season-tickets-email', async (req, res) => {
  console.log('Sending email',req.body)
  const { email, ticket, language } = req.body.params;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const emailSent = await sendFailureIssueSeasonTicketsEmail(email, ticket, language);
  console.log('emailSent', emailSent)

  if (emailSent) {
    res.status(200).json({ message: 'Email sent successfully'});
  } else {
    res.status(500).json({ error: 'There was an error sending the email' });
  }
});

app.listen(4242, () =>
  console.log(`Node server listening at http://localhost:4242`)
);
