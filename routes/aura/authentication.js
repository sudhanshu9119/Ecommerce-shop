const express = require('express')
const auraAuthController = require('../../controllers/aura/authController')





const router = express.Router();



router.post('/signUp', auraAuthController.postSignUp);
router.post('/signIn', auraAuthController.postSignIn);
router.get('/sessionData',auraAuthController.getLoggedInData)
module.exports = router;