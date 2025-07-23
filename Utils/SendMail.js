const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (to, subject, text) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail", // or use SMTP config below for custom providers
      auth: {
        user: process.env.EMAIL_USER, // your Gmail or service email
        pass: process.env.EMAIL_PASS, // app password or email password
      },
    });

    // Define mail options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Email send error:", error.message);
    throw error;
  }
};

module.exports = sendEmail;
