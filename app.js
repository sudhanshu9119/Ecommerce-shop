const path = require('path');
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const nodeMailer = require('nodemailer');
const cors = require('cors');

const errorController = require('./controllers/error');
const User = require('./models/user');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');

const auraAuth = require("./routes/aura/authentication")
const mediaRoutes = require('./routes/aura/mediaRoutes')

const app = express();

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', 'views');

// Built-in and third-party middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(cors());


// ✅ Setup session middleware BEFORE routes
app.use(session({
  secret: 'logginUser', // 🔐 Use strong random string in production
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions' 
  }),
  cookie: {
    secure: false, 
    httpOnly: true,
  }
}));


app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) return next();
      req.user = user;
      next();
    })
    .catch(err => {
      console.log(err);
      next();
    });
});

// ✅ Define routes AFTER session middleware
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(userRoutes);
app.use(authRoutes);
app.use('/aura',auraAuth);
app.use('/aura', mediaRoutes)

// Error handler last
app.use(errorController.get404);

// Connect to MongoDB and start server
mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    writeConcern: { w: 'majority' },
    retryWrites: true,
    ssl: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  }
)
.then(() => {
  app.listen(process.env.port, () => {
    console.log(`✅ Server is running on ${process.env.port} `);
  });
})
.catch(err => {
  console.log("❌ MongoDB connection error:", err);
});
