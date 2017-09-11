var express = require('express');

const { Stocks } = require('./../models/stocks');
const { History } = require('./../models/history');
const { User } = require('./../models/members');
const Helpers = require('./../helpers/helpers');
const { ObjectID } = require("mongodb");


function StockController() {

    this.stocksPage = ( async (req, res) => {
        try {
            const stocks = await Stocks.find({owner: req.session._id});
            const sumOfStocks = stocks.reduce((sum, curr) => {
                                    return sum + (curr.price * curr.shares)
                                }, 0);
            const total = Helpers.currencyFormatter(sumOfStocks + req.session.cash, '$');

            res.render('index', {
                stocks,
                total,
                cash: Helpers.currencyFormatter(req.session.cash, '$')
            });
        } catch (error) {
            res.render('apologize', {message: 'Passwords do not match!'});
        }
    }),

    this.historyPage = (async (req, res) => {
        try {
            const historyData = await History.find({owner: req.session._id});

            res.render('history', { historyData });
        } catch (error) {
            res.render('apologize', {message: 'Something went wrong!'});
        }
    }),

    this.getQuote = ( async (req, res) => {
        try {
            const symbol = req.body.symbol;
            const quote = await Helpers.getStockData(symbol);
            const price = Helpers.currencyFormatter(quote.price.regularMarketPrice, '$');
            const name = quote.price.shortName || 'NA';
            res.render('quote', { price, name, symbol });      
        } catch (error) {
            console.log(error);
            res.render('apologize', { message: 'Symbol does not exists!' })
        }

    }),

    this.quoteStockForm = ( async (req, res) => {
        res.render('stock', {action: 'quote', btnName: 'Quote', trade: false});
    }),

    this.sellStockForm = (req, res) => {
        res.render('stock', {action: 'sell', btnName: 'Sell', trade: true});
    },

    this.buyStockForm = (req, res) => {
        res.render('stock', {action: 'buy', btnName: 'Buy', trade: true});
    },

    this.sellStock = ( async (req, res) => {
        try {
            const symbol = req.body.symbol.toUpperCase();;
            const shares = Number(req.body.shares);
            const dataFromDb = await Stocks.findOne({owner: req.session._id, symbol: symbol});

            if (!dataFromDb) {
                return res.render('apologize', { message: 'Symbol not owned' });
            }

            const newNumberOfShares = dataFromDb.shares - shares;

            if ( newNumberOfShares < 0 ) {
                return res.render('apologize', { message: 'You do not own that many shares!' });
            } else if (newNumberOfShares === 0) {
                await Stocks.findByIdAndRemove(dataFromDb._id);
            } else {
                dataFromDb.shares = newNumberOfShares;
                dataFromDb.save();
            }

            const plusCash = shares * dataFromDb.price;
            const minusShare = shares * -1;
            const history = new History({
                symbol,
                shares: minusShare,
                price: dataFromDb.price,
                owner: req.session._id
            });
            req.session.cash += plusCash;
            await history.save();
            await User.update({_id: req.session._id}, { $inc: { cash: plusCash }});
            
            res.redirect('/');      
        } catch (error) {
            res.render('apologize', { message: 'Something went wrong!' });
        }    

    }),

    this.buyStock = ( async (req, res) => {
        try {
            const symbol = req.body.symbol.toUpperCase();
            const shares = Number(req.body.shares);

            const quote = await Helpers.getStockData(symbol);
            const priceOfShares = quote.price.regularMarketPrice * shares;
            const name = quote.price.shortName || 'NA';

            let user = await User.findOne({_id: req.session._id});
            
            if (priceOfShares > user.cash) {
                return res.render('apologize', { message: 'You do not have enough cash for the transaction!' });
            }

            const dataFromDb = await Stocks.findOne({owner: req.session._id, symbol: symbol});
            console.log(dataFromDb);
            if (!dataFromDb) {
                const stock = new Stocks({
                    symbol: symbol,
                    name: name,
                    price: quote.price.regularMarketPrice,
                    shares: shares,
                    owner: req.session._id
                });
                await stock.save();
            } else {
                dataFromDb.shares = shares + dataFromDb.shares;
                await dataFromDb.save();
            }

            const history = new History({
                symbol,
                shares,
                price: quote.price.regularMarketPrice,
                owner: req.session._id
            });
            
            await history.save();
            const minusCash = priceOfShares * -1;
            req.session.cash += minusCash;
            await User.update({_id: req.session._id}, { $inc: { cash: minusCash }});

            res.redirect('/');    
        } catch (error) {
            res.render('apologize', { message: 'Why?!' })
        }      
        
    })
}


module.exports = StockController;