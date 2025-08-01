const path = require('path');
const express = require('express');
const shopController = require('../controllers/shop');
const router = express.Router();
const authMidlleware = require('../Middlwares/authMiddleware')


router.get('/', shopController.getIndex);

router.get('/products', authMidlleware.authUser, shopController.getProducts);

router.get('/products/:productId', authMidlleware.authUser, shopController.getProduct);

router.get('/cart', authMidlleware.authUser, shopController.getCart);

router.post('/cart', authMidlleware.authUser, shopController.postAddToCart);

router.get('/cart/delete/:productId', authMidlleware.authUser, shopController.postCartDeleteProduct);

router.get("/cart/wishlist/:productId", authMidlleware.authUser, shopController.MovetoWhishList)

// router.post('/create-order', shopController.postOrder);

// router.get('/orders', shopController.getOrders);

module.exports = router;
