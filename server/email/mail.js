require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const format = require('date-format');

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


const sendTicketPurchaseEmail = async (email, ticket, language, ticketsPdf) => {
  let subject
  if (language == 'en') {
    subject = 'Your COMO 1907 Ticket Purchase - ' + ticket.fixture_name
  } else if (language == 'it') {
    subject = 'Il tuo acquisto del biglietto COMO 1907 - ' + ticket.fixture_name
  }
  const msg = {
    to: email,
    from: process.env.EMAIL_FROM,
    subject: subject,
    // text: `Your OTP code is: ${otp}`,
    html: emailTemplateTicketPurchase(ticket, language, 'COMO 1907', 'https://access-staging02.comofootball.com/img/logos/logo.png'),
    attachments: ticketsPdf
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

const emailTemplateTicketPurchase = (ticket, language, homePageTitle, logoImageUrl) => {

  if (language == 'en') {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
          <title>COMO 1907 - Your Payment was Successful</title>
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
              <h3>Congratulations, your transaction was successful!</h3>
              <div style="text-align: justify;">
                <p>
                We are excited to inform you that your transaction for the ${ticket.fixture_name} Match Event has been successfully processed. The payment has been approved and added the Digital Ticket(s) have been added to your account.
                  <br>
                  <br>
                  To obtain your ticket, please follow these four simple steps:
                  <ul>
                    <li>Go to your <strong>“Digital Wallet“</strong> section, which is located in the menu on your profile (please ensure that you are logged in).</li><br>
                    <li> Visit “Issued Tickets” on the 'Digital Wallet' menu, to see your QR code issued ticket(s).</li>
                  </ul>
                  <br>
                  Please note the following important information:
                  <br>
                  <br>
                    Tickets that have not been issued will not be valid for entry. Only tickets that show your full name on the match ticket will be granted access, identification will be required to authenticate ticket holder.
                  <br>
                  <br>
                  <div style="width:100%">
                    <p style="font-size:13px">
                      Below are the purchase details for your ticket:<br>
                    </p>
                    <div style="display:flex;width:100%">
                      <div style="width:100%">
                        <div class="mb-1">
                          <p class="my-025" style="font-size:13px">
                            Payment Amount<br>
                            EUR ${ticket.ticket_total_price}.00
                          </p>
                        </div>
                        <div class="mb-1">
                          <p class="my-025" style="font-size:13px">
                            Payment Method<br>
                            CARD
                          </p>
                        </div>
                        <div class="mb-1">
                          <p class="my-025" style="font-size:13px">
                            Time of Purchase<br>
                            ${format.asString('dd/MM/yyyy hh:mm', new Date(ticket.modified + (60 * 60 * 1000) ))}
                          </p>
                        </div>
                      </div>
                      <div style="width:100%">
                        <div class="mb-1">
                          <p class="my-025" style="font-size:13px">
                            Quantity<br>
                            ${ticket.ticket_quantity}
                          </p>
                        </div>
                        <div class="mb-1">
                          <p class="my-025" style="font-size:13px">
                            Match Event - Ticket Type<br>
                            ${ticket.fixture_name} - ${ticket.ticket_type}
                          </p>
                        </div>
                        <div class="mb-1">
                          <p class="my-025" style="font-size:13px">
                            Payment Status<br>
                            Paid
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p style="font-size:13px;text-align: center;">
                      Thank you for completing your transaction on COMO 1907.
                      </p>
                      <p style="font-size:13px;text-align: center;">
                        We hope you have a great time at the match event!
                      </p>
                    </div>
                  </div>
                </p>
              </div>
            </section>
            <footer style="text-align: center;">
              <section style="padding: 1em;border-top: 1px solid #ccc; border-right: 0.5px solid rgba(149,157,165,0.2);border-left: 0.5px solid rgba(149,157,165,0.2);">
                <div>
                  <p>
                    Como 1907 will never email you and ask you to disclose or verify your password, credit card, or banking account number.
                  </p>
                </div>
              </section>
              <section style="background-color: #f0f2f3;padding: 2em;">
                <p style="width: 90%;margin: auto;font-size: .75em;">
                  This message was produced and distributed by COMO 1907. ©2023, Inc. All rights reserved. COMO 1907 is a registered trademark. View our <a href="https://comofootball.com/en/privacy-policy/">privacy policy</a>
                </p>
              </section>
            </footer>
          </div>
        </body>
      </html>
    `;
  } else if (language == 'it') {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
          <title>COMO 1907 - Il pagamento è riuscito!</title>
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
              <h3>Congratulazioni, la transazione è andata a buon fine!</h3>
              <div style="text-align: justify;">
                <p>
                Siamo lieti di informarti che la tua transazione per il Match Event ${ticket.fixture_name} è stata elaborata con successo. Il pagamento è stato approvato e i biglietti digitali sono stati aggiunti al tuo account.
                  <br>
                  <br>
                  Per ottenere il tuo biglietto, segui questi quattro semplici passaggi:
                  <ul>
                    <li>Vai alla sezione <strong>"Portafoglio digitale"</strong>, che si trova nel menu del tuo profilo (assicurati di aver effettuato l'accesso).</li><br>
                    <li> Visita "Biglietti emessi" nel menu "Portafoglio digitale" per vedere i biglietti emessi con il codice QR.</li>
                  </ul>
                  <br>
                  Si prega di notare le seguenti informazioni importanti:
                  <br>
                  <br>
                  I biglietti non emessi non saranno validi per l'ingresso. Verrà consentito l'accesso solo ai biglietti che riportano il tuo nome completo sul biglietto della partita, sarà richiesta l'identificazione per autenticare il titolare del biglietto.
                  <br>
                  <br>
                  <div style="width:100%">
                    <p style="font-size:13px">
                    Di seguito sono riportati i dettagli per l'acquisto dei tuoi biglietti:<br>
                    </p>
                    <div style="display:flex;width:100%">
                      <div style="width:100%">
                        <div class="mb-1">
                          <p class="my-025" style="font-size:13px">
                            Importo del pagamento<br>
                            EUR ${ticket.ticket_total_price}.00
                          </p>
                        </div>
                        <div class="mb-1">
                          <p class="my-025" style="font-size:13px">
                            Metodo di pagamento<br>
                            CARD
                          </p>
                        </div>
                        <div class="mb-1">
                          <p class="my-025" style="font-size:13px">
                            Momento dell'acquisto<br>
                            ${format.asString('dd/MM/yyyy hh:mm', new Date(ticket.modified + (60 * 60 * 1000) ))}
                          </p>
                        </div>
                      </div>
                      <div style="width:100%">
                        <div class="mb-1">
                          <p class="my-025" style="font-size:13px">
                            Quantità<br>
                            ${ticket.ticket_quantity}
                          </p>
                        </div>
                        <div class="mb-1">
                          <p class="my-025" style="font-size:13px">
                            Match Event - Ticket Type<br>
                            ${ticket.fixture_name} - ${ticket.ticket_type}
                          </p>
                        </div>
                        <div class="mb-1">
                          <p class="my-025" style="font-size:13px">
                            Stato del pagamento<br>
                            Pagata
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p style="font-size:13px;text-align: center;">
                      Grazie per aver completato la transazione su COMO 1907.
                      </p>
                      <p style="font-size:13px;text-align: center;">
                      Ci auguriamo che tu ti diverta all'evento della partita!
                      </p>
                    </div>
                  </div>
                </p>
              </div>
            </section>
            <footer style="text-align: center;">
              <section style="padding: 1em;border-top: 1px solid #ccc; border-right: 0.5px solid rgba(149,157,165,0.2);border-left: 0.5px solid rgba(149,157,165,0.2);">
                <div>
                  <p>
                  Como 1907 non ti invierà mai un'e-mail chiedendoti di rivelare o verificare la tua password, carta di credito o numero di conto bancario.
                  </p>
                </div>
              </section>
              <section style="background-color: #f0f2f3;padding: 2em;">
                <p style="width: 90%;margin: auto;font-size: .75em;">
                Questo messaggio è stato prodotto e distribuito da COMO 1907. ©2023, Inc. Tutti i diritti riservati. COMO 1907 è un marchio registrato. Visualizza la nostra <a href="https://comofootball.com/privacy-policy/">informativa sulla privacy</a>
                </p>
              </section>
            </footer>
          </div>
        </body>
      </html>
    `;
  }
};

module.exports = { sendOTP, sendTicketPurchaseEmail };
