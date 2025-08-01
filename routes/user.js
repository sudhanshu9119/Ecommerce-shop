const express = require("express");

const router =  express.Router()

const userController = require('../controllers/user');

router.post('/user/create', userController.postCreateUser);

module.exports = router;