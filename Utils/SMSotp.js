// const twilio = require("twilio");
require("dotenv").config();
// const client = new twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// module.exports = client;
const twilio = require("twilio");
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtpToMobile = async (number, otp) => {
  try {
    const message = await client.messages.create({
      body: `Your OTP is ${otp}`,
      to: number.startsWith("+91") ? number : `+91${number}`, // India prefix
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    console.log("OTP sent:", message.sid);
    return { success: true };
  } catch (error) {
    console.error("Twilio Error:", error);
    return { success: false, error };
  }
};

module.exports = sendOtpToMobile;
