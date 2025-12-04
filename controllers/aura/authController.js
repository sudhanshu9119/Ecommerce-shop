const bcrypt = require('bcryptjs');
const AuthUser = require('../../models/aura/AuraUserModal');
const nodemailer = require('nodemailer');
const nodemailerSendgrid = require('nodemailer-sendgrid');



const transportor = nodemailer.createTransport(
    nodemailerSendgrid({
        apiKey: process.env.SENDGRID_API_KEY   
    })
);

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
}


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
