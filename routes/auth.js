const express = require('express');

const router = express.Router();

const authController = require('../controllers/auth')

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/logout', authController.getLogout);
router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignUp);





module.exports = router;