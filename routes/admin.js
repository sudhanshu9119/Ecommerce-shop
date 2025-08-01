const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');
const authMiddleware = require('../Middlwares/authMiddleware')

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', authMiddleware.authUser, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', authMiddleware.authUser, adminController.getAddProducts);

// /admin/add-product => POST
router.post('/add-product', authMiddleware.authUser, adminController.postAddProduct);

router.get('/edit-product/:productId', authMiddleware.authUser,  adminController.getEditProduct);

router.post('/edit-product', authMiddleware.authUser, adminController.postEditProduct);

router.post('/delete-product', authMiddleware.authUser, adminController.postDeleteProduct);

module.exports = router;
