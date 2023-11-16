require('dotenv').config();
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendOTP = async (email, otp) => {
  const msg = {
    to: email,
    from: process.env.EMAIL_FROM,
    subject: 'Your OTP Code',
    // text: `Your OTP code is: ${otp}`,
    html: emailTemplate(otp, 'COMO 1907', 'https://access-staging02.comofootball.com/img/logos/logo.png'),
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

const emailTemplate = (otp, homePageTitle, logoImageUrl) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>Email Verification</title>
      </head>
      <body>
        <div class="email-card" style="width: 95%; max-width: 590px; margin: 0 auto; font-family: Arial, Helvetica, sans-serif; color: #000;">
          <div class="email-card__header" style="height: 5em; background-color: #252F3D; width: 100%; color: #fff; margin-bottom: 0; display: grid; grid-template-columns: 1fr; grid-template-rows: repeat(3, 1fr);">
            <div style="display: flex; margin: 0 auto;">
              <div style="width: 40px;">
                <img src="${logoImageUrl}" alt="Logo" style="width: 100%; margin-top: 10px" />
              </div>
              <h2 style="font-size: 1.2em; margin-bottom: 1em; margin: 1.3em 0;">${homePageTitle}</h2>
            </div>
          </div>
          <section class="card-body" style="box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px; border: 0.5px solid rgba(149, 157, 165, 0.2); padding: 2em;">
            <h3>Email Verification</h3>
            <div style="text-align: justify;">
              <p>
                Thank you for requesting your COMO 1907 One Time Password (OTP).
                <br>
                <br>
                We want to make sure it's really you.
                <br>
                Please enter the following OTP to verify your email address.
                This code is valid for 1 minute.
              </p>
            </div>
            <div class="mail-card-verfication-code" style="margin-top: 3em; text-align: center;">
              <h5>Your Verification Code:</h5>
              <h1>${otp}</h1>
            </div>
          </section>
          <footer>
            <!-- Footer Content -->
          </footer>
        </div>
      </body>
    </html>
  `;
};


module.exports = { sendOTP };
