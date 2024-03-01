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

const sendSeasonTicketPurchaseEmail = async (email, ticket, language, ticketsPdf) => {
  let subject
  if (language == 'en') {
    subject = 'Your COMO 1907 Season Ticket Purchase - ' + ticket.season_ticket_name
  } else if (language == 'it') {
    subject = 'Il tuo acquisto del biglietto abbonamento COMO 1907 - ' + ticket.season_ticket_name
  }
  const msg = {
    to: email,
    from: process.env.EMAIL_FROM,
    subject: subject,
    // text: `Your OTP code is: ${otp}`,
    html: emailTemplateSeasonTicketPurchase(ticket, language, 'COMO 1907', 'https://access-staging02.comofootball.com/img/logos/logo.png'),
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

const sendFixtureTicketTransferToPersonEmail = async ({sender, receiver}, ticket, language, ticketsPdf) => {
  const subjectReceiver = language === 'it'
    ? `Hai ricevuto un biglietto di trasferimento COMO 1907 - ${ticket.fixture_name}`
    : `You have received a COMO 1907 Ticket Transfer - ${ticket.fixture_name}`;
  const subjectSender = language === 'it'
    ? `Il tuo trasferimento del biglietto COMO 1907 è riuscito - ${ticket.fixture_name}`
    : `Your COMO 1907 Ticket Transfer Success - ${ticket.fixture_name}`;

  const msgReceiver = {
    to: receiver, 
    from: process.env.EMAIL_FROM, 
    subject: subjectReceiver,
    html: emailTemplateTicketTransferToReceiver(ticket, language, 'COMO 1907', 'https://access-staging02.comofootball.com/img/logos/logo.png'),
    attachments: ticketsPdf
  };

  const msgSender = {
    to: sender, 
    from: process.env.EMAIL_FROM, 
    subject: subjectSender,
    html: emailTemplateTicketTransferToSender(ticket, language, 'COMO 1907', 'https://access-staging02.comofootball.com/img/logos/logo.png'),
  };

  try {
    await sgMail.send(msgReceiver);
    if (sender !== '') {
      await sgMail.send(msgSender);
    }

    return true;
  } catch (error) {
    console.error("Error sending emails:", error);
    if (error.response) {
      console.error("Detailed error:", error.response.body);
    }
    return false;
  }
};

const sendSeasonTicketTransferToPersonEmail = async ({sender, receiver}, ticket, language, ticketsPdf) => {
  const subjectReceiver = language === 'it'
    ? `Hai ricevuto un abbonamento COMO 1907 - ${ticket.season_ticket_name}`
    : `You have received a COMO 1907 Season Ticket - ${ticket.season_ticket_name}`;
  const subjectSender = language === 'it'
    ? `Il tuo trasferimento dell'abbonamento COMO 1907 è riuscito - ${ticket.season_ticket_name}`
    : `Your COMO 1907 Season Ticket Transfer Success - ${ticket.season_ticket_name}`;

  const msgReceiver = {
    to: receiver,
    from: process.env.EMAIL_FROM,
    subject: subjectReceiver,
    html: emailTemplateSeasonTicketTransferToReceiver(ticket, language, 'COMO 1907', 'https://access-staging02.comofootball.com/img/logos/logo.png'),
    attachments: ticketsPdf
  };

  const msgSender = {
    to: sender,
    from: process.env.EMAIL_FROM,
    subject: subjectSender,
    html: emailTemplateSeasonTicketTransferToSender(ticket, language, 'COMO 1907', 'https://access-staging02.comofootball.com/img/logos/logo.png'),
  };

  try {
    await sgMail.send(msgReceiver);
    if (sender !== '') {
      await sgMail.send(msgSender);
    }

    return true;
  } catch (error) {
    console.error("Error sending emails:", error);
    if (error.response) {
      console.error("Detailed error:", error.response.body);
    }
    return false;
  }
};

const sendFailureIssueFixtureTicketsEmail = async (email, ticket, language) => {
  let subject
  if (language == 'en') {
    subject = 'Your COMO 1907 Ticket Purchase - ' + ticket.fixture_name + ' - Failed'
  }
  else if (language == 'it') {
    subject = 'Il tuo acquisto del biglietto COMO 1907 - ' + ticket.fixture_name + ' - non riuscito'
  }
  const msg = {
    to: email,
    from: process.env.EMAIL_FROM,
    subject: subject,
    html: emailTemplateFailureIssueTickets(ticket, language, 'COMO 1907', 'https://access-staging02.comofootball.com/img/logos/logo.png'),
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

const sendFailureIssueSeasonTicketsEmail =  async (email, ticket, language) => {
  let subject
  if (language == 'en') {
    subject = 'Your COMO 1907 Season Ticket Purchase - ' + ticket.season_ticket_name + ' - Failed'
  }
  else if (language == 'it') {
    subject = 'Il tuo acquisto del biglietto abbonamento COMO 1907 - ' + ticket.season_ticket_name + ' - non riuscito'
  }
  const msg = {
    to: email,
    from: process.env.EMAIL_FROM,
    subject: subject,
    html: emailTemplateFailureIssueSeasonTickets(ticket, language, 'COMO 1907', 'https://access-staging02.comofootball.com/img/logos/logo.png'),
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
}

const emailTemplateFailureIssueSeasonTickets = (ticket, language, homePageTitle, logoImageUrl) => {
  if (language == 'en') {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>COMO 1907 - Your Season Ticket Purchase Failed</title>
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
            <h3>Your Season Ticket Purchase Failed</h3>
            <div style="text-align: justify;">
              <p>
                We regret to inform you that your season ticket purchase has failed. The purchase has not been processed, and the season ticket has not been added to your account.
                <br><br>
                Please note the following important information:
                <br><br>
                The season ticket will not be added to your account and will not be valid for entry.
                <br><br>
                Below are the details of your attempted purchase:
                <br><br>
                ${ticket.failedCreations.map(failedCreation => `
                  <div style="margin-bottom: 20px;">
                    <p style="font-size: 13px; margin: 0;">
                      <strong>Error:</strong> ${failedCreation.error.Message}
                    </p>
                    <p style="font-size: 13px;">
                      <strong>Match Event:</strong> ${ticket.season_ticket_name}
                    </p>
                    <p style="font-size: 13px;">
                      <strong>Seat:</strong> ${failedCreation.data.modelloAbbonamento.codicePosto}, ${failedCreation.data.modelloAbbonamento.fila}
                    </p>
                    <p style="font-size: 13px;">
                      <strong>Gate:</strong> ${failedCreation.data.modelloAbbonamento.varco}
                    </p>
                  </div>
                `).join('')}
                <div style="display:flex;width:100%">
                  <div style="width:100%">
                    <div class="mb-1">
                      <p class="my-025" style="font-size:13px">
                        Purchase Date<br>
                        ${format.asString('dd/MM/yyyy hh:mm', new Date(ticket.created + (60 * 60 * 1000) ))}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <p style="font-size:13px;text-align: center;">
                    We apologize for the inconvenience and hope you will try again.
                  </p>
                  <p style="font-size:13px;text-align: center;">
                    We hope you have a great time at the match event!
                  </p>
                </div>
              </p>
            </div>
          </section>
          <footer style="text-align: center;">
            <section style="padding: 1em;border-top: 1px solid #ccc; border-right: 0.5px solid rgba(149,157,165,0.2);border-left: 0.5px solid rgba(149,157,165,0.2);">
              <p>
                Como 1907 will never email you and ask you to disclose or verify your password, credit card, or banking account number.
              </p>
            </section>
            <section style="background-color: #f0f2f3;padding: 2em;">
              <p style="width: 90%;margin: auto;font-size: .75em;">
                This message was produced and distributed by COMO 1907. ©2023, Inc. All rights reserved. COMO 1907 is a registered trademark. View our privacy policy.
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
        <title>COMO 1907 - Il tuo acquisto del biglietto abbonamento è fallito</title>
      </head>
      <body>
        <div class="email-card" style="width: 95%; max-width: 590px; margin: 0 auto; font-family: Arial, Helvetica, sans-serif; color: #000;">
          <div class="email-card
          __header" style="height: 5em; background-color: #252F3D; width: 100%; color: #fff; margin-bottom: 0; display: grid; grid-template-columns: 1fr; grid-template-rows: repeat(3, 1fr);">
            <div style="display: flex; margin: 0 auto;">
              <div style="width: 40px;">
              <img src="${logoImageUrl}" alt="Logo" style="width: 100%; margin-top: 10px" />
              </div>
              <h2 style="font-size: 1.2em; margin-bottom: 1em; margin: 1.3em 0;">${homePageTitle}</h2>
            </div>
          </div>

          <section class="card-body" style="box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px; border: 0.5px solid rgba(149, 157, 165, 0.2); padding: 2em;">
            <h3>Il tuo acquisto del biglietto abbonamento è fallito</h3>
            <div style="text-align: justify;">
              <p>
                Ci dispiace informarti che il tuo acquisto del biglietto abbonamento è fallito. L'acquisto non è stato elaborato e l'abbonamento non è stato aggiunto al tuo account.
                <br><br>
                Si prega di notare le seguenti informazioni importanti:
                <br><br>
                L'abbonamento non verrà aggiunto al tuo account e non sarà valido per l'ingresso.
                <br><br>
                Di seguito sono riportati i dettagli del tuo acquisto non riuscito:
                <br><br>
                ${ticket.failedCreations.map(failedCreation => `
                  <div style="margin-bottom: 20px;">
                    <p style="font-size: 13px; margin: 0;">
                      <strong>Error:</strong> ${failedCreation.error.Message}
                    </p>
                    <p style="font-size: 13px;">
                      <strong>Match Event:</strong> ${ticket.season_ticket_name}
                    </p>
                    <p style="font-size: 13px;">
                      <strong>Seat:</strong> ${failedCreation.data.modelloAbbonamento.codicePosto}, ${failedCreation.data.modelloAbbonamento.fila}
                    </p>
                    <p style="font-size: 13px;">
                      <strong>Gate:</strong> ${failedCreation.data.modelloAbbonamento.varco}
                    </p>
                  </div>
                `).join('')}
                <div style="display:flex;width:100%">
                  <div style="width:100%">
                    <div class="mb-1">
                      <p class="my-025" style="font-size:13px">
                        Purchase Date<br>
                        ${format.asString('dd/MM/yyyy hh:mm', new Date(ticket.created + (60 * 60 * 1000) ))}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <p style="font-size:13px;text-align: center;">
                    Ci scusiamo per l'inconveniente e speriamo che tu riproverai.
                  </p>
                  <p style="font-size:13px;text-align: center;">
                    Ci auguriamo che tu ti div
                  </p>
                </div>
              </p>
            </div>
          </section>
          <footer style="text-align: center;">
            <section style="padding: 1em;border-top: 1px solid #ccc; border-right: 0.5px solid rgba(149,157,165,0.2);border-left: 0.5px solid rgba(149,157,165,0.2);">
              <p>
                Como 1907 non ti invierà mai un'e-mail chiedendoti di rivelare o verificare la tua password, carta di credito o numero di conto bancario.
              </p>
            </section>
            <section style="background-color: #f0f2f3;padding: 2em;">
              <p style="width: 90%;margin: auto;font-size: .75em;">
                Questo messaggio è stato prodotto e distribuito da COMO 1907. ©2023, Inc. Tutti i diritti riservati. COMO 1907 è un marchio registrato. Visualizza la nostra informativa sulla privacy.
              </p>
            </section>
          </footer>
        </div>
      </body>
    </html>
    `;
  }
}

const emailTemplateFailureIssueTickets = (ticket, language, homePageTitle, logoImageUrl) => {
  if (language == 'en') {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
          <title>COMO 1907 - Your Ticket Purchase Failed</title>
        </head>
        <body>
          <div class="email-card" style="width: 95%; max-width: 590px; margin: 0 auto; font-family: Arial, Helvetica, sans-serif; color: #000;">
            <div class="email-card
            __header" style="height: 5em; background-color: #252F3D; width: 100%; color: #fff; margin-bottom: 0; display: grid; grid-template-columns: 1fr; grid-template-rows: repeat(3, 1fr);">
              <div style="display: flex; margin: 0 auto;">
                <div style="width: 40px;">
                  <img src="${logoImageUrl}" alt="Logo" style="width: 100%; margin-top: 10px" />
                </div>
                <h2 style="font-size: 1.2em; margin-bottom: 1em; margin: 1.3em 0;">${homePageTitle}</h2>
              </div>
            </div>

            <section class="card-body" style="box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px; border: 0.5px solid rgba(149, 157, 165, 0.2); padding: 2em;">
              <h3>Your Ticket Purchase Failed</h3>
              <div style="text-align: justify;">

                <p>
                We regret to inform you that your ticket purchase for the ${ticket.fixture_name} Match Event has failed. The ticket purchase has not been processed and the Digital Ticket(s) have not been added to your account.
                  <br>
                  <br>
                  Please note the following important information:
                  <br>
                  <br>
                  The ticket(s) will not be added to your account and will not be valid for entry. The ticket purchase has not been processed and the Digital Ticket(s) have not been added to your account.
                  <br>
                  <br>
                  <div style="width:100%">
                    <p style="font-size:13px">
                      Below are the details of your ticket purchase:<br>
                    </p>
                    ${ticket.failedCreations.map(failedCreation => `
                      <div style="margin-bottom: 20px;">
                        <p style="font-size: 13px; margin: 0;">
                          <strong>Error:</strong> ${failedCreation.error.Message}
                        </p>
                        <p style="font-size: 13px;">
                          <strong>Match Event:</strong> ${failedCreation.data.modelloBiglietto.eventoId} - ${failedCreation.data.modelloBiglietto.postoLabel}
                        </p>
                        <p style="font-size: 13px;">
                          <strong>Seat:</strong> ${failedCreation.data.modelloBiglietto.codicePosto}, ${failedCreation.data.modelloBiglietto.fila}
                        </p>
                        <p style="font-size: 13px;">
                          <strong>Gate:</strong> ${failedCreation.data.modelloBiglietto.varco}
                        </p>
                      </div>
                    `).join('')}
                    <div style="display:flex;width:100%">
                      <div style="width:100%">
                        <div class="mb-1">
                          <p class="my-025" style="font-size:13px">
                            Purchase Date<br>
                            ${format.asString('dd/MM/yyyy hh:mm', new Date(ticket.created + (60 * 60 * 1000) ))}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p style="font-size:13px;text-align: center;">
                      We apologize for the inconvenience and hope you will try again.
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
          <title>COMO 1907 - Il tuo acquisto del biglietto è fallito</title>
        </head>
        <body>
          <div class="email-card
          " style="width: 95%; max-width: 590px; margin: 0 auto; font-family: Arial, Helvetica, sans-serif; color: #000;">

            <div class="email-card__header" style="height: 5em; background-color: #252F3D; width: 100%; color: #fff; margin-bottom: 0; display: grid; grid-template-columns: 1fr; grid-template-rows: repeat(3, 1fr);">
              <div style="display: flex; margin: 0 auto;">
                <div style="width: 40px;">
                  <img src="${logoImageUrl}" alt="Logo" style="width: 100%; margin-top: 10px" />
                </div>
                <h2 style="font-size: 1.2em; margin-bottom: 1em; margin: 1.3em 0;">${homePageTitle}</h2>
              </div>
            </div>

            <section class="card-body" style="box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px; border: 0.5px solid rgba(149, 157, 165, 0.2); padding: 2em;">
              <h3>Il tuo acquisto del biglietto è fallito</h3>
              <div style="text-align: justify;">

                <p>
                Ci dispiace informarti che il tuo acquisto del biglietto per l'evento della partita ${ticket.fixture_name} è fallito. L'acquisto del biglietto non è stato elaborato e i biglietti digitali non sono stati aggiunti al tuo account.
                  <br>
                  <br>
                  Si prega di notare le seguenti informazioni importanti:
                  <br>
                  <br>
                  Il/i biglietto/i non verrà/nno aggiunto/i al tuo account e non sarà/nno valido/i per l'ingresso. L'acquisto del biglietto non è stato elaborato e i biglietti digitali non sono stati aggiunti al tuo account.
                  <br>
                  <br>
                  <div style="width:100%">
                    <p style="font-size:13px">
                    Di seguito sono riportati i dettagli del tuo acquisto del biglietto:<br>
                    </p>
                    ${ticket.failedCreations.map(failedCreation => `
                      <div style="margin-bottom: 20px;">
                        <p style="font-size: 13px; margin: 0;">
                          <strong>Error:</strong> ${failedCreation.error.Message}
                        </p>
                        <p style="font-size: 13px;">
                          <strong>Match Event:</strong> ${failedCreation.data.modelloBiglietto.eventoId} - ${failedCreation.data.modelloBiglietto.postoLabel}
                        </p>
                        <p style="font-size: 13px;">
                          <strong>Seat:</strong> ${failedCreation.data.modelloBiglietto.codicePosto}, ${failedCreation.data.modelloBiglietto.fila}
                        </p>
                        <p style="font-size: 13px;">
                          <strong>Gate:</strong> ${failedCreation.data.modelloBiglietto.varco}
                        </p>
                      </div>
                    `).join('')}
                    <div style="display:flex;width:100%">
                      <div style="width:100%">
                        <div class="mb-1">
                          <p class="my-025" style="font-size:13px">
                            Data di acquisto<br>
                            ${format.asString('dd/MM/yyyy hh:mm', new Date(ticket.created + (60 * 60 * 1000) ))}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p style="font-size:13px;text-align: center;">
                      Ci scusiamo per l'inconveniente e speriamo che tu riproverai.
                      </p>
                      <p style="font-size:13px;text-align: center;">
                        Ci auguriamo che tu ti div
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
}

const emailTemplateSeasonTicketTransferToReceiver = (ticket, language, homePageTitle, logoImageUrl) => {
  if (language == 'en') {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
          <title>COMO 1907 - You have received a season ticket transfer</title>
        </head>
        <body>
          <div class="email-card" style="width: 95%; max-width: 590px; margin: 0 auto; font-family: Arial, Helvetica, sans-serif; color: #000;">
            <div class="email-card
            __header" style="height: 5em; background-color: #252F3D; width: 100%; color: #fff; margin-bottom: 0; display: grid; grid-template-columns: 1fr; grid-template-rows: repeat(3, 1fr);">
              <div style="display: flex; margin: 0 auto;">
                <div style="width: 40px;">
                  <img src="${logoImageUrl}" alt="Logo" style="width: 100%; margin-top: 10px" />
                </div>
                <h2 style="font-size: 1.2em; margin-bottom: 1em; margin: 1.3em 0;">${homePageTitle}</h2>
              </div>
            </div>

            <section class="card-body" style="box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px; border: 0.5px solid rgba(149, 157, 165, 0.2); padding: 2em;">
              <h3>You have received a season ticket transfer!</h3>
              <div style="text-align: justify;">

                <p>
                You have received a season ticket transfer for the ${ticket.season_ticket_name} Season Ticket. The season ticket has been transferred to your account and the Digital Ticket(s) have been added to your account.
                  <br>
                  <br>
                  Please note the following important information:
                  <br>
                  <br>
                  The season ticket(s) will be added to your account and will be valid for entry. The season ticket(s) will be removed from the sender's account and will no longer be valid for entry.
                  <br>
                  <br>
                  <div style="width:100%">
                    <p style="font-size:13px">
                      Below are the transfer details for your season ticket:<br>
                    </p>
                    <div style="display:flex;width:100%">
                      <div style="width:100%">
                        <div class="mb-1">
                          <p class="my-025" style="font-size:13px">
                            Transfer Date<br>
                            ${ticket.modified}
                          </p>
                        </div>
                      </div>
                      <div style="width:100%">
                        <div class="mb-1">
                          <p class="my-025" style="font-size:13px">
                            Season Ticket Name<br>
                            ${ticket.season_ticket_name}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p style="font-size:13px;text-align: center;">
                      You have successfully received a season ticket transfer on COMO 1907.
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
          <title>COMO 1907 - Hai ricevuto un trasferimento di abbonamento</title>
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
              <h3>Hai ricevuto un trasferimento di abbonamento!</h3>
              <div style="text-align: justify;">
                <p>
                Hai ricevuto un trasferimento di abbonamento per l'abbonamento ${ticket.season_ticket_name}. L'abbonamento è stato trasferito al tuo account e i biglietti digitali sono stati aggiunti al tuo account.
                  <br>
                  <br>
                  Si prega di notare le seguenti informazioni importanti:
                  <br>
                  <br>
                  L'abbonamento verrà aggiunto al tuo account e sarà valido per l'ingresso. L'abbonamento verrà rimosso dall'account del mittente e non sarà più valido per l'ingresso.
                  <br>
                  <br>
                  <div style="width:100%">
                    <p style="font-size:13px">
                    Di seguito sono riportati i dettagli del trasferimento del tuo abbonamento:<br>
                    </p>
                    <div style="display:flex;width:100%">
                      <div style="width:100%">
                        <div class="mb-1">
                          <p class="my-025" style="font-size:13px">
                            Data del trasferimento<br>
                            ${ticket.modified}
                          </p>
                        </div>
                      </div>
                      <div style="width:100%">

                        <div class="mb-1">
                          <p class="my-025" style="font-size:13px">
                            Nome dell'abbonamento<br>
                            ${ticket.season_ticket_name}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p style="font-size:13px;text-align: center;">
                      Hai ricevuto con successo un trasferimento di abbonamento su COMO 1907.
                      </p>
                      <p style="font-size:13px;text-align: center;">
                      Ci auguriamo che tu ti div
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
}

const emailTemplateSeasonTicketTransferToSender = (ticket, language, homePageTitle, logoImageUrl) => {
  if (language == 'en') {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
          <title>COMO 1907 - Your Season Ticket Transfer was Successful</title>
        </head>
        <body>
          <div class="email-card" style="width: 95%; max-width: 590px; margin: 0 auto; font-family: Arial, Helvetica, sans-serif; color: #000;">
            <div class="email-card
            __header" style="height: 5em; background-color: #252F3D; width: 100%; color: #fff; margin-bottom: 0; display: grid; grid-template-columns: 1fr; grid-template-rows: repeat(3, 1fr);">
              <div style="display: flex; margin: 0 auto;">
                <div style="width: 40px;">
                  <img src="${logoImageUrl}" alt="Logo" style="width: 100%; margin-top: 10px" />
                </div>
                <h2 style="font-size: 1.2em; margin-bottom: 1em; margin: 1.3em 0;">${homePageTitle}</h2>
              </div>
            </div>

            <section class="card-body" style="box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px; border: 0.5px solid rgba(149, 157, 165, 0.2); padding: 2em;">
              <h3>Congratulations, your season ticket transfer was successful!</h3>
              <div style="text-align: justify;">

                <p>
                We are excited to inform you that your season ticket transfer for the ${ticket.season_ticket_name} Season Ticket has been successfully processed. The season ticket has been transferred to the recipient and the Digital Ticket(s) have been removed from your account.
                  <br>
                  <br>
                  Please note the following important information:
                  <br>
                  <br>
                  The recipient will receive an email notification with the season ticket(s) and the season ticket(s) will be added to their account. The season ticket(s) will be removed from your account and will no longer be valid for entry.
                  <br>
                  <br>
                  <div style="width:100%">
                    <p style="font-size:13px">
                      Below are the transfer details for your season ticket:<br>
                    </p>
                    <div style="display:flex;width:100%">
                      <div style="width:100%">
                        <div class="mb-1">
                          <p class="my-025" style="font-size:13px">
                            Transfer Date<br>
                            ${ticket.modified}
                          </p>
                        </div>
                      </div>
                      <div style="width:100%">
                        <div class="mb-1">
                          <p class="my-025" style="font-size:13px">
                            Season Ticket Name<br>
                            ${ticket.season_ticket_name}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p style="font-size:13px;text-align: center;">
                      Thank you for completing your season ticket transfer on COMO 1907.
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
          <title>COMO 1907 - Il tuo trasferimento dell'abbonamento è riuscito</title>
        </head>
        <body>
          <div class="email-card
          " style="width: 95%; max-width: 590px; margin: 0 auto; font-family: Arial, Helvetica, sans-serif; color: #000;">
            <div class="email-card__header" style="height: 5em; background-color: #252F3D; width: 100%; color: #fff; margin-bottom: 0; display: grid; grid-template-columns: 1fr; grid-template-rows: repeat(3, 1fr);">
              <div style="display: flex; margin: 0 auto;">
                <div style="width: 40px;">
                  <img src="${logoImageUrl}" alt="Logo" style="width: 100%; margin-top: 10px" />
                </div>
                <h2 style="font-size: 1.2em; margin-bottom: 1em; margin: 1.3em 0;">${homePageTitle}</h2>
              </div>
            </div>

            <section class="card-body" style="box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px; border: 0.5px solid rgba(149, 157, 165, 0.2); padding: 2em;">
              <h3>Il tuo trasferimento dell'abbonamento è riuscito!</h3> 
              <div style="text-align: justify;">
                <p>
                Siamo lieti di informarti che il tuo trasferimento dell'abbonamento per l'abbonamento ${ticket.season_ticket_name} è stato completato con successo. L'abbonamento è stato trasferito al destinatario e i biglietti digitali sono stati rimossi dal tuo account.
                  <br>
                  <br>
                  Si prega di notare le seguenti informazioni importanti:
                  <br>
                  <br>
                  Il destinatario riceverà una notifica via email con l'abbonamento e l'abbonamento verrà aggiunto al suo account. L'abbonamento verrà rimosso dal tuo account e non sarà più valido per l'ingresso.
                  <br>
                  <br>
                  <div style="width:100%">
                    <p style="font-size:13px">
                    Di seguito sono riportati i dettagli del trasferimento del tuo abbonamento:<br>
                    </p>
                    <div style="display:flex;width:100%">
                      <div style="width:100%">
                        <div class="mb-1">
                          <p class="my-025" style="font-size:13px">
                            Data del trasferimento<br>
                            ${ticket.modified}
                          </p>
                        </div>
                      </div>
                      <div style="width:100%">
                        <div class="mb-1">

                          <p class="my-025" style="font-size:13px">
                            Nome dell'abbonamento<br>
                            ${ticket.season_ticket_name}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p style="font-size:13px;text-align: center;">
                      Grazie per aver completato il trasferimento del tuo abbonamento su COMO 1907.
                      </p>
                      <p style="font-size:13px;text-align: center;">

                        Ci auguriamo che tu ti div
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
}

const emailTemplateTicketTransferToReceiver = (ticket, language, homePageTitle, logoImageUrl) => {
  if (language == 'en') {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
          <title>COMO 1907 - You have received a ticket transfer</title>
        </head>
        <body>
          <div class="email-card" style="width: 95%; max-width: 590px; margin: 0 auto; font-family: Arial, Helvetica, sans-serif; color: #000;">
            <div class="email-card
            __header" style="height: 5em; background-color: #252F3D; width: 100%; color: #fff; margin-bottom: 0; display: grid; grid-template-columns: 1fr; grid-template-rows: repeat(3, 1fr);">
              <div style="display: flex; margin: 0 auto;">
                <div style="width: 40px;">
                  <img src="${logoImageUrl}" alt="Logo" style="width: 100%; margin-top: 10px" />
                </div>
                <h2 style="font-size: 1.2em; margin-bottom: 1em; margin: 1.3em 0;">${homePageTitle}</h2>
              </div>
            </div>

            <section class="card-body" style="box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px; border: 0.5px solid rgba(149, 157, 165, 0.2); padding: 2em;">
              <h3>You have received a ticket transfer!</h3>
              <div style="text-align: justify;">
                <p>
                You have received a ticket transfer for the ${ticket.fixture_name} Match Event. The ticket has been transferred to your account and the Digital Ticket(s) have been added to your account.
                  <br>
                  <br>
                  Please note the following important information:
                  <br>
                  <br>
                  The ticket(s) will be added to your account and will be valid for entry. The ticket(s) will be removed from the sender's account and will no longer be valid for entry.
                  <br>
                  <br>
                  <div style="width:100%">
                    <p style="font-size:13px">
                      Below are the transfer details for your ticket:<br>
                    </p>
                    <div style="display:flex;width:100%">
                      <div style="width:100%">
                        <div class="mb-1">
                          <p class="my-025" style="font-size:13px">
                            Transfer Date<br>
                            ${ticket.modified}
                          </p>
                        </div>
                      </div>
                      <div style="width:100%">
                        <div class="mb-1">
                          <p class="my-025" style="font-size:13px">
                            Match Event - Ticket Type<br>
                            ${ticket.fixture_name} - ${ticket.ticket_type}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p style="font-size:13px;text-align: center;">
                      You have successfully received a ticket transfer on COMO 1907.
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
          <title>COMO 1907 - Hai ricevuto un trasferimento di biglietto</title>
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
              <h3>Hai ricevuto un trasferimento di biglietto!</h3>
              <div style="text-align: justify;">
                <p>
                Hai ricevuto un trasferimento di biglietto per l'evento della partita ${ticket.fixture_name}. Il biglietto è stato trasferito al tuo account e i biglietti digitali sono stati aggiunti al tuo account.
                  <br>
                  <br>
                  Si prega di notare le seguenti informazioni importanti:
                  <br>
                  <br>
                  Il/i biglietto/i verranno aggiunti al tuo account e saranno validi per l'ingresso. Il/i biglietto/i verranno rimossi dall'account del mittente e non saranno più validi per l'ingresso.
                  <br>
                  <br>
                  <div style="width:100%">
                    <p style="font-size:13px">
                    Di seguito sono riportati i dettagli del trasferimento del tuo biglietto:<br>
                    </p>
                    <div style="display:flex;width:100%">
                      <div style="width:100%">
                        <div class="mb-1">
                          <p class="my-025" style="font-size:13px">
                            Data del trasferimento<br>
                            ${ticket.modified}
                          </p>
                        </div>
                      </div>
                      <div style="width:100%">
                        <div class="mb-1">
                          <p class="my-025" style="font-size:13px">
                            Evento della partita - Tipo di biglietto<br>
                            ${ticket.fixture_name} - ${ticket.ticket_type}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p style="font-size:13px;text-align: center;">
                      Hai ricevuto con successo un trasferimento di biglietto su COMO 1907.
                      </p>
                      <p style="font-size:13px;text-align: center;">
                        Ci auguriamo che tu ti div
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
}

const emailTemplateTicketTransferToSender = (ticket, language, homePageTitle, logoImageUrl) => {
  if (language == 'en') {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
          <title>COMO 1907 - Your Ticket Transfer was Successful</title>
        </head>
        <body>
          <div class="email-card" style="width: 95%; max-width: 590px; margin: 0 auto; font-family: Arial, Helvetica, sans-serif; color: #000;">
            <div class="email-card
            __header" style="height: 5em; background-color: #252F3D; width: 100%; color: #fff; margin-bottom: 0; display: grid; grid-template-columns: 1fr; grid-template-rows: repeat(3, 1fr);">
              <div style="display: flex; margin: 0 auto;">
                <div style="width: 40px;">
                  <img src="${logoImageUrl}" alt="Logo" style="width: 100%; margin-top: 10px" />
                </div>
                <h2 style="font-size: 1.2em; margin-bottom: 1em; margin: 1.3em 0;">${homePageTitle}</h2>
              </div>
            </div>

            <section class="card-body" style="box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px; border: 0.5px solid rgba(149, 157, 165, 0.2); padding: 2em;">
              <h3>Congratulations, your ticket transfer was successful!</h3>
              <div style="text-align: justify;">
                <p>
                We are excited to inform you that your ticket transfer for the ${ticket.fixture_name} Match Event has been successfully processed. The ticket has been transferred to the recipient and the Digital Ticket(s) have been removed from your account.
                  <br>
                  <br>
                  Please note the following important information:
                  <br>
                  <br>
                  The recipient will receive an email notification with the ticket(s) and the ticket(s) will be added to their account. The ticket(s) will be removed from your account and will no longer be valid for entry.
                  <br>
                  <br>
                  <div style="width:100%">
                    <p style="font-size:13px">
                      Below are the transfer details for your ticket:<br>
                    </p>
                    <div style="display:flex;width:100%">
                      <div style="width:100%">
                        <div class="mb-1">
                          <p class="my-025" style="font-size:13px">
                            Transfer Date<br>
                            ${ticket.modified}
                          </p>
                        </div>
                      </div>
                      <div style="width:100%">
                        <div class="mb-1">
                          <p class="my-025" style="font-size:13px">
                            Match Event - Ticket Type<br>
                            ${ticket.fixture_name} - ${ticket.ticket_type}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p style="font-size:13px;text-align: center;">
                      Thank you for completing your ticket transfer on COMO 1907.
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
          <title>COMO 1907 - Il trasferimento del biglietto è riuscito!</title>
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
              <h3>Congratulazioni, il trasferimento del biglietto è riuscito!</h3>
              <div style="text-align: justify;">
                <p>
                Siamo lieti di informarti che il trasferimento del biglietto per l'evento della partita ${ticket.fixture_name} è stato elaborato con successo. Il biglietto è stato trasferito al destinatario e i biglietti digitali sono stati rimossi dal tuo account.
                  <br>
                  <br>
                  Si prega di notare le seguenti informazioni importanti:
                  <br>
                  <br>
                  Il destinatario riceverà una notifica via email con il/i biglietto/i e il/i biglietto/i verranno aggiunti al suo account. Il/i biglietto/i verranno rimossi dal tuo account e non saranno più validi per l'ingresso.
                  <br>
                  <br>
                  <div style="width:100%">
                    <p style="font-size:13px">
                    Di seguito sono riportati i dettagli del trasferimento del tuo biglietto:<br>
                    </p>
                    <div style="display:flex;width:100%">
                      <div style="width:100%">
                        <div class="mb-1">
                          <p class="my-025" style="font-size:13px">
                            Data del trasferimento<br>
                            ${ticket.modified}
                          </p>
                        </div>
                      </div>
                      <div style="width:100%">
                        <div class="mb-1">
                          <p class="my-025" style="font-size:13px">
                            Evento della partita - Tipo di biglietto<br>
                            ${ticket.fixture_name} - ${ticket.ticket_type}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p style="font-size:13px;text-align: center;">
                      Grazie per aver completato il trasferimento del tuo biglietto su COMO 1907.
                      </p>
                      <p style="font-size:13px;text-align: center;">
                      Ci auguriamo che tu ti div
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
}

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
                            ${ticket.payment_type}
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
                            ${ticket.payment_type}
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

const emailTemplateSeasonTicketPurchase = (ticket, language, homePageTitle, logoImageUrl) => {

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
                We are excited to inform you that your transaction for the ${ticket.season_ticket_name} Season Ticket has been successfully processed. The payment has been approved and added the Digital Ticket(s) have been added to your account.
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
                            ${ticket.payment_type}
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
                            ${ticket.season_ticket_name} - ${ticket.ticket_type}
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
                Siamo lieti di informarti che la tua transazione per il Match Event ${ticket.season_ticket_name} è stata elaborata con successo. Il pagamento è stato approvato e i biglietti abbonamento digitali sono stati aggiunti al tuo account.
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
                            ${ticket.payment_type}
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
                            ${ticket.season_ticket_name} - ${ticket.ticket_type}
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

module.exports = { sendOTP, sendTicketPurchaseEmail, sendSeasonTicketPurchaseEmail, sendFixtureTicketTransferToPersonEmail, sendSeasonTicketTransferToPersonEmail, sendFailureIssueFixtureTicketsEmail, sendFailureIssueSeasonTicketsEmail };
