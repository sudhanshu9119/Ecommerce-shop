const userModel = require('../models/user')
const bcrypt = require('bcrypt');
// const nodemailer = require('nodemailer');
// const nodemailerSendgrid = require('nodemailer-sendgrid');
  const nodemailer = require('nodemailer');
const MailgunTransport = require('nodemailer-mailgun-transport');



// const transportor = nodemailer.createTransport(
//     nodemailerSendgrid({
//         apiKey: apiKey   
//     })
// );

console.log("mail gun api key loading from env", process.env.MAILGUN_API_KEY);
console.log("maigun domian",process.env.MAILGUN_DOMAIN)

  let transporter = nodemailer.createTransport(MailgunTransport({
    auth: {
      domain: process.env.MAILGUN_DOMAIN,
      apiKey: process.env.MAILGUN_API_KEY
    }
  }));

module.exports.getLogin = (req, res, next) => {
    res.render('../views/auth/login.ejs', {
        pageTitle: "Login",
        path: '/login',
        isAuthenticated: false
    });
};

module.exports.postLogin = (req, res, next) => {
  let { email, password } = req.body;

  userModel.findOne({ email: email }).then((existingUser) => {
      if (!existingUser) {
          return res.redirect('/signup');
      }
      bcrypt.compare(password, existingUser.password).then((matched) => {
          if (matched) {
              req.session.loggedIn = true;
              req.session.user = {
                  _id: existingUser._id,
                  email: existingUser.email,
                  password: existingUser.password
              };
              req.session.save(() => {
                  res.redirect('/');
              });
          } else {
              res.redirect('/signup');
          }
      });
  }).catch(err => {
      console.error("Login error:", err);
      next(err);
  });
};

    
  
  module.exports.getLogout = (req, res, next) =>
    {
    req.session.destroy(err => {
        if (err) {
          return res.status(500).send("Logout error");
        }
        res.redirect('/login');
      });
  };

  module.exports.getSignup = (req, res, next) =>{

    res.render('../views/auth/signup.ejs', {
        pageTitle: "SignUp",
        path: '/signup',
        isAuthenticated: false
        
    })
  }

  module.exports.postSignUp = async (req, res, next) => {
    try {
      let { email, password, confirmPassword } = req.body;
      const existingUser = await userModel.findOne({ email: email });
  
      if (existingUser) {
        console.log("This user is already exist");
        return res.redirect('/login'); 
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = new userModel({
        email: email,
        password: hashedPassword,
      });
  
      await newUser.save();
     try {
       await transporter.sendMail({
         from: process.env.MAILGUN_FROM || 'no-reply@example.com',
         to: email,
         subject: 'Welcome to Our App!',
         text: `Hello ${email}, welcome to our platform!`,
         html: `<h3>Welcome, ${email}!</h3><p>Thank you for signing up.</p>`
       }).then((status)=>{
        console.log(`email has been sent successfully to ${email}`);
       })
     } catch (mailErr) {
       console.error('SendGrid mail error:', mailErr && mailErr.response && mailErr.response.body ? mailErr.response.body : mailErr);
     }
  
      return res.redirect('/login');
    } catch (error) {
      console.error("Signup Error:", error);
      return res.status(500).send("Internal Server Error");
    }
  };