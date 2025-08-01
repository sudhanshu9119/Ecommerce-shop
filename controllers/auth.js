const userModel = require('../models/user')
const bcrypt = require('bcrypt');


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
        return res.redirect('/login'); 
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = new userModel({
        email: email,
        password: hashedPassword,
      });
  
      await newUser.save();
  
      return res.redirect('/login');
    } catch (error) {
      console.error("Signup Error:", error);
      return res.status(500).send("Internal Server Error");
    }
  };