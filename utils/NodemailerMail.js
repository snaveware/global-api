const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.elasticemail.net",
  port: 2525,
  secure: true,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: "info@snaveware.com",
    pass: "3EDD36B0F71552E969A695AB46E9A7823850",
  },
});

// async..await is not allowed in global scope, must use a wrapper
async function sendMail(to, subject, message, filePath) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: "info@snaveware.com", // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    text: message, // plain text body
    html: `<p>${message}</p>`, // html body
    attachments: [
      {
        filename: "Manifest",
        path: filePath,
      },
    ],
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  //
  // NOTE: You can go to https://forwardemail.net/my-account/emails to see your email delivery status and preview
  //       Or you can use the "preview-email" npm package to preview emails locally in browsers and iOS Simulator
  //       <https://github.com/forwardemail/preview-email>
  //
}

async function sendRecoveryEmail(to, subject, url) {
  const info = await transporter.sendMail({
    from: "info@snaveware.com", // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    text: message, // plain text body
    html: `
    Click the url below to recover your password
    ${url}
    `,
    html: `
    <p> click the link below to recover your password.</p>
    <a href="${url}" style="background-color: rgb(100,100,250); text-decoration: none; color: white; padding: 8px 15px; border-radius: 5px;">Recover Your Password </a>

    <p>Or visit the following url</p>
    <p style="padding: 5px; text-align: center">${url}</p>
    
    `, // html body
  });
}
// main().catch(console.error);

module.exports = {
  sendMail,
  sendRecoveryEmail,
};
