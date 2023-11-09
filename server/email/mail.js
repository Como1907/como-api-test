require('dotenv').config();
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendOTP = async (email, otp) => {
  const msg = {
    to: email,
    from: process.env.EMAIL_FROM,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
    html: `<strong>Your OTP code is: ${otp}</strong>`,
  };

  try {
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error(error);
    if (error.response) {
      console.error(error.response.body);
    }
    return false;
  }
};

module.exports = { sendOTP };
