const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const nodeMailer = require('nodemailer');

const errorController = require('./controllers/error');
const User = require('./models/user');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');

const app = express();

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', 'views');

// Built-in and third-party middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// ✅ Setup session middleware BEFORE routes
app.use(session({
  secret: 'logginUser', // 🔐 Use strong random string in production
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb+srv://stiwari9598:nahipata@cluster0.miool.mongodb.net/EcommerceApp?authSource=admin&replicaSet=atlas-80mh0h-shard-0',
    collectionName: 'sessions' // consistent naming
  }),
  cookie: {
    secure: false, // ✅ true in production (with HTTPS)
    httpOnly: true,
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));

// Load user from DB if needed (optional helper)
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

// Error handler last
app.use(errorController.get404);

// Connect to MongoDB and start server
mongoose.connect(
  'mongodb+srv://stiwari9598:nahipata@cluster0.miool.mongodb.net/EcommerceApp?authSource=admin&replicaSet=atlas-80mh0h-shard-0',
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
  app.listen(3000, () => {
    console.log("✅ Server is running on http://localhost:3000");
  });
})
.catch(err => {
  console.log("❌ MongoDB connection error:", err);
});
