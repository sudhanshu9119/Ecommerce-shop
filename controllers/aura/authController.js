const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const AuthUser = require('../../models/aura/AuraUserModal');
const nodemailer = require('nodemailer');
const nodemailerSendgrid = require('nodemailer-sendgrid');
const multer = require('multer');
const storage = require('../../config/gridfs');

const transportor = nodemailer.createTransport(
  nodemailerSendgrid({
    apiKey: process.env.SENDGRID_API_KEY,
  })
);

const uploadAvatar = multer({ storage }).single("avatar");

module.exports.postSignUp = async (req, res) => {

  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: "Username, email, and password are required." 
      });
    }

  
    const existingUser = await AuthUser.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        message: "User already exists, please login." 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = new AuthUser({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Send Welcome Email
    try {
      // await transportor.sendMail({
      //   from: process.env.MAIL_FROM || 'no-reply@example.com',
      //   to: email,
      //   subject: 'Welcome to Our App!',
      //   text: `Hello ${username}, welcome to our platform!`,
      //   html: `<h3>Welcome, ${username}!</h3><p>Thank you for signing up.</p>`
      // });

      console.log(`email has been sent successfully to ${email}`);

    } catch (mailErr) {
      console.error('Mail send error:', mailErr);
    }

    return res.status(201).json({
      message: "Signup successful!",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ 
      message: "Internal Server Error" 
    });
  }
};


module.exports.postSignIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const existingUser = await AuthUser.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    req.session.user = {
      id: existingUser._id,
      username: existingUser.username,
      email: existingUser.email
    };

    return res.status(200).json({
      message: "Login successful!",
      user: req.session.user
    });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.getLoggedInData = (req, res) => {
  console.log("loggedin User data fired")
  if (!req.session.user) {
    return res.status(401).json({ message: "Not logged in" });
  }

  return res.status(200).json({
    user: req.session.user
  });
};

module.exports.postForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await AuthUser.findOne({ email });

    // Always respond with success message to avoid leaking which emails exist
    if (!user) {
      return res.status(200).json({
        message:
          "If this email is registered, a reset code has been sent to your inbox.",
      });
    }

    const resetToken = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6-char code
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiration = new Date(expiresAt);
    await user.save();

    try {
      await transportor.sendMail({
        from: process.env.MAIL_FROM || "no-reply@example.com",
        to: email,
        subject: "Aura Password Reset Code",
        text: `Your Aura password reset code is: ${resetToken}. This code will expire in 1 hour.`,
        html: `<p>Your Aura password reset code is: <strong>${resetToken}</strong></p><p>This code will expire in 1 hour.</p>`,
      });
      console.log(`Password reset code sent to ${email}`);
    } catch (mailErr) {
      console.error("Password reset mail error:", mailErr);
      // Still return success to the client, but log for debugging
    }

    return res.status(200).json({
      message:
        "If this email is registered, a reset code has been sent to your inbox.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.postResetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, reset code, and new password are required" });
    }

    const user = await AuthUser.findOne({
      email,
      resetToken: token,
      resetTokenExpiration: { $gt: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset code" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;

    await user.save();

    return res.status(200).json({ message: "Password has been updated" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update profile (username + optional avatar)
module.exports.updateProfile = [
  uploadAvatar,
  async (req, res) => {
    try {
      const { userId, username } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }

      const update = {};
      if (username) update.username = username;
      if (req.file && req.file.id) {
        update.avatar = req.file.id;
      }

      const user = await AuthUser.findByIdAndUpdate(userId, update, {
        new: true,
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        message: "Profile updated",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar || null,
        },
      });
    } catch (error) {
      console.error("Update profile error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
];


// module.exports.updateAvatar = async (req, res) => {
//   try {
//     if (!req.session.user) {
//       return res.status(401).json({ message: "Not logged in" });
//     }

//     if (!req.file) {
//       return res.status(400).json({ message: "Avatar image required" });
//     }

//     const userId = req.session.user.id;
//     const avatarId = req.file.id;

//     const updatedUser = await AuthUser.findByIdAndUpdate(
//       userId,
//       { avatar: avatarId },
//       { new: true }
//     );

//     req.session.user.avatar = avatarId;

//     res.status(200).json({
//       message: "Avatar updated successfully",
//       user: updatedUser
//     });

//   } catch (error) {
//     console.error("Avatar Update Error:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };
