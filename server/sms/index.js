require('dotenv').config();
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSmsOtp = async (to) => {
  try {
    const verification = await client.verify.v2.services(process.env.TWILIO_SERVICE)
      .verifications
      .create({ to, channel: 'sms' });
    return verification;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw new Error('Failed to send SMS');
  }
};

const verifySmsOtp = async (to, code) => {
  try {
    const verificationCheck = await client.verify.v2.services(process.env.TWILIO_SERVICE)
      .verificationChecks
      .create({ to, code });
    return verificationCheck;
  } catch (error) {
    console.error('Error verifying SMS:', error);
    throw new Error('Failed to verify SMS');
  }
};

module.exports = { sendSmsOtp, verifySmsOtp };