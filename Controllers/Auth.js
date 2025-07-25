const User = require("../Models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const sendEmail = require("../Utils/SendMail");
const { crypto } = require("crypto");
const sendOtpToMobile = require("../Utils/SMSotp");
const Mobile = require("../Models/mobil");
const { error } = require("console");
const otpTemplate = require("./Templates/otpTemplate");
const forgotPasswordTemplate = require("./Templates/otpTemplate");
const reSendOtpTemplate = require("./Templates/otpTemplate");

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// signup method for email users
// This method handles user registration, including password hashing and OTP generation.
const signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, accountType } = req.body;

    if (!email || !password || !confirmPassword || !name || !accountType) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedConfirmPassword = await bcrypt.hash(confirmPassword, 10);

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      confirmPassword: hashedConfirmPassword,
      accountType,
      otp,
      otpExpires,
    });
    try {
      await sendEmail(
        email,
        "Verify your email",
        otpTemplate(otp, accountType)
      );
    } catch (error) {
      console.error("Error sending OTP email:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to send OTP email" });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent to email",
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// verifyOtp method for email users
// This method verifies the OTP sent to the user's email during signup.
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // ❌ OTP doesn't match
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP Please try again",
      });
    }

    // ❌ OTP expired
    if (user.otpExpires < new Date()) {
      await User.deleteOne({ email });
      return res.status(400).json({
        success: false,
        message: "OTP has expired. User data deleted.",
      });
    }

    // ✅ OTP is valid
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Re-send OTP to email for verification
// This method allows users to request a new OTP if they didn't receive the first one or if
const reSendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email already verified" });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min
    await user.save();
    try {
      await sendEmail(email, "Resend OTP", reSendOtpTemplate(otp));
    } catch (error) {
      console.error("Error sending OTP email:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to send OTP email" });
    }

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// login method for email users
// This method handles user login, verifies credentials, and generates a JWT token.
const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        success: false,
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Email not verified",
        success: false,
      });
    }
    if (!user.isActive) {
      return res.status(403).json({
        message: "you are blocked",
        success: false,
      });
    }
    // Prepare payload for JWT
    let payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      accountType: user.accountType,
    };
    // Compare password with hashed password
    if (await bcrypt.compare(password, user.password)) {
      // create JWT token
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "10h",
      });
      user.token = token; // Store the token in the user object
      user.password = undefined; // Remove password from the response
      user.confirmPassword = undefined; // Remove confirmPassword from the response

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 1 hour
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      };
      res.cookie("anupamCookie", token, options).status(200).json({
        message: "Login successful",
        success: true,
        data: {
          user,
          token,
        },
      });
    } else {
      return res.status(401).json({
        message: "Invalid password",
        success: false,
      });
    }
  } catch (err) {
    console.error("Error during login:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: err.message,
    });
  }
};

// STEP 1: Send OTP and signup (for Signup/Login) for mobile users
const sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;
    console.log("Mobile number received:", mobile);

    if (!mobile) {
      return res
        .status(400)
        .json({ success: false, message: "Mobile number is required" });
    }

    let user = await Mobile.findOne({ mobile });

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // expires in 5 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    const otpSent = await sendOtpToMobile(mobile, otp); // twilio send

    if (!otpSent.success) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to send OTP" });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      mobile,
    });
  } catch (error) {
    console.error("OTP send error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// STEP 2: Verify OTP (for Signup/Login) for mobile users
const verifyOtpAndLogin = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Mobile and OTP are required" });
    }

    const user = await Mobile.findOne({ mobile });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }
    let payload = {
      id: user._id,
      aaccountType: user.accountType,
    };

    // Generate JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Clear OTP and save
    user.accountType = Mobile.accountType || "User"; // Default to User if not set
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Set cookie
    res.cookie("token", user, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Optional: inject userId in req.body for chained use
    req.body.userId = user._id;

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// controllers/Auth.js

const logout = async (req, res) => {
  try {
    // Clear the token cookie by setting it to empty and expiring it immediately
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0), // Expire the cookie immediately
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed due to server error",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User with this email not found" });
    }

    // 2. Generate 6-digit OTP
    const otp = generateOtp();

    // 3. Set OTP & expiry on user (save in DB)
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes from now
    await user.save();

    // 4. Send OTP via email
    try {
      await sendEmail(email, "Verify your email", forgotPasswordTemplate(otp));
    } catch (error) {
      console.error("Error sending OTP email:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to send OTP email" });
    }

    // 5. Response
    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    if (!email || !otp || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.confirmPassword = hashedPassword;

    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // OTP doesn't match
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // OTP expired
    if (user.otpExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // OTP is valid
    // Optionally you can clear OTP fields after verification
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Forgot Password OTP verification error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  signup,
  verifyOtp,
  reSendOtp,
  Login,
  sendOtp,
  verifyOtpAndLogin,
  logout,
  forgotPassword,
  resetPassword,
  verifyForgotPasswordOtp,
};
