const express = require('express')
const auraAuthController = require('../../controllers/aura/authController')





const router = express.Router();



router.post('/signUp', auraAuthController.postSignUp);
router.post('/signIn', auraAuthController.postSignIn);
router.get('/sessionData',auraAuthController.getLoggedInData)
router.post('/forgot-password', auraAuthController.postForgotPassword);
router.post('/reset-password', auraAuthController.postResetPassword);
router.put('/profile', auraAuthController.updateProfile);
module.exports = router;