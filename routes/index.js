const express = require('express');
const router = express.Router();

const { authenticate } = require('./../middleware/authenticate');
const { checkParams, checkParam } = require('./../middleware/formHandler');

const UserAuthController = require('./../controllers/userAuthController');
const StockController = require('./../controllers/stockController');

const userAuthController = new UserAuthController();
const stockController = new StockController();

//user handling
router.get('/login', userAuthController.loginPage);
router.get('/signup', userAuthController.signUpPage);
router.post('/users/signup', userAuthController.signUp);
router.post('/users/login', userAuthController.logIn);
router.get('/users/logout', authenticate, userAuthController.logOut);


// stock related routes
router.get('/', authenticate, stockController.stocksPage);

router.get('/history', authenticate, stockController.historyPage);

router.route('/quote')
  .get(authenticate, stockController.quoteStockForm)
  .post(authenticate, checkParam, stockController.getQuote);

router.route('/buy')
  .get(authenticate, stockController.buyStockForm)
  .post(authenticate, checkParams, stockController.buyStock);


router.route('/sell')
  .get(authenticate, stockController.sellStockForm)
  .post(authenticate, checkParams, stockController.sellStock);

module.exports = router;
