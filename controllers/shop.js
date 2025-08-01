const Product = require("../models/product");
const cartModel = require("../models/cartModel");
const mongoose = require("mongoose");


exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        isAuthenticated: req.session.loggedIn
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
        isAuthenticated: req.session.loggedIn
      });
    })
    .catch((err) => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        isAuthenticated: req.session.loggedIn
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postAddToCart = async (req, res, next) => {
  const productId = req.body.productId;
  const userId = req.session.user._id;
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }
  const cartProduct = {
    productId: product._id,
    quantity: 1,
    name: product.title,
    price: product.price,
    imgUrl: product.imageUrl,
  };

  let cartDoc = await cartModel.findOne({ userId: userId, active: true });
  if (cartDoc) {
    const existingProductIndex = cartDoc.products.findIndex(
      (p) => p.productId.toString() === productId
    );

    if (existingProductIndex > -1) {
      cartDoc.products[existingProductIndex].quantity += 1;
    } else {
      cartDoc.products.push(cartProduct);
    }
    cartDoc.modifiedOn = Date.now();
    await cartDoc.save();
  } else {
    cartDoc = new cartModel({
      userId: userId,
      products: [cartProduct],
      active: true,
    });
    await cartDoc.save();
  }
  res.redirect("/cart");
  // res.status(200).json({
  //     success: true,
  //     message: 'Cart updated successfully',
  //     cart: cartDoc
  // });
};

exports.getCart = async (req, res, next) => {
  try {
    if (!req.session.user || !req.session.loggedIn) {
      return res.redirect('/login');
    }

    const userId = req.session.user._id;
    const userCart = await cartModel.findOne({ userId });

    res.render("shop/cart", {
      pageTitle: "Your Cart",
      path: "/cart",
      products: userCart ? userCart.products : [],
      isAuthenticated: req.session.loggedIn
    });

  } catch (error) {
    console.error("Error in getCart:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching cart",
      error: error.message
    });
  }
};


exports.postCartDeleteProduct = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.redirect('/login');
    }
    const productId = req.params.productId;
    const userId = req.user._id;
    const cart = await cartModel.findOne({ userId: userId, active: true });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }
    cart.products = cart.products.filter(
      (product) => product.productId.toString() !== productId
    );
    await cart.save();
    res.redirect("/cart");
  } catch (error) {
    console.error("Error in postCartDeleteProduct:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting product from cart",
      error: error.message,
    });
  }
};

exports.MovetoWhishList = (req, res, next) => {};
// exports.postOrder = (req, res, next) => {
//   console.log("create-order function called")
//   let fetchedCart;
//   req.user
//     .addOrder()
//     .then(result => {
//       res.redirect('/orders');
//     })
//     .catch(err => console.log(err));
// };

// exports.getOrders = (req, res, next) => {
//   req.user
//     .getOrders()
//     .then(orders => {
//       res.render('shop/orders', {
//         path: '/orders',
//         pageTitle: 'Your Orders',
//         orders: orders
//       });
//     })
//     .catch(err => console.log(err));
// };
