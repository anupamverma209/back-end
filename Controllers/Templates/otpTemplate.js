require("dotenv").config();
const MAIL_BANNER = process.env.MAIL_BANNER;

module.exports = function otpTemplate(otp, accountType) {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          
          <!-- Image Banner -->
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${MAIL_BANNER}" style="max-width: 100%; height: auto; border-radius: 6px;">
          </div>

          <!-- Heading -->
          <h2 style="color: #007bff; text-align: center;">Email Verification</h2>

          <p>Hello,</p>
          <p>Thank you for registering. Please use the OTP below to verify your email:</p>

          <!-- OTP Box -->
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background-color: #e6f4ea; padding: 15px 25px; border-radius: 6px; font-size: 24px; font-weight: bold; color: #28a745;">
              ${otp}
            </div>
          </div>

          <p>This OTP is valid for <strong>5 minutes</strong>.</p>
          <p>You have registered as: <strong>${accountType}</strong></p>

          <br>
          <p>Thanks & regards,<br><strong>Achiciz Team</strong></p>

          <!-- Footer -->
          <hr style="margin: 40px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">
            For support, contact us at <a href="mailto:support@achiciz.com" style="color: #007bff;">sahindmailer@gmail.com</a><br>
            &copy; 2025 Achiciz. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;
};

module.exports = function forgotPasswordTemplate(otp) {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          
          <!-- Image Banner -->
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${MAIL_BANNER}" style="max-width: 100%; height: auto; border-radius: 6px;">
          </div>

          <!-- Heading -->
          <h2 style="color: #007bff; text-align: center;">Your OTP</h2>

          <p>Hello,</p>
          <p>Use the OTP below to complete your action:</p>

          <!-- OTP Box -->
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background-color: #e6f4ea; padding: 15px 25px; border-radius: 6px; font-size: 24px; font-weight: bold; color: #28a745;">
              ${otp}
            </div>
          </div>

          <p>This OTP is valid for <strong>5 minutes</strong>.</p>
          <p>If you did not request this, please ignore this email.</p>

          <br>
          <p>Thanks & regards,<br><strong>Achiciz Team</strong></p>

          <!-- Footer -->
          <hr style="margin: 40px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">
            For support, contact us at <a href="mailto:sahindmailer@gmail.com" style="color: #007bff;">sahindmailer@gmail.com</a><br>
            &copy; 2025 Achiciz. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;
};

module.exports = function reSendOtpTemplate(otp) {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          
          <!-- Banner Image -->
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${MAIL_BANNER}" style="max-width: 100%; height: auto; border-radius: 6px;" alt="Achiciz Banner" />
          </div>

          <!-- Heading -->
          <h2 style="color: #007bff; text-align: center;">Your OTP Code</h2>

          <p>Hello,</p>
          <p>You've requested a new One-Time Password (OTP). Please use the code below:</p>

          <!-- OTP Box -->
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background-color: #e6f4ea; padding: 15px 25px; border-radius: 6px; font-size: 24px; font-weight: bold; color: #28a745;">
              ${otp}
            </div>
          </div>

          <p>This OTP is valid for <strong>5 minutes</strong>.</p>
          <p>If you did not request this OTP, please ignore this email.</p>

          <br>
          <p>Thanks & regards,<br><strong>Achiciz Team</strong></p>

          <!-- Footer -->
          <hr style="margin: 40px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">
            For support, contact us at <a href="mailto:support@achiciz.com" style="color: #007bff;">support@achiciz.com</a><br>
            &copy; 2025 Achiciz. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;
};
